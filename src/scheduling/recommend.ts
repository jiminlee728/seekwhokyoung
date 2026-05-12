import type {
  AvailabilityResponse,
  EventRecommendationInput,
  TimeRecommendation,
  UserId,
} from "./types.js";

const MAX_PREFERENCE_SCORE = 5;

export function recommendTimes(input: EventRecommendationInput): TimeRecommendation[] {
  validateRecommendationInput(input);
  const responsesBySlotAndUser = buildResponseMap(input.responses);
  const coreMembers = input.participants.filter((participant) => participant.isCore);
  const topN = input.topN ?? 3;

  return input.slots
    .map((slot) => {
      let availableCount = 0;
      let maybeCount = 0;
      let unavailableCount = 0;
      let missingCount = 0;
      let weightedAttendance = 0;
      let coreWeightedAttendance = 0;
      let preferenceSum = 0;

      for (const participant of input.participants) {
        const response = responsesBySlotAndUser.get(toKey(slot.id, participant.userId));
        if (!response) {
          missingCount += 1;
          continue;
        }

        if (response.status === "available") {
          availableCount += 1;
          weightedAttendance += 1;
          if (participant.isCore) coreWeightedAttendance += 1;
          preferenceSum += response.preferenceScore ?? 0;
        } else if (response.status === "maybe") {
          maybeCount += 1;
          weightedAttendance += 0.5;
          if (participant.isCore) coreWeightedAttendance += 0.5;
          preferenceSum += (response.preferenceScore ?? 0) * 0.5;
        } else {
          unavailableCount += 1;
        }
      }

      const attendanceRate = weightedAttendance / input.participants.length;
      const coreMemberRate = coreMembers.length === 0 ? 1 : coreWeightedAttendance / coreMembers.length;
      const preferenceAverage = preferenceSum / input.participants.length;
      const recurringPatternScore = clamp(input.recurringPatternScores?.[slot.id] ?? 0, 0, 1);
      const conflictPenalty = availableCount === 0 && maybeCount === 0 ? 100 : 0;
      const score = roundScore(
        attendanceRate * 40 +
          coreMemberRate * 30 +
          (preferenceAverage / MAX_PREFERENCE_SCORE) * 20 +
          recurringPatternScore * 10 -
          conflictPenalty,
      );

      return {
        slot,
        score,
        availableCount,
        maybeCount,
        unavailableCount,
        missingCount,
        attendanceRate,
        coreMemberRate,
        preferenceAverage,
        recurringPatternScore,
        reasons: buildReasons({
          availableCount,
          maybeCount,
          totalCount: input.participants.length,
          coreAvailableCount: coreWeightedAttendance,
          coreTotal: coreMembers.length,
          preferenceAverage,
          recurringPatternScore,
        }),
      };
    })
    .sort(compareRecommendations)
    .slice(0, topN);
}

export function getNonResponders(participants: { userId: UserId }[], responses: AvailabilityResponse[]): UserId[] {
  const respondedUserIds = new Set(responses.map((response) => response.userId));
  return participants.map((participant) => participant.userId).filter((userId) => !respondedUserIds.has(userId));
}

function validateRecommendationInput(input: EventRecommendationInput): void {
  if (input.slots.length === 0) throw new Error("At least one slot is required.");
  if (input.participants.length === 0) throw new Error("At least one participant is required.");

  const slotIds = new Set(input.slots.map((slot) => slot.id));
  const participantIds = new Set(input.participants.map((participant) => participant.userId));
  if (slotIds.size !== input.slots.length) throw new Error("Slot IDs must be unique.");
  if (participantIds.size !== input.participants.length) throw new Error("Participant IDs must be unique.");

  for (const response of input.responses) {
    if (!slotIds.has(response.slotId)) throw new Error(`Response references unknown slot ${response.slotId}.`);
    if (!participantIds.has(response.userId)) throw new Error(`Response references unknown user ${response.userId}.`);
    const preferenceScore = response.preferenceScore ?? 0;
    if (!Number.isInteger(preferenceScore) || preferenceScore < 0 || preferenceScore > MAX_PREFERENCE_SCORE) {
      throw new Error("preferenceScore must be an integer between 0 and 5.");
    }
  }
}

function buildResponseMap(responses: AvailabilityResponse[]): Map<string, AvailabilityResponse> {
  const map = new Map<string, AvailabilityResponse>();
  for (const response of responses) {
    map.set(toKey(response.slotId, response.userId), response);
  }
  return map;
}

function toKey(slotId: string, userId: UserId): string {
  return `${slotId}:${userId}`;
}

function compareRecommendations(a: TimeRecommendation, b: TimeRecommendation): number {
  return (
    b.score - a.score ||
    b.availableCount - a.availableCount ||
    b.maybeCount - a.maybeCount ||
    a.unavailableCount - b.unavailableCount ||
    a.slot.startAt.localeCompare(b.slot.startAt) ||
    a.slot.id.localeCompare(b.slot.id)
  );
}

function buildReasons(input: {
  availableCount: number;
  maybeCount: number;
  totalCount: number;
  coreAvailableCount: number;
  coreTotal: number;
  preferenceAverage: number;
  recurringPatternScore: number;
}): string[] {
  const reasons = [`${input.totalCount}명 중 ${input.availableCount}명 가능`];
  if (input.maybeCount > 0) reasons.push(`${input.maybeCount}명 애매`);
  if (input.coreTotal > 0) {
    reasons.push(`핵심 인원 ${formatCount(input.coreAvailableCount)} / ${input.coreTotal}명 가능`);
  }
  if (input.preferenceAverage > 0) reasons.push(`평균 선호도 ${input.preferenceAverage.toFixed(1)}점`);
  if (input.recurringPatternScore > 0) reasons.push("반복 모임 패턴과 유사");
  return reasons;
}

function formatCount(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundScore(value: number): number {
  return Math.round(value * 100) / 100;
}
