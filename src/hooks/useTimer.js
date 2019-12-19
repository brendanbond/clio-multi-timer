import { useState, useRef, useEffect } from 'react';

function useTimer() {
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerTime, setTimerTime] = useState(0);
  const timerStart = useRef(0);
  const interval = useRef(null);

  const startTimer = () => {
    setTimerRunning(true);
  };

  const stopTimer = () => {
    setTimerRunning(false);
    timerStart.current = timerTime;
  };

  const toggleTimer = e => {
    e.preventDefault();
    if (timerRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  };

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

  return {
    timerRunning,
    toggleTimer,
    startTimer,
    stopTimer,
    timerTime
  };
}

export { useTimer };
