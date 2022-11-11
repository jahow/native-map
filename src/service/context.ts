import { FeatureCollection } from 'geojson';

export interface MapView {
  zoom: number;
  center: [number, number]; // center Expressed in Longitude, latitude (degrees)
  srs?: string; // Default is EPSG:3857
}

export interface WmsLayer {
  type: 'wms';
  url: string;
  name: string;
}

export interface GeoJSONLayer {
  type: 'geojson';
  geojson: FeatureCollection;
}

export type MapLayer = WmsLayer | GeoJSONLayer;

export interface MapContext {
  view?: MapView;
  layers?: MapLayer[];
}

function equalsLayer(layerA: MapLayer, layerB: MapLayer) {
  return layerA === layerB;
}

function hasLayer(context: MapContext, layer: MapLayer) {
  return context.layers?.some((l) => equalsLayer(layer, l));
}

/**
 * @param newContext
 * @param oldContext
 * @returns Empty array if no layers changed
 */
export function getAddedLayers(
  newContext: MapContext,
  oldContext?: MapContext
): { layer: MapLayer; position: number }[] {
  if (!('layers' in newContext)) return [];
  if (!oldContext || !('layers' in oldContext))
    return newContext.layers.map((layer, position) => ({ layer, position }));
  if (newContext.layers === oldContext.layers) return [];
  return newContext.layers.reduce(
    (prev, layer, i) =>
      hasLayer(oldContext, layer)
        ? prev
        : [
            ...prev,
            {
              layer,
              position: i,
            },
          ],
    []
  );
}

/**
 * @param newContext
 * @param oldContext
 * @returns Empty array if no layers changed
 */
export function getRemovedLayers(
  newContext: MapContext,
  oldContext?: MapContext
): MapLayer[] {
  if (
    !oldContext ||
    !('layers' in newContext) ||
    !('layers' in oldContext) ||
    newContext.layers === oldContext.layers
  )
    return [];
  return oldContext.layers.reduce(
    (prev, layer, i) => (hasLayer(newContext, layer) ? prev : [...prev, layer]),
    []
  );
}

/**
 * @param newContext
 * @param oldContext
 * @returns true if a new view was specified
 */
export function hasViewChanged(
  newContext: MapContext,
  oldContext?: MapContext
) {
  if (!('view' in newContext)) {
    return false;
  }
  if (!oldContext || !('view' in oldContext)) {
    return true;
  }
  return newContext.view !== oldContext?.view;
}
