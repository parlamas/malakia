// app/math/fractions/StudentLCMVisualization.tsx

"use client";

import React, { useEffect, useState } from 'react';

interface StudentStep {
  step: number;
  description: string;
  numbers: number[];
  multiples: Record<number, number>;
  circles: Record<number, boolean>;
  currentRow: number;
  lcm?: number;
  explanation: string;
  foundLCM?: boolean;
}

interface StudentLCMVisualizationProps {
  step: StudentStep | null;
  showHand: boolean;
  speed: number;
  maxRowReached: number;
}


const StudentLCMVisualization: React.FC<StudentLCMVisualizationProps> = ({ 
  step, 
  showHand, 
  speed,
  maxRowReached
}) => {

  const [isWriting, setIsWriting] = useState(false);
  const [handPosition, setHandPosition] = useState({ x: 50, y: 50 });


  useEffect(() => {
    if (!step || !showHand) return;

    setIsWriting(true);
    
    // Calculate hand position based on what's being written
    let targetX = 50;
    let targetY = 50;
    
    if (step.step === 1) {
  targetX = 100 + (step.numbers.length > 1 ? 100 : 0);
  targetY = 20;
}
 else if (step.currentRow > 0) {
      // Position for writing multiples
      targetX = 100 + (step.numbers.length > 1 ? 100 : 0);
      targetY = 120 + (step.currentRow - 1) * 40;
    }
    
    setHandPosition({ x: targetX, y: targetY });
    
    const timer = setTimeout(() => {
      setIsWriting(false);
    }, speed * 0.7);

    return () => clearTimeout(timer);
  }, [step, showHand, speed]);


  if (!step) return null;

  // Show ONLY up to current row, and STOP if LCM is found
  const maxRowsToShow = step.lcm
  ? Math.max(
      step.currentRow,
      ...step.numbers.map(n => step.lcm! / n).filter(Number.isInteger)
    )
  : step.currentRow;



  return (
    <div className="student-notebook" style={{ marginTop: '0' }}>
      {/* Simple hand animation */}
      {showHand && (
        <div 
          className="writing-hand"
          style={{
            left: `${handPosition.x}px`,
            top: `${handPosition.y}px`,
            opacity: isWriting ? 1 : 0.5
          }}
        >
          <div className="hand-icon">✍️</div>
          {isWriting && <div className="ink-dot"></div>}
        </div>
      )}
      
      {/* Notebook Paper */}
      <div className="notebook-paper">
        
        
        {/* Header with numbers - positioned closer */}
        <div className="numbers-header" style={{ marginBottom: '1rem', gap: '2rem' }}>
          {step.numbers.map((num, index) => (
            <div key={index} className="number-column">
              <div className="number-title">{num}</div>
            </div>
          ))}
        </div>
        
        {/* Multiples rows - STOP when LCM is found */}
        <div className="multiples-rows">
          {Array.from({ length: maxRowsToShow }).map((_, rowIndex) => {
            const rowNum = rowIndex + 1;
            const shouldShowRow = rowNum <= step.currentRow;
            
            return (
              <div key={rowIndex} className="multiple-row" style={{ gap: '2rem', marginBottom: '0.25rem' }}>
                {/* Row number */}
                <div className="row-number" style={{ width: '1.5rem' }}>{rowNum}.</div>
                
                {/* Multiples for each number */}
                {step.numbers.map((num, colIndex) => {
                  const multiple = num * rowNum;
                  const isWritten = rowNum <= maxRowReached;
                  const isCircled = step.circles[multiple] || false;
                  
                  return (
                    <div key={colIndex} className="multiple-cell">
                      <div
  className={`multiple-number ${step.lcm === multiple ? 'lcm-number' : ''}`}
  style={{
    color: step.lcm === multiple ? '#e74c3c' : '#2c3e50',
    fontWeight: step.lcm === multiple ? 'bold' : 'normal'
  }}
>
  {multiple}
  {step.lcm === multiple && <div className="circle-animation"></div>}
</div>

                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        
        {/* LCM Result - IN RED */}
        {step.lcm && (
          <div className="lcm-result-box" style={{ 
            marginTop: '1rem',
            borderLeft: '5px solid #e74c3c',
            background: 'rgba(231, 76, 60, 0.1)'
          }}>
            <div className="lcm-label" style={{ color: '#2c3e50' }}>LCM =</div>
            <div className="lcm-value" style={{ color: '#e74c3c' }}>{step.lcm}</div>
          </div>
        )}

        {/* Stop message if LCM found */}
        {step.foundLCM && (
          <div className="stop-message" style={{ 
            marginTop: '1rem', 
            color: '#27ae60',
            fontStyle: 'italic',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            ✓ LCM found in row {step.currentRow}! No more rows needed.
          </div>
        )}
      </div>
      
      {/* Step Explanation */}
      <div className="step-explanation">
        <div className="step-title">Step {step.step}: {step.description}</div>
        <div className="step-text">{step.explanation}</div>
      </div>
    </div>
  );
};

export default StudentLCMVisualization;