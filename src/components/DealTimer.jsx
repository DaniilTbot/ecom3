import { useEffect, useState } from "react";

const INITIAL_SECONDS = 3599;

function DealTimer() {
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS);
  const [isRunning, setIsRunning] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const isExpired = secondsLeft === 0;

  useEffect(() => {
    if (!isRunning || isExpired) {
      return;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft((prevSeconds) => {
        if (prevSeconds <= 1) {
          return 0;
        }

        return prevSeconds - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning, isExpired]);

  useEffect(() => {
    if (isExpired) {
      setIsRunning(false);
    }
  }, [isExpired]);

  function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function handleToggleRunning() {
    if (isExpired) {
      return;
    }

    setIsRunning((prev) => !prev);
  }

  function handleRestart() {
    if (isExpired) {
      setSecondsLeft(INITIAL_SECONDS);
      setIsRunning(true);
      return;
    }

    setSecondsLeft(INITIAL_SECONDS);
  }

  function handleClose() {
    setIsVisible(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="special-deal">
      <button className="timer-close-button" onClick={handleClose} type="button">
        ×
      </button>

      <h3>Специальное предложение</h3>
      <p>{isExpired ? "Таймер истёк" : formatTime(secondsLeft)}</p>

      <div className="timer-controls">
        <button onClick={handleToggleRunning} type="button" disabled={isExpired}>
          {isRunning ? "Стоп" : "Возобновить"}
        </button>

        <button
          onClick={handleRestart}
          type="button"
          className={isExpired ? "timer-restart-active" : ""}
        >
          Рестарт
        </button>
      </div>
    </div>
  );
}

export default DealTimer;
