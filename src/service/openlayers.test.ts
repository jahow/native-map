import {
  MAP_CTX_EXTENT_FIXTURE,
  MAP_CTX_FIXTURE,
} from '../fixtures/map-context';
import { createMap, setView } from './openlayers';
import OlMap from 'ol/Map';
import OlView from 'ol/View';

describe('openlayers functions', () => {
  describe('createMap', () => {
    let map;
    const mapContext = MAP_CTX_FIXTURE;
    beforeEach(() => {
      const div = document.createElement('div');
      map = createMap(mapContext, div);
    });
    it('create a map', () => {
      expect(map).toBeTruthy();
      expect(map).toBeInstanceOf(OlMap);
    });
    it('has a view with undefined center', () => {
      expect(map.getView().getCenter()).toBe(undefined);
    });
    it('has one layer (base map)', () => {
      expect(map.getLayers().getLength()).toBe(1);
    });
    describe('with noBaseMap = true', () => {
      beforeEach(() => {
        const div = document.createElement('div');
        map = createMap({ ...mapContext, noBaseMap: true }, div);
      });
      it('has no layer', () => {
        expect(map.getLayers().getLength()).toBe(0);
      });
    });
  });

  describe('addLayer', () => {
    describe('WMS', () => {});
    describe('WFS', () => {});
    describe('GeoJSON (with inline data)', () => {});
    describe('GeoJSON (with url)', () => {});
    describe('WMTS', () => {});
    describe('layer with position', () => {});
  });
  describe('removeLayer', () => {
    describe('layer is found', () => {});
    describe('layer is not found', () => {});
  });

  describe('setView', () => {
    let olMap;
    let view;
    const contextModel = MAP_CTX_FIXTURE;
    beforeEach(() => {
      olMap = new OlMap({});
      olMap.setSize([100, 100]);
    });
    describe('from center and zoom', () => {
      beforeEach(() => {
        setView(olMap, contextModel.view);
        view = olMap.getView();
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
        expect(zoom).toEqual(contextModel.view.zoom);
      });
    });
    describe('from extent', () => {
      beforeEach(() => {
        setView(olMap, {
          ...contextModel.view,
          extent: MAP_CTX_EXTENT_FIXTURE,
        });
        view = olMap.getView();
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
        setView(olMap, contextModel.view);
        prevView = olMap.getView();
        setView(olMap, {
          ...contextModel.view,
          zoom: 4,
        });
        view = olMap.getView();
      });
      it('creates a new view', () => {
        expect(view).not.toEqual(prevView);
      });
    });
  });
});
