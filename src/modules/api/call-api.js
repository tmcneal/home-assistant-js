import { Promise } from 'es6-promise';

import { getters as authGetters } from '../auth';

let callApi = function callApi(reactor, method, path, parameters = null) {
  const authInfo = reactor.evaluate(authGetters.authInfo);

  const url = `${authInfo.host}/api/${path}`;

  return new Promise(function apiResponse(resolve, reject) {
    const req = new XMLHttpRequest();
    req.open(method, url, true);
    req.setRequestHeader('X-HA-access', authInfo.authToken);

    req.onload = () => {
      if (req.status > 199 && req.status < 300) {
        resolve(JSON.parse(req.responseText));
      } else {
        // see if we got an error back.
        try {
          reject(JSON.parse(req.responseText));
        } catch (err) {
          reject({});
        }
      }
    };

    req.onerror = () => reject({});

    if (parameters) {
      req.send(JSON.stringify(parameters));
    } else {
      req.send();
    }
  });
};

if (__DEMO__) {
  callApi = function demoCallAPI(method, path) {
    return new Promise(function demoAPIResponse(resolve) {
      if (method !== 'GET') {
        throw new Error(`Method ${method} not allowed in demo mode.`);
      }

      const component = path.split('/', 1)[0];

      switch (component) {
      case 'bootstrap':
        resolve(require('../demo/bootstrap_data.js'));
        break;
      case 'logbook':
        resolve(require('../demo/logbook_data.js'));
        break;
      case 'history':
        resolve(require('../demo/state_history_data.js'));
        break;
      default:
        throw new Error(`URL not implemented in demo mode /api/${path}`);
      }
    });
  };
}

export default callApi;
