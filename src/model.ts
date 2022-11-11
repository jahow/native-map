import { FeatureCollection } from 'geojson';

type SingleOrMultipleUrls =
  | {
      url: string;
      urls?: never;
    }
  | {
      urls: string[];
      url?: never;
    };

export interface MapContextLayerWms {
  type: 'wms';
  url: string;
  name: string;
}

interface MapContextLayerWfs {
  type: 'wfs';
  url: string;
  name: string;
}

export type MapContextLayerWmts = {
  type: 'wmts';
} & SingleOrMultipleUrls;

export type MapContextLayerXyz = {
  type: 'xyz';
} & SingleOrMultipleUrls;

export type MapContextLayerGeojson = {
  type: 'geojson';
} & (
  | {
      url: string;
      data?: never;
    }
  | {
      data: FeatureCollection | string;
      url?: never;
    }
);

export type MapContextLayer =
  | MapContextLayerWms
  | MapContextLayerWmts
  | MapContextLayerWfs
  | MapContextLayerXyz
  | MapContextLayerGeojson;

export interface MapContextView {
  center?: [number, number]; // expressed in long/lat (EPSG:4326)
  zoom?: number;
  extent?: [number, number, number, number]; // expressed in long/lat (EPSG:4326)
  maxZoom?: number;
  maxExtent?: [number, number, number, number]; // expressed in long/lat (EPSG:4326)
}

export interface MapContext {
  view?: MapContextView;
  layers?: MapContextLayer[];
}
