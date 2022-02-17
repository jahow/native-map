import { getAddedLayers } from "./context";

const SAMPLE_LAYERS = [{ url: "abcd" }, { url: "1234" }, { url: "xyz" }];

describe("context functions", () => {
  let oldContext, newContext;
  describe("getAddedLayers", () => {
    describe("layers array has not changed", () => {
      beforeEach(() => {
        oldContext = {
          layers: SAMPLE_LAYERS,
        };
        newContext = {
          layers: SAMPLE_LAYERS,
        };
      });
      it("returns empty array", () => {
        expect(getAddedLayers(newContext, oldContext)).toEqual([]);
      });
    });
    describe("layers array changed", () => {
      beforeEach(() => {
        oldContext = {
          layers: SAMPLE_LAYERS,
        };
        newContext = {
          layers: [
            SAMPLE_LAYERS[1],
            { url: "6789" },
            SAMPLE_LAYERS[0],
            { url: "abcd" },
          ],
        };
      });
      it("returns changed layers", () => {
        expect(getAddedLayers(newContext, oldContext)).toEqual([
          { layer: { url: "6789" }, position: 1 },
          { layer: { url: "abcd" }, position: 3 },
        ]);
      });
    });
    describe("layers array not set in new context", () => {
      beforeEach(() => {
        oldContext = {
          layers: SAMPLE_LAYERS,
        };
        newContext = {};
      });
      it("returns empty array", () => {
        expect(getAddedLayers(newContext, oldContext)).toEqual([]);
      });
    });
    describe("layers array not set in old context", () => {
      beforeEach(() => {
        oldContext = null;
        newContext = {
          layers: SAMPLE_LAYERS,
        };
      });
      it("returns changed layers", () => {
        expect(getAddedLayers(newContext, oldContext)).toEqual([
          { layer: { url: "abcd" }, position: 0 },
          { layer: { url: "1234" }, position: 1 },
          { layer: { url: "xyz" }, position: 2 },
        ]);
      });
    });
  });
  describe("getRemovedLayers", () => {});
  describe("hasViewChanged", () => {});
});
