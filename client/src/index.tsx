import { runWithAdal } from 'react-adal';
import { authContext } from '@lib/adal';
import { getUrlQuery } from '@lib/utils';

const query = getUrlQuery();

if (!query['token']) {
  runWithAdal(
    authContext,
    () => {
      require('./app');
    },
    false
  );
} else {
  require('./app');
}
