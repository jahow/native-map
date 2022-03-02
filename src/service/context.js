/**
 * @typedef {Object} MapContext
 * @property {View} [view]
 * @property {Layer[]} [layers]
 */

/**
 * @typedef {WmsLayer|GeoJSONLayer} Layer
 */

/**
 * @typedef {Object} WmsLayer
 * @property {'wms'} type
 * @property {string} url
 * @property {string} name
 */

/**
 * @typedef {Object} GeoJSONLayer
 * @property {'geojson'} type
 * @property {import('@types/geojson').FeatureCollection} geojson
 */

/**
 * @typedef {Object} View
 * @property {number} zoom
 * @property {[number,number]} center Expressed in Longitude, latitude (degrees)
 * @property {string} [srs] Default is EPSG:3857
 */

/**
 * @param {Layer} layerA
 * @param {Layer} layerB
 * @returns {boolean}
 */
function equalsLayer(layerA, layerB) {
  return layerA === layerB;
}

/**
 * @param {MapContext} context
 * @param {Layer} layer
 * @returns {boolean}
 */
function hasLayer(context, layer) {
  return context.layers?.some((l) => equalsLayer(layer, l));
}

/**
 * @param {MapContext} newContext
 * @param {MapContext|null} oldContext
 * @returns {{ layer: Layer, position: number }[]} Empty array if no layers changed
 */
export function getAddedLayers(newContext, oldContext) {
  if (!("layers" in newContext)) return [];
  if (oldContext === null || !("layers" in oldContext))
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
 * @param {MapContext} newContext
 * @param {MapContext|null} oldContext
 * @returns {Layer[]} Empty array if no layers changed
 */
export function getRemovedLayers(newContext, oldContext) {
  if (
    oldContext === null ||
    !("layers" in newContext) ||
    !("layers" in oldContext) ||
    newContext.layers === oldContext.layers
  )
    return [];
  return oldContext.layers.reduce(
    (prev, layer, i) => (hasLayer(newContext, layer) ? prev : [...prev, layer]),
    []
  );
}

/**
 * @param {MapContext} newContext
 * @param {MapContext|null} oldContext
 * @returns {boolean} true if a new view was specified
 */
export function hasViewChanged(newContext, oldContext) {
  if (!("view" in newContext)) {
    return false;
  }
  if (oldContext === null || !("view" in oldContext)) {
    return true;
  }
  return newContext.view !== oldContext?.view;
}
