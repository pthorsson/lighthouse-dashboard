import React, { useContext } from 'react';
import { apiFetch } from '@lib/adal';

export enum USER_ROLES {
  NONE,
  VIEWER,
  USER,
  ADMIN,
  SUPERADMIN,
}

type CurrentUserState = {
  user: {
    id: string;
    email: string;
    role: USER_ROLES;
  };
  isReady: boolean;
};

type ContextState = CurrentUserState['user'] & {
  ensureRole: (role: USER_ROLES) => boolean;
};

const CurrentUserContext = React.createContext<ContextState>({
  id: null,
  email: null,
  role: USER_ROLES.NONE,
  ensureRole: null,
});

export class CurrentUserProvider extends React.Component {
  state: CurrentUserState = {
    user: {
      id: null,
      email: null,
      role: USER_ROLES.NONE,
    },
    isReady: false,
  };

  async componentDidMount() {
    const res = await apiFetch('/api/get-current-user', {
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await res.json();

    this.setState({
      isReady: true,
      user: {
        id: data?.id || null,
        email: data?.email || null,
        role: data?.role || USER_ROLES.NONE,
      },
    });
  }

  ensureRole = (role: USER_ROLES) => this.state.user.role >= role;

  render() {
    const context: ContextState = {
      ...this.state.user,
      ensureRole: this.ensureRole,
    };

    return (
      this.state.isReady && (
        <CurrentUserContext.Provider value={context}>
          {this.props.children}
        </CurrentUserContext.Provider>
      )
    );
  }
}

type CurrentUserHook = () => ContextState;

export const useCurrentUser: CurrentUserHook = () =>
  useContext(CurrentUserContext);

type EnsureUserRoleProps = {
  role: USER_ROLES;
};

export const EnsureUserRole: React.FC<EnsureUserRoleProps> = ({
  children,
  role,
}) => {
  const currentUser = useCurrentUser();

  return currentUser.role >= role ? <>{children}</> : null;
};
