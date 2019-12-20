import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

function useMatters() {
  const auth = useAuth();
  const [options, setOptions] = useState([
    {
      value: null,
      label: 'Log in to Clio to access matters.'
    }
  ]);

  useEffect(() => {
    if (auth.authToken) {
      auth.getMatters(auth.authToken).then(res => {
        const options = res.data.data.map(option => {
          return {
            value: option.id,
            label: option.display_number + ' ' + option.description
          };
        });
        setOptions(options);
      });
    }
  }, [auth]);

  return options;
}

export { useMatters };
