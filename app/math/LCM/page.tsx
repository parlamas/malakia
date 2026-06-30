// app/math/fractions/page.tsx

"use client";

import { useState, useEffect, useRef } from 'react';
import StudentLCMVisualization from './StudentLCMVisualization';
import './styles.css';

export default function LCMFinderPage() {
  const [numbers, setNumbers] = useState<string[]>(['4', '6']);
  const [inputValues, setInputValues] = useState(['4', '6']);
  const [calculationSteps, setCalculationSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [speed, setSpeed] = useState(1500);
  const [showHand, setShowHand] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Generate student-style steps
  const generateStudentSteps = (numbers: number[]) => {
    const steps = [];
    
    // Step 1: Write the numbers
    steps.push({
      step: 1,
      description: "Write down the numbers",
      numbers: numbers,
      multiples: {},
      circles: {},
      currentRow: 0,
      explanation: `We write the numbers ${numbers.join(' and ')} side by side.`
    });

    let detectedLCM: number | null = null;
let requiredLastRow = 0;

    
    for (let currentRow = 1; ; currentRow++) {
      const multiples: Record<number, number> = {};

numbers.forEach(num => {
  multiples[num] = num * currentRow;
});

const values = Object.values(multiples);

if (detectedLCM === null) {
  for (const value of values) {
    const isLCM = numbers.every(n => value % n === 0);
    if (isLCM) {
      detectedLCM = value;
      requiredLastRow = Math.max(
        ...numbers.map(n => detectedLCM! / n)
      );
      break;
    }
  }
}


const circles: Record<number, boolean> = {};
if (detectedLCM !== null) {
  numbers.forEach(num => {
    const value = num * currentRow;
    if (value === detectedLCM) {
      circles[value] = true;
    }
  });
}

steps.push({
  step: steps.length + 1,
  description: `Row ${currentRow}`,
  numbers: numbers,
  multiples: { ...multiples },
  circles,
  currentRow,
  lcm: detectedLCM ?? undefined,
  foundLCM: detectedLCM !== null && currentRow >= requiredLastRow,
  explanation:
    detectedLCM === null
      ? `Multiply each number by ${currentRow}.`
      : currentRow < requiredLastRow
        ? `LCM ${detectedLCM} appears in this column. Continue.`
        : `✓ ${detectedLCM} now appears in all columns. This is the LCM.`
});

if (detectedLCM !== null && currentRow >= requiredLastRow) {
  break;
}


}
return steps;

  };

  

  // Auto-play animation
  useEffect(() => {
    if (!autoPlay || calculationSteps.length === 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const currentStep = calculationSteps[currentStepIndex];
    if (currentStepIndex >= calculationSteps.length - 1) {
  if (timerRef.current) clearTimeout(timerRef.current);
  return;
}


    timerRef.current = setTimeout(() => {
      setCurrentStepIndex(prev => prev < calculationSteps.length - 1 ? prev + 1 : prev);
    }, speed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoPlay, currentStepIndex, calculationSteps, speed]);

  const handleNumberChange = (index: number, value: string) => {
    const newValues = [...inputValues];
    newValues[index] = value;
    setInputValues(newValues);
  };

  const handleAddNumber = () => {
    if (inputValues.length < 4) {
      setInputValues([...inputValues, '']);
    }
  };

  const handleRemoveNumber = (index: number) => {
    if (inputValues.length > 2) {
      setInputValues(inputValues.filter((_, i) => i !== index));
    }
  };

  const handleCalculate = () => {
  const validNumbers = inputValues
    .map(num => parseInt(num))
    .filter(num => !isNaN(num) && num > 0);

  if (validNumbers.length >= 2) {
    const steps = generateStudentSteps(validNumbers);
    setCalculationSteps(steps);
    setCurrentStepIndex(0);
    setAutoPlay(true);
  }
};


  const handleReset = () => {
  setInputValues(['4', '6']);
  setNumbers(['4', '6']);
  setCalculationSteps([]);
  setCurrentStepIndex(0);
  setAutoPlay(false);
};


  const handleStepChange = (step: number) => {
    setCurrentStepIndex(step);
    if (autoPlay) setAutoPlay(false);
  };

  const currentStep = calculationSteps[currentStepIndex] || null;
  const lcm = calculationSteps.length > 0 
    ? calculationSteps[calculationSteps.length - 1].lcm
    : null;

  return (
    <div className="student-lcm-page" style={{ marginTop: '-200px' }}>
      <header className="page-header">
        <h1 className="chalk-title">LCM Visualizer</h1>
        <p className="subtitle">
          Watch how a student finds the Least Common Multiple on paper
        </p>
      </header>

      <div className="content-grid">
        <div className="controls-section">
          <div className="controls-card">
            <h2>Enter Numbers</h2>
            
            <div className="number-inputs-student">
              {inputValues.map((value, index) => (
                <div key={index} className="student-input-group">
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={value}
                    onChange={(e) => handleNumberChange(index, e.target.value)}
                    placeholder="Number"
                    className="student-input"
                  />
                  {inputValues.length > 2 && (
                    <button
                      onClick={() => handleRemoveNumber(index)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              
              {inputValues.length < 4 && (
                <button
                  onClick={handleAddNumber}
                  className="add-btn"
                >
                  + Add Number
                </button>
              )}
            </div>
            
            <div className="control-buttons">
              <button
                onClick={handleCalculate}
                className="calculate-btn"
                disabled={inputValues.filter(v => v && parseInt(v) > 0).length < 2}
              >
                Find LCM
              </button>
              <button
                onClick={handleReset}
                className="reset-btn"
              >
                Reset
              </button>
            </div>
            
            <div className="animation-controls">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={autoPlay}
                  onChange={(e) => setAutoPlay(e.target.checked)}
                />
                Auto-play steps
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showHand}
                  onChange={(e) => setShowHand(e.target.checked)}
                />
                Show writing hand
              </label>
              <div className="speed-control">
                <span>Speed: </span>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="100"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  disabled={!autoPlay}
                />
                <span>{speed}ms</span>
              </div>
            </div>
          </div>
          
          {lcm && (
            <div className="result-card">
              <h3>Result</h3>
              <div className="lcm-result">
                <span>LCM({numbers.join(', ')}) = </span>
                <span className="result-value">{lcm}</span>
              </div>
              <p style={{ marginTop: '0.5rem', color: '#27ae60', fontSize: '0.9rem' }}>
                ✓ Found in {currentStep?.currentRow || 0} rows
              </p>
            </div>
          )}
        </div>

        <div className="visualization-section">
          {calculationSteps.length > 0 ? (
            <>
              <div className="step-controls-bar">
                <div className="step-buttons">
                  <button
                    onClick={() => handleStepChange(0)}
                    disabled={currentStepIndex === 0}
                    className="step-btn"
                  >
                    ↶ First
                  </button>
                  <button
                    onClick={() => handleStepChange(Math.max(0, currentStepIndex - 1))}
                    disabled={currentStepIndex === 0}
                    className="step-btn"
                  >
                    ← Previous
                  </button>
                  <span className="step-info">
                    Step {currentStepIndex + 1} of {calculationSteps.length}
                    {currentStep?.foundLCM && ' ✓'}
                  </span>
                  <button
                    onClick={() => handleStepChange(Math.min(calculationSteps.length - 1, currentStepIndex + 1))}
                    disabled={currentStepIndex === calculationSteps.length - 1 || currentStep?.foundLCM}
                    className="step-btn"
                  >
                    Next →
                  </button>
                  <button
                    onClick={() => handleStepChange(calculationSteps.length - 1)}
                    disabled={currentStepIndex === calculationSteps.length - 1}
                    className="step-btn"
                  >
                    Last ↷
                  </button>
                </div>
                {currentStep?.foundLCM && (
                  <div style={{
                    textAlign: 'center',
                    marginTop: '0.5rem',
                    color: '#27ae60',
                    fontWeight: 'bold'
                  }}>
                    ✓ LCM Found! Auto-play stopped.
                  </div>
                )}
              </div>

              <StudentLCMVisualization
  step={currentStep}
  showHand={showHand}
  speed={speed}
  maxRowReached={Math.max(
    ...calculationSteps
      .slice(0, currentStepIndex + 1)
      .map(s => s.currentRow)
  )}
/>

            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">✏️</div>
              <h3>Ready to Find LCM</h3>
              <p>Enter numbers and click "Find LCM" to see the student's method</p>
              <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
                <strong>Tip:</strong> Try 4 and 6 to see LCM = 12
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="explanation-section">
        <h3>Student's Method for Finding LCM</h3>
        <div className="explanation-content">
          <p>
            This is how students typically find LCM by hand:
          </p>
          <ol>
            <li>Write the numbers side by side</li>
            <li>List multiples of each number in rows</li>
            <li>Look for the <strong>first common multiple</strong> in the same row</li>
            <li><strong>Circle</strong> the common multiple when found</li>
            <li>The circled number is the LCM!</li>
            <li><strong>Stop</strong> when LCM is found (no need for more rows)</li>
          </ol>
          <p>
            The hand ✍️ shows where the student is writing. Watch it circle the LCM when found!
          </p>
        </div>
      </div>
    </div>
  );
}