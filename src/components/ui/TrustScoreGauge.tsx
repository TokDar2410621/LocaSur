import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TrustScoreGaugeProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

// Configuration des segments de la jauge
const SEGMENTS = [
  { min: 0, max: 20, label: "Faible", color: "#ef4444", gradient: "from-red-500 to-red-400" },
  { min: 20, max: 40, label: "Moyen", color: "#f97316", gradient: "from-orange-500 to-orange-400" },
  { min: 40, max: 60, label: "Bon", color: "#eab308", gradient: "from-yellow-500 to-yellow-400" },
  { min: 60, max: 80, label: "Très bon", color: "#22c55e", gradient: "from-green-500 to-green-400" },
  { min: 80, max: 100, label: "Excellent", color: "#10b981", gradient: "from-emerald-500 to-emerald-400" },
];

function getScoreInfo(score: number) {
  const segment = SEGMENTS.find(s => score >= s.min && score < s.max) || SEGMENTS[SEGMENTS.length - 1];
  return segment;
}

function getGradeFromScore(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  return "D";
}

const sizeConfig = {
  sm: { width: 180, height: 110, strokeWidth: 12, fontSize: 28, gradeSize: 14 },
  md: { width: 240, height: 140, strokeWidth: 16, fontSize: 36, gradeSize: 16 },
  lg: { width: 320, height: 180, strokeWidth: 20, fontSize: 48, gradeSize: 20 },
};

export function TrustScoreGauge({
  score,
  size = "md",
  showLabel = true,
  className
}: TrustScoreGaugeProps) {
  const config = sizeConfig[size];
  const scoreInfo = getScoreInfo(score);
  const grade = getGradeFromScore(score);

  // Dimensions du SVG
  const centerX = config.width / 2;
  const centerY = config.height - 20;
  const radius = Math.min(config.width / 2, config.height) - config.strokeWidth - 10;

  // Calcul de l'arc
  const circumference = Math.PI * radius;
  const scorePercent = Math.min(100, Math.max(0, score)) / 100;
  const dashOffset = circumference * (1 - scorePercent);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
        >
          {/* Dégradé pour l'arc */}
          <defs>
            <linearGradient id={`gauge-gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Arc de fond */}
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            className="text-gray-200 dark:text-gray-700"
          />

          {/* Arc coloré (score) */}
          <motion.path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
            fill="none"
            stroke={`url(#gauge-gradient-${score})`}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          {/* Marqueur de position */}
          <motion.circle
            cx={centerX - radius + (radius * 2 * scorePercent)}
            cy={centerY}
            r={config.strokeWidth / 2 + 2}
            fill="white"
            stroke={scoreInfo.color}
            strokeWidth={3}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              cx: centerX - radius * Math.cos(Math.PI * scorePercent),
              cy: centerY - radius * Math.sin(Math.PI * scorePercent)
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="drop-shadow-md"
          />
        </svg>

        {/* Score au centre */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="text-center"
          >
            <span
              className="font-bold"
              style={{ fontSize: config.fontSize, color: scoreInfo.color }}
            >
              {score}
            </span>
            <span className="text-muted-foreground" style={{ fontSize: config.gradeSize }}>
              /100
            </span>
          </motion.div>
        </div>
      </div>

      {/* Grade et Label */}
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-1"
        >
          <div className="flex items-center justify-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-white text-sm font-bold"
              style={{ backgroundColor: scoreInfo.color }}
            >
              Grade {grade}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {scoreInfo.label}
          </p>
        </motion.div>
      )}
    </div>
  );
}

// Version compacte horizontale - Belle et moderne
export function TrustScoreCompact({
  score,
  className
}: {
  score: number;
  className?: string;
}) {
  const scoreInfo = getScoreInfo(score);
  const grade = getGradeFromScore(score);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: scoreInfo.color }}
          >
            {grade}
          </span>
          <span className="font-medium text-sm">Score de confiance</span>
        </div>
        <span className="text-xl font-bold" style={{ color: scoreInfo.color }}>
          {score}
        </span>
      </div>

      {/* Barre de progression avec segments */}
      <div className="relative h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        <div className="absolute inset-0 flex">
          {SEGMENTS.map((segment, index) => (
            <div
              key={index}
              className="flex-1 transition-opacity duration-300"
              style={{
                backgroundColor: segment.color,
                opacity: score >= segment.min ? 1 : 0.2,
              }}
            />
          ))}
        </div>
        {/* Indicateur de position */}
        <motion.div
          className="absolute top-0 bottom-0 w-1 bg-white rounded-full shadow-lg"
          initial={{ left: "0%" }}
          animate={{ left: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ transform: "translateX(-50%)" }}
        />
      </div>

      <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
        <span>Faible</span>
        <span>Moyen</span>
        <span>Bon</span>
        <span>Très bon</span>
        <span>Excellent</span>
      </div>
    </div>
  );
}

// Version badge minimaliste
export function TrustScoreBadge({
  score,
  className
}: {
  score: number;
  className?: string;
}) {
  const scoreInfo = getScoreInfo(score);
  const grade = getGradeFromScore(score);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
        className
      )}
    >
      <div
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: scoreInfo.color }}
      />
      <span className="font-bold text-sm" style={{ color: scoreInfo.color }}>
        {score}
      </span>
      <span className="text-xs text-muted-foreground font-medium">
        {grade}
      </span>
    </div>
  );
}

// Mini jauge circulaire
export function TrustScoreCircle({
  score,
  size = 60,
  className
}: {
  score: number;
  size?: number;
  className?: string;
}) {
  const scoreInfo = getScoreInfo(score);
  const grade = getGradeFromScore(score);
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={scoreInfo.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold text-sm" style={{ color: scoreInfo.color }}>
          {score}
        </span>
        <span className="text-[8px] text-muted-foreground font-medium">
          {grade}
        </span>
      </div>
    </div>
  );
}

export default TrustScoreGauge;
