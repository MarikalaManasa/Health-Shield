export enum ConditionCategory {
  DIABETES = "Diabetes-related",
  CARDIAC = "Cardiac-related",
  LIFESTYLE = "Lifestyle diseases",
  GENERAL = "General illness",
  RESPIRATORY = "Respiratory issues",
  MENTAL_HEALTH = "Mental health",
}

export interface ConditionCost {
  min: number;
  max: number;
  avg: number;
}

export interface UserInput {
  // Section 1: Personal
  age: number;
  gender: string;

  // Section 2: Health Data
  bpSystolic: number;
  bpDiastolic: number;
  sugarLevel: number;
  cholesterol: number;
  height: number; // in cm
  weight: number; // in kg

  // Section 3: Lifestyle
  smoking: string;
  alcohol: string;
  exerciseDays: number;
  sleepHours: number;

  // Section 4: Medical History
  existingConditions: string[];
  familyHistory: string[];

  // Section 5: Financial Info
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  hasInsurance: boolean;
  insuranceCoverage: number;
  dependents: number;
  hasEmergencyFund: boolean;
  debtEmi: number;
  spendingBehavior: "Low" | "Medium" | "High";
}

export interface ConditionBreakdown {
  name: string;
  min: number;
  max: number;
  avg: number;
}

export interface AnalysisResult {
  conditions: ConditionCategory[];
  bmi: number;
  bmiCategory: string;
  totalCostRange: {
    min: number;
    max: number;
    avg: number;
  };
  conditionBreakdown: ConditionBreakdown[];
  savingsCapacity: number;
  insuranceGap: number;
  totalFinancialGap: number;
  recommendations: string[];
}
