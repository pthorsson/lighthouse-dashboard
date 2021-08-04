# Lighthouse Dashboard

An application for managing multiple websites in Lighthouse.

## Application info

The server of the application runs an [Express](https://expressjs.com/) server
and uses web sockets to push the state of the audits to the client. It uses the
[Lighthouse](https://www.npmjs.com/package/lighthouse) package to run the audits
from the server.

The client is build with [React](https://reactjs.org/).

### Roles

| Endpoint / Required role  | None | Viewer | User | Admin | Super admin |
| ------------------------- | ---- | ------ | ---- | ----- | ----------- |
| `/api/get-current-user`   | ✓    | ✓      | ✓    | ✓     | ✓           |
| `/api/data/sections`      | ✓    | ✓      | ✓    | ✓     | ✓           |
| `/api/token/*`            | -    | -      | ✓    | ✓     | ✓           |
| `/api/actions/*`          | -    | -      | ✓    | ✓     | ✓           |
| `/api/admin/section/*`    | -    | -      | -    | ✓     | ✓           |
| `/api/admin/page-group/*` | -    | -      | -    | ✓     | ✓           |
| `/api/admin/page/*`       | -    | -      | -    | ✓     | ✓           |
| `/api/admin/info/*`       | -    | -      | -    | -     | ✓           |
| `/api/admin/user/*`       | -    | -      | -    | -     | ✓           |

## Installation

Requirements and instructions for installing and running the application in development or production.

### Dependencies

- [Yarn](https://yarnpkg.com/) >= 1.22
- [Node](https://nodejs.org/en/) >= 10
- [MongoDB](https://www.mongodb.com/)
- [Google Chrome](https://www.google.com/chrome/) (Headless)
- [Azure AD](https://azure.microsoft.com/en-us/services/active-directory/)
  application

### Run application

1. Make sure all required environment variables are available
   - `NODE_ENV` should be `development` or `production`
   - `PORT` port that the application will run on, defaults to `3000`
   - `MONGO_CONNECTION_STR` full MongoDB connection url with credentials
   - `AUTH_AD_TENANT_ID`, `AUTH_AD_CLIENT_ID` and `AUTH_AD_ISSUER` for Azure AD
2. Run install yarn install script `yarn` in the root of the project

#### In development

3. Run yarn dev script `yarn dev` in project root to run both back end and front end applications.
   - For running only back end `yarn dev:server`
   - For running only front end `yarn dev:client` (requires running server)
4. Access the application on `http://localhost:<port>`, port being the environment variable `PORT`

#### In production

3. Run yarn dev script `yarn build` in project root to build both back end and front end applications.
4. Run the server from the build dir in the repo `node .build/server/server.js`

---

Credit to [Volvo Cars](https://www.volvocars.com/) (Global Online Business) where this application has been developed as a side project.
