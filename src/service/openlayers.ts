import OlMap from 'ol/Map';
import OlView from 'ol/View';
import { defaults as defaultControls } from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat, transformExtent } from 'ol/proj';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import {
  LonLatCoords,
  MapContext,
  MapContextLayer,
  MapContextLayerGeojson,
  MapContextLayerWfs,
  MapContextLayerWms,
  MapContextLayerXyz,
  MapContextView,
} from '../model';
import TileWMS from 'ol/source/TileWMS';
import WMTS from 'ol/source/WMTS';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import BaseLayer from 'ol/layer/Base';
import Feature from 'ol/Feature';
import { FeatureCollection } from 'geojson';
import { Geometry } from 'ol/geom';
import Layer from 'ol/layer/Layer';
import Source from 'ol/source/Source';

const DEFAULT_BASELAYER_CONTEXT: MapContextLayerXyz = {
  type: 'xyz',
  urls: [
    `https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png`,
    `https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png`,
    `https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png`,
  ],
};

/**
 * @param target
 * @returns Newly created OpenLayers map
 */
export function createMap(target: HTMLElement) {
  return new OlMap({
    target,
    controls: defaultControls({
      zoom: false,
      rotate: false,
    }),
  });
}

export async function setHasBaseMap(olMap: OlMap, hasBaseMap: boolean) {
  const existingBaseLayer = getMapLayerFromContextLayer(
    olMap,
    DEFAULT_BASELAYER_CONTEXT
  );
  if (!existingBaseLayer && hasBaseMap) {
    const baseLayer = await addLayer(olMap, DEFAULT_BASELAYER_CONTEXT, 0);
    baseLayer.setZIndex(-999);
  } else if (existingBaseLayer && !hasBaseMap) {
    removeLayer(olMap, DEFAULT_BASELAYER_CONTEXT);
  }
}

/**
 * @param layer
 * @param position Position of the layer, 0-based, from background to foreground
 * @param viewSrs
 */
function createLayerFromModel(
  layer: MapContextLayer,
  position: number,
  viewSrs = 'EPSG:3857'
): Promise<BaseLayer> {
  const layerProps = {
    zIndex: position,
    properties: { contextLayer: layer },
  };
  switch (layer.type) {
    case 'xyz':
      return Promise.resolve(
        new TileLayer({
          source: new XYZ({
            url: 'url' in layer ? layer.url : undefined,
            urls: 'urls' in layer ? layer.urls : undefined,
          }),
          ...layerProps,
        })
      );
    case 'wms':
      if (layer.tiled) {
        return Promise.resolve(
          new TileLayer({
            source: new TileWMS({
              url: layer.url,
              params: { LAYERS: layer.name },
              gutter: 20,
            }),
            ...layerProps,
          })
        );
      }
      return Promise.resolve(
        new ImageLayer({
          source: new ImageWMS({
            url: layer.url,
            params: {
              LAYERS: layer.name,
            },
          }),
          ...layerProps,
        })
      );
    case 'wmts':
      return Promise.resolve(
        new TileLayer({
          source: new WMTS({} as any), // TODO: fill options automatically!
          ...layerProps,
        })
      );
    case 'wfs':
      return Promise.resolve(
        new VectorLayer({
          source: new VectorSource({
            format: new GeoJSON(),
            url: function (extent) {
              return `${
                layer.url
              }?service=WFS&version=1.1.0&request=GetFeature&outputFormat=application/json&typename=${
                layer.name
              }&srsname=EPSG:3857&bbox=${extent.join(',')},EPSG:3857`;
            },
            strategy: bboxStrategy,
          }),
          style: layer.style,
          ...layerProps,
        })
      );
    case 'geojson': {
      if ('url' in layer) {
        return Promise.resolve(
          new VectorLayer({
            source: new VectorSource({
              format: new GeoJSON(),
              url: layer.url,
            }),
            style: layer.style,
            ...layerProps,
          })
        );
      } else {
        let geojson = layer.data;
        if (typeof geojson === 'string') {
          try {
            geojson = JSON.parse(geojson);
          } catch (e) {
            console.warn('A layer could not be created', layer, e);
            geojson = { type: 'FeatureCollection', features: [] };
          }
        }
        const features = new GeoJSON().readFeatures(layer.data, {
          dataProjection: 'EPSG:4326',
          featureProjection: viewSrs,
        });
        return Promise.resolve(
          new VectorLayer({
            source: new VectorSource({
              features,
            }),
            style: layer.style,
            ...layerProps,
          })
        );
      }
    }
  }
}

function getGFIUrl(
  layer: MapContextLayerWms,
  map: OlMap,
  coordinate: LonLatCoords
) {
  const olLayer = getMapLayerFromContextLayer(map, layer) as
    | ImageLayer<ImageWMS>
    | TileLayer<TileWMS>;
  const view = map.getView();
  const projection = view.getProjection();
  const resolution = view.getResolution();
  const source = olLayer.getSource();
  const params = {
    ...source.getParams(),
    INFO_FORMAT: 'application/json',
  };
  return source.getFeatureInfoUrl(coordinate, resolution, projection, params);
}

function getVectorFeatures(
  layer: MapContextLayerWfs | MapContextLayerGeojson,
  map: OlMap,
  coordinate: LonLatCoords
): Promise<Feature<Geometry>[]> {
  const olLayer = getMapLayerFromContextLayer(map, layer) as VectorLayer<
    VectorSource<Geometry>
  >;
  return olLayer.getFeatures(map.getPixelFromCoordinate(coordinate));
}

function getFeaturesFromLayer(
  layer: MapContextLayer,
  map: OlMap,
  coordinate: LonLatCoords
): Promise<Feature<Geometry>[] | null> {
  if (layer.notQueryable) return Promise.resolve(null);
  const viewSrs = map.getView().getProjection();
  switch (layer.type) {
    case 'wmts':
    case 'xyz':
      return Promise.resolve([]);
    case 'wms':
      return fetch(getGFIUrl(layer, map, coordinate))
        .then((resp) => resp.json())
        .then((json: FeatureCollection) =>
          new GeoJSON().readFeatures(json, {
            dataProjection: 'EPSG:4326',
            featureProjection: viewSrs,
          })
        );
    case 'wfs':
    case 'geojson':
      return getVectorFeatures(layer, map, coordinate);
  }
}

/**
 * @param olMap
 * @param layer
 * @param position Position of the layer, 0-based, from background to foreground
 */
export async function addLayer(
  olMap: OlMap,
  layer: MapContextLayer,
  position: number
) {
  const createdLayer = await createLayerFromModel(
    layer,
    position,
    olMap.getView().getProjection().getCode()
  );
  olMap.addLayer(createdLayer);
  return createdLayer;
}

function getMapLayerFromContextLayer(
  olMap: OlMap,
  contextLayer: MapContextLayer
): Layer<Source, any> | null {
  return (
    olMap
      .getAllLayers()
      .find((olLayer) => olLayer.get('contextLayer') === contextLayer) || null
  );
}

export function removeLayer(olMap: OlMap, layer: MapContextLayer) {
  const toRemove = getMapLayerFromContextLayer(olMap, layer);
  if (!toRemove) {
    throw new Error(
      `Layer deletion failed: could not find the corresponding layer in the map: ${JSON.stringify(
        layer
      )}`
    );
  }
  olMap.removeLayer(toRemove);
}

export function setView(olMap: OlMap, view: MapContextView) {
  const {
    center: centerInViewProj,
    zoom,
    extent,
    maxZoom,
    maxExtent,
    srs,
  } = view;
  const mapSrs = srs || 'EPSG:3857';
  const center = centerInViewProj
    ? fromLonLat(centerInViewProj, mapSrs)
    : [0, 0];
  const olView = new OlView({
    center,
    zoom,
    maxZoom,
    extent: maxExtent
      ? transformExtent(maxExtent, 'EPSG:4326', mapSrs)
      : undefined,
    multiWorld: false,
    constrainResolution: true,
    projection: srs,
  });
  if (extent) {
    olView.fit(transformExtent(extent, 'EPSG:4326', mapSrs), {
      size: olMap.getSize(),
    });
  }
  olMap.setView(olView);
}

/**
 * @param map
 * @param context
 * @param coordinate
 * @returns An array of arrays; each layer in the map context is represented by one array, its position in the root
 * array being the same as the layer's position in the map context; not queryable layers are represented by null
 */
export async function getFeaturesAtCoordinate(
  map: OlMap,
  context: MapContext,
  coordinate: LonLatCoords
): Promise<(Feature<Geometry>[] | null)[]> {
  if (!context.layers) return [];
  return Promise.all(
    context.layers.map((layer) => getFeaturesFromLayer(layer, map, coordinate))
  ).catch((e) => {
    console.error('Something went wrong while querying layers', e);
    return [];
  });
}

/**
 * @param map
 * @param context
 * @returns an array of OL layers in the same order as the layers provided in the context
 */
export function getMapLayers(map: OlMap, context: MapContext) {
  if (!context.layers) return [];
  return context.layers.map((layer) => getMapLayerFromContextLayer(map, layer));
}
