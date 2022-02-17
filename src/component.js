import {
  getAddedLayers,
  getRemovedLayers,
  hasViewChanged,
} from "./service/context";
import {
  addLayer,
  createMap,
  removeLayer,
  setView,
} from "./service/openlayers";

class NativeMapElement extends HTMLElement {
  get context() {
    return {}; // TODO: return current map state
  }

  set context(val) {
    this.handleContextChanged(val, this.incomingContext);
    this.incomingContext = val;
  }

  constructor() {
    super();

    /**
     * @type {import('ol').Map}
     */
    this.olMap = null;

    /**
     * @type {MapContext|null}
     */
    this.incomingContext = null;
  }

  connectedCallback() {
    this.olMap = createMap();
    if (this.incomingContext) {
      this.handleContextChanged(this.incomingContext, null);
    }
  }

  disconnectedCallback() {
    this.olMap.dispose();
    this.olMap = null;
  }

  /**
   * @param {MapContext} newContext
   * @param {MapContext|null} oldContext
   */
  handleContextChanged(newContext, oldContext) {
    getAddedLayers(newContext, oldContext).map(({ layer, position }) =>
      addLayer(this.olMap, layer, position)
    );
    getRemovedLayers(newContext, oldContext).map((layer) =>
      removeLayer(this.olMap, layer)
    );
    if (hasViewChanged(newContext, oldContext)) {
      setView(this.olMap, newContext.view);
    }
  }
}

customElements.define("native-map", NativeMapElement);
