const STORAGE_KEY = "sikhoogyeong:p0:event";

const state = { eventId: null, participants: [], schedule: { slots: [], responses: {}, confirmedSlotId: null }, rounds: [] };

const elements = {
  eventTitle: document.querySelector("#eventTitle"),
  participantsList: document.querySelector("#participantsList"),
  slotsList: document.querySelector("#slotsList"),
  recommendationList: document.querySelector("#recommendationList"),
  roundsList: document.querySelector("#roundsList"),
  resultSummary: document.querySelector("#resultSummary"),
  transferList: document.querySelector("#transferList"),
  debugOutput: document.querySelector("#debugOutput"),
  shareMessage: document.querySelector("#shareMessage"),
  savedEventBox: document.querySelector("#savedEventBox"),
};

const participantTemplate = document.querySelector("#participantTemplate");
const roundTemplate = document.querySelector("#roundTemplate");

const sample = {
  participants: ["민수", "지민", "영희", "수현", "철수", "유나"],
  slots: [
    { label: "금요일 저녁", startAt: "2026-05-15T19:00", endAt: "2026-05-15T21:00", place: "강남역" },
    { label: "토요일 저녁", startAt: "2026-05-16T18:00", endAt: "2026-05-16T20:00", place: "홍대입구" },
    { label: "일요일 점심", startAt: "2026-05-17T12:00", endAt: "2026-05-17T14:00", place: "성수" },
  ],
  rounds: [
    { placeName: "고깃집", expenses: [{ amount: 98000, payerIndex: 0, category: "food" }], participantIndexes: [0, 1, 2, 3, 4, 5] },
    { placeName: "술집", expenses: [{ amount: 61000, payerIndex: 1, category: "alcohol" }], participantIndexes: [0, 1, 2, 3] },
    { placeName: "노래방", expenses: [{ amount: 35000, payerIndex: 3, category: "activity" }], participantIndexes: [0, 3] },
  ],
};

initialize();

async function initialize() {
  document.querySelector("#addParticipantButton").addEventListener("click", () => addParticipant());
  document.querySelector("#addSlotButton").addEventListener("click", () => addSlot());
  document.querySelector("#recommendTimeButton").addEventListener("click", () => renderRecommendations(recommendTimes()));
  document.querySelector("#addRoundButton").addEventListener("click", () => addRound());
  document.querySelector("#calculateButton").addEventListener("click", calculate);
  document.querySelector("#calculateTopButton").addEventListener("click", calculate);
  document.querySelector("#loadSampleButton").addEventListener("click", loadSample);
  document.querySelector("#copyMessageButton").addEventListener("click", copyMessage);
  document.querySelector("#saveEventButton").addEventListener("click", saveEvent);
  elements.eventTitle.addEventListener("input", persistLocal);

  const eventId = new URLSearchParams(location.search).get("eventId");
  if (eventId && (await loadEventFromServer(eventId))) return;
  if (loadLocal()) return;
  loadSample();
}

function loadSample() {
  state.eventId = null;
  state.participants = sample.participants.map((name, index) => ({ id: `u${index + 1}`, name, isCore: index < 2 }));
  state.schedule = { slots: sample.slots.map((slot, index) => ({ id: `s${index + 1}`, ...slot })), responses: {}, confirmedSlotId: null };
  for (const slot of state.schedule.slots) {
    state.schedule.responses[slot.id] = Object.fromEntries(
      state.participants.map((participant, index) => [participant.id, { status: index === 3 && slot.id === "s2" ? "unavailable" : index === 4 ? "maybe" : "available", preferenceScore: Math.max(1, 5 - index) }]),
    );
  }
  state.rounds = sample.rounds.map((round, index) => createRoundFromSample(round, index));
  elements.eventTitle.value = "5월 정기 회식";
  renderAndPersist();
  showToast("샘플 데이터를 불러왔습니다.");
}

function createRoundFromSample(round, index) {
  return {
    id: `r${index + 1}`,
    roundNo: index + 1,
    placeName: round.placeName,
    participantSettings: Object.fromEntries(state.participants.map((participant, participantIndex) => [participant.id, { included: round.participantIndexes.includes(participantIndex), weight: 1, adjustmentAmount: 0, excludeAlcohol: false }])),
    expenses: round.expenses.map((expense, expenseIndex) => ({ id: `r${index + 1}-e${expenseIndex + 1}`, amount: expense.amount, payerId: state.participants[expense.payerIndex].id, category: expense.category, discountAmount: 0 })),
  };
}

function addParticipant(name = "") {
  const participant = { id: crypto.randomUUID(), name, isCore: false };
  state.participants.push(participant);
  for (const slot of state.schedule.slots) state.schedule.responses[slot.id][participant.id] = { status: "available", preferenceScore: 3 };
  for (const round of state.rounds) round.participantSettings[participant.id] = { included: true, weight: 1, adjustmentAmount: 0, excludeAlcohol: false };
  renderAndPersist();
}

function removeParticipant(id) {
  if (state.participants.length <= 1) return showToast("참석자는 최소 1명 이상 필요합니다.");
  state.participants = state.participants.filter((participant) => participant.id !== id);
  for (const slot of state.schedule.slots) delete state.schedule.responses[slot.id]?.[id];
  for (const round of state.rounds) {
    delete round.participantSettings[id];
    for (const expense of round.expenses) if (expense.payerId === id) expense.payerId = state.participants[0]?.id ?? "";
  }
  renderAndPersist();
}

function addSlot() {
  const index = state.schedule.slots.length + 1;
  const slot = { id: crypto.randomUUID(), label: `후보 ${index}`, startAt: "", endAt: "", place: "" };
  state.schedule.slots.push(slot);
  state.schedule.responses[slot.id] = Object.fromEntries(state.participants.map((participant) => [participant.id, { status: "available", preferenceScore: 3 }]));
  renderAndPersist();
}

function removeSlot(id) {
  if (state.schedule.slots.length <= 1) return showToast("후보 시간은 최소 1개 이상 필요합니다.");
  state.schedule.slots = state.schedule.slots.filter((slot) => slot.id !== id);
  delete state.schedule.responses[id];
  if (state.schedule.confirmedSlotId === id) state.schedule.confirmedSlotId = null;
  renderAndPersist();
}

function confirmSlot(slotId) {
  state.schedule.confirmedSlotId = slotId;
  const slot = state.schedule.slots.find((candidate) => candidate.id === slotId);
  if (slot?.place) {
    const firstRound = state.rounds[0];
    if (firstRound && !firstRound.placeName) firstRound.placeName = slot.place;
  }
  renderAndPersist();
  showToast("모임 시간을 확정했습니다.");
}

function addRound() {
  state.rounds.push({
    id: crypto.randomUUID(),
    roundNo: state.rounds.length + 1,
    placeName: "",
    participantSettings: Object.fromEntries(state.participants.map((participant) => [participant.id, { included: true, weight: 1, adjustmentAmount: 0, excludeAlcohol: false }])),
    expenses: [createExpense()],
  });
  renderAndPersist();
}

function removeRound(id) {
  if (state.rounds.length <= 1) return showToast("차수는 최소 1개 이상 필요합니다.");
  state.rounds = state.rounds.filter((round) => round.id !== id).map((round, index) => ({ ...round, roundNo: index + 1 }));
  renderAndPersist();
}

function createExpense() {
  return { id: crypto.randomUUID(), amount: 0, payerId: state.participants[0]?.id ?? "", category: "food", discountAmount: 0 };
}

function addExpense(round) {
  round.expenses.push(createExpense());
  renderAndPersist();
}

function removeExpense(round, expenseId) {
  if (round.expenses.length <= 1) return showToast("결제 내역은 차수별 최소 1개가 필요합니다.");
  round.expenses = round.expenses.filter((expense) => expense.id !== expenseId);
  renderAndPersist();
}

function renderAndPersist() { render(); persistLocal(); }

function render() {
  ensureSchedule();
  renderParticipants();
  renderSchedule();
  renderRounds();
  renderSavedLink();
}

function renderParticipants() {
  elements.participantsList.replaceChildren();
  for (const participant of state.participants) {
    const node = participantTemplate.content.firstElementChild.cloneNode(true);
    const input = node.querySelector(".participant-name");
    input.value = participant.name;
    input.addEventListener("input", () => { participant.name = input.value; refreshPayerSelects(); renderSchedule(); persistLocal(); });
    const core = document.createElement("label");
    core.className = "check-line muted-check";
    core.innerHTML = '<input type="checkbox" /> 핵심 인원';
    const checkbox = core.querySelector("input");
    checkbox.checked = participant.isCore;
    checkbox.addEventListener("change", () => { participant.isCore = checkbox.checked; persistLocal(); });
    node.append(core);
    node.querySelector(".remove-participant").addEventListener("click", () => removeParticipant(participant.id));
    elements.participantsList.append(node);
  }
}

function renderSchedule() {
  elements.slotsList.replaceChildren();
  for (const slot of state.schedule.slots) {
    const card = document.createElement("article");
    card.className = "schedule-card";
    card.innerHTML = `
      <div class="round-card-header">
        <strong>${state.schedule.confirmedSlotId === slot.id ? "✅ " : ""}${slot.label || "후보 시간"}</strong>
        <button type="button" class="icon-button remove-slot">×</button>
      </div>
      <div class="schedule-grid">
        <label>라벨<input class="text-input slot-label" placeholder="금요일 저녁" /></label>
        <label>장소<input class="text-input slot-place" placeholder="강남역" /></label>
        <label>시작<input class="text-input slot-start" type="datetime-local" /></label>
        <label>종료<input class="text-input slot-end" type="datetime-local" /></label>
      </div>
      <div class="mini-title">가능 시간 응답</div>
      <div class="availability-list"></div>
    `;
    bindInput(card.querySelector(".slot-label"), slot.label, (value) => { slot.label = value; persistLocal(); });
    bindInput(card.querySelector(".slot-place"), slot.place, (value) => { slot.place = value; persistLocal(); });
    bindInput(card.querySelector(".slot-start"), slot.startAt, (value) => { slot.startAt = value; persistLocal(); });
    bindInput(card.querySelector(".slot-end"), slot.endAt, (value) => { slot.endAt = value; persistLocal(); });
    card.querySelector(".remove-slot").addEventListener("click", () => removeSlot(slot.id));
    renderAvailabilityRows(card.querySelector(".availability-list"), slot);
    elements.slotsList.append(card);
  }
  renderRecommendations(recommendTimes(), false);
}

function renderAvailabilityRows(container, slot) {
  container.replaceChildren();
  state.schedule.responses[slot.id] ??= {};
  for (const participant of state.participants) {
    const response = state.schedule.responses[slot.id][participant.id] ??= { status: "available", preferenceScore: 3 };
    const row = document.createElement("div");
    row.className = "availability-row";
    row.innerHTML = `
      <strong>${participant.name || "이름 없음"}${participant.isCore ? " ⭐" : ""}</strong>
      <select class="text-input availability-status">
        <option value="available">가능</option><option value="maybe">애매</option><option value="unavailable">불가능</option>
      </select>
      <select class="text-input availability-pref">
        <option value="0">선호 0</option><option value="1">선호 1</option><option value="2">선호 2</option><option value="3">선호 3</option><option value="4">선호 4</option><option value="5">선호 5</option>
      </select>
    `;
    const status = row.querySelector(".availability-status");
    status.value = response.status;
    status.addEventListener("change", () => { response.status = status.value; persistLocal(); });
    const pref = row.querySelector(".availability-pref");
    pref.value = `${response.preferenceScore ?? 0}`;
    pref.addEventListener("change", () => { response.preferenceScore = Number(pref.value); persistLocal(); });
    container.append(row);
  }
}

function recommendTimes() {
  return state.schedule.slots.map((slot) => {
    const responses = state.schedule.responses[slot.id] ?? {};
    let available = 0, maybe = 0, unavailable = 0, weighted = 0, coreWeighted = 0, pref = 0;
    const coreCount = state.participants.filter((participant) => participant.isCore).length;
    for (const participant of state.participants) {
      const response = responses[participant.id] ?? { status: "unavailable", preferenceScore: 0 };
      if (response.status === "available") { available += 1; weighted += 1; if (participant.isCore) coreWeighted += 1; pref += response.preferenceScore ?? 0; }
      else if (response.status === "maybe") { maybe += 1; weighted += 0.5; if (participant.isCore) coreWeighted += 0.5; pref += (response.preferenceScore ?? 0) * 0.5; }
      else unavailable += 1;
    }
    const attendanceRate = state.participants.length ? weighted / state.participants.length : 0;
    const coreRate = coreCount ? coreWeighted / coreCount : 1;
    const prefAvg = state.participants.length ? pref / state.participants.length : 0;
    const score = Math.round((attendanceRate * 40 + coreRate * 30 + (prefAvg / 5) * 20) * 100) / 100;
    return { slot, available, maybe, unavailable, score, reasons: [`${state.participants.length}명 중 ${available}명 가능`, `${maybe}명 애매`, `핵심 인원 ${coreWeighted}/${coreCount || 0}명 가능`, `평균 선호도 ${prefAvg.toFixed(1)}점`] };
  }).sort((a, b) => b.score - a.score || b.available - a.available || a.unavailable - b.unavailable).slice(0, 3);
}

function renderRecommendations(recommendations, toast = true) {
  elements.recommendationList.replaceChildren();
  for (const recommendation of recommendations) {
    const card = document.createElement("div");
    card.className = "recommendation-card";
    card.innerHTML = `
      <div><strong>${recommendation.slot.label || "후보"}</strong><span>${formatSlot(recommendation.slot)} · ${recommendation.slot.place || "장소 미정"}</span></div>
      <div class="amount">${recommendation.score}점</div>
      <p>${recommendation.reasons.join(" · ")}</p>
      <button type="button" class="ghost-button confirm-slot">이 시간 확정</button>
    `;
    card.querySelector(".confirm-slot").addEventListener("click", () => confirmSlot(recommendation.slot.id));
    elements.recommendationList.append(card);
  }
  if (toast) showToast("추천 시간을 계산했습니다.");
}

function renderRounds() {
  elements.roundsList.replaceChildren();
  for (const round of state.rounds) {
    ensureRoundSettings(round);
    const node = roundTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".round-title").textContent = `${round.roundNo}차`;
    node.querySelector(".remove-round").addEventListener("click", () => removeRound(round.id));
    node.querySelector(".add-expense").addEventListener("click", () => addExpense(round));
    bindInput(node.querySelector(".place-name"), round.placeName, (value) => { round.placeName = value; persistLocal(); });
    renderParticipantOptions(node.querySelector(".participant-chips"), round);
    renderExpenseRows(node.querySelector(".expenses-list"), round);
    elements.roundsList.append(node);
  }
}

function ensureSchedule() {
  state.schedule ??= { slots: [], responses: {}, confirmedSlotId: null };
  if (!state.schedule.slots.length) addSlot();
  for (const slot of state.schedule.slots) {
    state.schedule.responses[slot.id] ??= {};
    for (const participant of state.participants) state.schedule.responses[slot.id][participant.id] ??= { status: "available", preferenceScore: 3 };
  }
}

function ensureRoundSettings(round) {
  round.participantSettings ??= {};
  for (const participant of state.participants) round.participantSettings[participant.id] ??= { included: true, weight: 1, adjustmentAmount: 0, excludeAlcohol: false };
  for (const participantId of Object.keys(round.participantSettings)) if (!state.participants.some((participant) => participant.id === participantId)) delete round.participantSettings[participantId];
  if (!round.expenses?.length) round.expenses = [createExpense()];
}

function renderParticipantOptions(container, round) {
  container.replaceChildren();
  for (const participant of state.participants) {
    const setting = round.participantSettings[participant.id];
    const card = document.createElement("div");
    card.className = "participant-option-card";
    card.innerHTML = `
      <label class="check-line"><input type="checkbox" class="participant-included" /><strong>${participant.name || "이름 없음"}</strong></label>
      <div class="option-grid">
        <label>부담비율<select class="text-input participant-weight"><option value="1">1</option><option value="0.5">0.5</option><option value="0.25">0.25</option></select></label>
        <label>조정금액<input class="text-input participant-adjustment" inputmode="numeric" placeholder="-5000" /></label>
      </div>
      <label class="check-line muted-check"><input type="checkbox" class="participant-exclude-alcohol" /> 술값 제외</label>
    `;
    const included = card.querySelector(".participant-included");
    included.checked = setting.included;
    included.addEventListener("change", () => { setting.included = included.checked; persistLocal(); });
    const weight = card.querySelector(".participant-weight");
    weight.value = `${setting.weight ?? 1}`;
    weight.addEventListener("change", () => { setting.weight = Number(weight.value); persistLocal(); });
    const adjustment = card.querySelector(".participant-adjustment");
    adjustment.value = setting.adjustmentAmount ? String(setting.adjustmentAmount) : "";
    adjustment.addEventListener("input", () => { setting.adjustmentAmount = parseSignedMoney(adjustment.value); persistLocal(); });
    const excludeAlcohol = card.querySelector(".participant-exclude-alcohol");
    excludeAlcohol.checked = setting.excludeAlcohol;
    excludeAlcohol.addEventListener("change", () => { setting.excludeAlcohol = excludeAlcohol.checked; persistLocal(); });
    container.append(card);
  }
}

function renderExpenseRows(container, round) {
  container.replaceChildren();
  for (const expense of round.expenses) {
    const row = document.createElement("div");
    row.className = "expense-row";
    row.innerHTML = `
      <label>금액<input class="text-input expense-amount" inputmode="numeric" placeholder="98000" /></label>
      <label>결제자<select class="text-input payer-select"></select></label>
      <label>카테고리<select class="text-input category-select"><option value="food">음식</option><option value="alcohol">술</option><option value="activity">활동</option><option value="transport">이동</option><option value="other">기타</option></select></label>
      <label>할인/쿠폰<input class="text-input discount-amount" inputmode="numeric" placeholder="0" /></label>
      <button type="button" class="icon-button remove-expense" aria-label="결제 삭제">×</button>
    `;
    bindMoneyInput(row.querySelector(".expense-amount"), expense.amount, (value) => { expense.amount = value; persistLocal(); });
    bindMoneyInput(row.querySelector(".discount-amount"), expense.discountAmount, (value) => { expense.discountAmount = value; persistLocal(); });
    const payerSelect = row.querySelector(".payer-select");
    fillPayerSelect(payerSelect, expense.payerId);
    payerSelect.addEventListener("change", () => { expense.payerId = payerSelect.value; persistLocal(); });
    const categorySelect = row.querySelector(".category-select");
    categorySelect.value = expense.category;
    categorySelect.addEventListener("change", () => { expense.category = categorySelect.value; persistLocal(); });
    row.querySelector(".remove-expense").addEventListener("click", () => removeExpense(round, expense.id));
    container.append(row);
  }
}

function fillPayerSelect(select, selectedId) {
  select.replaceChildren();
  for (const participant of state.participants) {
    const option = document.createElement("option");
    option.value = participant.id;
    option.textContent = participant.name || "이름 없음";
    select.append(option);
  }
  select.value = selectedId || state.participants[0]?.id || "";
}

function refreshPayerSelects() { document.querySelectorAll(".payer-select").forEach((select) => fillPayerSelect(select, select.value)); }
function bindInput(input, value, onChange) { input.value = value ?? ""; input.addEventListener("input", () => onChange(input.value)); }
function bindMoneyInput(input, value, onChange) { input.value = value ? String(value) : ""; input.addEventListener("input", () => onChange(parseMoney(input.value))); }

function buildPayload() {
  const participants = state.participants.map((participant) => ({ id: participant.id, name: participant.name.trim() })).filter((participant) => participant.name);
  const participantIds = new Set(participants.map((participant) => participant.id));
  if (participants.length === 0) throw new Error("참석자를 1명 이상 입력해주세요.");

  const rounds = state.rounds.map((round) => ({
    id: round.id,
    roundNo: round.roundNo,
    placeName: round.placeName,
    participants: Object.entries(round.participantSettings ?? {})
      .filter(([participantId, setting]) => participantIds.has(participantId) && setting.included)
      .map(([participantId, setting]) => ({ userId: participantId, weight: setting.weight ?? 1, adjustmentAmount: setting.adjustmentAmount ?? 0, excludedCategories: setting.excludeAlcohol ? ["alcohol"] : [] })),
  }));

  const expenses = state.rounds.flatMap((round) => round.expenses.map((expense) => ({ id: expense.id, roundId: round.id, paidByUserId: expense.payerId, amount: expense.amount, category: expense.category, discountAmount: expense.discountAmount })));

  for (const round of rounds) if (round.participants.length === 0) throw new Error(`${round.roundNo}차 참석자를 1명 이상 선택해주세요.`);
  for (const expense of expenses) {
    if (!participantIds.has(expense.paidByUserId)) throw new Error("결제자를 선택해주세요.");
    if (!Number.isInteger(expense.amount) || expense.amount <= 0) throw new Error("각 결제 금액을 1원 이상 입력해주세요.");
  }

  return { eventTitle: elements.eventTitle.value.trim() || "식후경 모임", participants, rounds, expenses };
}

async function calculate() {
  try {
    const response = await fetch("/api/settlement/calculate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildPayload()) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "정산 계산에 실패했습니다.");
    renderResult(result);
    document.querySelector("#resultPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) { showToast(error.message); }
}

async function saveEvent() {
  try {
    const payload = { ...buildPayload(), clientState: exportClientState() };
    const response = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "저장에 실패했습니다.");
    const absoluteUrl = new URL(result.url, location.origin).toString();
    state.eventId = result.eventId;
    persistLocal();
    renderSavedLink(absoluteUrl);
    await navigator.clipboard?.writeText(absoluteUrl).catch(() => undefined);
    showToast("저장 링크를 만들었습니다.");
  } catch (error) { showToast(error.message); }
}

async function loadEventFromServer(eventId) {
  try {
    const response = await fetch(`/api/events/${encodeURIComponent(eventId)}`);
    if (!response.ok) return false;
    const saved = await response.json();
    importClientState(saved.clientState ?? saved);
    state.eventId = eventId;
    render();
    persistLocal();
    showToast("저장된 모임을 불러왔습니다.");
    return true;
  } catch { return false; }
}

function renderResult(result) {
  const nameById = new Map(state.participants.map((participant) => [participant.id, participant.name || "이름 없음"]));
  elements.transferList.replaceChildren();
  if (result.transfers.length === 0) {
    elements.resultSummary.textContent = "정산할 송금이 없습니다.";
    elements.resultSummary.classList.remove("empty");
  } else {
    const total = result.transfers.reduce((sum, transfer) => sum + transfer.amount, 0);
    elements.resultSummary.textContent = `${result.transfers.length}번의 송금으로 ${formatKrw(total)} 정산 완료`;
    elements.resultSummary.classList.remove("empty");
    for (const transfer of result.transfers) {
      const card = document.createElement("div");
      card.className = "transfer-card";
      card.innerHTML = `<div><strong>${nameById.get(transfer.payerUserId) ?? transfer.payerUserId} → ${nameById.get(transfer.payeeUserId) ?? transfer.payeeUserId}</strong><span>최소 송금 경로</span></div><div class="amount">${formatKrw(transfer.amount)}</div>`;
      elements.transferList.append(card);
    }
  }
  elements.debugOutput.textContent = JSON.stringify({ balances: result.balances, shares: result.shares }, null, 2);
  elements.shareMessage.value = result.message;
}

async function copyMessage() {
  if (!elements.shareMessage.value) return showToast("먼저 정산을 계산해주세요.");
  await navigator.clipboard.writeText(elements.shareMessage.value);
  showToast("카카오톡 공유 문구를 복사했습니다.");
}

function persistLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(exportClientState())); }

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    importClientState(JSON.parse(raw));
    render();
    return true;
  } catch { return false; }
}

function exportClientState() { return { eventId: state.eventId, eventTitle: elements.eventTitle.value, participants: state.participants, schedule: state.schedule, rounds: state.rounds }; }

function importClientState(saved) {
  state.eventId = saved.eventId ?? null;
  state.participants = saved.participants ?? [];
  state.schedule = normalizeSchedule(saved.schedule);
  state.rounds = normalizeRounds(saved.rounds ?? []);
  elements.eventTitle.value = saved.eventTitle ?? "식후경 모임";
}

function normalizeSchedule(schedule) {
  const slots = schedule?.slots?.length ? schedule.slots : [{ id: crypto.randomUUID(), label: "후보 1", startAt: "", endAt: "", place: "" }];
  return { slots, responses: schedule?.responses ?? {}, confirmedSlotId: schedule?.confirmedSlotId ?? null };
}

function normalizeRounds(rounds) {
  return rounds.map((round, index) => ({
    id: round.id ?? crypto.randomUUID(),
    roundNo: index + 1,
    placeName: round.placeName ?? "",
    participantSettings: round.participantSettings ?? Object.fromEntries((round.participantIds ?? state.participants.map((participant) => participant.id)).map((participantId) => [participantId, { included: true, weight: 1, adjustmentAmount: 0, excludeAlcohol: false }])),
    expenses: round.expenses ?? [{ id: `${round.id ?? crypto.randomUUID()}-expense`, amount: round.amount ?? 0, payerId: round.payerId ?? state.participants[0]?.id ?? "", category: round.category ?? "food", discountAmount: round.discountAmount ?? 0 }],
  }));
}

function renderSavedLink(url = null) {
  if (!elements.savedEventBox) return;
  const link = url ?? (state.eventId ? `${location.origin}${location.pathname}?eventId=${state.eventId}` : "");
  if (!link) { elements.savedEventBox.hidden = true; return; }
  elements.savedEventBox.hidden = false;
  elements.savedEventBox.innerHTML = `저장 링크: <a href="${link}">${link}</a>`;
}

function parseMoney(value) { const normalized = value.replace(/[^0-9]/g, ""); return normalized ? Number(normalized) : 0; }
function parseSignedMoney(value) { const normalized = value.trim().replace(/[^0-9-]/g, ""); if (!normalized || normalized === "-") return 0; return Number(normalized); }
function formatKrw(amount) { return `${new Intl.NumberFormat("ko-KR").format(amount)}원`; }
function formatSlot(slot) { return slot.startAt && slot.endAt ? `${slot.startAt.replace("T", " ")}~${slot.endAt.split("T")[1] ?? slot.endAt}` : "시간 미정"; }
function showToast(message) { const toast = document.createElement("div"); toast.className = "toast"; toast.textContent = message; document.body.append(toast); setTimeout(() => toast.remove(), 2100); }
