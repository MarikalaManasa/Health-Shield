import { ConditionCategory, ConditionCost } from "./types";

export const CONDITION_COSTS: Record<ConditionCategory, ConditionCost> = {
  [ConditionCategory.DIABETES]: { min: 30000, max: 100000, avg: 65000 },
  [ConditionCategory.CARDIAC]: { min: 100000, max: 500000, avg: 300000 },
  [ConditionCategory.LIFESTYLE]: { min: 20000, max: 80000, avg: 50000 },
  [ConditionCategory.GENERAL]: { min: 10000, max: 50000, avg: 30000 },
  [ConditionCategory.RESPIRATORY]: { min: 15000, max: 60000, avg: 37500 },
  [ConditionCategory.MENTAL_HEALTH]: { min: 25000, max: 120000, avg: 72500 },
};

export const GENDERS = ["Male", "Female", "Other"];

export const SMOKING_LEVELS = ["Never", "Occasionally", "Regularly"];
export const ALCOHOL_LEVELS = ["Never", "Socially", "Regularly"];
export const SPENDING_BEHAVIORS = ["Low", "Medium", "High"];

export const EXISTING_CONDITIONS = [
  { id: "diabetes_t1", label: "Type 1 Diabetes", category: ConditionCategory.DIABETES },
  { id: "diabetes_t2", label: "Type 2 Diabetes", category: ConditionCategory.DIABETES },
  { id: "hypertension", label: "High Blood Pressure", category: ConditionCategory.CARDIAC },
  { id: "cholesterol", label: "High Cholesterol", category: ConditionCategory.CARDIAC },
  { id: "asthma", label: "Asthma", category: ConditionCategory.RESPIRATORY },
  { id: "copd", label: "COPD / Bronchitis", category: ConditionCategory.RESPIRATORY },
  { id: "obesity", label: "Obesity", category: ConditionCategory.LIFESTYLE },
  { id: "pcos", label: "PCOS / PCOD", category: ConditionCategory.LIFESTYLE },
  { id: "thyroid", label: "Thyroid Issues", category: ConditionCategory.GENERAL },
  { id: "arthritis", label: "Arthritis / Joint Pain", category: ConditionCategory.GENERAL },
  { id: "anxiety", label: "Anxiety Disorders", category: ConditionCategory.MENTAL_HEALTH },
  { id: "depression", label: "Depression", category: ConditionCategory.MENTAL_HEALTH },
  { id: "insomnia", label: "Sleep Disorders", category: ConditionCategory.MENTAL_HEALTH },
  { id: "gastritis", label: "Gastric Issues / Acidity", category: ConditionCategory.GENERAL },
  { id: "migraine", label: "Frequent Migraines", category: ConditionCategory.GENERAL },
  { id: "kidney_stones", label: "Kidney Issues", category: ConditionCategory.GENERAL },
  { id: "fatty_liver", label: "Fatty Liver", category: ConditionCategory.LIFESTYLE },
  { id: "sinusitis", label: "Sinus Issues", category: ConditionCategory.RESPIRATORY },
  { id: "anemia", label: "Anemia / Low Iron", category: ConditionCategory.GENERAL },
  { id: "back_pain", label: "Chronic Back Pain", category: ConditionCategory.LIFESTYLE },
  { id: "allergies", label: "Severe Allergies", category: ConditionCategory.GENERAL },
  { id: "skin_issues", label: "Skin Conditions (Eczema/Psoriasis)", category: ConditionCategory.GENERAL },
  { id: "vision_issues", label: "Vision / Eye Issues", category: ConditionCategory.GENERAL },
  { id: "hearing_issues", label: "Hearing Issues", category: ConditionCategory.GENERAL },
  { id: "dental_issues", label: "Chronic Dental Issues", category: ConditionCategory.GENERAL },
  { id: "liver_issues", label: "Liver Disease", category: ConditionCategory.GENERAL },
  { id: "heart_murmur", label: "Heart Murmur / Valve Issues", category: ConditionCategory.CARDIAC },
];

export const FAMILY_HISTORY = [
  { id: "fh_diabetes", label: "Diabetes (Parents/Siblings)", category: ConditionCategory.DIABETES },
  { id: "fh_cardiac", label: "Heart Disease / Stroke", category: ConditionCategory.CARDIAC },
  { id: "fh_cancer", label: "Cancer History", category: ConditionCategory.GENERAL },
  { id: "fh_bp", label: "High BP in Family", category: ConditionCategory.CARDIAC },
  { id: "fh_asthma", label: "Respiratory Issues", category: ConditionCategory.RESPIRATORY },
  { id: "fh_mental", label: "Mental Health History", category: ConditionCategory.MENTAL_HEALTH },
  { id: "fh_autoimmune", label: "Autoimmune Issues", category: ConditionCategory.GENERAL },
];
