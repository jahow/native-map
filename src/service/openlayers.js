import OlMap from "ol/Map";
import OlView from "ol/View";
import { defaults as defaultControls } from "ol/control";
import TileLayer from "ol/layer/Tile";
import XYZSource from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";
import ImageLayer from "ol/layer/Image";
import { ImageWMS } from "ol/source";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";

/**
 * @param {HTMLElement} target
 * @returns {OlMap} Newly created OpenLayers map
 */
export function createMap(target) {
  const olMap = new OlMap({
    view: new OlView({
      zoom: 3,
      center: [0, 0],
      multiWorld: true,
    }),
    target,
    controls: defaultControls({
      zoom: false,
      rotate: false,
    }),
  });

  // add positron basemap
  olMap.addLayer(
    new TileLayer({
      source: new XYZSource({
        urls: [
          "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
          "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
          "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        ],
        crossOrigin: "anonymous",
      }),
      zIndex: -999,
    })
  );

  return olMap;
}

/**
 * @param {OlMap} olMap
 * @param {Layer} layer
 * @param {number} position Position of the layer, 0-based, from background to foreground
 */
export function addLayer(olMap, layer, position) {
  const layerProps = {
    zIndex: position,
    contextLayer: layer,
  };
  switch (layer.type) {
    case "wms": {
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
    case "geojson": {
      const features = new GeoJSON().readFeatures(layer.geojson, {
        dataProjection: "EPSG:4326",
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
    default:
      throw new Error(`Unrecognized layer type: ${layer.type}`);
  }
}

/**
 * @param {OlMap} olMap
 * @param {Layer} contextLayer
 * @returns {import('ol/layer').Layer}
 */
function getMapLayerFromContextLayer(olMap, contextLayer) {
  return olMap
    .getAllLayers()
    .find((olLayer) => olLayer.get("contextLayer") === contextLayer);
}

/**
 @param {OlMap} olMap
 * @param {Layer} layer
 */
export function removeLayer(olMap, layer) {
  const toRemove = getMapLayerFromContextLayer(olMap, layer);
  olMap.removeLayer(toRemove);
}

/**
 @param {OlMap} olMap
 * @param {View} view
 */
export function setView(olMap, view) {
  olMap.setView(
    new OlView({
      zoom: view.zoom,
      center: fromLonLat(
        view.center,
        olMap.getView().getProjection().getCode()
      ),
      multiWorld: true,
    })
  );
}
