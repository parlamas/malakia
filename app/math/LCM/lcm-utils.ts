// app/math/fractions/lcm-utils.ts

import { PrimeFactor, NumberBreakdown, LCMCalculationStep } from './types';

// Helper function to get prime factors
export function getPrimeFactors(n: number): PrimeFactor[] {
  const factors: PrimeFactor[] = [];
  let temp = n;
  
  // Check for factor 2
  let count = 0;
  while (temp % 2 === 0) {
    temp /= 2;
    count++;
  }
  if (count > 0) {
    factors.push({ 
      base: 2, 
      exponent: count,
      id: `${2}-${count}-${Math.random().toString(36).substr(2, 9)}`
    });
  }
  
  // Check for odd factors
  for (let i = 3; i <= Math.sqrt(temp); i += 2) {
    count = 0;
    while (temp % i === 0) {
      temp /= i;
      count++;
    }
    if (count > 0) {
      factors.push({ 
        base: i, 
        exponent: count,
        id: `${i}-${count}-${Math.random().toString(36).substr(2, 9)}`
      });
    }
  }
  
  // If anything remains, it's a prime
  if (temp > 2) {
    factors.push({ 
      base: temp, 
      exponent: 1,
      id: `${temp}-1-${Math.random().toString(36).substr(2, 9)}`
    });
  }
  
  return factors;
}

// Generate step-by-step calculation with moving factors
export function calculateLCMSteps(numbers: number[]): LCMCalculationStep[] {
  const steps: LCMCalculationStep[] = [];
  
  // Step 1: Show original numbers
  const initialBreakdown: NumberBreakdown[] = numbers.map(num => ({
    original: num,
    primeFactors: getPrimeFactors(num)
  }));
  
  steps.push({
    step: 1,
    description: "Starting with the original numbers",
    numbers: JSON.parse(JSON.stringify(initialBreakdown)),
    commonFactors: [],
    currentLCM: 1,
    lcm: 0,
    explanation: `We begin with the numbers: ${numbers.join(', ')}. Let's break each one down into its prime factors.`,
    movingFactors: []
  });
  
  // Track all factor IDs
  const allFactorIds = new Map<string, PrimeFactor>();
  initialBreakdown.forEach(breakdown => {
    breakdown.primeFactors.forEach(factor => {
      if (factor.id) {
        allFactorIds.set(factor.id, factor);
      }
    });
  });
  
  // Collect all prime bases
  const allBases = new Set<number>();
  initialBreakdown.forEach(breakdown => {
    breakdown.primeFactors.forEach(factor => {
      allBases.add(factor.base);
    });
  });
  
  const sortedBases = Array.from(allBases).sort((a, b) => a - b);
  const commonFactors: PrimeFactor[] = [];
  let currentLCM = 1;
  let stepCount = 1;
  
  // Process each prime base
  for (let i = 0; i < sortedBases.length; i++) {
    const base = sortedBases[i];
    
    // Find the highest exponent for this base
    let maxExponent = 0;
    initialBreakdown.forEach(breakdown => {
      breakdown.primeFactors.forEach(factor => {
        if (factor.base === base && factor.exponent > maxExponent) {
          maxExponent = factor.exponent;
        }
      });
    });
    
    if (maxExponent > 0) {
      stepCount++;
      
      // Find factors that will move (all factors with this base)
      const movingFactors: PrimeFactor[] = [];
      const updatedNumbers = initialBreakdown.map(breakdown => {
        const newFactors = breakdown.primeFactors.filter(factor => {
          if (factor.base === base) {
            movingFactors.push({ ...factor, moving: true });
            return false; // Remove from original number
          }
          return true; // Keep in original number
        });
        
        return {
          original: breakdown.original,
          primeFactors: newFactors
        };
      });
      
      // Add the highest exponent factor to common factors
      const commonFactor = {
        base,
        exponent: maxExponent,
        id: `common-${base}-${maxExponent}-${Math.random().toString(36).substr(2, 9)}`
      };
      commonFactors.push(commonFactor);
      currentLCM *= Math.pow(base, maxExponent);
      
      steps.push({
        step: stepCount,
        description: `Moving factors of ${base}${maxExponent > 1 ? `^${maxExponent}` : ''}`,
        numbers: updatedNumbers,
        commonFactors: [...commonFactors],
        currentLCM,
        lcm: 0,
        explanation: `We take the highest power of ${base} (which is ${base}${maxExponent > 1 ? `^${maxExponent}` : ''}) from all numbers and add it to our LCM calculation.`,
        movingFactors
      });
    }
  }
  
  // Final step
  steps.push({
    step: steps.length + 1,
    description: "LCM Calculation Complete",
    numbers: initialBreakdown.map(b => ({ 
      ...b, 
      primeFactors: [] // All factors moved
    })),
    commonFactors,
    currentLCM,
    lcm: currentLCM,
    explanation: `The LCM is the product of all the highest prime factors: ${commonFactors.map(f => f.exponent > 1 ? `${f.base}^${f.exponent}` : f.base).join(' × ')} = ${currentLCM}`,
    movingFactors: []
  });
  
  return steps;
}