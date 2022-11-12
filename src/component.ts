import {
  getAddedLayers,
  getRemovedLayers,
  hasParamChanged,
} from './service/context';
import {
  addLayer,
  createMap,
  removeLayer,
  setHasBaseMap,
  setView,
} from './service/openlayers';
import OlMap from 'ol/Map';
import { MapContext } from './model';

// add default styling for native-map elements
const elStyle = document.createElement('style');
elStyle.innerHTML = `native-map {
  width: 400px;
  height: 300px;
  display: block;
}`;
document.head.appendChild(elStyle);

export class NativeMapElement extends HTMLElement {
  incomingContext: MapContext = null;
  olMap: OlMap = null;

  get context() {
    return {}; // TODO: return current map state
  }

  set context(val: MapContext) {
    this.handleContextChanged(val, this.incomingContext);
    this.incomingContext = val;
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.olMap = createMap(this);
    if (this.incomingContext) {
      this.handleContextChanged(this.incomingContext, null);
    }
    this.olMap.updateSize();
  }

  disconnectedCallback() {
    if (this.olMap === null) return;
    this.olMap.dispose();
    this.olMap = null;
  }

  /**
   * @param {MapContext} newContext
   * @param {MapContext|null} oldContext
   */
  handleContextChanged(newContext: MapContext, oldContext: MapContext) {
    if (this.olMap === null) return;
    getAddedLayers(newContext, oldContext).map(({ layer, position }) =>
      addLayer(this.olMap, layer, position)
    );
    getRemovedLayers(newContext, oldContext).map((layer) =>
      removeLayer(this.olMap, layer)
    );
    if (hasParamChanged('view', newContext, oldContext)) {
      setView(this.olMap, newContext.view);
    }
    if (hasParamChanged('noBaseMap', newContext, oldContext)) {
      setHasBaseMap(this.olMap, !newContext.noBaseMap);
    }
  }
}

customElements.define('native-map', NativeMapElement);
