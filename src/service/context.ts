import { MapContext, MapContextLayer } from '../model';

function equalsLayer(layerA: MapContextLayer, layerB: MapContextLayer) {
  return layerA === layerB;
}

function hasLayer(context: MapContext, layer: MapContextLayer) {
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
): { layer: MapContextLayer; position: number }[] {
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
): MapContextLayer[] {
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
 @param paramName
 * @param newContext
 * @param oldContext
 * @returns true if a param was specified wit a new value
 */
export function hasParamChanged(
  paramName: string,
  newContext: MapContext,
  oldContext?: MapContext
) {
  if (!(paramName in newContext) && oldContext && paramName in oldContext) {
    return false;
  }
  if (!oldContext || !(paramName in oldContext)) {
    return true;
  }
  return newContext[paramName] !== oldContext?.[paramName];
}
