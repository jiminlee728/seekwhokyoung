import type {
  EventParticipant,
  ExistingPayment,
  Expense,
  ParticipantShare,
  Round,
  RoundParticipant,
  SettlementInput,
  SettlementPlan,
  Transfer,
  UserId,
} from "./types.js";

const DEFAULT_WEIGHT = 1;

export function calculateSettlementPlan(input: SettlementInput): SettlementPlan {
  validateInput(input);

  const balances = createZeroBalances(input.participants);
  const shares: ParticipantShare[] = [];
  const roundsById = new Map(input.rounds.map((round) => [round.id, round]));

  for (const expense of input.expenses) {
    const round = roundsById.get(expense.roundId);
    if (!round) {
      throw new Error(`Expense ${expense.id} references unknown round ${expense.roundId}.`);
    }

    const netAmount = getNetExpenseAmount(expense);
    balances[expense.paidByUserId] += netAmount;

    const expenseShares = splitExpense(round, expense, netAmount);
    for (const share of expenseShares) {
      balances[share.userId] -= share.amount;
      shares.push(share);
    }
  }

  const adjustedBalances = applyExistingPayments(balances, input.existingPayments ?? []);
  const transfers = minimizeTransfers(adjustedBalances);

  assertBalancesAreSettled(adjustedBalances, transfers);

  return {
    balances: adjustedBalances,
    shares,
    transfers,
  };
}

export function minimizeTransfers(balances: Record<UserId, number>): Transfer[] {
  const debtors = Object.entries(balances)
    .filter(([, balance]) => balance < 0)
    .map(([userId, balance]) => ({ userId, amount: -balance }))
    .sort(compareAmountDescThenUserId);

  const creditors = Object.entries(balances)
    .filter(([, balance]) => balance > 0)
    .map(([userId, balance]) => ({ userId, amount: balance }))
    .sort(compareAmountDescThenUserId);

  const transfers: Transfer[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0) {
      transfers.push({
        payerUserId: debtor.userId,
        payeeUserId: creditor.userId,
        amount,
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount === 0) debtorIndex += 1;
    if (creditor.amount === 0) creditorIndex += 1;
  }

  return transfers;
}

export function formatKakaoSettlementMessage(
  eventTitle: string,
  participants: EventParticipant[],
  transfers: Transfer[],
): string {
  const names = new Map(participants.map((participant) => [participant.id, participant.name]));
  const lines = [`${eventTitle} 정산`, "", "송금할 금액"];

  if (transfers.length === 0) {
    lines.push("정산할 금액이 없습니다.");
  } else {
    for (const transfer of transfers) {
      lines.push(
        `${names.get(transfer.payerUserId) ?? transfer.payerUserId} → ${
          names.get(transfer.payeeUserId) ?? transfer.payeeUserId
        } ${formatKrw(transfer.amount)}`,
      );
    }
  }

  lines.push("", "식후경에서 자동 계산됨");
  return lines.join("\n");
}

function splitExpense(round: Round, expense: Expense, netAmount: number): ParticipantShare[] {
  const eligibleParticipants = round.participants.filter(
    (participant) => !(participant.excludedCategories ?? []).includes(expense.category ?? "other"),
  );

  if (eligibleParticipants.length === 0) {
    throw new Error(`Expense ${expense.id} has no eligible participants.`);
  }

  const adjustmentTotal = eligibleParticipants.reduce(
    (sum, participant) => sum + (participant.adjustmentAmount ?? 0),
    0,
  );
  const splittableAmount = netAmount - adjustmentTotal;
  if (splittableAmount < 0) {
    throw new Error(`Expense ${expense.id} manual adjustments exceed the net amount.`);
  }

  const totalWeight = eligibleParticipants.reduce((sum, participant) => sum + getWeight(participant), 0);
  if (totalWeight <= 0) {
    throw new Error(`Expense ${expense.id} has no positive participant weight.`);
  }

  const rawShares = eligibleParticipants.map((participant) => {
    const exactBaseShare = (splittableAmount * getWeight(participant)) / totalWeight;
    const baseShare = Math.floor(exactBaseShare);
    const amount = baseShare + (participant.adjustmentAmount ?? 0);
    if (amount < 0) {
      throw new Error(`Expense ${expense.id} creates a negative share for user ${participant.userId}.`);
    }

    return {
      userId: participant.userId,
      amount,
      remainder: exactBaseShare - baseShare,
    };
  });

  let undistributed = netAmount - rawShares.reduce((sum, share) => sum + share.amount, 0);
  rawShares.sort((a, b) => b.remainder - a.remainder || a.userId.localeCompare(b.userId));

  for (const share of rawShares) {
    if (undistributed <= 0) break;
    share.amount += 1;
    undistributed -= 1;
  }

  return rawShares
    .sort((a, b) => a.userId.localeCompare(b.userId))
    .map((share) => ({
      userId: share.userId,
      roundId: round.id,
      expenseId: expense.id,
      amount: share.amount,
    }));
}

function applyExistingPayments(
  balances: Record<UserId, number>,
  existingPayments: ExistingPayment[],
): Record<UserId, number> {
  const adjustedBalances = { ...balances };

  for (const payment of existingPayments) {
    assertIntegerAmount(payment.paidAmount, "paidAmount");
    if (!(payment.payerUserId in adjustedBalances)) adjustedBalances[payment.payerUserId] = 0;
    if (!(payment.payeeUserId in adjustedBalances)) adjustedBalances[payment.payeeUserId] = 0;

    adjustedBalances[payment.payerUserId] += payment.paidAmount;
    adjustedBalances[payment.payeeUserId] -= payment.paidAmount;
  }

  return adjustedBalances;
}

function createZeroBalances(participants: EventParticipant[]): Record<UserId, number> {
  return Object.fromEntries(participants.map((participant) => [participant.id, 0]));
}

function getNetExpenseAmount(expense: Expense): number {
  const discountAmount = expense.discountAmount ?? 0;
  const fundAppliedAmount = expense.fundAppliedAmount ?? 0;
  const netAmount = expense.amount - discountAmount - fundAppliedAmount;

  if (netAmount < 0) {
    throw new Error(`Expense ${expense.id} discount and fund amounts exceed the paid amount.`);
  }

  return netAmount;
}

function getWeight(participant: RoundParticipant): number {
  return participant.weight ?? DEFAULT_WEIGHT;
}

function validateInput(input: SettlementInput): void {
  const participantIds = new Set(input.participants.map((participant) => participant.id));
  if (participantIds.size !== input.participants.length) {
    throw new Error("Participant IDs must be unique.");
  }

  for (const round of input.rounds) {
    if (!Number.isInteger(round.roundNo) || round.roundNo <= 0) {
      throw new Error(`Round ${round.id} must have a positive integer roundNo.`);
    }

    const roundParticipantIds = new Set<UserId>();
    for (const participant of round.participants) {
      if (!participantIds.has(participant.userId)) {
        throw new Error(`Round ${round.id} references unknown participant ${participant.userId}.`);
      }
      if (roundParticipantIds.has(participant.userId)) {
        throw new Error(`Round ${round.id} has duplicate participant ${participant.userId}.`);
      }
      roundParticipantIds.add(participant.userId);
      if (getWeight(participant) < 0) {
        throw new Error(`Round ${round.id} has negative weight for participant ${participant.userId}.`);
      }
      assertInteger(participant.adjustmentAmount ?? 0, "adjustmentAmount");
    }
  }

  for (const expense of input.expenses) {
    if (!participantIds.has(expense.paidByUserId)) {
      throw new Error(`Expense ${expense.id} references unknown payer ${expense.paidByUserId}.`);
    }
    assertIntegerAmount(expense.amount, "amount");
    assertIntegerAmount(expense.discountAmount ?? 0, "discountAmount");
    assertIntegerAmount(expense.fundAppliedAmount ?? 0, "fundAppliedAmount");
  }
}

function assertIntegerAmount(amount: number, fieldName: string): void {
  assertInteger(amount, fieldName);
  if (amount < 0) {
    throw new Error(`${fieldName} must be a non-negative integer KRW amount.`);
  }
}

function assertInteger(amount: number, fieldName: string): void {
  if (!Number.isInteger(amount)) {
    throw new Error(`${fieldName} must be an integer KRW amount.`);
  }
}

function assertBalancesAreSettled(balances: Record<UserId, number>, transfers: Transfer[]): void {
  const afterTransfers = { ...balances };
  for (const transfer of transfers) {
    afterTransfers[transfer.payerUserId] += transfer.amount;
    afterTransfers[transfer.payeeUserId] -= transfer.amount;
  }

  const unsettled = Object.entries(afterTransfers).filter(([, balance]) => balance !== 0);
  if (unsettled.length > 0) {
    throw new Error(`Settlement transfers do not resolve all balances: ${JSON.stringify(unsettled)}`);
  }
}

function compareAmountDescThenUserId(
  a: { userId: UserId; amount: number },
  b: { userId: UserId; amount: number },
): number {
  return b.amount - a.amount || a.userId.localeCompare(b.userId);
}

function formatKrw(amount: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(amount)}원`;
}
