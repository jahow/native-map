# native-map

A native web component that shows an interactive map based on a given context.

[Live demo here!](https://jahow.github.io/native-map/master/)

## Usage

To use it:

```shell
npm install @camptocamp/native-map
```

```html
<html>
    ...
    <body>
      <native-map></native-map>
    </body>
</html>
```

```js
import '@camptocamp/native-map'

const nativeMap = document.getElementById('map');
nativeMap.context = {
  view: {
    zoom: 3,
    center: [4, 45]
  },
  layers: [
    { url: 'https://my.test.server/wms', type: 'wms', name: 'abcd' }
  ]
};
```

The map cannot be modified directly, everything has to be done declaratively using the `context` property of the
`NativeMapElement` class.

When providing a new context, the component checks which parts of it have changed using reference equality instead
of deep equality.

As an example, this will cause the WMS layer to be recreated:
```js
// initial context has only one layer
nativeMap.context = {
  layers: [
    { url: 'https://my.test.server/wms', type: 'wms', name: 'abcd' }
  ]
};

// add a new layer in first position
nativeMap.context = {
  layers: [
    { ... },
    { url: 'https://my.test.server/wms', type: 'wms', name: 'abcd' }
  ]
};
```

This will not (because the same layer object is used in both contexts):
```js
const wmsLayer = [{ url: 'https://my.test.server/wms', type: 'wms', name: 'abcd' }];

// initial context has only one layer
nativeMap.context = {
  layers: [
    wmsLayer
  ]
};

// add a new layer in first position
nativeMap.context = {
  layers: [
    { ... },
    wmsLayer
  ]
};
```

### Demo

To run the demo:
```shell
npm install
npm run demo
```
