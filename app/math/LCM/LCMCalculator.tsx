//app/math/fractions/LCMCalculator.tsx

"use client";

import React from 'react';

interface LCMCalculatorProps {
  inputValues: string[];
  onNumberChange: (index: number, value: string) => void;
  onAddNumber: () => void;
  onRemoveNumber: (index: number) => void;
  onCalculate: () => void;
  onReset: () => void;
  maxNumbers: number;
}

const LCMCalculator: React.FC<LCMCalculatorProps> = ({
  inputValues,
  onNumberChange,
  onAddNumber,
  onRemoveNumber,
  onCalculate,
  onReset,
  maxNumbers
}) => {
  return (
    <div className="calculator-card">
      <h2>Enter Numbers</h2>
      <p className="instruction">
        Enter at least 2 positive integers (up to {maxNumbers})
      </p>
      
      <div className="number-inputs">
        {inputValues.map((value, index) => (
          <div key={index} className="input-group">
            <div className="input-with-button">
              <input
                type="number"
                min="1"
                max="1000"
                value={value}
                onChange={(e) => onNumberChange(index, e.target.value)}
                placeholder="Enter a number"
                className="number-input"
              />
              {inputValues.length > 2 && (
                <button
                  type="button"
                  onClick={() => onRemoveNumber(index)}
                  className="remove-button"
                  title="Remove this number"
                >
                  ×
                </button>
              )}
            </div>
            <div className="input-label">Number {index + 1}</div>
          </div>
        ))}
      </div>
      
      <div className="calculator-controls">
        {inputValues.length < maxNumbers && (
          <button
            type="button"
            onClick={onAddNumber}
            className="add-button"
          >
            + Add Another Number
          </button>
        )}
        
        <div className="action-buttons">
          <button
            type="button"
            onClick={onCalculate}
            className="calculate-button"
            disabled={inputValues.filter(v => v && parseInt(v) > 0).length < 2}
          >
            Calculate LCM
          </button>
          <button
            type="button"
            onClick={onReset}
            className="reset-button"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default LCMCalculator;