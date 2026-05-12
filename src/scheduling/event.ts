import type {
  EventDraft,
  Group,
  GroupDraft,
  SchedulingEvent,
  ShareLinks,
  TimeSlot,
  UserId,
} from "./types.js";

export function createGroup(draft: GroupDraft, id: string, inviteCode = createReadableCode(draft.name, id)): Group {
  if (!draft.name.trim()) throw new Error("Group name is required.");
  if (!draft.ownerId.trim()) throw new Error("Group ownerId is required.");

  return {
    id,
    name: draft.name.trim(),
    description: draft.description?.trim(),
    ownerId: draft.ownerId,
    isRecurring: draft.isRecurring ?? false,
    inviteCode,
  };
}

export function createSchedulingEvent(
  draft: EventDraft,
  id: string,
  voteToken = createReadableCode(draft.title, id),
): SchedulingEvent {
  validateCandidateSlots(draft.candidateSlots);
  if (!draft.groupId.trim()) throw new Error("Event groupId is required.");
  if (!draft.title.trim()) throw new Error("Event title is required.");

  return {
    ...draft,
    title: draft.title.trim(),
    description: draft.description?.trim(),
    candidatePlaces: draft.candidatePlaces ?? [],
    visibility: draft.visibility ?? "link_public",
    id,
    status: "voting",
    voteToken,
  };
}

export function createShareLinks(baseUrl: string, event: Pick<SchedulingEvent, "id" | "voteToken">): ShareLinks {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  return {
    voteUrl: `${normalizedBaseUrl}/events/${event.id}/vote?token=${encodeURIComponent(event.voteToken)}`,
    resultUrl: `${normalizedBaseUrl}/events/${event.id}/results?token=${encodeURIComponent(event.voteToken)}`,
  };
}

export function confirmEvent(
  event: SchedulingEvent,
  slotId: string,
  confirmedPlace?: string,
  confirmedAttendeeIds: UserId[] = [],
): SchedulingEvent {
  if (!event.candidateSlots.some((slot) => slot.id === slotId)) {
    throw new Error(`Cannot confirm unknown slot ${slotId}.`);
  }

  return {
    ...event,
    status: "confirmed",
    confirmedSlotId: slotId,
    confirmedPlace,
    confirmedAttendeeIds,
  };
}

export function formatKakaoVoteMessage(event: SchedulingEvent, links: ShareLinks): string {
  const deadline = event.voteDeadlineAt ? `\n투표 마감: ${formatKoreanDateTime(event.voteDeadlineAt)}` : "";
  return [`${event.title} 일정 투표`, deadline.trim(), `가능 시간을 입력해주세요: ${links.voteUrl}`]
    .filter(Boolean)
    .join("\n");
}

export function formatKakaoConfirmationMessage(event: SchedulingEvent, slot: TimeSlot, resultUrl?: string): string {
  const lines = [
    `${event.title} 확정`,
    `시간: ${formatKoreanDateTime(slot.startAt)} ~ ${formatKoreanTime(slot.endAt)}`,
  ];

  if (event.confirmedPlace) lines.push(`장소: ${event.confirmedPlace}`);
  if (resultUrl) lines.push(`상세 보기: ${resultUrl}`);

  return lines.join("\n");
}

function validateCandidateSlots(slots: TimeSlot[]): void {
  if (slots.length === 0) throw new Error("At least one candidate slot is required.");

  const ids = new Set<string>();
  for (const slot of slots) {
    if (!slot.id.trim()) throw new Error("Slot id is required.");
    if (ids.has(slot.id)) throw new Error(`Duplicate slot id ${slot.id}.`);
    ids.add(slot.id);

    const start = Date.parse(slot.startAt);
    const end = Date.parse(slot.endAt);
    if (Number.isNaN(start) || Number.isNaN(end) || start >= end) {
      throw new Error(`Slot ${slot.id} must have a valid start/end range.`);
    }
  }
}

function createReadableCode(label: string, id: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return `${slug || "link"}-${id}`;
}

function formatKoreanDateTime(value: string): string {
  const parts = getKoreanDateTimeParts(value);
  return `${parts.year}. ${parts.month}. ${parts.day}. ${parts.period} ${parts.hour}:${parts.minute}`;
}

function formatKoreanTime(value: string): string {
  const parts = getKoreanDateTimeParts(value);
  return `${parts.period} ${parts.hour}:${parts.minute}`;
}

function getKoreanDateTimeParts(value: string): {
  year: string;
  month: string;
  day: string;
  period: "오전" | "오후";
  hour: string;
  minute: string;
} {
  const date = new Date(value);
  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Seoul",
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  const hour24 = Number(parts.hour);
  const period = hour24 < 12 ? "오전" : "오후";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    period,
    hour: `${hour12}`,
    minute: parts.minute,
  };
}
