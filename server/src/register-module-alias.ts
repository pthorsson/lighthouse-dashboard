import { join } from 'path';
import * as moduleAlias from 'module-alias';

moduleAlias.addAliases({
  '@config': join(__dirname, 'config'),
  '@db': join(__dirname, 'db'),
  '@lib': join(__dirname, 'lib'),
  '@models': join(__dirname, 'models'),
  '@middleware': join(__dirname, 'middleware'),
  '@controllers': join(__dirname, 'controllers'),
});

moduleAlias(join(__dirname, '../../server/package.json'));
