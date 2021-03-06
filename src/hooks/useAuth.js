import React, { useState, useContext, createContext, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import axios from "axios";
import queryString from "query-string";

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
  const [authToken, setAuthToken] = useLocalStorage("authToken", null);

  const [isAuth, setIsAuth] = useState(false);
  const [isFetchingAuth, setIsFetchingAuth] = useState(false);

  useEffect(() => {
    if (authToken && !isAuth) {
      setIsAuth(true);
    }
  }, [authToken, isAuth]);

  const createPopup = () => {
    const width = 500;
    const height = 500;
    const baseUrl = "https://app.clio.com/oauth/authorize?";
    const params = queryString.stringify({
      response_type: "code",
      client_id: "MYAsywFlsKfGDXOwCsH75QUKIZ527ZWFIxvWtczw",
      redirect_uri:
        process.env.NODE_ENV === "production"
          ? "https://clio-multi-timer.herokuapp.com/callback"
          : "https://localhost:5000/callback"
    });

    const url = baseUrl + params;

    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;
    const popup = window.open(
      url,
      "Login to Clio",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    const checkForCode = setInterval(() => {
      try {
        if (!popup || popup.closed || popup.closed === undefined) {
          clearInterval(checkForCode);
          return;
        }
        const params = new URL(popup.location).searchParams;
        const code = params.get("code");
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
      .get(`/auth?code=${code}`)
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
    const data = {
      accessToken: token
    };

    return axios.post("/matters", queryString.stringify(data));
  };

  const getCategories = authToken => {
    const token = `Bearer ${authToken}`;
    const data = {
      accessToken: token
    };

    return axios.post("/categories", queryString.stringify(data));
  };

  const submitActivity = data => {
    //is it bad that I don't revalidate data here?
    return axios.post("/submit_activity", data).then(res => {
      if (res.status === 200) {
        return true;
      } else {
        return false;
      }
    });
  };

  // Return the auth object and auth methods
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
