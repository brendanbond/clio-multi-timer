import React, { useState, useEffect, useRef } from 'react';
import Timer from './Timer';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { useAuth } from './useAuth';
import './TimeEntry.css';
import "react-datepicker/dist/react-datepicker.css";

function TimeEntry(props) {
  const [startDate, setStartDate] = useState(new Date());
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerTime, setTimerTime] = useState(0);

  const [activityDescription, setActivityDescription] = useState("");
  const [matterOptions, setMatterOptions] = useState([{
    value: 0,
    label: "Login to Clio to access matters."
  }]);
  const [categoryOptions, setCategoryOptions] = useState([{
    value: 0,
    label: "Login to Clio to access categories."
  }]);
  const [selectedMatter, setSelectedMatter] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const timerStart = useRef(0);
  const interval = useRef(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isSynced, setIsSynced] = useState(false);

  const auth = useAuth();

  const startTimer = () => {
    setTimerRunning(true);
  }

  const stopTimer = () => {
    setTimerRunning(false);
    timerStart.current = timerTime;
  }

  const handleClick = (e) => {
    e.preventDefault();
    if (timerRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  }

  const handleInputChange = (e) => {
    setActivityDescription(e.target.value);
  }

  useEffect(() => {
    if (timerRunning) {
      timerStart.current = Date.now() - timerStart.current;
      interval.current = setInterval(() => {
        setTimerTime(Date.now() - timerStart.current);
      }, 1000);
    } else {
      clearInterval(interval.current);
    }
  }, [timerRunning]);

  useEffect(() => {
    if (auth.authToken) {
      auth.getMatters(auth.authToken).then((res) => {
        const options = res.data.data.map((option) => {
          return {
            value: option.id,
            label: option.display_number + option.description
          }
        });
        setMatterOptions(options);
      });

      auth.getCategories(auth.authToken).then((res) => {
        const options = res.data.data.map((option) => {
          return {
            value: option.id,
            label: option.name
          }
        });
        setCategoryOptions(options);
      });
    }
  }, [auth]);

  const submitActivity = () => {
    setIsSyncing(true);
    const data = {
      data: {
        date: startDate,
        note: activityDescription,
        matter: {
          id: selectedMatter.value
        },
        activity_description: {
          id: selectedCategory.value
        },
        quantity: Math.floor(timerTime / 1000),
        type: "TimeEntry"
      }
    }

    const success = auth.submitActivity(auth.authToken, data);
    if (success) {
      setIsSynced(true);
    }
    else {
      //TODO: error handling
      console.log("Sync operation failed");
    }

  }

  return (
    <div className="container time-entry p-2 mb-4">
      <div className="form-row pl-2 pr-2">
        <div className="form-group col-lg-2">
          <label htmlFor="date"><strong>Date</strong></label>
          <DatePicker
            className="form-control"
            selected={startDate}
            onChange={date => setStartDate(date)}
            popperPlacement={"top-end"}
          />
        </div>
        <div className="form-group col-lg-3">
          <label htmlFor="description"><strong>Description</strong></label>
          <input value={activityDescription} onChange={handleInputChange} type="text" className="form-control" name="description"></input>
        </div>
        <div className="form-group col-lg-2">
          <label htmlFor="matter"><strong>Matter</strong></label>
          <Select onChange={option => setSelectedMatter(option)} options={matterOptions} />
        </div>
        <div className="form-group col-lg-2">
          <label htmlFor="category"><strong>Category</strong></label>
          <Select onChange={option => setSelectedCategory(option)} options={categoryOptions} />
        </div>
        <div className="form-group col-lg-3 text-center align-self-end">
          <Timer handleClick={handleClick} time={timerTime} />
          <button className="btn btn-primary" onClick={submitActivity}>Sync</button>
        </div>
      </div>
    </div>
  );
}

export default TimeEntry;