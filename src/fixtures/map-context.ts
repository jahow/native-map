import {
  MapContext,
  MapContextLayer,
  MapContextLayerGeojson,
  MapContextView,
  MapContextViewExtent,
} from '../model';
import { FEATURE_COLLECTION_POLYGON_FIXTURE_4326 } from './geojson';

export const MAP_CTX_LAYER_XYZ_FIXTURE: MapContextLayer = {
  type: 'xyz',
  url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};

export const MAP_CTX_LAYER_WMS_FIXTURE: MapContextLayer = {
  type: 'wms',
  url: 'https://www.geograndest.fr/geoserver/region-grand-est/ows?',
  name: 'commune_actuelle_3857',
};

export const MAP_CTX_LAYER_WFS_FIXTURE: MapContextLayer = {
  type: 'wfs',
  url: 'https://www.geograndest.fr/geoserver/region-grand-est/ows?',
  name: 'ms:commune_actuelle_3857',
};

export const MAP_CTX_LAYER_GEOJSON_FIXTURE: MapContextLayerGeojson = {
  type: 'geojson',
  data: FEATURE_COLLECTION_POLYGON_FIXTURE_4326,
};

export const MAP_CTX_LAYER_GEOJSON_REMOTE_FIXTURE: MapContextLayerGeojson = {
  type: 'geojson',
  url: 'https://my.host.com/data/regions.json',
};

export const MAP_CTX_LAYER_WMTS_FIXTURE: MapContextLayer = {
  type: 'wmts',
  url: 'https://www.geograndest.fr/geoserver/region-grand-est/wmts?',
  name: 'commune_actuelle_3857',
};

export const MAP_CTX_VIEW_FIXTURE: MapContextView = {
  center: [7.75, 48.6],
  zoom: 9,
};

export const MAP_CTX_FIXTURE: MapContext = {
  layers: [
    MAP_CTX_LAYER_XYZ_FIXTURE,
    MAP_CTX_LAYER_WMS_FIXTURE,
    MAP_CTX_LAYER_GEOJSON_FIXTURE,
  ],
  view: MAP_CTX_VIEW_FIXTURE,
};

export const MAP_CTX_EXTENT_FIXTURE: MapContextViewExtent = [-10, -20, 2, 6];
