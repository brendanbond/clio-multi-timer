import React from 'react';
import { useAuth } from '../hooks/useAuth';

function ClioAuth() {
  const auth = useAuth();

  if (!auth.isAuth) {
    return (
      <button className="btn btn-primary mr-2" onClick={auth.createPopup}>
        Login
      </button>
    );
  } else if (auth.isFetchingAuth) {
    return (
      <button className="btn btn-primary mr-2" onClick={auth.createPopup}>
        <div className="bouncing-loader">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </button>
    );
  } else {
    return (
      <button className="btn btn-primary mr-2" onClick={auth.logout}>
        Logout
      </button>
    );
  }
}

export default ClioAuth;
