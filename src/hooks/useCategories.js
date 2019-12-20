import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

function useCategories() {
  const auth = useAuth();

  const [options, setOptions] = useState([
    {
      value: null,
      label: 'Log in to Clio to access categories.'
    }
  ]);

  useEffect(() => {
    if (auth.authToken) {
      auth.getCategories(auth.authToken).then(res => {
        const options = res.data.data.map(option => {
          return {
            value: option.id,
            label: option.name
          };
        });
        setOptions(options);
      });
    }
  }, [auth]);

  return options;
}

export { useCategories };
