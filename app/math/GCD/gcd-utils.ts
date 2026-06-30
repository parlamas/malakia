//app/math/GCD/gcd-utils.ts

export interface GCDStep {
  a: number;
  b: number;
  remainder: number;
  explanation: string;
}

export function gcdSteps(a: number, b: number): GCDStep[] {
  const steps: GCDStep[] = [];

  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y !== 0) {
    const remainder = x % y;

    steps.push({
      a: x,
      b: y,
      remainder,
      explanation: `${x} ÷ ${y} = ${Math.floor(x / y)} remainder ${remainder}`
    });

    x = y;
    y = remainder;
  }

  return steps;
}

