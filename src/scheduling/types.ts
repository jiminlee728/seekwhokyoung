export type UserId = string;
export type EventId = string;
export type GroupId = string;
export type AvailabilityStatus = "available" | "maybe" | "unavailable";
export type EventStatus = "draft" | "voting" | "confirmed";

export interface GroupDraft {
  name: string;
  description?: string;
  ownerId: UserId;
  isRecurring?: boolean;
}

export interface Group {
  id: GroupId;
  name: string;
  description?: string;
  ownerId: UserId;
  isRecurring: boolean;
  inviteCode: string;
}

export interface TimeSlot {
  id: string;
  startAt: string;
  endAt: string;
}

export interface EventDraft {
  groupId: GroupId;
  title: string;
  description?: string;
  candidateSlots: TimeSlot[];
  candidatePlaces?: string[];
  voteDeadlineAt?: string;
  visibility?: "private" | "link_public";
}

export interface SchedulingEvent extends EventDraft {
  id: EventId;
  status: EventStatus;
  voteToken: string;
  confirmedSlotId?: string;
  confirmedPlace?: string;
  confirmedAttendeeIds?: UserId[];
}

export interface VotingParticipant {
  userId: UserId;
  name: string;
  isCore?: boolean;
}

export interface AvailabilityResponse {
  userId: UserId;
  slotId: string;
  status: AvailabilityStatus;
  /** 0~5 선호도. undefined는 0으로 처리한다. */
  preferenceScore?: number;
}

export interface EventRecommendationInput {
  slots: TimeSlot[];
  participants: VotingParticipant[];
  responses: AvailabilityResponse[];
  recurringPatternScores?: Record<string, number>;
  topN?: number;
}

export interface TimeRecommendation {
  slot: TimeSlot;
  score: number;
  availableCount: number;
  maybeCount: number;
  unavailableCount: number;
  missingCount: number;
  attendanceRate: number;
  coreMemberRate: number;
  preferenceAverage: number;
  recurringPatternScore: number;
  reasons: string[];
}

export interface ShareLinks {
  voteUrl: string;
  resultUrl: string;
}
