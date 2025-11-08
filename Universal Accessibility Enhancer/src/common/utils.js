// Cross-browser API wrapper
// Prefer browser.*; fall back to chrome.*
(function initUaeApi(global){
  const api = (typeof global.browser !== 'undefined') ? global.browser : (typeof global.chrome !== 'undefined' ? global.chrome : {});
  // attach to global for easy access without imports
  global.uaeApi = api;

  // simple storage helpers on global
  global.uaeGetStorage = function(keys){
    return new Promise((resolve) => {
      (api.storage && api.storage.sync ? api.storage.sync : api.storage.local).get(keys, resolve);
    });
  };
  global.uaeSetStorage = function(items){
    return new Promise((resolve) => {
      (api.storage && api.storage.sync ? api.storage.sync : api.storage.local).set(items, resolve);
    });
  };
})(typeof self !== 'undefined' ? self : this);
