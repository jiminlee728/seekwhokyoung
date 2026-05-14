export type UserId = string;
export type RoundId = string;

export type ExpenseCategory = "food" | "alcohol" | "activity" | "transport" | "other";

export interface EventParticipant {
  id: UserId;
  name: string;
}

export interface RoundParticipant {
  userId: UserId;
  /**
   * 부담 비율. 기본값은 1이며, 0.5는 반만 부담하는 참석자를 의미한다.
   */
  weight?: number;
  /**
   * 사용자가 제외될 비용 카테고리. 예: 술 제외 사용자는 ["alcohol"].
   */
  excludedCategories?: ExpenseCategory[];
  /**
   * 원 단위 수동 조정. 양수는 더 부담, 음수는 덜 부담한다.
   */
  adjustmentAmount?: number;
}

export interface Round {
  id: RoundId;
  roundNo: number;
  placeName?: string;
  participants: RoundParticipant[];
}

export interface Expense {
  id: string;
  roundId: RoundId;
  paidByUserId: UserId;
  amount: number;
  category?: ExpenseCategory;
  description?: string;
  discountAmount?: number;
  fundAppliedAmount?: number;
}

export interface SettlementInput {
  participants: EventParticipant[];
  rounds: Round[];
  expenses: Expense[];
  existingPayments?: ExistingPayment[];
}

export interface ExistingPayment {
  payerUserId: UserId;
  payeeUserId: UserId;
  paidAmount: number;
}

export interface Transfer {
  payerUserId: UserId;
  payeeUserId: UserId;
  amount: number;
}

export interface ParticipantShare {
  userId: UserId;
  roundId: RoundId;
  expenseId: string;
  amount: number;
}

export interface SettlementPlan {
  balances: Record<UserId, number>;
  shares: ParticipantShare[];
  transfers: Transfer[];
}
