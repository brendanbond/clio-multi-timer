import { useState, useEffect } from 'react';

function useMatters(auth) {
  const [options, setOptions] = useState([
    {
      value: null,
      label: 'Login to Clio to access matters.'
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
