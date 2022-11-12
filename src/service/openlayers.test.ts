import {
  MAP_CTX_EXTENT_FIXTURE,
  MAP_CTX_FIXTURE,
  MAP_CTX_LAYER_GEOJSON_FIXTURE,
  MAP_CTX_LAYER_GEOJSON_REMOTE_FIXTURE,
  MAP_CTX_LAYER_WFS_FIXTURE,
  MAP_CTX_LAYER_WMS_FIXTURE,
  MAP_CTX_LAYER_WMTS_FIXTURE,
} from '../fixtures/map-context';
import {
  addLayer,
  createMap,
  removeLayer,
  setHasBaseMap,
  setView,
} from './openlayers';
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import ImageWMS from 'ol/source/ImageWMS';
import ImageLayer from 'ol/layer/Image';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import { MapContextLayerWms } from '../model';
import BaseLayer from 'ol/layer/Base';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import WMTS from 'ol/source/WMTS';

describe('openlayers functions', () => {
  let map;
  beforeEach(() => {
    const div = document.createElement('div');
    map = createMap(div);
    map.setSize([100, 100]);
  });

  describe('createMap', () => {
    it('creates a map', () => {
      expect(map).toBeTruthy();
      expect(map).toBeInstanceOf(OlMap);
    });
    it('has a view with undefined center', () => {
      expect(map.getView().getCenter()).toBe(undefined);
    });
    it('has no layer', () => {
      expect(map.getLayers().getLength()).toBe(0);
    });
  });

  describe('setHasBaseMap', () => {
    describe('called with false and true', () => {
      beforeEach(async () => {
        await setHasBaseMap(map, false);
        await setHasBaseMap(map, true);
        await setHasBaseMap(map, true);
      });
      it('has one layer (base map) with low z-index', () => {
        expect(map.getLayers().getLength()).toBe(1);
        expect(map.getLayers().item(0).getZIndex()).toBeLessThan(-100);
      });
    });
    describe('called with true and false', () => {
      beforeEach(async () => {
        await setHasBaseMap(map, true);
        await setHasBaseMap(map, false);
        await setHasBaseMap(map, false);
      });
      it('has no layer', () => {
        expect(map.getLayers().getLength()).toBe(0);
      });
    });
  });

  describe('addLayer', () => {
    let layer;
    describe('generic properties', () => {
      beforeEach(async () => {
        layer = await addLayer(map, MAP_CTX_LAYER_WMS_FIXTURE, 4);
      });
      it('creates a layer with a z-index of 4, and with a reference to the layer model', () => {
        expect(layer).toBeInstanceOf(BaseLayer);
        expect(layer.getZIndex()).toBe(4);
        expect(layer.get('contextLayer')).toBe(MAP_CTX_LAYER_WMS_FIXTURE);
      });
    });
    describe('WMS (not tiled)', () => {
      beforeEach(async () => {
        layer = await addLayer(map, MAP_CTX_LAYER_WMS_FIXTURE, 0);
      });
      it('creates an Image layer with a WMS source', () => {
        expect(layer).toBeInstanceOf(ImageLayer);
        expect(layer.getSource()).toBeInstanceOf(ImageWMS);
      });
    });
    describe('WMS (tiled)', () => {
      beforeEach(async () => {
        layer = await addLayer(
          map,
          { ...MAP_CTX_LAYER_WMS_FIXTURE, tiled: true } as MapContextLayerWms,
          0
        );
      });
      it('creates an Image layer with a WMS source', () => {
        expect(layer).toBeInstanceOf(TileLayer);
        expect(layer.getSource()).toBeInstanceOf(TileWMS);
      });
    });
    describe('WFS', () => {
      beforeEach(async () => {
        layer = await addLayer(map, MAP_CTX_LAYER_WFS_FIXTURE, 0);
      });
      it('creates a Vector layer with a Vector source', () => {
        expect(layer).toBeInstanceOf(VectorLayer);
        expect(layer.getSource()).toBeInstanceOf(VectorSource);
      });
      it('creates a Vector source with a url() function pointing to the WFS geojson output', () => {
        expect(layer.getSource().getUrl()).toBeInstanceOf(Function);
        const exampleUrl = layer.getSource().getUrl()([10, 20, 30, 40]);
        expect(exampleUrl).toMatch(
          'outputFormat=application/json&typename=ms:commune_actuelle_3857'
        );
      });
    });
    describe('GeoJSON (with inline data)', () => {
      beforeEach(async () => {
        layer = await addLayer(map, MAP_CTX_LAYER_GEOJSON_FIXTURE, 0);
      });
      it('creates a Vector layer with a WFS source', () => {
        expect(layer).toBeInstanceOf(VectorLayer);
        expect(layer.getSource()).toBeInstanceOf(VectorSource);
      });
    });
    describe('GeoJSON (with url)', () => {
      beforeEach(async () => {
        layer = await addLayer(map, MAP_CTX_LAYER_GEOJSON_REMOTE_FIXTURE, 0);
      });
      it('creates a Vector layer with a Vector source', () => {
        expect(layer).toBeInstanceOf(VectorLayer);
        expect(layer.getSource()).toBeInstanceOf(VectorSource);
      });
      it('creates a Vector source with a url pointing to the geojson file', () => {
        expect(layer.getSource().getUrl()).toBe(
          MAP_CTX_LAYER_GEOJSON_REMOTE_FIXTURE.url
        );
      });
    });
    describe('WMTS', () => {
      beforeEach(async () => {
        layer = await addLayer(map, MAP_CTX_LAYER_WMTS_FIXTURE, 0);
      });
      it('creates a Vector layer with a Vector source', () => {
        expect(layer).toBeInstanceOf(TileLayer);
        expect(layer.getSource()).toBeInstanceOf(WMTS);
      });
    });
  });

  describe('removeLayer', () => {
    describe('layer is found', () => {
      let prevCount;
      beforeEach(async () => {
        prevCount = map.getLayers().getLength();
        await addLayer(map, MAP_CTX_LAYER_WMS_FIXTURE, 0);
        removeLayer(map, MAP_CTX_LAYER_WMS_FIXTURE);
      });
      it('removes the layer', () => {
        expect(map.getLayers().getLength()).toBe(prevCount);
      });
    });
    describe('layer is not found', () => {
      let error;
      beforeEach(() => {
        error = null;
        try {
          removeLayer(map, MAP_CTX_LAYER_WMS_FIXTURE);
        } catch (e) {
          error = e;
        }
      });
      it('throws an error', () => {
        expect(error).toMatchObject({
          message: expect.stringContaining('could not find'),
        });
      });
    });
  });

  describe('setView', () => {
    let view;
    describe('from center and zoom', () => {
      beforeEach(() => {
        setView(map, MAP_CTX_FIXTURE.view);
        view = map.getView();
      });
      it('create a view', () => {
        expect(view).toBeTruthy();
        expect(view).toBeInstanceOf(OlView);
      });
      it('set center', () => {
        const center = view.getCenter();
        expect(center).toEqual([862726.0536478702, 6207260.308175252]);
      });
      it('set zoom', () => {
        const zoom = view.getZoom();
        expect(zoom).toEqual(MAP_CTX_FIXTURE.view.zoom);
      });
    });
    describe('from extent', () => {
      beforeEach(() => {
        setView(map, {
          ...MAP_CTX_FIXTURE.view,
          extent: MAP_CTX_EXTENT_FIXTURE,
        });
        view = map.getView();
      });
      it('create a view', () => {
        expect(view).toBeTruthy();
        expect(view).toBeInstanceOf(OlView);
      });
      it('set center', () => {
        const center = view.getCenter();
        expect(center).toEqual([-445277.9631730943, -801944.9349717223]);
      });
      it('set zoom', () => {
        const zoom = view.getZoom();
        expect(zoom).toEqual(2);
      });
    });
    describe('a view already exists', () => {
      let prevView;
      beforeEach(() => {
        setView(map, MAP_CTX_FIXTURE.view);
        prevView = map.getView();
        setView(map, {
          ...MAP_CTX_FIXTURE.view,
          zoom: 4,
        });
        view = map.getView();
      });
      it('creates a new view', () => {
        expect(view).not.toEqual(prevView);
      });
    });
  });
});
