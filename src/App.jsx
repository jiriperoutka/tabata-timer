import { useState, useRef, useEffect } from "react";
import "./App.css";

function playSound(src) {
  const audio = new window.Audio(src);
  audio.play();
}

const defaultSettings = {
  initialCountdown: 10,
  exerciseInterval: 40,
  restInterval: 20,
  sets: 8,
  recoveryInterval: 60,
  cycles: 3,
};

function App() {
  const [settings, setSettings] = useState(defaultSettings);
  const [stage, setStage] = useState("start"); // 'start' for GO! screen
  const [timeLeft, setTimeLeft] = useState(settings.initialCountdown);
  const [setCount, setSetCount] = useState(1);
  const [cycleCount, setCycleCount] = useState(1);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!running || stage === "start" || stage === "done") return;
    if (timeLeft <= 3 && timeLeft > 0) {
      playSound("/sounds/beep.mp3");
    }
    if (timeLeft === 0) {
      if (stage === "exercise") {
        playSound("/sounds/siren-exercise.mp3");
      } else if (stage === "rest") {
        playSound("/sounds/siren-rest.mp3");
      }
    }
    if (timeLeft <= 0) {
      nextStage();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, running, stage]);

  const nextStage = () => {
    if (stage === "initial") {
      playSound("/sounds/siren-exercise.mp3"); // Play siren when exercise starts
      setStage("exercise");
      setTimeLeft(settings.exerciseInterval);
    } else if (stage === "exercise") {
      setStage("rest");
      setTimeLeft(settings.restInterval);
    } else if (stage === "rest") {
      if (setCount < settings.sets) {
        setSetCount(setCount + 1);
        playSound("/sounds/siren-exercise.mp3"); // Play siren for next exercise
        setStage("exercise");
        setTimeLeft(settings.exerciseInterval);
      } else if (cycleCount < settings.cycles) {
        setCycleCount(cycleCount + 1);
        setSetCount(1);
        setStage("recovery");
        setTimeLeft(settings.recoveryInterval);
      } else {
        setStage("done");
        setRunning(false);
      }
    } else if (stage === "recovery") {
      playSound("/sounds/siren-exercise.mp3"); // Play siren for exercise after recovery
      setStage("exercise");
      setTimeLeft(settings.exerciseInterval);
    }
  };

  const startTabata = () => {
    setStage("initial");
    setTimeLeft(settings.initialCountdown);
    setSetCount(1);
    setCycleCount(1);
    setRunning(true);
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: Number(e.target.value) });
  };

  const getStageLabel = () => {
    switch (stage) {
      case "initial":
        return "Get Ready!";
      case "exercise":
        return "Exercise!";
      case "rest":
        return "Rest";
      case "recovery":
        return "Recovery";
      case "done":
        return "Finished!";
      default:
        return "";
    }
  };

  // Circle color logic
  const getCircleClass = () => {
    if (stage === "start" || stage === "initial" || stage === "recovery")
      return "circle-white";
    if (stage === "exercise") return "circle-red";
    if (stage === "rest") return "circle-green";
    if (stage === "done") return "circle-white";
    return "circle-white";
  };

  return (
    <div className="tabata-bg">
      <h1 className="shiny-title">Tabata Timer</h1>
      <div className="countdown-panel">
        <div
          className={`countdown-circle ${getCircleClass()}`}
          onClick={() => {
            if (stage === "start") startTabata();
          }}
          style={{ cursor: stage === "start" ? "pointer" : "default" }}
        >
          {stage === "start" ? (
            <span className="go-label">GO!</span>
          ) : (
            <>
              <span className="big-count">{timeLeft}</span>
              <span className="stage-label">{getStageLabel()}</span>
            </>
          )}
        </div>
        <div className="progress-info">
          <span>
            Set: {setCount} / {settings.sets}
          </span>
          <span>
            Cycle: {cycleCount} / {settings.cycles}
          </span>
        </div>
      </div>
      <div className="settings-panel">
        <label>
          Initial Countdown:
          <input
            type="number"
            name="initialCountdown"
            value={settings.initialCountdown}
            onChange={handleChange}
            min={0}
          />
        </label>
        <label>
          Exercise Interval:
          <input
            type="number"
            name="exerciseInterval"
            value={settings.exerciseInterval}
            onChange={handleChange}
            min={1}
          />
        </label>
        <label>
          Rest Interval:
          <input
            type="number"
            name="restInterval"
            value={settings.restInterval}
            onChange={handleChange}
            min={1}
          />
        </label>
        <label>
          Number of Sets:
          <input
            type="number"
            name="sets"
            value={settings.sets}
            onChange={handleChange}
            min={1}
          />
        </label>
        <label>
          Recovery Interval:
          <input
            type="number"
            name="recoveryInterval"
            value={settings.recoveryInterval}
            onChange={handleChange}
            min={0}
          />
        </label>
        <label>
          Number of Cycles:
          <input
            type="number"
            name="cycles"
            value={settings.cycles}
            onChange={handleChange}
            min={1}
          />
        </label>
      </div>
      {stage !== "start" && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            marginTop: "2rem",
          }}
        >
          <button
            className="start-btn"
            onClick={() => {
              setStage("start");
              setRunning(false);
              setTimeLeft(settings.initialCountdown);
              setSetCount(1);
              setCycleCount(1);
            }}
          >
            Restart
          </button>
          <button
            className="start-btn"
            onClick={() => setRunning((prev) => !prev)}
          >
            {running ? "Pause" : "Resume"}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
