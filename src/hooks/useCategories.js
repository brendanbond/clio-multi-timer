import { useState, useEffect } from 'react';

function useCategories(auth) {
  const [options, setOptions] = useState([
    {
      value: null,
      label: 'Login to Clio to access categories.'
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
