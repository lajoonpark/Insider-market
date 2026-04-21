export type NavSection =
  | "dashboard"
  | "market"
  | "news"
  | "insider"
  | "missions"
  | "history"
  | "settings";

export type CoinId = "APEX" | "HYPE" | "NOVA" | "VALT" | "SHAD" | "GRID";
export type StockCategory = "Blue-chip" | "Growth" | "Small-cap" | "Speculative" | "Dividend";
export type MarketRegime = "Calm" | "Bullish" | "Bearish" | "Volatile" | "Panic";

export type SourceType =
  | "Anonymous tip"
  | "Hedge fund contact"
  | "Insider leak"
  | "Influencer call"
  | "Broker intel";

export interface CoinConfig {
  id: CoinId;
  name: string;
  description: string;
  category: StockCategory;
  basePrice: number;
  volatility: number;
  maxMovePerTick: number;
  maxEventMove: number;
  dailyMoveLimit: number;
  trendBias: number;
  eventSensitivity: number;
  insiderSensitivity: number;
  scamRisk: number;
  riskLabel: "Low" | "Medium" | "High" | "Extreme";
}

export interface CoinState {
  id: CoinId;
  price: number;
  buyPrice: number;
  sellPrice: number;
  momentum: number;
  trend24h: number;
  intradayOpenPrice: number;
  dailyMovePct: number;
  cooldownTicks: number;
  history: Array<{ t: number; price: number }>;
  volatilityLabel: "Low" | "Medium" | "High" | "Extreme";
  latestNewsIds: string[];
}

export interface Holding {
  coinId: CoinId;
  units: number;
  avgCost: number;
  invested: number;
  realizedPnL: number;
}

export interface Trade {
  id: string;
  t: number;
  coinId: CoinId;
  side: "buy" | "sell";
  units: number;
  price: number;
  fee: number;
  slippagePct: number;
  total: number;
  pnl?: number;
}

export interface NewsItem {
  id: string;
  t: number;
  headline: string;
  detail: string;
  sentiment: "bullish" | "bearish" | "neutral";
  impact: number;
  coinId?: CoinId;
  source: string;
}

export interface InsiderTip {
  id: string;
  t: number;
  coinId: CoinId;
  message: string;
  confidenceHint: string;
  sourceType: SourceType;
  expectedReactionMinutes: number;
  expectedDirection: "up" | "down";
  hiddenReliability: number;
  truthType: "true" | "false" | "partial";
  resolved: boolean;
  wasAccurate?: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  reward: string;
}

export interface MarketEvent {
  id: string;
  title: string;
  detail: string;
  sentiment: number;
  target: "market" | CoinId;
  remainingMinutes: number;
  intensity: number;
}

export interface NotificationToast {
  id: string;
  t: number;
  title: string;
  message: string;
  type: "event" | "insider" | "trade" | "mission";
}

export interface SourceStats {
  type: SourceType;
  tipsTotal: number;
  resolvedTips: number;
  accurateTips: number;
}

export interface GameSettings {
  difficulty: "Casual" | "Realistic" | "Chaos";
  soundEnabled: boolean;
  tutorialSeen: boolean;
}

export interface GameState {
  seed: number;
  rngState: number;
  startedAt: number;
  currentTime: number;
  paused: boolean;
  timeSpeed: number;
  cash: number;
  fear: number;
  greed: number;
  marketSentiment: number;
  marketRegime: MarketRegime;
  regimeMinutesRemaining: number;
  activeEvents: MarketEvent[];
  coins: Record<CoinId, CoinState>;
  holdings: Record<CoinId, Holding>;
  trades: Trade[];
  news: NewsItem[];
  insiderTips: InsiderTip[];
  sourceStats: Record<SourceType, SourceStats>;
  missions: Mission[];
  unlockedFeatures: string[];
  nav: NavSection;
  selectedCoin: CoinId;
  netWorthHistory: Array<{ t: number; value: number; marketIndex: number }>;
  majorDecisions: Array<{ t: number; text: string }>;
  notifications: NotificationToast[];
  runBestValue: number;
}

export interface TradePreview {
  side: "buy" | "sell";
  coinId: CoinId;
  orderUsd: number;
  units: number;
  estimatedPrice: number;
  fee: number;
  spreadCost: number;
  slippagePct: number;
  total: number;
  valid: boolean;
  reason?: string;
}
