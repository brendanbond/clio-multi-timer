import React from 'react';
import Loading from './Loading';
import { useAuth } from '../hooks/useAuth';

function AuthorizeButton(props) {
  const auth = useAuth();

  if (!auth.isAuth) {
    return (
      <button className="btn btn-primary mr-2" onClick={auth.createPopup}>
        Authorize
      </button>
    );
  } else if (auth.isFetchingAuth) {
    return (
      <button className="btn btn-primary mr-2">
        <Loading />
      </button>
    );
  } else {
    return (
      <button className="btn btn-primary mr-2 disabled">Authorized</button>
    );
  }
}

export default AuthorizeButton;
