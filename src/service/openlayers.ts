import OlMap from "ol/Map";
import OlView from "ol/View";
import { defaults as defaultControls } from "ol/control";
import TileLayer from "ol/layer/Tile";
import XYZSource from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";
import ImageLayer from "ol/layer/Image";
import {Options as LayerOptions} from "ol/layer/Base";
import ImageWMS from "ol/source/ImageWMS";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import {MapLayer, MapView} from './context'

/**
 * @param target
 * @returns Newly created OpenLayers map
 */
export function createMap(target: HTMLElement) {
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
 * @param olMap
 * @param layer
 * @param position Position of the layer, 0-based, from background to foreground
 */
export function addLayer(olMap: OlMap, layer: MapLayer, position: number) {
  const layerProps = {
    zIndex: position,
    properties: {contextLayer: layer,}
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

function getMapLayerFromContextLayer(olMap: OlMap, contextLayer: MapLayer) {
  return olMap
    .getAllLayers()
    .find((olLayer) => olLayer.get("contextLayer") === contextLayer);
}

export function removeLayer(olMap: OlMap, layer: MapLayer) {
  const toRemove = getMapLayerFromContextLayer(olMap, layer);
  olMap.removeLayer(toRemove);
}

export function setView(olMap: OlMap, view: MapView) {
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
