import React, { useState, useEffect } from "react";
import Timer from "./Timer";
import SyncButton from "./SyncButton";
import Alert from "./Alert";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { useTimer } from "../hooks/useTimer";
import { useAuth } from "../hooks/useAuth";
import { useMatters } from "../hooks/useMatters";
import { useCategories } from "../hooks/useCategories";
import "./TimeEntry.css";
import "react-datepicker/dist/react-datepicker.css";

function TimeEntry(props) {
  const [activityDate, setActivityDate] = useState(new Date());
  const [activityDescription, setActivityDescription] = useState("");
  const [selectedMatter, setSelectedMatter] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isSynced, setIsSynced] = useState(false);

  const [error, setError] = useState("");

  const auth = useAuth();
  const timer = useTimer();
  const matters = useMatters(auth);
  const categories = useCategories(auth);

  const handleInputChange = e => {
    setActivityDescription(e.target.value);
  };

  const submitActivity = () => {
    //check that all needed data has been selected
    let problems = [];
    if (!auth.isAuth) {
      problems.push("User not logged in to Clio.");
    }
    if (activityDescription === "") {
      problems.push("Describe your activity.");
    }
    if (!selectedMatter) {
      problems.push("Select a matter.");
    }
    if (!selectedCategory) {
      problems.push("Select a category.");
    }
    if (timer.timerTime < 360000) {
      problems.push("Not enough time to bill.");
    }
    if (problems.length !== 0) {
      setError(problems);
      return;
    }

    setIsSyncing(true);
    const data = {
      accessToken: `Bearer ${auth.authToken}`,
      data: {
        date: activityDate,
        note: activityDescription,
        matter: {
          id: selectedMatter.value
        },
        activity_description: {
          id: selectedCategory.value
        },
        quantity: Math.floor(timer.timerTime / 1000),
        type: "TimeEntry"
      }
    };

    const success = auth.submitActivity(data);
    if (success) {
      setIsSyncing(false);
      setIsSynced(true);
    } else {
      setIsSyncing(false);
      setError(["Sync failed. Please try again later."]);
    }
  };

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  }, [error]);

  return (
    <div className="container">
      <div className="container time-entry p-2 mb-4">
        <div className="form-row pl-2 pr-2">
          <div className="form-group col-lg-2">
            <label htmlFor="date">
              <strong>Date</strong>
            </label>
            <DatePicker
              className="form-control"
              disabled={isSynced}
              selected={activityDate}
              onChange={date => setActivityDate(date)}
              popperPlacement={"top-end"}
            />
          </div>
          <div className="form-group col-lg-3">
            <label htmlFor="description">
              <strong>Description</strong>
            </label>
            <input
              value={activityDescription}
              onChange={handleInputChange}
              type="text"
              className="form-control"
              name="description"
              disabled={isSynced}
            ></input>
          </div>
          <div className="form-group col-lg-2">
            <label htmlFor="matter">
              <strong>Matter</strong>
            </label>
            <Select
              onChange={option => setSelectedMatter(option)}
              options={matters}
              isDisabled={isSynced}
            />
          </div>
          <div className="form-group col-lg-2">
            <label htmlFor="category">
              <strong>Category</strong>
            </label>
            <Select
              onChange={option => setSelectedCategory(option)}
              options={categories}
              isDisabled={isSynced}
            />
          </div>
          <div className="form-group col-lg-3 text-center align-self-end">
            <Timer
              handleClick={timer.toggleTimer}
              time={timer.timerTime}
              disabled={isSynced}
            />
            <SyncButton
              disabled={isSynced}
              isSyncing={isSyncing}
              onClick={submitActivity}
            />
          </div>
        </div>
      </div>
      <Alert error={error}></Alert>
    </div>
  );
}

export default TimeEntry;
