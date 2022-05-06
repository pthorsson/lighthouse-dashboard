import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Display from './pages/display.js';
import Dashboard from './pages/dashboard.js';
import LandingPage from './pages/landing-page.js';
import Log from './pages/log.js';
import { useCurrentUser } from './hooks/index.js';
import SectionVerifier from './components/section-verifier/index.js';
import ErrorScreen from './components/error-screen/index.js';
import Providers from './providers.js';

import { USER_ROLES } from './hooks/use-current-user.js';

const App = () => {
  const currentUser = useCurrentUser();

  return (
    <Router>
      <Switch>
        {currentUser.role >= USER_ROLES.VIEWER && (
          <Route exact path="/">
            <LandingPage />
          </Route>
        )}
        {currentUser.role >= USER_ROLES.VIEWER && (
          <Route exact path="/:section">
            <SectionVerifier>
              <Dashboard />
            </SectionVerifier>
          </Route>
        )}
        {currentUser.role >= USER_ROLES.VIEWER && (
          <Route exact path="/:section/display">
            <SectionVerifier>
              <Display />
            </SectionVerifier>
          </Route>
        )}
        {currentUser.role >= USER_ROLES.SUPERADMIN && (
          <>
            <Route exact path="/log/calibration">
              <Log type="calibration" />
            </Route>
            <Route exact path="/log/section/:section">
              <Log type="section" />
            </Route>
          </>
        )}
        <Route>
          <ErrorScreen
            header="404"
            message="Nothing to see here!"
            link={{ text: 'Go to landing page', href: '/' }}
          />
        </Route>
      </Switch>
    </Router>
  );
};

export default () => {
  ReactDOM.render(
    <Providers>
      <App />
    </Providers>,
    document.getElementById('app-root')
  );
};
