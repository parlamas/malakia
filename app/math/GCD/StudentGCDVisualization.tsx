//app/math/GCD/StudentGCDVisualization.tsx

"use client";

import React from "react";
import { GCDStep } from "./gcd-utils";

interface Props {
  steps: GCDStep[];
}

export default function StudentGCDVisualization({ steps }: Props) {
  if (steps.length === 0) return null;

  return (
    <div className="student-notebook">
      <div className="notebook-paper">
        {steps.map((step, index) => (
          <div key={index} className="gcd-row">
            <div>
  {step.a} ÷{" "}
  <span
    style={{
      color: step.remainder === 0 ? "#e74c3c" : "inherit",
      fontWeight: step.remainder === 0 ? "bold" : "normal",
    }}
  >
    {step.b}
  </span>{" "}
  = {Math.floor(step.a / step.b)} remainder/υπόλοιπο{" "}
  <span
    style={{
      color: step.remainder === 0 ? "#e74c3c" : "inherit",
      fontWeight: step.remainder === 0 ? "bold" : "normal",
    }}
  >
    {step.remainder}
  </span>
</div>



          </div>
        ))}

        <div className="gcd-result" style={{ color: "#e74c3c", fontWeight: "bold" }}>
  GCD/ΜΚΔ = {steps[steps.length - 1].b}
</div>

      </div>
    </div>
  );
}
