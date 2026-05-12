const state = {
  participants: [],
  rounds: [],
};

const elements = {
  eventTitle: document.querySelector("#eventTitle"),
  participantsList: document.querySelector("#participantsList"),
  roundsList: document.querySelector("#roundsList"),
  resultSummary: document.querySelector("#resultSummary"),
  transferList: document.querySelector("#transferList"),
  debugOutput: document.querySelector("#debugOutput"),
  shareMessage: document.querySelector("#shareMessage"),
};

const participantTemplate = document.querySelector("#participantTemplate");
const roundTemplate = document.querySelector("#roundTemplate");

const sample = {
  participants: ["민수", "지민", "영희", "수현", "철수", "유나"],
  rounds: [
    { placeName: "고깃집", amount: 98000, payerIndex: 0, category: "food", participantIndexes: [0, 1, 2, 3, 4, 5] },
    { placeName: "술집", amount: 61000, payerIndex: 1, category: "alcohol", participantIndexes: [0, 1, 2, 3] },
    { placeName: "노래방", amount: 35000, payerIndex: 3, category: "activity", participantIndexes: [0, 3] },
  ],
};

initialize();

function initialize() {
  document.querySelector("#addParticipantButton").addEventListener("click", () => addParticipant());
  document.querySelector("#addRoundButton").addEventListener("click", () => addRound());
  document.querySelector("#calculateButton").addEventListener("click", calculate);
  document.querySelector("#calculateTopButton").addEventListener("click", calculate);
  document.querySelector("#loadSampleButton").addEventListener("click", loadSample);
  document.querySelector("#copyMessageButton").addEventListener("click", copyMessage);
  loadSample();
}

function loadSample() {
  state.participants = sample.participants.map((name, index) => ({ id: `u${index + 1}`, name }));
  state.rounds = sample.rounds.map((round, index) => ({
    id: `r${index + 1}`,
    roundNo: index + 1,
    placeName: round.placeName,
    amount: round.amount,
    payerId: state.participants[round.payerIndex].id,
    category: round.category,
    discountAmount: 0,
    participantIds: round.participantIndexes.map((participantIndex) => state.participants[participantIndex].id),
  }));
  render();
  showToast("샘플 데이터를 불러왔습니다.");
}

function addParticipant(name = "") {
  state.participants.push({ id: crypto.randomUUID(), name });
  for (const round of state.rounds) round.participantIds.push(state.participants.at(-1).id);
  render();
}

function removeParticipant(id) {
  if (state.participants.length <= 1) {
    showToast("참석자는 최소 1명 이상 필요합니다.");
    return;
  }
  state.participants = state.participants.filter((participant) => participant.id !== id);
  for (const round of state.rounds) {
    round.participantIds = round.participantIds.filter((participantId) => participantId !== id);
    if (round.payerId === id) round.payerId = state.participants[0]?.id ?? "";
  }
  render();
}

function addRound() {
  const roundNo = state.rounds.length + 1;
  state.rounds.push({
    id: crypto.randomUUID(),
    roundNo,
    placeName: "",
    amount: 0,
    payerId: state.participants[0]?.id ?? "",
    category: "food",
    discountAmount: 0,
    participantIds: state.participants.map((participant) => participant.id),
  });
  render();
}

function removeRound(id) {
  if (state.rounds.length <= 1) {
    showToast("차수는 최소 1개 이상 필요합니다.");
    return;
  }
  state.rounds = state.rounds.filter((round) => round.id !== id).map((round, index) => ({ ...round, roundNo: index + 1 }));
  render();
}

function render() {
  renderParticipants();
  renderRounds();
}

function renderParticipants() {
  elements.participantsList.replaceChildren();
  for (const participant of state.participants) {
    const node = participantTemplate.content.firstElementChild.cloneNode(true);
    const input = node.querySelector(".participant-name");
    input.value = participant.name;
    input.addEventListener("input", () => {
      participant.name = input.value;
      refreshPayerSelects();
    });
    node.querySelector(".remove-participant").addEventListener("click", () => removeParticipant(participant.id));
    elements.participantsList.append(node);
  }
}

function renderRounds() {
  elements.roundsList.replaceChildren();
  for (const round of state.rounds) {
    const node = roundTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".round-title").textContent = `${round.roundNo}차`;
    node.querySelector(".remove-round").addEventListener("click", () => removeRound(round.id));

    bindInput(node.querySelector(".place-name"), round.placeName, (value) => (round.placeName = value));
    bindMoneyInput(node.querySelector(".expense-amount"), round.amount, (value) => (round.amount = value));
    bindMoneyInput(node.querySelector(".discount-amount"), round.discountAmount, (value) => (round.discountAmount = value));

    const categorySelect = node.querySelector(".category-select");
    categorySelect.value = round.category;
    categorySelect.addEventListener("change", () => (round.category = categorySelect.value));

    const payerSelect = node.querySelector(".payer-select");
    fillPayerSelect(payerSelect, round.payerId);
    payerSelect.addEventListener("change", () => (round.payerId = payerSelect.value));

    const chips = node.querySelector(".participant-chips");
    for (const participant of state.participants) {
      const chip = document.createElement("label");
      chip.className = "chip";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = round.participantIds.includes(participant.id);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          round.participantIds = [...new Set([...round.participantIds, participant.id])];
        } else {
          round.participantIds = round.participantIds.filter((id) => id !== participant.id);
        }
      });
      chip.append(checkbox, participant.name || "이름 없음");
      chips.append(chip);
    }

    elements.roundsList.append(node);
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

function refreshPayerSelects() {
  document.querySelectorAll(".payer-select").forEach((select, index) => fillPayerSelect(select, state.rounds[index]?.payerId));
}

function bindInput(input, value, onChange) {
  input.value = value ?? "";
  input.addEventListener("input", () => onChange(input.value));
}

function bindMoneyInput(input, value, onChange) {
  input.value = value ? String(value) : "";
  input.addEventListener("input", () => onChange(parseMoney(input.value)));
}

function buildPayload() {
  const participants = state.participants
    .map((participant) => ({ id: participant.id, name: participant.name.trim() }))
    .filter((participant) => participant.name);
  const participantIds = new Set(participants.map((participant) => participant.id));

  if (participants.length === 0) throw new Error("참석자를 1명 이상 입력해주세요.");

  const rounds = state.rounds.map((round) => ({
    id: round.id,
    roundNo: round.roundNo,
    placeName: round.placeName,
    participants: round.participantIds
      .filter((participantId) => participantIds.has(participantId))
      .map((participantId) => ({ userId: participantId })),
  }));

  const expenses = state.rounds.map((round) => ({
    id: `${round.id}-expense`,
    roundId: round.id,
    paidByUserId: round.payerId,
    amount: round.amount,
    category: round.category,
    discountAmount: round.discountAmount,
  }));

  for (const round of rounds) {
    if (round.participants.length === 0) throw new Error(`${round.roundNo}차 참석자를 1명 이상 선택해주세요.`);
  }
  for (const expense of expenses) {
    if (!participantIds.has(expense.paidByUserId)) throw new Error("결제자를 선택해주세요.");
    if (!Number.isInteger(expense.amount) || expense.amount <= 0) throw new Error("각 차수 금액을 1원 이상 입력해주세요.");
  }

  return { eventTitle: elements.eventTitle.value.trim() || "식후경 모임", participants, rounds, expenses };
}

async function calculate() {
  try {
    const response = await fetch("/api/settlement/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload()),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "정산 계산에 실패했습니다.");
    renderResult(result);
    document.querySelector("#resultPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showToast(error.message);
  }
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
      card.innerHTML = `
        <div>
          <strong>${nameById.get(transfer.payerUserId) ?? transfer.payerUserId} → ${nameById.get(transfer.payeeUserId) ?? transfer.payeeUserId}</strong>
          <span>최소 송금 경로</span>
        </div>
        <div class="amount">${formatKrw(transfer.amount)}</div>
      `;
      elements.transferList.append(card);
    }
  }

  elements.debugOutput.textContent = JSON.stringify({ balances: result.balances, shares: result.shares }, null, 2);
  elements.shareMessage.value = result.message;
}

async function copyMessage() {
  if (!elements.shareMessage.value) {
    showToast("먼저 정산을 계산해주세요.");
    return;
  }
  await navigator.clipboard.writeText(elements.shareMessage.value);
  showToast("카카오톡 공유 문구를 복사했습니다.");
}

function parseMoney(value) {
  const normalized = value.replace(/[^0-9]/g, "");
  return normalized ? Number(normalized) : 0;
}

function formatKrw(amount) {
  return `${new Intl.NumberFormat("ko-KR").format(amount)}원`;
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.append(toast);
  setTimeout(() => toast.remove(), 2100);
}
