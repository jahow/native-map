import {
  getAddedLayers,
  getRemovedLayers,
  hasParamChanged,
} from './service/context';
import {
  addLayer,
  createMap,
  getFeaturesAtCoordinate,
  getMapLayers,
  removeLayer,
  setHasBaseMap,
  setView,
} from './service/openlayers';
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import {
  EventMap,
  FeaturesClickedEvent,
  LonLatCoords,
  MapContext,
} from './model';
import Layer from 'ol/layer/Layer';
import Source from 'ol/source/Source';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';

// add default styling for native-map elements
const elStyle = document.createElement('style');
elStyle.innerHTML = `native-map {
  width: 400px;
  height: 300px;
  display: block;
}`;
document.head.appendChild(elStyle);

export class NativeMapElement extends HTMLElement {
  private incomingContext: MapContext = null;
  private olMap: OlMap = null;
  private featuresClickedKey: EventsKey = null;

  get context() {
    return this.incomingContext;
  }

  set context(val: MapContext) {
    this.handleContextChanged(val, this.incomingContext);
    this.incomingContext = val;
  }

  get olView(): OlView {
    return this.olMap?.getView() || null;
  }

  get olLayers(): (Layer<Source, any> | null)[] {
    if (!this.olMap || !this.incomingContext) return [];
    return getMapLayers(this.olMap, this.incomingContext);
  }

  get olInteractions() {
    return this.olMap.getInteractions();
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
    this.disableFeaturesClicked();
    this.olMap.dispose();
    this.olMap = null;
  }

  addEventListener<K extends keyof EventMap>(
    type: K,
    listener: (this: HTMLElement, ev: EventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions
  ) {
    if (type === 'featuresClicked') {
      this.enableFeaturesClicked();
    }
    return super.addEventListener(type, listener, options);
  }

  removeEventListener<K extends keyof EventMap>(
    type: K,
    listener: (this: HTMLElement, ev: EventMap[K]) => unknown,
    options?: boolean | EventListenerOptions
  ) {
    if (type === 'featuresClicked') {
      this.disableFeaturesClicked();
    }
    return super.removeEventListener(type, listener, options);
  }

  private enableFeaturesClicked() {
    if (this.olMap === null)
      throw new Error('[native-map] element is not attached to DOM yet');
    if (this.featuresClickedKey) return;
    this.featuresClickedKey = this.olMap.on('click', async (event) => {
      const coords = event.coordinate;
      const features = await getFeaturesAtCoordinate(
        this.olMap,
        this.incomingContext,
        coords as LonLatCoords
      );
      this.dispatchEvent(
        new CustomEvent('featuresClicked', {
          detail: { features },
        }) as FeaturesClickedEvent
      );
    });
  }

  private disableFeaturesClicked() {
    unByKey(this.featuresClickedKey);
    this.featuresClickedKey = null;
  }

  /**
   * @param {MapContext} newContext
   * @param {MapContext|null} oldContext
   */
  private handleContextChanged(newContext: MapContext, oldContext: MapContext) {
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
