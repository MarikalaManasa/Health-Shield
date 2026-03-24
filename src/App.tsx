import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  Activity, 
  Wallet, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  RefreshCw,
  TrendingDown,
  Info,
  User as UserIcon,
  Stethoscope,
  History,
  ShieldCheck,
  ArrowLeft,
  LogOut,
  Sparkles,
  Shield,
  Zap,
  Lock,
  Rocket
} from "lucide-react";
import { 
  GENDERS, 
  SMOKING_LEVELS, 
  ALCOHOL_LEVELS, 
  SPENDING_BEHAVIORS, 
  EXISTING_CONDITIONS, 
  FAMILY_HISTORY 
} from "./constants";
import { UserInput, AnalysisResult } from "./types";
import { analyzeHealthInputs } from "./services/analysisService";
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "./firebase";
import { Toaster, toast } from "sonner";

type FormStep = "personal" | "health" | "lifestyle" | "history" | "financial" | "result";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [demoEmail, setDemoEmail] = useState("");
  const [demoPassword, setDemoPassword] = useState("");
  const [step, setStep] = useState<FormStep>("personal");
  const [formData, setFormData] = useState<UserInput>({
    age: 30,
    gender: "Male",
    bpSystolic: 120,
    bpDiastolic: 80,
    sugarLevel: 100,
    cholesterol: 180,
    height: 170,
    weight: 70,
    smoking: "Never",
    alcohol: "Never",
    exerciseDays: 3,
    sleepHours: 7,
    existingConditions: [],
    familyHistory: [],
    monthlyIncome: 50000,
    monthlyExpenses: 30000,
    currentSavings: 100000,
    hasInsurance: false,
    insuranceCoverage: 0,
    dependents: 0,
    hasEmergencyFund: false,
    debtEmi: 0,
    spendingBehavior: "Medium",
  });

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Demo mode: No Firebase auth needed
    setLoading(false);
  }, []);

  const handleLogin = async () => {
    if (!demoEmail || !demoPassword) {
      toast.error("Please enter email and password");
      return;
    }
    
    setIsLoggingIn(true);
    const toastId = toast.loading("Logging in...");
    try {
      // Demo mode: Create a fake user
      const demoUser = {
        uid: "demo-" + Date.now(),
        displayName: demoEmail.split("@")[0],
        email: demoEmail,
        photoURL: null,
      } as any;
      
      setUser(demoUser);
      setDemoEmail("");
      setDemoPassword("");
      setIsLoggingIn(false);
      toast.success("Welcome to Health Shock Shield! (Demo Mode)", { id: toastId });
    } catch (error: any) {
      setIsLoggingIn(false);
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.", { id: toastId });
    }
  };

  const handleLogout = async () => {
    try {
      setUser(null);
      setStep("personal");
      setResult(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.displayName?.split(" ")[0] || "Explorer";
    if (hour < 12) return `Good morning, ${name}! Ready to explore?`;
    if (hour < 18) return `Good afternoon, ${name}! Ready to explore?`;
    return `Good evening, ${name}! Ready to explore?`;
  };

  const updateField = (field: keyof UserInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: "existingConditions" | "familyHistory", id: string) => {
    setFormData(prev => {
      const current = prev[field] as string[];
      const next = current.includes(id) ? current.filter(i => i !== id) : [...current, id];
      return { ...prev, [field]: next };
    });
  };

  const handleAnalyze = () => {
    const analysis = analyzeHealthInputs(formData);
    setResult(analysis);
    setStep("result");
  };

  const reset = () => {
    setStep("personal");
    setResult(null);
  };

  const renderStep = () => {
    switch (step) {
      case "personal":
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shadow-sm">
                <UserIcon className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Personal Details</h2>
                <p className="text-sm text-gray-500">Let's start with the basics</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-[32px] border-2 border-blue-50 shadow-sm">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateField("age", Number(e.target.value))}
                  className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-blue-600 focus:outline-none bg-gray-50/50 transition-all font-medium text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Gender</label>
                <div className="flex gap-2">
                  {GENDERS.map(g => (
                    <button
                      key={g}
                      onClick={() => updateField("gender", g)}
                      className={`flex-1 p-5 rounded-2xl border-2 transition-all font-medium text-lg ${
                        formData.gender === g 
                          ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" 
                          : "bg-gray-50/50 border-gray-100 hover:border-blue-200"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setStep("health")} className="w-full py-6 bg-blue-600 text-white rounded-[32px] text-xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
              Next: Health Data <ArrowRight className="w-6 h-6" />
            </button>
          </motion.div>
        );

      case "health":
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shadow-sm">
                <Stethoscope className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Vitals & Health</h2>
                <p className="text-sm text-gray-500">Your current health markers</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-[32px] border-2 border-blue-50 shadow-sm">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Blood Pressure (Sys/Dia)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={formData.bpSystolic}
                    onChange={(e) => updateField("bpSystolic", Number(e.target.value))}
                    className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-blue-600 focus:outline-none bg-gray-50/50 transition-all font-medium text-lg"
                    placeholder="Sys"
                  />
                  <span className="text-gray-300 font-bold">/</span>
                  <input
                    type="number"
                    value={formData.bpDiastolic}
                    onChange={(e) => updateField("bpDiastolic", Number(e.target.value))}
                    className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-blue-600 focus:outline-none bg-gray-50/50 transition-all font-medium text-lg"
                    placeholder="Dia"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sugar Level (mg/dL)</label>
                <input
                  type="number"
                  value={formData.sugarLevel}
                  onChange={(e) => updateField("sugarLevel", Number(e.target.value))}
                  className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-blue-600 focus:outline-none bg-gray-50/50 transition-all font-medium text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Height (cm) & Weight (kg)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => updateField("height", Number(e.target.value))}
                    className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-blue-600 focus:outline-none bg-gray-50/50 transition-all font-medium text-lg"
                    placeholder="Height"
                  />
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => updateField("weight", Number(e.target.value))}
                    className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-blue-600 focus:outline-none bg-gray-50/50 transition-all font-medium text-lg"
                    placeholder="Weight"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Cholesterol (mg/dL)</label>
                <input
                  type="number"
                  value={formData.cholesterol}
                  onChange={(e) => updateField("cholesterol", Number(e.target.value))}
                  className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-blue-600 focus:outline-none bg-gray-50/50 transition-all font-medium text-lg"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep("personal")} className="flex-1 py-6 bg-white border-2 border-gray-100 rounded-[32px] text-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                <ArrowLeft className="w-6 h-6" /> Back
              </button>
              <button onClick={() => setStep("lifestyle")} className="flex-[2] py-6 bg-blue-600 text-white rounded-[32px] text-xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                Next: Lifestyle <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        );

      case "lifestyle":
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shadow-sm">
                <Activity className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Lifestyle Habits</h2>
                <p className="text-sm text-gray-500">How you live your daily life</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-[32px] border-2 border-blue-50 shadow-sm">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Smoking</label>
                <div className="flex flex-wrap gap-2">
                  {SMOKING_LEVELS.map(l => (
                    <button
                      key={l}
                      onClick={() => updateField("smoking", l)}
                      className={`flex-1 min-w-[100px] p-4 rounded-2xl border-2 transition-all font-medium ${
                        formData.smoking === l 
                          ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 scale-[1.02]" 
                          : "bg-gray-50/50 border-gray-100 hover:border-blue-200"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Alcohol</label>
                <div className="flex flex-wrap gap-2">
                  {ALCOHOL_LEVELS.map(l => (
                    <button
                      key={l}
                      onClick={() => updateField("alcohol", l)}
                      className={`flex-1 min-w-[100px] p-4 rounded-2xl border-2 transition-all font-medium ${
                        formData.alcohol === l 
                          ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 scale-[1.02]" 
                          : "bg-gray-50/50 border-gray-100 hover:border-blue-200"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4 col-span-full">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Exercise (Days/Week)</label>
                  <span className="text-blue-600 font-bold text-lg">{formData.exerciseDays} days</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="7"
                  value={formData.exerciseDays}
                  onChange={(e) => updateField("exerciseDays", Number(e.target.value))}
                  className="w-full h-3 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <div className="space-y-2 col-span-full">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sleep (Hours/Night)</label>
                <input
                  type="number"
                  value={formData.sleepHours}
                  onChange={(e) => updateField("sleepHours", Number(e.target.value))}
                  className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-blue-600 focus:outline-none bg-gray-50/50 transition-all font-medium text-lg"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep("health")} className="flex-1 py-6 bg-white border-2 border-gray-100 rounded-[32px] text-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                <ArrowLeft className="w-6 h-6" /> Back
              </button>
              <button onClick={() => setStep("history")} className="flex-[2] py-6 bg-blue-600 text-white rounded-[32px] text-xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                Next: History <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        );

      case "history":
        const filteredConditions = EXISTING_CONDITIONS.filter(c => 
          c.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const filteredFamily = FAMILY_HISTORY.filter(h => 
          h.label.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shadow-sm">
                <History className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Medical History</h2>
                <p className="text-sm text-gray-500">Search and select any past conditions</p>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search for a disease or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-5 pl-12 rounded-[24px] border-2 border-blue-100 focus:border-blue-600 focus:outline-none bg-white shadow-sm transition-all"
              />
              <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
            </div>

            <div className="space-y-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              <section>
                <h3 className="text-xs font-bold text-blue-600 mb-4 uppercase tracking-widest">Existing Conditions</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredConditions.length > 0 ? (
                    filteredConditions.map(c => (
                      <button
                        key={c.id}
                        onClick={() => toggleArrayField("existingConditions", c.id)}
                        className={`p-4 rounded-2xl border-2 transition-all text-left text-sm font-medium ${
                          formData.existingConditions.includes(c.id) 
                            ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 scale-[1.02]" 
                            : "bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50/30"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center text-gray-400 italic">
                      No conditions found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              </section>
              
              <section>
                <h3 className="text-xs font-bold text-blue-600 mb-4 uppercase tracking-widest">Family History</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredFamily.length > 0 ? (
                    filteredFamily.map(h => (
                      <button
                        key={h.id}
                        onClick={() => toggleArrayField("familyHistory", h.id)}
                        className={`p-4 rounded-2xl border-2 transition-all text-left text-sm font-medium ${
                          formData.familyHistory.includes(h.id) 
                            ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 scale-[1.02]" 
                            : "bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50/30"
                        }`}
                      >
                        {h.label}
                      </button>
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center text-gray-400 italic">
                      No family history found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep("lifestyle")} className="flex-1 py-6 bg-white border-2 border-gray-100 rounded-[32px] text-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                <ArrowLeft className="w-6 h-6" /> Back
              </button>
              <button onClick={() => setStep("financial")} className="flex-[2] py-6 bg-blue-600 text-white rounded-[32px] text-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                Next: Financial <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        );

      case "financial":
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shadow-sm">
                <Wallet className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Financial Audit</h2>
                <p className="text-sm text-gray-500">Your safety net and capacity</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-[32px] border-2 border-blue-50 shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 group relative">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Monthly Income (₹)</label>
                  <Info className="w-3.5 h-3.5 text-gray-300 cursor-help" />
                  <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl font-normal normal-case tracking-normal">
                    Total money you take home every month after taxes.
                  </div>
                </div>
                <input
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => updateField("monthlyIncome", Number(e.target.value))}
                  className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-blue-600 focus:outline-none bg-gray-50/50 transition-all font-medium text-lg"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 group relative">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Monthly Expenses (₹)</label>
                  <Info className="w-3.5 h-3.5 text-gray-300 cursor-help" />
                  <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl font-normal normal-case tracking-normal">
                    Average monthly spend on rent, food, bills, and lifestyle.
                  </div>
                </div>
                <input
                  type="number"
                  value={formData.monthlyExpenses}
                  onChange={(e) => updateField("monthlyExpenses", Number(e.target.value))}
                  className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-blue-600 focus:outline-none bg-gray-50/50 transition-all font-medium text-lg"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 group relative">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Current Savings (₹)</label>
                  <Info className="w-3.5 h-3.5 text-gray-300 cursor-help" />
                  <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl font-normal normal-case tracking-normal">
                    Total cash you have in bank accounts or liquid investments.
                  </div>
                </div>
                <input
                  type="number"
                  value={formData.currentSavings}
                  onChange={(e) => updateField("currentSavings", Number(e.target.value))}
                  className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-blue-600 focus:outline-none bg-gray-50/50 transition-all font-medium text-lg"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 group relative">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Insurance Coverage (₹)</label>
                  <Info className="w-3.5 h-3.5 text-gray-300 cursor-help" />
                  <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl font-normal normal-case tracking-normal">
                    The maximum amount your health insurance policy will pay for medical bills.
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateField("hasInsurance", !formData.hasInsurance)}
                    className={`flex-1 p-5 rounded-2xl border-2 transition-all font-medium ${
                      formData.hasInsurance 
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 scale-[1.02]" 
                        : "bg-gray-50/50 border-gray-100 hover:border-blue-200"
                    }`}
                  >
                    {formData.hasInsurance ? "Insured" : "No Insurance"}
                  </button>
                  {formData.hasInsurance && (
                    <input
                      type="number"
                      value={formData.insuranceCoverage}
                      onChange={(e) => updateField("insuranceCoverage", Number(e.target.value))}
                      className="flex-[2] p-5 rounded-2xl border-2 border-gray-100 focus:border-blue-600 focus:outline-none bg-gray-50/50 transition-all font-medium text-lg"
                      placeholder="Amount"
                    />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Dependents</label>
                <input
                  type="number"
                  value={formData.dependents}
                  onChange={(e) => updateField("dependents", Number(e.target.value))}
                  className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-blue-600 focus:outline-none bg-gray-50/50 transition-all font-medium text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Debt EMI (₹)</label>
                <input
                  type="number"
                  value={formData.debtEmi}
                  onChange={(e) => updateField("debtEmi", Number(e.target.value))}
                  className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-blue-600 focus:outline-none bg-gray-50/50 transition-all font-medium text-lg"
                />
              </div>
              <div className="space-y-2 col-span-full">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Spending Behavior</label>
                <div className="flex gap-2">
                  {SPENDING_BEHAVIORS.map(b => (
                    <button
                      key={b}
                      onClick={() => updateField("spendingBehavior", b)}
                      className={`flex-1 p-5 rounded-2xl border-2 transition-all font-medium ${
                        formData.spendingBehavior === b 
                          ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 scale-[1.02]" 
                          : "bg-gray-50/50 border-gray-100 hover:border-blue-200"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-full p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Calculated Monthly Savings</span>
                  <div className={`text-2xl font-bold ${formData.monthlyIncome - formData.monthlyExpenses - formData.debtEmi > 0 ? 'text-blue-600' : 'text-red-500'}`}>
                    ₹{(formData.monthlyIncome - formData.monthlyExpenses - formData.debtEmi).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Savings Rate</span>
                  <div className="text-lg font-bold text-gray-700">
                    {formData.monthlyIncome > 0 ? Math.max(0, ((formData.monthlyIncome - formData.monthlyExpenses - formData.debtEmi) / formData.monthlyIncome) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-[24px] border-2 border-blue-100 col-span-full">
                <input
                  type="checkbox"
                  checked={formData.hasEmergencyFund}
                  onChange={(e) => updateField("hasEmergencyFund", e.target.checked)}
                  className="w-6 h-6 accent-blue-600 cursor-pointer"
                />
                <span className="text-lg font-bold text-blue-900">I have an emergency fund ready</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep("history")} className="flex-1 py-6 bg-white border-2 border-gray-100 rounded-[32px] text-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                <ArrowLeft className="w-6 h-6" /> Back
              </button>
              <button onClick={handleAnalyze} className="flex-[2] py-6 bg-blue-600 text-white rounded-[32px] text-xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                Analyze Risks <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        );

      case "result":
        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8">
            {/* Health Summary */}
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
                <div className="flex-1">
                  <span className="text-sm font-semibold tracking-wider uppercase text-blue-600 mb-2 block">Your Health Profile</span>
                  <h2 className="text-3xl font-medium mb-4">What we found</h2>
                  <p className="text-gray-500 mb-6 leading-relaxed">
                    Based on your inputs, you might be at risk for the following categories. 
                    Early attention can help reduce long-term costs.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result?.conditions.map((c) => (
                      <span key={c} className="px-5 py-2.5 bg-blue-50 text-blue-700 rounded-2xl text-sm font-semibold border border-blue-100 shadow-sm">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 w-full md:w-auto min-w-[200px]">
                  <span className="text-xs font-bold uppercase text-gray-400 block mb-2">Weight Status (BMI)</span>
                  <div className={`text-3xl font-bold ${result?.bmiCategory === "Normal" ? "text-blue-600" : "text-blue-500"}`}>
                    {result?.bmiCategory}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">Score: {result?.bmi.toFixed(1)}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Estimated Yearly Medical Expense</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-8 rounded-[32px] bg-green-600 text-white shadow-xl shadow-green-100 text-center">
                    <span className="text-xs font-bold uppercase text-green-100 block mb-2">If things go well</span>
                    <div className="text-3xl font-bold">₹{result?.totalCostRange.min.toLocaleString()}</div>
                  </div>
                  <div className="p-8 rounded-[32px] bg-amber-500 text-white shadow-xl shadow-amber-100 text-center scale-105 z-10">
                    <span className="text-xs font-bold uppercase text-amber-100 block mb-2">Most Likely</span>
                    <div className="text-4xl font-bold">₹{result?.totalCostRange.avg.toLocaleString()}</div>
                  </div>
                  <div className="p-8 rounded-[32px] bg-amber-600 text-white shadow-xl shadow-amber-100 text-center">
                    <span className="text-xs font-bold uppercase text-amber-100 block mb-2">In worst case</span>
                    <div className="text-3xl font-bold">₹{result?.totalCostRange.max.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Condition Breakdown */}
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <Stethoscope className="text-blue-600 w-6 h-6" />
                </div>
                <h2 className="text-2xl font-medium">Condition Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-4 text-xs font-bold uppercase text-gray-400">Condition Category</th>
                      <th className="pb-4 text-xs font-bold uppercase text-green-600 text-right">Min Cost</th>
                      <th className="pb-4 text-xs font-bold uppercase text-amber-500 text-right">Avg Cost</th>
                      <th className="pb-4 text-xs font-bold uppercase text-amber-600 text-right">Max Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {result?.conditionBreakdown.map((item) => (
                      <tr key={item.name} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="py-5 font-medium text-gray-900">{item.name}</td>
                        <td className="py-5 text-right text-green-600 font-medium">₹{item.min.toLocaleString()}</td>
                        <td className="py-5 text-right font-bold text-amber-500">₹{item.avg.toLocaleString()}</td>
                        <td className="py-5 text-right font-medium text-amber-600">₹{item.max.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-6 text-xs text-gray-400 italic">
                * Costs represent estimated annual out-of-pocket expenses including consultations, medications, and routine tests.
              </p>
            </div>

            {/* Financial Gap */}
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                    <Wallet className="text-blue-600 w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-medium">Your Financial Readiness</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  <div className="space-y-8">
                    {/* Income & Expenses */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-1.5 group relative">
                          <span className="text-sm font-semibold text-gray-900 block">Monthly Budget</span>
                          <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                          <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl font-normal">
                            This tracks how much you earn versus how much you spend each month. A healthy budget leaves room for savings.
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">Income: ₹{formData.monthlyIncome.toLocaleString()} | Expenses: ₹{formData.monthlyExpenses.toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${formData.monthlyExpenses > formData.monthlyIncome ? 'bg-blue-800' : 'bg-blue-600'}`}
                          style={{ width: `${Math.min(100, (formData.monthlyExpenses / formData.monthlyIncome) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {formData.monthlyExpenses + formData.debtEmi > formData.monthlyIncome 
                          ? "Warning: Your expenses and debt exceed your income. This makes it difficult to build a health safety net." 
                          : `You are saving ₹${(formData.monthlyIncome - formData.monthlyExpenses - formData.debtEmi).toLocaleString()} monthly. This is your primary source for building an emergency fund.`}
                      </p>
                    </div>

                    {/* Savings vs Potential Cost */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-1.5 group relative">
                          <span className="text-sm font-semibold text-gray-900 block">Savings Readiness</span>
                          <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                          <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl font-normal">
                            This shows if your current savings can cover the expected yearly medical costs. 100% means you are fully prepared for the average case.
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">Current Savings: ₹{formData.currentSavings.toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, (formData.currentSavings / result!.totalCostRange.avg) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        This shows how much of the "Most Likely" health cost (₹{result?.totalCostRange.avg.toLocaleString()}) you can cover with your current liquid savings.
                      </p>
                    </div>

                    {/* Insurance Coverage */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-1.5 group relative">
                          <span className="text-sm font-semibold text-gray-900 block">Insurance Protection</span>
                          <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                          <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl font-normal">
                            This measures how much of a "worst-case" medical bill your insurance would pay. Higher percentage means less risk to your personal wealth.
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">Coverage: ₹{formData.insuranceCoverage.toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-400 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, (formData.insuranceCoverage / result!.totalCostRange.max) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        In a "Worst Case" scenario (₹{result?.totalCostRange.max.toLocaleString()}), your insurance covers this percentage of the total bill.
                      </p>
                    </div>

                    <div className="pt-8 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1.5 group relative">
                          <span className="text-xl font-medium text-gray-900">Total Money Gap</span>
                          <Info className="w-4 h-4 text-gray-400 cursor-help" />
                          <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl font-normal">
                            This is your "danger zone"—the amount you might have to pay out of your own pocket that you don't currently have saved or insured.
                          </div>
                        </div>
                        <span className="text-4xl font-bold text-blue-900">₹{result?.totalFinancialGap.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-6">
                        This is your net exposure after accounting for all your assets and insurance.
                      </p>

                      {/* Savings Prediction */}
                      <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100">
                        <h4 className="text-sm font-bold text-blue-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <TrendingDown className="w-4 h-4" /> Savings Prediction
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-700">In 1 Month</span>
                            <span className="font-bold text-blue-900">₹{(formData.currentSavings + result!.savingsCapacity).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-700">In 6 Months</span>
                            <span className="font-bold text-blue-900">₹{(formData.currentSavings + (result!.savingsCapacity * 6)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-700">In 1 Year</span>
                            <span className="font-bold text-blue-900">₹{(formData.currentSavings + (result!.savingsCapacity * 12)).toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 w-full bg-blue-200 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 2 }}
                              className="h-full bg-blue-600"
                            />
                          </div>
                          <p className="text-[10px] text-blue-600 italic">
                            *Assumes consistent monthly surplus of ₹{result?.savingsCapacity.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 p-8 rounded-[32px] border border-blue-100 h-fit">
                    <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      Simple Steps to Secure Yourself
                    </h3>
                    <div className="space-y-5">
                      {result?.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex gap-4 items-start">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <span className="text-sm font-medium text-blue-900/80 leading-relaxed">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative background element */}
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-30" />
            </div>

            <button onClick={reset} className="w-full py-6 bg-gray-900 text-white rounded-[32px] text-xl font-medium hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3">
              <RefreshCw className="w-5 h-5" /> Retake Audit
            </button>
          </motion.div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <Toaster position="top-center" richColors />
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Activity className="w-12 h-12 text-blue-600" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6 overflow-hidden relative">
        <Toaster position="top-center" richColors />
        {/* Animated background elements */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50"
        />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-2xl shadow-blue-100 relative z-10 border border-blue-50"
        >
          <AnimatePresence mode="wait">
            {isLoggingIn ? (
              <motion.div 
                key="logging-in"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="text-center py-10"
              >
                <div className="relative w-32 h-32 mx-auto mb-8">
                  <motion.div 
                    animate={{ 
                      y: [0, -20, 0],
                      rotate: [0, -5, 5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative z-10"
                  >
                    <Rocket className="w-32 h-32 text-blue-600 fill-blue-50" />
                  </motion.div>
                  
                  {/* Exhaust particles */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <motion.div 
                        key={i}
                        animate={{ 
                          y: [0, 40],
                          opacity: [1, 0],
                          scale: [1, 0.5]
                        }}
                        transition={{ 
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                        className="w-3 h-3 bg-blue-400 rounded-full blur-[2px]"
                      />
                    ))}
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Igniting Shield...</h2>
                
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="h-full bg-blue-600"
                  />
                </div>
                <p className="text-sm text-gray-400 animate-pulse">Establishing secure connection</p>
              </motion.div>
            ) : (
              <motion.div 
                key="login-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center mb-10">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200"
                  >
                    <Shield className="text-white w-10 h-10" />
                  </motion.div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">Health Shock Shield</h1>
                  <p className="text-gray-500 leading-relaxed">
                    Unlock your personalized health and financial risk analysis. Your data is protected.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <Zap className="text-blue-600 w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium text-blue-900">Instant Risk Analysis</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <Sparkles className="text-blue-600 w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium text-blue-900">Personalized Recommendations</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <Lock className="text-blue-600 w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium text-blue-900">Secure & Private Audit</span>
                  </div>
                </div>

                <div className="space-y-4 mt-10">
                  <div>
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Email (Demo)</label>
                    <input
                      type="email"
                      value={demoEmail}
                      onChange={(e) => setDemoEmail(e.target.value)}
                      placeholder="Enter any email"
                      className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-blue-600 focus:outline-none bg-gray-50/50 transition-all font-medium text-lg mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Password (Demo)</label>
                    <input
                      type="password"
                      value={demoPassword}
                      onChange={(e) => setDemoPassword(e.target.value)}
                      placeholder="Enter any password"
                      className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-blue-600 focus:outline-none bg-gray-50/50 transition-all font-medium text-lg mt-2"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full mt-10 py-6 bg-blue-600 text-white rounded-[32px] text-xl font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 group"
                >
                  Get Started <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <p className="text-center text-xs text-gray-400 mt-6">
                  By continuing, you agree to our secure data processing terms.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans selection:bg-blue-100">
      <Toaster position="top-center" richColors />
      <header className="max-w-4xl mx-auto pt-12 px-6 pb-8">
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="text-white w-5 h-5" />
              </div>
              <span className="text-sm font-semibold tracking-wider uppercase text-gray-500">Health Shock Shield</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-medium text-blue-900">
                {getGreeting()}
              </h1>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 rounded-full border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Health Guardian Lvl. 1</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <h1 className="text-4xl font-light tracking-tight text-gray-900 md:text-5xl">
          Complete <span className="font-medium">Health & Financial</span> Audit.
        </h1>
        
        {/* Progress Bar */}
        {step !== "result" && (
          <div className="mt-8 flex gap-2">
            {["personal", "health", "lifestyle", "history", "financial"].map((s, idx) => (
              <div 
                key={s} 
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  ["personal", "health", "lifestyle", "history", "financial"].indexOf(step) >= idx ? "bg-blue-600" : "bg-gray-200"
                }`} 
              />
            ))}
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-24">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-400">
          Estimates are based on public health data and approximate averages. 
          This tool is for educational purposes and not a substitute for professional medical or financial advice.
        </p>
      </footer>
    </div>
  );
}
