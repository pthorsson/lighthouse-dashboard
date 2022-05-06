import { runWithAdal } from 'react-adal';
import { authContext } from './lib/adal.js';
import { getUrlQuery } from './lib/utils.js';
import initApp from './app.js';

const query = getUrlQuery();

if (!query['token']) {
  runWithAdal(
    authContext,
    () => {
      initApp();
    },
    false
  );
} else {
  initApp();
}
