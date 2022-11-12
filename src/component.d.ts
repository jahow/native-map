import { MapContext } from './model';

export declare class NativeMapElement extends HTMLElement {
  get context(): MapContext;
  set context(val: MapContext);
}

declare global {
  interface HTMLElementTagNameMap {
    'native-map': NativeMapElement;
  }
}
