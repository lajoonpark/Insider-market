import { CoinConfig, Mission, SourceType } from "@/lib/game/types";

export const STARTING_CASH = 10_000;
export const STORAGE_KEY = "insider-market-save-v1";

export const COIN_CONFIGS: CoinConfig[] = [
  {
    id: "BTCX",
    name: "BitCore X",
    description: "Market leader and trend anchor with deep liquidity.",
    basePrice: 42000,
    volatility: 0.003,
    trendBias: 0.00005,
    eventSensitivity: 0.8,
    insiderSensitivity: 0.5,
    scamRisk: 0,
    riskLabel: "Low",
  },
  {
    id: "MEME",
    name: "MemeBurst",
    description: "Chaotic social-driven token with giant mood swings.",
    basePrice: 4.2,
    volatility: 0.02,
    trendBias: 0.0001,
    eventSensitivity: 1.5,
    insiderSensitivity: 1.4,
    scamRisk: 0.05,
    riskLabel: "Extreme",
  },
  {
    id: "NEXA",
    name: "NexaChain",
    description: "Narrative-heavy growth coin tied to product momentum.",
    basePrice: 120,
    volatility: 0.01,
    trendBias: 0.00008,
    eventSensitivity: 1.2,
    insiderSensitivity: 1.1,
    scamRisk: 0.02,
    riskLabel: "High",
  },
  {
    id: "SAFE",
    name: "SafeHarbor",
    description: "Defensive low-volatility coin favored in panic markets.",
    basePrice: 60,
    volatility: 0.002,
    trendBias: 0.00002,
    eventSensitivity: 0.4,
    insiderSensitivity: 0.3,
    scamRisk: 0,
    riskLabel: "Low",
  },
  {
    id: "SHDW",
    name: "ShadowMint",
    description: "Opaque high-risk project with rug-pull potential.",
    basePrice: 22,
    volatility: 0.018,
    trendBias: -0.00005,
    eventSensitivity: 1.7,
    insiderSensitivity: 1.3,
    scamRisk: 0.16,
    riskLabel: "Extreme",
  },
  {
    id: "GRID",
    name: "GridLayer",
    description: "Infrastructure-focused coin with slower directional moves.",
    basePrice: 240,
    volatility: 0.005,
    trendBias: 0.00004,
    eventSensitivity: 0.9,
    insiderSensitivity: 0.7,
    scamRisk: 0.01,
    riskLabel: "Medium",
  },
];

export const SOURCE_TYPES: SourceType[] = [
  "Anonymous source",
  "Known whale",
  "Developer leak",
  "Influencer rumor",
  "Exchange employee",
];

export const SOURCE_RELIABILITY: Record<SourceType, [number, number]> = {
  "Anonymous source": [0.25, 0.55],
  "Known whale": [0.4, 0.75],
  "Developer leak": [0.5, 0.85],
  "Influencer rumor": [0.3, 0.7],
  "Exchange employee": [0.45, 0.8],
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
    description: "Survive a major crash without going bankrupt.",
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
    id: "m-meme",
    title: "Diamond Hands",
    description: "Hold MEME through an extreme volatility event.",
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
  "exchange hack",
  "regulation shock",
  "influencer hype",
  "chain upgrade success",
  "exploit rumor",
  "whale accumulation",
  "rug pull alarm",
  "macro panic",
  "institutional adoption",
] as const;

export const HEADLINE_TEMPLATES = {
  marketBear: [
    "Regulatory fears shake risk assets",
    "Major exchange outage causes panic",
    "Macro panic spreads across crypto desks",
  ],
  marketBull: [
    "Institutional desks rotate back into risk",
    "Liquidity returns as markets stabilize",
    "Risk-on mood pushes broad token rally",
  ],
  meme: [
    "Viral meme sends small-cap token soaring",
    "Influencer thread ignites retail frenzy",
    "Meme traders pile into late-night pump",
  ],
  security: [
    "Security exploit rumors spread across forums",
    "Suspicious wallet activity sparks selloff",
    "Auditor warning triggers fear cycle",
  ],
};
