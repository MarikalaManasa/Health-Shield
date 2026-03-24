import { ConditionCategory, UserInput, AnalysisResult } from "../types";
import { CONDITION_COSTS, EXISTING_CONDITIONS, FAMILY_HISTORY } from "../constants";

export function analyzeHealthInputs(input: UserInput): AnalysisResult {
  const detectedCategories = new Set<ConditionCategory>();
  const recommendations: string[] = [];

  // 1. BMI Calculation
  const heightInMeters = input.height / 100;
  const bmi = input.weight / (heightInMeters * heightInMeters);
  let bmiCategory = "Normal";
  if (bmi < 18.5) bmiCategory = "Underweight";
  else if (bmi >= 25 && bmi < 30) {
    bmiCategory = "Overweight";
    detectedCategories.add(ConditionCategory.LIFESTYLE);
  } else if (bmi >= 30) {
    bmiCategory = "Obese";
    detectedCategories.add(ConditionCategory.LIFESTYLE);
    recommendations.push("Consult a nutritionist to manage BMI.");
  }

  // 2. BP Risk
  if (input.bpSystolic > 140 || input.bpDiastolic > 90) {
    detectedCategories.add(ConditionCategory.CARDIAC);
    recommendations.push("High BP detected. Monitor regularly and consult a cardiologist.");
  }

  // 3. Sugar Level
  if (input.sugarLevel > 140) {
    detectedCategories.add(ConditionCategory.DIABETES);
    recommendations.push("High sugar levels. Consider a fasting blood sugar test.");
  }

  // 4. Lifestyle Factors
  if (input.smoking === "Regularly") {
    detectedCategories.add(ConditionCategory.RESPIRATORY);
    recommendations.push("Quit smoking to reduce respiratory and cardiac risks.");
  }
  if (input.exerciseDays < 2) {
    detectedCategories.add(ConditionCategory.LIFESTYLE);
    recommendations.push("Increase physical activity to at least 150 mins/week.");
  }

  // 5. Medical History
  input.existingConditions.forEach(id => {
    const condition = EXISTING_CONDITIONS.find(c => c.id === id);
    if (condition) detectedCategories.add(condition.category);
  });
  input.familyHistory.forEach(id => {
    const history = FAMILY_HISTORY.find(h => h.id === id);
    if (history) detectedCategories.add(history.category);
  });

  // Default if none
  if (detectedCategories.size === 0) detectedCategories.add(ConditionCategory.GENERAL);

  const conditions = Array.from(detectedCategories);
  const conditionBreakdown = conditions.map(c => ({
    name: c,
    ...CONDITION_COSTS[c]
  }));

  // 6. Cost Calculation
  let totalMin = 0;
  let totalMax = 0;
  let totalAvg = 0;
  conditionBreakdown.forEach(c => {
    totalMin += c.min;
    totalMax += c.max;
    totalAvg += c.avg;
  });

  // 7. Financial Analysis
  const savingsCapacity = input.monthlyIncome - input.monthlyExpenses - input.debtEmi;
  const insuranceGap = Math.max(0, totalMax - input.insuranceCoverage);
  const totalFinancialGap = Math.max(0, totalAvg - input.currentSavings - (input.hasInsurance ? input.insuranceCoverage : 0));

  if (insuranceGap > 0) {
    recommendations.push(`Increase health insurance coverage by at least ₹${(insuranceGap / 100000).toFixed(1)}L.`);
  }
  if (savingsCapacity < 0) {
    recommendations.push("Your expenses exceed income. Review your spending behavior.");
  } else if (savingsCapacity < totalAvg / 12) {
    recommendations.push(`Aim to save at least ₹${(totalAvg / 12).toFixed(0)} monthly for health emergencies.`);
  }

  if (!input.hasEmergencyFund) {
    recommendations.push("Build an emergency fund covering at least 3-6 months of expenses.");
  }

  return {
    conditions,
    bmi,
    bmiCategory,
    totalCostRange: { min: totalMin, max: totalMax, avg: totalAvg },
    conditionBreakdown,
    savingsCapacity,
    insuranceGap,
    totalFinancialGap,
    recommendations,
  };
}
