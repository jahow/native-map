import { getAddedLayers, getRemovedLayers, hasViewChanged } from './context';

const SAMPLE_LAYERS = [{ url: 'abcd' }, { url: '1234' }, { url: 'xyz' }];

describe('context functions', () => {
  let oldContext, newContext;

  describe('getAddedLayers', () => {
    describe('layers array has not changed', () => {
      beforeEach(() => {
        oldContext = {
          layers: SAMPLE_LAYERS,
        };
        newContext = {
          layers: SAMPLE_LAYERS,
        };
      });
      it('returns empty array', () => {
        expect(getAddedLayers(newContext, oldContext)).toEqual([]);
      });
    });
    describe('layers array changed', () => {
      beforeEach(() => {
        oldContext = {
          layers: SAMPLE_LAYERS,
        };
        newContext = {
          layers: [
            SAMPLE_LAYERS[1],
            { url: '6789' },
            SAMPLE_LAYERS[0],
            { url: 'abcd' },
          ],
        };
      });
      it('returns changed layers', () => {
        expect(getAddedLayers(newContext, oldContext)).toEqual([
          { layer: { url: '6789' }, position: 1 },
          { layer: { url: 'abcd' }, position: 3 },
        ]);
      });
    });
    describe('layers array not set in new context', () => {
      beforeEach(() => {
        oldContext = {
          layers: SAMPLE_LAYERS,
        };
        newContext = {};
      });
      it('returns empty array', () => {
        expect(getAddedLayers(newContext, oldContext)).toEqual([]);
      });
    });
    describe('layers array not set in old context', () => {
      beforeEach(() => {
        oldContext = {};
        newContext = {
          layers: SAMPLE_LAYERS,
        };
      });
      it('returns changed layers', () => {
        expect(getAddedLayers(newContext, oldContext)).toEqual([
          { layer: { url: 'abcd' }, position: 0 },
          { layer: { url: '1234' }, position: 1 },
          { layer: { url: 'xyz' }, position: 2 },
        ]);
      });
    });
    describe('old context is null', () => {
      beforeEach(() => {
        oldContext = null;
        newContext = {
          layers: SAMPLE_LAYERS,
        };
      });
      it('returns changed layers', () => {
        expect(getAddedLayers(newContext, oldContext)).toEqual([
          { layer: { url: 'abcd' }, position: 0 },
          { layer: { url: '1234' }, position: 1 },
          { layer: { url: 'xyz' }, position: 2 },
        ]);
      });
    });
  });

  describe('getRemovedLayers', () => {
    describe('layers array has not changed', () => {
      beforeEach(() => {
        oldContext = {
          layers: SAMPLE_LAYERS,
        };
        newContext = {
          layers: SAMPLE_LAYERS,
        };
      });
      it('returns empty array', () => {
        expect(getRemovedLayers(newContext, oldContext)).toEqual([]);
      });
    });
    describe('layers array changed', () => {
      beforeEach(() => {
        oldContext = {
          layers: SAMPLE_LAYERS,
        };
        newContext = {
          layers: [
            SAMPLE_LAYERS[1],
            { url: '6789' },
            SAMPLE_LAYERS[0],
            { url: 'abcd' },
          ],
        };
      });
      it('returns removed layer', () => {
        expect(getRemovedLayers(newContext, oldContext)).toEqual([
          { url: 'xyz' },
        ]);
      });
    });
    describe('layers array empty in new context', () => {
      beforeEach(() => {
        oldContext = {
          layers: SAMPLE_LAYERS,
        };
        newContext = { layers: [] };
      });
      it('returns empty array', () => {
        expect(getRemovedLayers(newContext, oldContext)).toEqual(SAMPLE_LAYERS);
      });
    });
    describe('layers array not set in new context', () => {
      beforeEach(() => {
        oldContext = {
          layers: SAMPLE_LAYERS,
        };
        newContext = {};
      });
      it('returns empty array', () => {
        expect(getRemovedLayers(newContext, oldContext)).toEqual([]);
      });
    });
    describe('layers array not set in old context', () => {
      beforeEach(() => {
        oldContext = {};
        newContext = {
          layers: SAMPLE_LAYERS,
        };
      });
      it('returns empty array layers', () => {
        expect(getRemovedLayers(newContext, oldContext)).toEqual([]);
      });
    });
    describe('old context is null', () => {
      beforeEach(() => {
        oldContext = null;
        newContext = {
          layers: SAMPLE_LAYERS,
        };
      });
      it('returns empty array layers', () => {
        expect(getRemovedLayers(newContext, oldContext)).toEqual([]);
      });
    });
  });

  describe('hasViewChanged', () => {
    describe('map view is same obj', () => {
      beforeEach(() => {
        oldContext = {
          view: { zoom: 1 },
        };
        newContext = {
          view: oldContext.view,
        };
      });
      it('returns false', () => {
        expect(hasViewChanged(newContext, oldContext)).toBeFalsy();
      });
    });
    describe('no map view in new context', () => {
      beforeEach(() => {
        oldContext = {
          view: { zoom: 1 },
        };
        newContext = {};
      });
      it('returns false', () => {
        expect(hasViewChanged(newContext, oldContext)).toBeFalsy();
      });
    });
    describe('no map view in old context', () => {
      beforeEach(() => {
        oldContext = {};
        newContext = {
          view: oldContext.view,
        };
      });
      it('returns true', () => {
        expect(hasViewChanged(newContext, oldContext)).toBeTruthy();
      });
    });
    describe('map view object is different in new context', () => {
      beforeEach(() => {
        oldContext = {
          view: { zoom: 1 },
        };
        newContext = {
          view: { zoom: 1 },
        };
      });
      it('returns true', () => {
        expect(hasViewChanged(newContext, oldContext)).toBeTruthy();
      });
    });
    describe('old context is null', () => {
      beforeEach(() => {
        oldContext = null;
        newContext = {
          view: { zoom: 1 },
        };
      });
      it('returns true', () => {
        expect(hasViewChanged(newContext, oldContext)).toBeTruthy();
      });
    });
    describe('old context is null, new context has no view', () => {
      beforeEach(() => {
        oldContext = null;
        newContext = {};
      });
      it('returns false', () => {
        expect(hasViewChanged(newContext, oldContext)).toBeFalsy();
      });
    });
  });
});
