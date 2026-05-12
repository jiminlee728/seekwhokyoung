import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createSettlementRecords,
  formatSettlementReminderMessage,
  getOutstandingRecords,
  summarizeSettlementStatus,
  updateSettlementPayment,
} from "../src/settlement/index.js";

describe("P1 정산 상태 관리", () => {
  it("최소 송금표를 미정산 상태로 만들고 부분/완료 상태를 업데이트한다", () => {
    const records = createSettlementRecords([
      { payerUserId: "b", payeeUserId: "a", amount: 20_000 },
      { payerUserId: "c", payeeUserId: "a", amount: 15_000 },
    ]);

    const partiallyPaid = updateSettlementPayment(records, "b", "a", 5_000);
    const paid = updateSettlementPayment(partiallyPaid, "c", "a", 15_000);

    assert.deepEqual(paid, [
      { payerUserId: "b", payeeUserId: "a", amount: 20_000, paidAmount: 5_000, status: "partial" },
      { payerUserId: "c", payeeUserId: "a", amount: 15_000, paidAmount: 15_000, status: "paid" },
    ]);
    assert.deepEqual(summarizeSettlementStatus(paid), {
      totalAmount: 35_000,
      paidAmount: 20_000,
      remainingAmount: 15_000,
      pendingCount: 0,
      partialCount: 1,
      paidCount: 1,
    });
    assert.deepEqual(getOutstandingRecords(paid), [
      { payerUserId: "b", payeeUserId: "a", amount: 20_000, paidAmount: 5_000, status: "partial" },
    ]);
  });

  it("독촉 메시지는 남은 금액만 표시한다", () => {
    const [record] = updateSettlementPayment(
      createSettlementRecords([{ payerUserId: "b", payeeUserId: "a", amount: 20_000 }]),
      "b",
      "a",
      8_000,
    );

    assert.equal(
      formatSettlementReminderMessage("5월 회식", record, { a: "민수", b: "지민" }),
      "5월 회식 정산 reminder\n지민님, 민수님에게 12,000원 송금 부탁드려요.",
    );
  });

  it("송금액보다 큰 완료 금액은 거부한다", () => {
    const records = createSettlementRecords([{ payerUserId: "b", payeeUserId: "a", amount: 20_000 }]);
    assert.throws(() => updateSettlementPayment(records, "b", "a", 20_001), /cannot exceed/);
  });
});
