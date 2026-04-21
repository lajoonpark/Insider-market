import { CoinConfig, Mission, SourceType } from "@/lib/game/types";

export const STARTING_CASH = 10_000;
export const STORAGE_KEY = "insider-market-save-v2";

export const COIN_CONFIGS: CoinConfig[] = [
  {
    id: "APEX",
    name: "Apex Technologies",
    description: "Large-cap tech leader with stable institutional ownership.",
    category: "Blue-chip",
    basePrice: 180,
    volatility: 0.0008,
    maxMovePerTick: 0.003,
    maxEventMove: 0.01,
    dailyMoveLimit: 0.03,
    trendBias: 0.000015,
    eventSensitivity: 0.65,
    insiderSensitivity: 0.5,
    scamRisk: 0,
    riskLabel: "Low",
  },
  {
    id: "HYPE",
    name: "HypeMedia Inc.",
    description: "Rumor-sensitive social platform with momentum-driven swings.",
    category: "Speculative",
    basePrice: 4.2,
    volatility: 0.0035,
    maxMovePerTick: 0.012,
    maxEventMove: 0.03,
    dailyMoveLimit: 0.08,
    trendBias: 0.00003,
    eventSensitivity: 1.45,
    insiderSensitivity: 1.35,
    scamRisk: 0.05,
    riskLabel: "Extreme",
  },
  {
    id: "NOVA",
    name: "Nova Systems",
    description: "Growth stock tied to product cycles and analyst revisions.",
    category: "Growth",
    basePrice: 45,
    volatility: 0.002,
    maxMovePerTick: 0.007,
    maxEventMove: 0.02,
    dailyMoveLimit: 0.05,
    trendBias: 0.000025,
    eventSensitivity: 1.15,
    insiderSensitivity: 1.1,
    scamRisk: 0.02,
    riskLabel: "High",
  },
  {
    id: "VALT",
    name: "Valt Finance",
    description: "Dividend-focused defensive financial with low beta behavior.",
    category: "Dividend",
    basePrice: 85,
    volatility: 0.0006,
    maxMovePerTick: 0.0025,
    maxEventMove: 0.008,
    dailyMoveLimit: 0.025,
    trendBias: 0.00001,
    eventSensitivity: 0.45,
    insiderSensitivity: 0.3,
    scamRisk: 0,
    riskLabel: "Low",
  },
  {
    id: "SHAD",
    name: "Shadow Dynamics",
    description: "Thinly traded small-cap with elevated but bounded volatility.",
    category: "Small-cap",
    basePrice: 12,
    volatility: 0.003,
    maxMovePerTick: 0.01,
    maxEventMove: 0.025,
    dailyMoveLimit: 0.07,
    trendBias: -0.00001,
    eventSensitivity: 1.4,
    insiderSensitivity: 1.25,
    scamRisk: 0.16,
    riskLabel: "Extreme",
  },
  {
    id: "GRID",
    name: "GridWorks Corp.",
    description: "Steady industrial utility with moderate cyclical swings.",
    category: "Blue-chip",
    basePrice: 240,
    volatility: 0.0012,
    maxMovePerTick: 0.004,
    maxEventMove: 0.012,
    dailyMoveLimit: 0.035,
    trendBias: 0.000015,
    eventSensitivity: 0.9,
    insiderSensitivity: 0.7,
    scamRisk: 0.01,
    riskLabel: "Medium",
  },
];

export const SOURCE_TYPES: SourceType[] = [
  "Anonymous tip",
  "Hedge fund contact",
  "Insider leak",
  "Influencer call",
  "Broker intel",
];

export const SOURCE_RELIABILITY: Record<SourceType, [number, number]> = {
  "Anonymous tip": [0.25, 0.55],
  "Hedge fund contact": [0.4, 0.75],
  "Insider leak": [0.5, 0.85],
  "Influencer call": [0.3, 0.7],
  "Broker intel": [0.45, 0.8],
};

export const MISSION_DEFS: Mission[] = [
  {
    id: "m-10x",
    title: "From 10K to 100K",
    description: "Grow total equity from $10,000 to $100,000.",
    completed: false,
    reward: "Starting cash bonus +$2,500 for next run",
  },
  {
    id: "m-crash",
    title: "Crash Survivor",
    description: "Survive a major market crash without going bankrupt.",
    completed: false,
    reward: "Unlock: Advanced chart overlays",
  },
  {
    id: "m-streak",
    title: "Clean Execution",
    description: "Make 5 profitable trades in a row.",
    completed: false,
    reward: "Badge: Precision Trader",
  },
  {
    id: "m-hype",
    title: "Ride the Wave",
    description: "Hold HYPE shares through an extreme volatility event.",
    completed: false,
    reward: "Unlock: Faster insider feed refresh",
  },
  {
    id: "m-insider",
    title: "Whisper Interpreter",
    description: "Correctly act on 3 insider leaks.",
    completed: false,
    reward: "Unlock: Better source filtering",
  },
];

export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "market", label: "Market / Invest" },
  { key: "news", label: "News Feed" },
  { key: "insider", label: "Insider" },
  { key: "missions", label: "Missions" },
  { key: "history", label: "History" },
  { key: "settings", label: "Settings" },
] as const;

export const SPEED_OPTIONS = [0, 1, 2, 3, 5, 10, 25, 50, 100];

export const EVENT_LIBRARY = [
  "earnings beat",
  "earnings miss",
  "guidance raise",
  "guidance cut",
  "merger rumor",
  "regulatory scrutiny",
  "analyst upgrade wave",
  "analyst downgrade cycle",
  "sector rotation",
  "market-wide risk-off move",
] as const;

export const HEADLINE_TEMPLATES = {
  marketBear: [
    "Regulatory fears shake risk assets across the board",
    "Major broker outage triggers panic selling",
    "Macro concerns spread across trading desks",
  ],
  marketBull: [
    "Institutional desks rotate back into equities",
    "Liquidity returns as sentiment stabilises",
    "Risk-on mood pushes broad market rally",
  ],
  hype: [
    "Viral post sends HypeMedia shares soaring",
    "Influencer thread ignites retail frenzy in HYPE",
    "Retail traders pile into overnight HYPE rally",
  ],
  security: [
    "Data breach rumours spread across analyst forums",
    "Suspicious trading activity sparks heavy selloff",
    "Auditor warning triggers fear cycle in small-caps",
  ],
};
