const DEFAULT_WEIGHT = 1;

export function calculateSettlementPlan(input) {
  validateInput(input);

  const balances = Object.fromEntries(input.participants.map((participant) => [participant.id, 0]));
  const shares = [];
  const roundsById = new Map(input.rounds.map((round) => [round.id, round]));

  for (const expense of input.expenses) {
    const round = roundsById.get(expense.roundId);
    if (!round) throw new Error(`Expense ${expense.id} references unknown round ${expense.roundId}.`);

    const netAmount = getNetExpenseAmount(expense);
    balances[expense.paidByUserId] += netAmount;

    for (const share of splitExpense(round, expense, netAmount)) {
      balances[share.userId] -= share.amount;
      shares.push(share);
    }
  }

  const adjustedBalances = applyExistingPayments(balances, input.existingPayments ?? []);
  const transfers = minimizeTransfers(adjustedBalances);
  assertBalancesAreSettled(adjustedBalances, transfers);

  return { balances: adjustedBalances, shares, transfers };
}

export function minimizeTransfers(balances) {
  const debtors = Object.entries(balances)
    .filter(([, balance]) => balance < 0)
    .map(([userId, balance]) => ({ userId, amount: -balance }))
    .sort(compareAmountDescThenUserId);

  const creditors = Object.entries(balances)
    .filter(([, balance]) => balance > 0)
    .map(([userId, balance]) => ({ userId, amount: balance }))
    .sort(compareAmountDescThenUserId);

  const transfers = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0) transfers.push({ payerUserId: debtor.userId, payeeUserId: creditor.userId, amount });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount === 0) debtorIndex += 1;
    if (creditor.amount === 0) creditorIndex += 1;
  }

  return transfers;
}

export function formatKakaoSettlementMessage(eventTitle, participants, transfers) {
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

function splitExpense(round, expense, netAmount) {
  const eligibleParticipants = round.participants.filter(
    (participant) => !(participant.excludedCategories ?? []).includes(expense.category ?? "other"),
  );
  if (eligibleParticipants.length === 0) throw new Error(`Expense ${expense.id} has no eligible participants.`);

  const adjustmentTotal = eligibleParticipants.reduce((sum, participant) => sum + (participant.adjustmentAmount ?? 0), 0);
  const splittableAmount = netAmount - adjustmentTotal;
  if (splittableAmount < 0) throw new Error(`Expense ${expense.id} manual adjustments exceed the net amount.`);

  const totalWeight = eligibleParticipants.reduce((sum, participant) => sum + (participant.weight ?? DEFAULT_WEIGHT), 0);
  if (totalWeight <= 0) throw new Error(`Expense ${expense.id} has no positive participant weight.`);

  const rawShares = eligibleParticipants.map((participant) => {
    const exactBaseShare = (splittableAmount * (participant.weight ?? DEFAULT_WEIGHT)) / totalWeight;
    const baseShare = Math.floor(exactBaseShare);
    const amount = baseShare + (participant.adjustmentAmount ?? 0);
    if (amount < 0) throw new Error(`Expense ${expense.id} creates a negative share for user ${participant.userId}.`);
    return { userId: participant.userId, amount, remainder: exactBaseShare - baseShare };
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
    .map((share) => ({ userId: share.userId, roundId: round.id, expenseId: expense.id, amount: share.amount }));
}

function applyExistingPayments(balances, existingPayments) {
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

function getNetExpenseAmount(expense) {
  const netAmount = expense.amount - (expense.discountAmount ?? 0) - (expense.fundAppliedAmount ?? 0);
  if (netAmount < 0) throw new Error(`Expense ${expense.id} discount and fund amounts exceed the paid amount.`);
  return netAmount;
}

function validateInput(input) {
  const participantIds = new Set(input.participants.map((participant) => participant.id));
  if (participantIds.size !== input.participants.length) throw new Error("Participant IDs must be unique.");

  for (const round of input.rounds) {
    if (!Number.isInteger(round.roundNo) || round.roundNo <= 0) {
      throw new Error(`Round ${round.id} must have a positive integer roundNo.`);
    }
    const roundParticipantIds = new Set();
    for (const participant of round.participants) {
      if (!participantIds.has(participant.userId)) throw new Error(`Round ${round.id} references unknown participant ${participant.userId}.`);
      if (roundParticipantIds.has(participant.userId)) throw new Error(`Round ${round.id} has duplicate participant ${participant.userId}.`);
      roundParticipantIds.add(participant.userId);
      if ((participant.weight ?? DEFAULT_WEIGHT) < 0) throw new Error(`Round ${round.id} has negative weight for participant ${participant.userId}.`);
      assertInteger(participant.adjustmentAmount ?? 0, "adjustmentAmount");
    }
  }

  for (const expense of input.expenses) {
    if (!participantIds.has(expense.paidByUserId)) throw new Error(`Expense ${expense.id} references unknown payer ${expense.paidByUserId}.`);
    assertIntegerAmount(expense.amount, "amount");
    assertIntegerAmount(expense.discountAmount ?? 0, "discountAmount");
    assertIntegerAmount(expense.fundAppliedAmount ?? 0, "fundAppliedAmount");
  }
}

function assertIntegerAmount(amount, fieldName) {
  assertInteger(amount, fieldName);
  if (amount < 0) throw new Error(`${fieldName} must be a non-negative integer KRW amount.`);
}

function assertInteger(amount, fieldName) {
  if (!Number.isInteger(amount)) throw new Error(`${fieldName} must be an integer KRW amount.`);
}

function assertBalancesAreSettled(balances, transfers) {
  const afterTransfers = { ...balances };
  for (const transfer of transfers) {
    afterTransfers[transfer.payerUserId] += transfer.amount;
    afterTransfers[transfer.payeeUserId] -= transfer.amount;
  }
  const unsettled = Object.entries(afterTransfers).filter(([, balance]) => balance !== 0);
  if (unsettled.length > 0) throw new Error(`Settlement transfers do not resolve all balances: ${JSON.stringify(unsettled)}`);
}

function compareAmountDescThenUserId(a, b) {
  return b.amount - a.amount || a.userId.localeCompare(b.userId);
}

function formatKrw(amount) {
  return `${new Intl.NumberFormat("ko-KR").format(amount)}원`;
}
