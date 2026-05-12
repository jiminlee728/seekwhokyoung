import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  confirmEvent,
  createGroup,
  createSchedulingEvent,
  createShareLinks,
  formatKakaoConfirmationMessage,
  formatKakaoVoteMessage,
  getNonResponders,
  recommendTimes,
} from "../src/scheduling/index.js";

const slots = [
  { id: "fri-19", startAt: "2026-05-15T10:00:00.000Z", endAt: "2026-05-15T12:00:00.000Z" },
  { id: "sat-18", startAt: "2026-05-16T09:00:00.000Z", endAt: "2026-05-16T11:00:00.000Z" },
  { id: "sun-12", startAt: "2026-05-17T03:00:00.000Z", endAt: "2026-05-17T05:00:00.000Z" },
];

const participants = [
  { userId: "a", name: "민수", isCore: true },
  { userId: "b", name: "지민", isCore: true },
  { userId: "c", name: "영희" },
  { userId: "d", name: "수현" },
];

describe("P1 링크 기반 일정 조율", () => {
  it("그룹과 이벤트를 만들고 투표 링크를 생성한다", () => {
    const group = createGroup({ name: "러닝크루", ownerId: "a", isRecurring: true }, "g1");
    const event = createSchedulingEvent(
      {
        groupId: group.id,
        title: "5월 정기 러닝",
        candidateSlots: slots,
        candidatePlaces: ["한강공원"],
        voteDeadlineAt: "2026-05-14T14:59:00.000Z",
      },
      "ev1",
    );
    const links = createShareLinks("https://sikhoo.kr/", event);

    assert.equal(group.inviteCode, "러닝크루-g1");
    assert.equal(event.status, "voting");
    assert.equal(links.voteUrl, "https://sikhoo.kr/events/ev1/vote?token=5%EC%9B%94-%EC%A0%95%EA%B8%B0-%EB%9F%AC%EB%8B%9D-ev1");
    assert.equal(links.resultUrl, "https://sikhoo.kr/events/ev1/results?token=5%EC%9B%94-%EC%A0%95%EA%B8%B0-%EB%9F%AC%EB%8B%9D-ev1");
  });

  it("참석률, 핵심 인원, 선호도, 반복 패턴으로 추천 시간 Top 3를 정렬한다", () => {
    const recommendations = recommendTimes({
      slots,
      participants,
      recurringPatternScores: { "fri-19": 0.1, "sat-18": 0.8, "sun-12": 0.4 },
      responses: [
        { userId: "a", slotId: "fri-19", status: "available", preferenceScore: 5 },
        { userId: "b", slotId: "fri-19", status: "unavailable" },
        { userId: "c", slotId: "fri-19", status: "available", preferenceScore: 4 },
        { userId: "d", slotId: "fri-19", status: "available", preferenceScore: 3 },
        { userId: "a", slotId: "sat-18", status: "available", preferenceScore: 4 },
        { userId: "b", slotId: "sat-18", status: "available", preferenceScore: 5 },
        { userId: "c", slotId: "sat-18", status: "maybe", preferenceScore: 2 },
        { userId: "d", slotId: "sat-18", status: "unavailable" },
        { userId: "a", slotId: "sun-12", status: "maybe", preferenceScore: 3 },
        { userId: "b", slotId: "sun-12", status: "maybe", preferenceScore: 3 },
        { userId: "c", slotId: "sun-12", status: "available", preferenceScore: 5 },
        { userId: "d", slotId: "sun-12", status: "available", preferenceScore: 5 },
      ],
    });

    assert.deepEqual(
      recommendations.map((recommendation) => recommendation.slot.id),
      ["sat-18", "sun-12", "fri-19"],
    );
    assert.equal(recommendations[0].availableCount, 2);
    assert.equal(recommendations[0].maybeCount, 1);
    assert.equal(recommendations[0].coreMemberRate, 1);
    assert.deepEqual(recommendations[0].reasons, [
      "4명 중 2명 가능",
      "1명 애매",
      "핵심 인원 2 / 2명 가능",
      "평균 선호도 2.5점",
      "반복 모임 패턴과 유사",
    ]);
  });

  it("미응답자를 계산하고 확정 메시지를 만든다", () => {
    const event = createSchedulingEvent(
      { groupId: "g1", title: "프로젝트 킥오프", candidateSlots: slots, candidatePlaces: ["강남역"] },
      "ev2",
    );
    const links = createShareLinks("https://sikhoo.kr", event);
    const nonResponders = getNonResponders(participants, [
      { userId: "a", slotId: "fri-19", status: "available" },
      { userId: "b", slotId: "fri-19", status: "maybe" },
    ]);
    const confirmed = confirmEvent(event, "fri-19", "강남역", ["a", "b"]);

    assert.deepEqual(nonResponders, ["c", "d"]);
    assert.equal(formatKakaoVoteMessage(event, links), `프로젝트 킥오프 일정 투표\n가능 시간을 입력해주세요: ${links.voteUrl}`);
    assert.equal(
      formatKakaoConfirmationMessage(confirmed, slots[0], links.resultUrl),
      `프로젝트 킥오프 확정\n시간: 2026. 5. 15. 오후 7:00 ~ 오후 9:00\n장소: 강남역\n상세 보기: ${links.resultUrl}`,
    );
  });

  it("잘못된 후보 시간과 선호도는 거부한다", () => {
    assert.throws(
      () => createSchedulingEvent({ groupId: "g1", title: "오류", candidateSlots: [] }, "ev3"),
      /At least one candidate slot/,
    );
    assert.throws(
      () =>
        recommendTimes({
          slots,
          participants,
          responses: [{ userId: "a", slotId: "fri-19", status: "available", preferenceScore: 6 }],
        }),
      /preferenceScore/,
    );
  });
});
