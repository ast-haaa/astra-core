import { type EnvironmentInfo, type LabTestInfo, type RecallInfo } from "../mockData";

interface QualityScoreCardProps {
  environment: EnvironmentInfo;
  labTest: LabTestInfo;
  recall?: RecallInfo;
}

export function QualityScoreCard({
  environment,
  labTest,
  recall
}: QualityScoreCardProps) {

  /* ---------- SCORE LOGIC (keep simple) ---------- */
  let score = 95;

  if (recall?.isRecalled) score = 0;

  if (labTest.result === "FAIL") score -= 50;
  if (labTest.result === "PENDING") score -= 20;

  if (environment.temperatureC > 30) score -= 15;
  if (environment.humidityPercent > 70) score -= 10;

  score = Math.max(0, Math.min(99, score)); // never 100

  /* ---------- COLOR ---------- */
  const color =
    score >= 75 ? "text-emerald-600" :
    score >= 50 ? "text-emerald-600" :
    "text-red-600";

  /* ---------- ONE REASON LINE ---------- */
  let reason = "All conditions within safe range";

  if (environment.temperatureC > 30)
    reason = "Potency reduced due to heat exposure";

  if (labTest.result === "FAIL")
    reason = "Lab quality test failed";

  if (recall?.isRecalled)
    reason = "Batch recalled by authority";

  /* ---------- UI ---------- */
  return (
    <div
      className="rounded-2xl border shadow-lg p-6 text-center bg-white"
      data-testid="card-quality-score"
    >
      <p className="text-sm font-semibold mb-2">
        POTENCY & SAFETY SCORE
      </p>

      <h2
        className={`text-4xl font-bold ${color}`}
        data-testid="text-quality-score"
      >
        {score} / 100
      </h2>

      <p className="text-xs mt-2 text-slate-600">
        {reason}
      </p>
    </div>
  );
}
