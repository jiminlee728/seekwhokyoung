import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calculateSettlementPlan,
  formatKakaoSettlementMessage,
  minimizeTransfers,
  type EventParticipant,
  type SettlementInput,
  type Transfer,
} from "../src/settlement/index.js";

const users: EventParticipant[] = [
  { id: "a", name: "민수" },
  { id: "b", name: "지민" },
  { id: "c", name: "영희" },
  { id: "d", name: "수현" },
  { id: "e", name: "철수" },
  { id: "f", name: "유나" },
];

function compactTransfers(transfers: Transfer[]): string[] {
  return transfers.map((transfer) => `${transfer.payerUserId}->${transfer.payeeUserId}:${transfer.amount}`);
}

describe("P0 차수별 정산 코어", () => {
  it("1차만 있고 결제자 1명인 경우 n분의 1과 최소 송금표를 만든다", () => {
    const plan = calculateSettlementPlan({
      participants: users.slice(0, 3),
      rounds: [{ id: "r1", roundNo: 1, participants: [{ userId: "a" }, { userId: "b" }, { userId: "c" }] }],
      expenses: [{ id: "e1", roundId: "r1", paidByUserId: "a", amount: 60_000 }],
    });

    assert.deepEqual(plan.balances, { a: 40_000, b: -20_000, c: -20_000 });
    assert.deepEqual(compactTransfers(plan.transfers), ["b->a:20000", "c->a:20000"]);
  });

  it("1차와 2차 참석자가 다를 때 차수별 참석자만 비용을 부담한다", () => {
    const plan = calculateSettlementPlan({
      participants: users.slice(0, 4),
      rounds: [
        { id: "r1", roundNo: 1, participants: [{ userId: "a" }, { userId: "b" }, { userId: "c" }, { userId: "d" }] },
        { id: "r2", roundNo: 2, participants: [{ userId: "a" }, { userId: "b" }] },
      ],
      expenses: [
        { id: "e1", roundId: "r1", paidByUserId: "a", amount: 80_000 },
        { id: "e2", roundId: "r2", paidByUserId: "b", amount: 40_000 },
      ],
    });

    assert.deepEqual(plan.balances, { a: 40_000, b: 0, c: -20_000, d: -20_000 });
    assert.deepEqual(compactTransfers(plan.transfers), ["c->a:20000", "d->a:20000"]);
  });

  it("복수 결제자를 여러 expense로 처리한다", () => {
    const plan = calculateSettlementPlan({
      participants: users.slice(0, 3),
      rounds: [{ id: "r1", roundNo: 1, participants: [{ userId: "a" }, { userId: "b" }, { userId: "c" }] }],
      expenses: [
        { id: "e1", roundId: "r1", paidByUserId: "a", amount: 45_000 },
        { id: "e2", roundId: "r1", paidByUserId: "b", amount: 15_000 },
      ],
    });

    assert.deepEqual(plan.balances, { a: 25_000, b: -5_000, c: -20_000 });
    assert.deepEqual(compactTransfers(plan.transfers), ["c->a:20000", "b->a:5000"]);
  });

  it("수동 조정 금액으로 일부 사용자의 부담을 조정한다", () => {
    const plan = calculateSettlementPlan({
      participants: users.slice(0, 3),
      rounds: [
        {
          id: "r1",
          roundNo: 1,
          participants: [
            { userId: "a" },
            { userId: "b", adjustmentAmount: -5_000 },
            { userId: "c" },
          ],
        },
      ],
      expenses: [{ id: "e1", roundId: "r1", paidByUserId: "a", amount: 60_000 }],
    });

    assert.deepEqual(
      plan.shares.map((share) => `${share.userId}:${share.amount}`),
      ["a:21667", "b:16667", "c:21666"],
    );
    assert.deepEqual(plan.balances, { a: 38_333, b: -16_667, c: -21_666 });
  });

  it("회비 차감액은 정산 대상 금액에서 제외한다", () => {
    const plan = calculateSettlementPlan({
      participants: users.slice(0, 3),
      rounds: [{ id: "r1", roundNo: 1, participants: [{ userId: "a" }, { userId: "b" }, { userId: "c" }] }],
      expenses: [{ id: "e1", roundId: "r1", paidByUserId: "a", amount: 90_000, fundAppliedAmount: 30_000 }],
    });

    assert.deepEqual(plan.balances, { a: 40_000, b: -20_000, c: -20_000 });
  });

  it("쿠폰 할인액은 정산 대상 금액에서 제외한다", () => {
    const plan = calculateSettlementPlan({
      participants: users.slice(0, 4),
      rounds: [{ id: "r1", roundNo: 1, participants: [{ userId: "a" }, { userId: "b" }, { userId: "c" }, { userId: "d" }] }],
      expenses: [{ id: "e1", roundId: "r1", paidByUserId: "a", amount: 100_000, discountAmount: 20_000 }],
    });

    assert.deepEqual(plan.balances, { a: 60_000, b: -20_000, c: -20_000, d: -20_000 });
  });

  it("부분 송금을 기존 결제로 반영해 남은 금액만 다시 계산한다", () => {
    const plan = calculateSettlementPlan({
      participants: users.slice(0, 3),
      rounds: [{ id: "r1", roundNo: 1, participants: [{ userId: "a" }, { userId: "b" }, { userId: "c" }] }],
      expenses: [{ id: "e1", roundId: "r1", paidByUserId: "a", amount: 60_000 }],
      existingPayments: [{ payerUserId: "b", payeeUserId: "a", paidAmount: 5_000 }],
    });

    assert.deepEqual(plan.balances, { a: 35_000, b: -15_000, c: -20_000 });
    assert.deepEqual(compactTransfers(plan.transfers), ["c->a:20000", "b->a:15000"]);
  });

  it("원 단위 나머지는 사용자 ID 기준으로 결정적으로 분배한다", () => {
    const plan = calculateSettlementPlan({
      participants: users.slice(0, 3),
      rounds: [{ id: "r1", roundNo: 1, participants: [{ userId: "a" }, { userId: "b" }, { userId: "c" }] }],
      expenses: [{ id: "e1", roundId: "r1", paidByUserId: "a", amount: 10_000 }],
    });

    assert.deepEqual(
      plan.shares.map((share) => `${share.userId}:${share.amount}`),
      ["a:3334", "b:3333", "c:3333"],
    );
    assert.deepEqual(plan.balances, { a: 6_666, b: -3_333, c: -3_333 });
  });

  it("참석자 1명인 차수는 송금이 필요 없다", () => {
    const plan = calculateSettlementPlan({
      participants: users.slice(0, 1),
      rounds: [{ id: "r1", roundNo: 1, participants: [{ userId: "a" }] }],
      expenses: [{ id: "e1", roundId: "r1", paidByUserId: "a", amount: 35_000 }],
    });

    assert.deepEqual(plan.balances, { a: 0 });
    assert.deepEqual(plan.transfers, []);
  });

  it("결제자가 해당 차수 참석자가 아니어도 대신 결제한 것으로 계산한다", () => {
    const plan = calculateSettlementPlan({
      participants: users.slice(0, 3),
      rounds: [{ id: "r1", roundNo: 1, participants: [{ userId: "b" }, { userId: "c" }] }],
      expenses: [{ id: "e1", roundId: "r1", paidByUserId: "a", amount: 40_000 }],
    });

    assert.deepEqual(plan.balances, { a: 40_000, b: -20_000, c: -20_000 });
    assert.deepEqual(compactTransfers(plan.transfers), ["b->a:20000", "c->a:20000"]);
  });

  it("술 제외 옵션은 alcohol 카테고리 비용에서 해당 참석자를 제외한다", () => {
    const plan = calculateSettlementPlan({
      participants: users.slice(0, 3),
      rounds: [
        {
          id: "r1",
          roundNo: 1,
          participants: [
            { userId: "a" },
            { userId: "b" },
            { userId: "c", excludedCategories: ["alcohol"] },
          ],
        },
      ],
      expenses: [{ id: "e1", roundId: "r1", paidByUserId: "a", amount: 30_000, category: "alcohol" }],
    });

    assert.deepEqual(plan.balances, { a: 15_000, b: -15_000, c: 0 });
  });

  it("최소 송금 경로는 불필요한 송금 체인을 만들지 않는다", () => {
    assert.deepEqual(compactTransfers(minimizeTransfers({ a: 30_000, b: 20_000, c: -10_000, d: -40_000 })), [
      "d->a:30000",
      "d->b:10000",
      "c->b:10000",
    ]);
  });

  it("카카오톡 공유용 정산 메시지를 만든다", () => {
    const message = formatKakaoSettlementMessage("5월 정기 회식", users.slice(0, 2), [
      { payerUserId: "b", payeeUserId: "a", amount: 18_000 },
    ]);

    assert.equal(message, "5월 정기 회식 정산\n\n송금할 금액\n지민 → 민수 18,000원\n\n식후경에서 자동 계산됨");
  });

  it("잘못된 음수 금액은 거부한다", () => {
    const input: SettlementInput = {
      participants: users.slice(0, 2),
      rounds: [{ id: "r1", roundNo: 1, participants: [{ userId: "a" }, { userId: "b" }] }],
      expenses: [{ id: "e1", roundId: "r1", paidByUserId: "a", amount: -1 }],
    };

    assert.throws(() => calculateSettlementPlan(input), /amount must be a non-negative integer/);
  });
});
