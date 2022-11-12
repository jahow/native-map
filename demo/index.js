import '@camptocamp/native-element';

const DEFAULT_CODE = `const mapEl = document.getElementById('map');

mapEl.context = {
  view: {
    zoom: 6,
    center: [4, 47]
  },
  layers: [
    {
      type: 'wms',
      url: 'https://www.geo2france.fr/geoserver/spld/ows',
      name: 'cantons',
    }
  ]
};

mapEl.addEventListener('featuresClicked', event => console.log('features clicked:', event.detail.features));
`;

const codeInputEl = document.getElementById('code-input');
const runBtn = document.getElementById('run-btn');

function execCode() {
  const code = codeInputEl.value;
  const execFn = new Function(code);
  execFn();
}

codeInputEl.value = DEFAULT_CODE;
execCode();

runBtn.addEventListener('click', execCode);
