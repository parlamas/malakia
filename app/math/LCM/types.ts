// app/math/fractions/types.ts

export interface PrimeFactor {
  base: number;
  exponent: number;
  id?: string; // For animation tracking
  moving?: boolean;
  position?: { x: number; y: number };
}

export interface NumberBreakdown {
  original: number;
  primeFactors: PrimeFactor[];
}

export interface LCMCalculationStep {
  step: number;
  description: string;
  numbers: NumberBreakdown[];
  commonFactors: PrimeFactor[];
  currentLCM: number;
  lcm: number;
  explanation: string;
  movingFactors?: PrimeFactor[]; // Factors currently moving in this step
}