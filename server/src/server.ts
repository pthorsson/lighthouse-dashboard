import './register-module-alias';

import * as express from 'express';
import * as bodyParser from 'body-parser';
import { createServer } from 'http';
import { PORT, APP_STATIC_DIR, BUILD_DIR } from '@config';
import * as socketIo from 'socket.io';
import devHotReload from './dev-hot-reload';
import * as lighthouse from '@lib/lighthouse';
import { mongoose } from '@db';
import { ensureUserRole, setCurrentUser, USER_ROLES } from '@middleware';
import * as serverState from '@lib/server-state';

import * as userController from '@controllers/admin/user.controller';
import * as sectionController from '@controllers/admin/section.controller';
import * as pageGroupController from '@controllers/admin/page-group.controller';
import * as pageController from '@controllers/admin/page.controller';
import * as actionsController from '@controllers/actions.controller';
import * as publicController from '@controllers/public.controller';

import { errorHandler } from '@middleware';

const app = express();
const server = createServer(app);
const io = socketIo(server, { path: '/socket' });

// Open a database connection
mongoose.connect(process.env.MONGO_CONNECTION_STR, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

if (process.env.NODE_ENV !== 'development') {
  // Set default CPU throttle if in development mode
  serverState.set({
    cpuThrottle: 4,
    state: serverState.SERVER_STATE.OK,
  });
} else {
  // Preform a calibration of Lighthouse on start-up
  console.log('Calibrating Lighthouse ...');

  lighthouse.calibrate(({ cpuThrottle, benchmarkIndex }, error) => {
    if (!cpuThrottle || error) {
      serverState.set({
        state: serverState.SERVER_STATE.ERROR,
      });

      console.log('Calibrating Lighthouse ERROR');
      console.error(error);
    } else {
      serverState.set({
        cpuThrottle,
        state: serverState.SERVER_STATE.ERROR,
      });

      console.log(
        `Calibrating Lighthouse DONE - cpuThrottle set to ${cpuThrottle.toFixed(
          1
        )} based on benchmarkIndex ${benchmarkIndex}`
      );
    }
  });
}

// Set up socket listeners on socket connect
io.on('connection', (socket) => {
  const { section } = socket.handshake.query;

  socket.on('request-server-state-update', () => {
    const { state } = serverState.get();
    socket.emit('server-state-update', state);
  });

  // Recieve section state request and send section state
  socket.on('request-section-state-update', (section) => {
    const state = lighthouse.getSectionState(section);
    socket.emit('section-state-update', { state });
  });

  // Recieve section data request and send section data
  socket.on('request-section-data', (section) => {
    const data = lighthouse.getSectionData(section);
    socket.emit('section-data', { section: data });
  });

  const serverStateSub = serverState.subscribe(({ state }) => {
    socket.emit('server-state-update', state);
  });

  // Subscribe to lighthouse data updates
  const dataUpdateSub = lighthouse.on('data-update', section, (data) => {
    socket.emit('section-data', data);
  });

  // Subscribe to lighthouse state updates
  const stateUpdateSub = lighthouse.on(
    'section-state-update',
    section,
    (data) => {
      console.log(`==== Lighthouse state updated (${section}) ====`);
      console.log(JSON.stringify(data.state, null, 2));

      socket.emit('section-state-update', data);
    }
  );

  // Subscribe to lighthouse audit completions
  const auditCompleteSub = lighthouse.on('audit-complete', section, (data) => {
    socket.emit('audit-complete', data);
  });

  // Remove subscriptions for socket on disconnect
  socket.on('disconnect', () => {
    serverStateSub.remove();
    dataUpdateSub.remove();
    stateUpdateSub.remove();
    auditCompleteSub.remove();
  });
});

// Apply body parser
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      // Tries to parse json and lets error handler catch if failed
      JSON.parse(buf.toString());
    },
  })
);

// Set application static directory
app.use('/static', express.static(APP_STATIC_DIR));

// ---- Admin API endpoints

// Ensure SUPERADMIN role for all admin user endpoints
app.use('/api/admin/user', ensureUserRole(USER_ROLES.SUPERADMIN));

// User handling endpoints
app.get('/api/admin/user', userController.getAll);
app.post('/api/admin/user', userController.create);
app.put('/api/admin/user/:id', userController.update);
app.delete('/api/admin/user/:id', userController.remove);

// Ensure ADMIN role for the rest of the admin endpoints
app.use(
  ['/api/admin/section', '/api/admin/page-group', '/api/admin/page'],
  ensureUserRole(USER_ROLES.ADMIN)
);

// Section handling endpoints
app.get('/api/admin/section', sectionController.getAll);
app.post('/api/admin/section', sectionController.create);
app.put('/api/admin/section/:id', sectionController.update);
app.delete('/api/admin/section/:id', sectionController.remove);

// PageGroup handling endpoints
app.get('/api/admin/page-group', pageGroupController.getAll);
app.post('/api/admin/page-group', pageGroupController.create);
app.put('/api/admin/page-group/:id', pageGroupController.update);
app.delete('/api/admin/page-group/:id', pageGroupController.remove);

// Page handling endpoints
app.get('/api/admin/page', pageController.getAll);
app.post('/api/admin/page', pageController.create);
app.delete('/api/admin/page/:id', pageController.remove);

// ---- Token API endpoints

// Ensure USER role for all token endpoints and set current user
app.use('/api/token', [ensureUserRole(USER_ROLES.USER), setCurrentUser()]);

app.get('/api/token', userController.getTokens);
app.post('/api/token', userController.createToken);
app.delete('/api/token/:tokenId', userController.removeToken);

// ---- Action API endpoints

// Ensure USER role for all action endpoints
app.use('/api/actions', ensureUserRole(USER_ROLES.USER));

// Endpoint for trigger an audit
app.get(
  '/api/actions/trigger-audit/:section/:id',
  actionsController.triggerAudit
);

// Endpoint for trigger all audits
app.get(
  '/api/actions/trigger-all-audits/:section',
  actionsController.triggerAllAudits
);

// Endpoint for removing a queued audit
app.get(
  '/api/actions/remove-queued-audit/:section/:id',
  actionsController.removeQueuedAudit
);

// Endpoint for removing all queued audits
app.get(
  '/api/actions/remove-all-queued-audits/:section',
  actionsController.removeAllQueuedAudits
);

// ---- Public API endpoints

// Serves data from section
app.get('/api/data/:section', [
  ensureUserRole(USER_ROLES.USER),
  ...publicController.getSectionData,
]);

// Serves all sections
app.get('/api/sections', [
  ensureUserRole(USER_ROLES.VIEWER),
  ...publicController.getSections,
]);

// Checks viewer token
app.get('/api/get-current-user', [
  setCurrentUser(),
  ...publicController.getCurrentUser,
]);

// Serves application info data
app.get('/api/application-info', publicController.getApplicationInfo);

// ---- Other

// Serve generated html audit report
app.get('/report/:audit', publicController.serveReport);

// Handle bad requests
app.use('/api/*', ensureUserRole(USER_ROLES.VIEWER), (req, res) => {
  res.status(404).json('Not found');
});

// Enable client side application hot reload in development
if (process.env.NODE_ENV === 'development') {
  devHotReload(app, {
    port: PORT + 1,
    watchDir: BUILD_DIR,
    subDir: 'client',
    route: '/*',
  });
}

// Serves client side SPA
app.get('/*', publicController.serveApp);

// Universal error handler
app.use(errorHandler);

// Run server
server.listen(PORT, () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('\n**********************************\n');
    console.log(`Server up on http://localhost:${PORT}`);
    console.log('\n**********************************\n');
  }
});
