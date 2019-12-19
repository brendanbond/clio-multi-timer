import React, { useState, useEffect, useContext, createContext } from 'react';
import axios from 'axios';
import queryString from 'query-string';

const authContext = createContext();

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
const useAuth = () => {
  return useContext(authContext);
};

// Provider hook that creates auth object and handles state
function useProvideAuth() {
  const [authToken, setAuthToken] = useState(null);

  const [isAuth, setIsAuth] = useState(false);
  const [isFetchingAuth, setIsFetchingAuth] = useState(false);

  const createPopup = () => {
    const width = 500;
    const height = 500;
    const baseUrl = 'https://app.clio.com/oauth/authorize?';
    const params = queryString.stringify({
      response_type: 'code',
      client_id: 'MYAsywFlsKfGDXOwCsH75QUKIZ527ZWFIxvWtczw',
      redirect_uri: 'https://localhost:3000/auth'
    });
    const url = baseUrl + params;

    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;
    const popup = window.open(
      url,
      'Login to Clio',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    const checkForCode = setInterval(() => {
      try {
        if (!popup || popup.closed || popup.closed === undefined) {
          clearInterval(checkForCode);
          return;
        }
        const params = new URL(popup.location).searchParams;
        const code = params.get('code');
        if (!code) {
          return;
        }
        clearInterval(checkForCode);
        onCode(code, params);
        popup.close();
      } catch (err) {
        console.log(err);
      }
    }, 200);
  };

  const onCode = (code, params) => {
    setIsFetchingAuth(true);
    axios
      .get(`https://clio-multi-timer-server.herokuapp.com/auth?code=${code}`)
      .then(res => {
        console.log(res);
        setAuthToken(res.data.access_token);
        setIsAuth(true);
        setIsFetchingAuth(false);
      })
      .catch(err => {
        console.log(err);
        setIsFetchingAuth(false);
      });
  };

  const onClose = () => {
    return null;
  };

  const logout = () => {
    return;
  };

  const getMatters = authToken => {
    const token = `Bearer ${authToken}`;
    const url = 'https://app.clio.com/api/v4/matters.json';
    return axios.get(url, {
      params: {
        fields: 'id,display_number,description',
        status: 'open'
      },
      headers: {
        Authorization: token
      }
    });
  };

  const getCategories = authToken => {
    const token = `Bearer ${authToken}`;
    const url = 'https://app.clio.com/api/v4/activity_descriptions.json';
    return axios.get(url, {
      params: {
        fields: 'id,name',
        flat_rate: false
      },
      headers: {
        Authorization: token
      }
    });
  };

  const submitActivity = (authToken, data) => {
    const token = `Bearer ${authToken}`;
    const url = 'https://app.clio.com/api/v4/activities.json';
    return axios
      .post(url, data, {
        headers: {
          Authorization: token
        }
      })
      .then(res => {
        if (res.status === 200) {
          return true;
        } else {
          return false;
        }
      });
  };

  // Return the user object and auth methods
  return {
    authToken,
    createPopup,
    getMatters,
    getCategories,
    isAuth,
    isFetchingAuth,
    logout,
    submitActivity
  };
}

export { ProvideAuth, useAuth };
