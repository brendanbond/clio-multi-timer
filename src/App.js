import React, { useState, useEffect } from 'react';
import TimeEntry from './components/TimeEntry';
import LoginButton from './components/LoginButton';
import { ProvideAuth } from './hooks/useAuth';

import './App.css';

function App() {
  const [timeEntries, setTimeEntries] = useState([<TimeEntry key={1} />]);

  const addTimeEntry = () => {
    let key = timeEntries.length + 1;
    setTimeEntries([...timeEntries, <TimeEntry key={key} />]);
  };

  return (
    <ProvideAuth>
      <div className="app">
        <div className="container text-center">
          <h1>clio-multi-timer</h1>
        </div>
        <div className="container text-right mb-2">
          <LoginButton />
          <button className="btn btn-primary" onClick={addTimeEntry}>
            Add
          </button>
        </div>
        <div className="container">{timeEntries}</div>
      </div>
    </ProvideAuth>
  );
}

export default App;
