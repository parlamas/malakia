//app/math/GCD/page.tsx

"use client";

import { useState } from "react";
import { gcdSteps } from "./gcd-utils";
import StudentGCDVisualization from "./StudentGCDVisualization";
import "./styles.css";

export default function GCDPage() {
  const [a, setA] = useState("48");
  const [b, setB] = useState("18");
  const [steps, setSteps] = useState<ReturnType<typeof gcdSteps>>([]);

  const handleCalculate = () => {
    const x = parseInt(a, 10);
    const y = parseInt(b, 10);

    if (!isNaN(x) && !isNaN(y) && x > 0 && y > 0) {
      setSteps(gcdSteps(x, y));
    }
  };

  const handleReset = () => {
    setA("48");
    setB("18");
    setSteps([]);
  };

  const gcd =
    steps.length > 0 ? steps[steps.length - 1].b : null;

  return (
  <div className="student-lcm-page">
      <header className="page-header">
  <h1 className="chalk-title">GCD Visualizer</h1>
  <p style={{ color: "black" }}>
    Watch how a student finds the Greatest Common Divisor using<br />the Euclidean algorithm/τον Ευκλίδειο αλγόριθμο.<br />
    Διαιρούμε τον διαιρέτη της προηγούμενης διαίρεσης με το υπολοιπο της προηγούμενης διαίρεσης, και ούτω καθ'εξής.
  </p>

</header>

            <div className="content-grid">
        <div className="controls-section">
          <div className="controls-card">
            <h2>Enter Numbers</h2>

            <div className="number-inputs-student">
              <input
                type="number"
                value={a}
                onChange={(e) => setA(e.target.value)}
                placeholder="First number"
                className="student-input"
              />
              <input
                type="number"
                value={b}
                onChange={(e) => setB(e.target.value)}
                placeholder="Second number"
                className="student-input"
              />
            </div>

            <div className="control-buttons">
              <button
                onClick={handleCalculate}
                className="calculate-btn"
              >
                Find GCD
              </button>
              <button
                onClick={handleReset}
                className="reset-btn"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="visualization-section">
          <StudentGCDVisualization steps={steps} />
        </div>
      </div>

    </div>
  );
}
