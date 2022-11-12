import 'regenerator-runtime/runtime';
import 'isomorphic-fetch';

// mock the global fetch API
window.fetchResponseFactory = (url) => '{ "empty": true }';
window.originalFetch = window.fetch;
window.mockFetch = jest.fn((url) =>
  Promise.resolve({
    text: () => Promise.resolve(globalThis.fetchResponseFactory(url)),
    json: () =>
      Promise.resolve(JSON.parse(globalThis.fetchResponseFactory(url))),
    status: 200,
    ok: true,
  })
);
window.fetch = window.mockFetch;
