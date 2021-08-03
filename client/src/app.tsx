import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Display from '@pages/display';
import Dashboard from '@pages/dashboard';
import LandingPage from '@pages/landing-page';
import Log from '@pages/log';
import { useCurrentUser } from '@hooks';
import SectionVerifier from '@components/section-verifier';
import ErrorScreen from '@components/error-screen';
import Providers from './providers';

import { USER_ROLES } from '@hooks/use-current-user';

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

ReactDOM.render(
  <Providers>
    <App />
  </Providers>,
  document.getElementById('app-root')
);
