import { FeatureCollection } from 'geojson';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { StyleLike } from 'ol/style/Style';

export type LonLatCoords = [number, number];

interface MapContextBaseLayer {
  notQueryable?: boolean; // defaults to fals
}

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
  tiled?: boolean;
}

export interface MapContextLayerWfs {
  type: 'wfs';
  url: string;
  name: string;
  style?: StyleLike;
}

export type MapContextLayerWmts = {
  type: 'wmts';
} & SingleOrMultipleUrls;

export type MapContextLayerXyz = {
  type: 'xyz';
} & SingleOrMultipleUrls;

export type MapContextLayerGeojson = {
  type: 'geojson';
  style?: StyleLike;
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

export type MapContextLayer = MapContextBaseLayer &
  (
    | MapContextLayerWms
    | MapContextLayerWmts
    | MapContextLayerWfs
    | MapContextLayerXyz
    | MapContextLayerGeojson
  );

export type MapContextViewExtent = [number, number, number, number];

export interface MapContextView {
  center?: LonLatCoords;
  zoom?: number;
  extent?: MapContextViewExtent; // expressed in long/lat (EPSG:4326)
  maxZoom?: number;
  maxExtent?: MapContextViewExtent; // expressed in long/lat (EPSG:4326)
  srs?: string;
}

export interface MapContext {
  view?: MapContextView;
  layers?: MapContextLayer[];
  noBaseMap?: boolean; // if true, the built-in base map will not be added; default to false
}

export interface FeaturesClickedEvent extends CustomEvent {
  detail: {
    features: Feature<Geometry>[][];
  };
}
