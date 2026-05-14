import type { Transfer, UserId } from "./types.js";

export type SettlementStatus = "pending" | "partial" | "paid";

export interface SettlementRecord extends Transfer {
  paidAmount: number;
  status: SettlementStatus;
}

export interface SettlementStatusSummary {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  pendingCount: number;
  partialCount: number;
  paidCount: number;
}

export function createSettlementRecords(transfers: Transfer[]): SettlementRecord[] {
  return transfers.map((transfer) => ({
    ...transfer,
    paidAmount: 0,
    status: "pending",
  }));
}

export function updateSettlementPayment(
  records: SettlementRecord[],
  payerUserId: UserId,
  payeeUserId: UserId,
  paidAmount: number,
): SettlementRecord[] {
  if (!Number.isInteger(paidAmount) || paidAmount < 0) {
    throw new Error("paidAmount must be a non-negative integer KRW amount.");
  }

  return records.map((record) => {
    if (record.payerUserId !== payerUserId || record.payeeUserId !== payeeUserId) return record;
    if (paidAmount > record.amount) {
      throw new Error("paidAmount cannot exceed settlement amount.");
    }

    return {
      ...record,
      paidAmount,
      status: paidAmount === 0 ? "pending" : paidAmount === record.amount ? "paid" : "partial",
    };
  });
}

export function summarizeSettlementStatus(records: SettlementRecord[]): SettlementStatusSummary {
  return records.reduce<SettlementStatusSummary>(
    (summary, record) => {
      summary.totalAmount += record.amount;
      summary.paidAmount += record.paidAmount;
      summary.remainingAmount += record.amount - record.paidAmount;
      if (record.status === "pending") summary.pendingCount += 1;
      if (record.status === "partial") summary.partialCount += 1;
      if (record.status === "paid") summary.paidCount += 1;
      return summary;
    },
    { totalAmount: 0, paidAmount: 0, remainingAmount: 0, pendingCount: 0, partialCount: 0, paidCount: 0 },
  );
}

export function getOutstandingRecords(records: SettlementRecord[]): SettlementRecord[] {
  return records.filter((record) => record.status !== "paid");
}

export function formatSettlementReminderMessage(
  eventTitle: string,
  record: SettlementRecord,
  names: Record<UserId, string>,
): string {
  const remainingAmount = record.amount - record.paidAmount;
  return `${eventTitle} 정산 reminder\n${names[record.payerUserId] ?? record.payerUserId}님, ${
    names[record.payeeUserId] ?? record.payeeUserId
  }님에게 ${formatKrw(remainingAmount)} 송금 부탁드려요.`;
}

function formatKrw(amount: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(amount)}원`;
}
