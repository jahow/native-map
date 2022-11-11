import OlMap from 'ol/Map';
import OlView from 'ol/View';
import { defaults as defaultControls } from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import XYZSource from 'ol/source/XYZ';
import XYZ from 'ol/source/XYZ';
import { fromLonLat, transformExtent } from 'ol/proj';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import {
  MapContext,
  MapContextLayer,
  MapContextLayerXyz,
  MapContextView,
} from '../model';
import TileWMS from 'ol/source/TileWMS';
import WMTS from 'ol/source/WMTS';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import BaseLayer from 'ol/layer/Base';

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
  const olMap = new OlMap({
    target,
    controls: defaultControls({
      zoom: false,
      rotate: false,
    }),
  });
  //if (!context.noBaseMap) { // FIXME: restore differently
  // add basemap synchronously
  olMap.addLayer(
    new TileLayer({
      source: new XYZSource({
        urls: DEFAULT_BASELAYER_CONTEXT.urls,
        crossOrigin: 'anonymous',
      }),
      zIndex: -999,
    })
  );
  //}
  return olMap;
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
            ...layerProps,
          })
        );
      }
    }
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
) {
  return olMap
    .getAllLayers()
    .find((olLayer) => olLayer.get('contextLayer') === contextLayer);
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
