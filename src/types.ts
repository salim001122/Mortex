export enum VIPRank {
  Bronze = 'Bronze',
  Silver = 'Silver',
  Gold = 'Gold',
  Platinum = 'Platinum'
}

export enum TransactionType {
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
  CopyTrade = 'CopyTrade',
  Staking = 'Staking',
  Commission = 'Commission',
  Bonus = 'Bonus'
}

export enum TransactionStatus {
  Pending = 'Pending',
  Success = 'Success',
  Failed = 'Failed'
}

export interface User {
  uid: string;
  username: string;
  email: string;
  mainBalance: number;
  profitBalance: number;
  totalVolume: number;
  totalStaked: number;
  teamVolume: number;
  teamProfit: number;
  teamCount: number;
  totalCommission: number;
  tier: VIPRank;
  loginStreak: number;
  lastBonusClaim: string | null; // ISO string
  referralCode: string;
  referrer: string | null;
  withdrawalPin: string;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  kycStatus: 'not_submitted' | 'pending' | 'verified';
  kycData?: {
    fullName: string;
    idNumber: string;
    nationality: string;
    documentImage: string;
    submittedAt: string;
  };
  copyTradeCount: number;
  copyTradeResetTime: string | null; // ISO string
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  timestamp: string; // ISO string
  network?: string;
  address?: string;
  traderName?: string;
  profit?: number;
  totalReturn?: number;
  bonus?: number;
  endTime?: string; // For running Copy Trades
  requiresApproval?: boolean;
}

export interface Trader {
  id: string;
  name: string;
  winRate: number;
  roi30d: number;
  followers: number;
  color: string;
  avatarLetter: string;
  riskScore: 'Low' | 'Medium' | 'High';
  weeklyProfit: number;
  minAmount: number;
}

export interface Stake {
  id: string;
  userId: string;
  amount: number;
  startDate: string; // ISO string
  endDate: string; // ISO string
  dailyROI: number; // e.g. 0.036 for 3.6%
  lastClaimed: string; // ISO string
  status: 'Active' | 'Completed';
  totalClaimed: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  userEmail: string;
  message: string;
  timestamp: string; // ISO string
}

export interface SupportMessage {
  id: string;
  sender: 'user' | 'bot';
  message: string;
  timestamp: string; // ISO string
}
