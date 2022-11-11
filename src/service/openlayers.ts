import OlMap from 'ol/Map';
import OlView from 'ol/View';
import { defaults as defaultControls } from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import XYZSource from 'ol/source/XYZ';
import { fromLonLat, transformExtent } from 'ol/proj';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { MapContext, MapContextLayer, MapContextView } from '../model';

/**
 * @param context
 * @param target
 * @returns Newly created OpenLayers map
 */
export function createMap(context: MapContext, target: HTMLElement) {
  const olMap = new OlMap({
    target,
    controls: defaultControls({
      zoom: false,
      rotate: false,
    }),
  });

  if (!context.noBaseMap) {
    // add positron basemap
    olMap.addLayer(
      new TileLayer({
        source: new XYZSource({
          urls: [
            'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          ],
          crossOrigin: 'anonymous',
        }),
        zIndex: -999,
      })
    );
  }

  return olMap;
}

/**
 * @param olMap
 * @param layer
 * @param position Position of the layer, 0-based, from background to foreground
 */
export function addLayer(
  olMap: OlMap,
  layer: MapContextLayer,
  position: number
) {
  const layerProps = {
    zIndex: position,
    properties: { contextLayer: layer },
  };
  switch (layer.type) {
    case 'wms': {
      olMap.addLayer(
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
      break;
    }
    case 'geojson': {
      if (!('data' in layer)) return;
      const features = new GeoJSON().readFeatures(layer.data, {
        dataProjection: 'EPSG:4326',
        featureProjection: olMap.getView().getProjection().getCode(),
      });
      olMap.addLayer(
        new VectorLayer({
          source: new VectorSource({
            features,
          }),
          ...layerProps,
        })
      );
      break;
    }
  }
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
