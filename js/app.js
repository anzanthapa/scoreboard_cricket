const state = {
  teamA: 'Team A',
  teamB: 'Team B',
  innings: 1,
  overs: 0,
  ballsInOver: 0,
  runs: 0,
  wickets: 0,
  extras: 0,
  wide: 0,
  noball: 0,
  bye: 0,
  legbye: 0,
  maxWickets: 10,
  history: [],
  inningsRecords: [null, null, null],
  started: false,
  matchEnded: false,
  firstBatting: 'A',
  playersA: [],
  playersB: [],
};

const elements = {
  setupCard: document.getElementById('setupCard'),
  matchPanel: document.getElementById('matchPanel'),
  matchResultCard: document.getElementById('matchResultCard'),
  chooseBatA: document.getElementById('chooseBatA'),
  chooseBatB: document.getElementById('chooseBatB'),
  teamAInput: document.getElementById('teamAInput'),
  teamBInput: document.getElementById('teamBInput'),
  teamAHeader: document.getElementById('teamAHeader'),
  teamBHeader: document.getElementById('teamBHeader'),
  teamAPlayerFields: document.getElementById('teamAPlayerFields'),
  teamBPlayerFields: document.getElementById('teamBPlayerFields'),
  inningsText: document.getElementById('inningsText'),
  oversText: document.getElementById('oversText'),
  scoreText: document.getElementById('scoreText'),
  runsText: document.getElementById('runsText'),
  wicketsText: document.getElementById('wicketsText'),
  extrasText: document.getElementById('extrasText'),
  widesCount: document.getElementById('widesCount'),
  noballsCount: document.getElementById('noballsCount'),
  byesCount: document.getElementById('byesCount'),
  legbyesCount: document.getElementById('legbyesCount'),
  historyList: document.getElementById('historyList'),
  resultText: document.getElementById('resultText'),
  endMatchBtn: document.getElementById('endMatchBtn'),
  newMatchBtn: document.getElementById('newMatchBtn'),
  wicketBtn: document.getElementById('wicketBtn'),
  undoBtn: document.getElementById('undoBtn'),
  endOverBtn: document.getElementById('endOverBtn'),
  swapInningsBtn: document.getElementById('swapInningsBtn'),
  scoreButtons: document.getElementById('scoreButtons'),
};

function formatOvers(overs, balls) {
  return `${overs}.${balls}`;
}

function generatePlayerFields() {
  elements.teamAPlayerFields.innerHTML = '';
  elements.teamBPlayerFields.innerHTML = '';

  for (let i = 1; i <= 15; i += 1) {
    const fieldA = document.createElement('div');
    fieldA.style.marginBottom = '4px';
    fieldA.innerHTML = `<input type="text" id="teamA-player-${i}" data-team="A" data-index="${i-1}" class="player-input full-width" />`;
    elements.teamAPlayerFields.appendChild(fieldA);

    const fieldB = document.createElement('div');
    fieldB.style.marginBottom = '4px';
    fieldB.innerHTML = `<input type="text" id="teamB-player-${i}" data-team="B" data-index="${i-1}" class="player-input full-width" />`;
    elements.teamBPlayerFields.appendChild(fieldB);
  }

  elements.teamAPlayerFields.addEventListener('input', (event) => {
    if (event.target.matches('.player-input[data-team="A"]')) {
      const idx = Number(event.target.dataset.index);
      state.playersA[idx] = event.target.value.trim() || `A${idx + 1}`;
    }
  });

  elements.teamBPlayerFields.addEventListener('input', (event) => {
    if (event.target.matches('.player-input[data-team="B"]')) {
      const idx = Number(event.target.dataset.index);
      state.playersB[idx] = event.target.value.trim() || `B${idx + 1}`;
    }
  });
}

function renderPlayers() {
  for (let i = 0; i < 15; i += 1) {
    const a = document.getElementById(`teamA-player-${i + 1}`);
    const b = document.getElementById(`teamB-player-${i + 1}`);
    if (a) a.value = state.playersA[i];
    if (b) b.value = state.playersB[i];
  }
}

function loadDefaultPlayers() {
  for (let i = 0; i < 15; i += 1) {
    if (!state.playersA[i]) state.playersA[i] = `A${i + 1}`;
    if (!state.playersB[i]) state.playersB[i] = `B${i + 1}`;
  }
}

function setBattingSelectors() {
  if (state.firstBatting === 'A') {
    elements.chooseBatA.classList.add('btn-active');
    elements.chooseBatB.classList.remove('btn-active');
  } else {
    elements.chooseBatB.classList.add('btn-active');
    elements.chooseBatA.classList.remove('btn-active');
  }
}

function setViewForSetup() {
  elements.setupCard.style.display = 'block';
  elements.matchPanel.style.display = 'none';
  elements.matchResultCard.style.display = 'none';
  elements.newMatchBtn.textContent = 'Start Match';
}

function setViewForMatch() {
  elements.setupCard.style.display = 'none';
  elements.matchPanel.style.display = 'grid';
  elements.matchResultCard.style.display = state.matchEnded ? 'block' : 'none';
  elements.newMatchBtn.textContent = 'Reset Match';
}

function getCurrentBattingTeam() {
  const a = state.teamA;
  const b = state.teamB;
  if (state.firstBatting === 'A') {
    return state.innings === 1 ? a : b;
  }
  return state.innings === 1 ? b : a;
}

function getCurrentBowlingTeam() {
  const a = state.teamA;
  const b = state.teamB;
  if (state.firstBatting === 'A') {
    return state.innings === 1 ? b : a;
  }
  return state.innings === 1 ? a : b;
}

function updateUI() {
  elements.inningsText.textContent = state.innings;
  elements.oversText.textContent = formatOvers(state.overs, state.ballsInOver);
  elements.scoreText.textContent = `${state.runs}/${state.wickets}`;
  elements.runsText.textContent = state.runs;
  elements.wicketsText.textContent = state.wickets;
  elements.extrasText.textContent = state.extras;
  elements.widesCount.textContent = state.wide;
  elements.noballsCount.textContent = state.noball;
  elements.byesCount.textContent = state.bye;
  elements.legbyesCount.textContent = state.legbye;

  const battingTeam = getCurrentBattingTeam();
  const bowlingTeam = getCurrentBowlingTeam();
  document.title = `Cricket Scoreboard - ${battingTeam} batting`;

  elements.teamAHeader.textContent = state.teamA;
  elements.teamBHeader.textContent = state.teamB;

  elements.resultText.textContent = state.matchEnded ? 'Match is ended. Reset to start again.' : `${battingTeam} is batting versus ${bowlingTeam}.`;

  elements.swapInningsBtn.disabled = state.matchEnded;
  elements.wicketBtn.disabled = state.matchEnded;

  setBattingSelectors();
  elements.undoBtn.disabled = state.history.length === 0;
  elements.endOverBtn.disabled = state.matchEnded;
  [...elements.scoreButtons.querySelectorAll('button[data-run]')].forEach(b => b.disabled = state.matchEnded);
  [...elements.scoreButtons.querySelectorAll('button[data-extra]')].forEach(b => b.disabled = state.matchEnded);
}

function addHistory(action) {
  state.history.unshift(action);
  renderHistory();
}

function renderHistory() {
  elements.historyList.innerHTML = '';
  state.history.slice(0, 30).forEach(entry => {
    const li = document.createElement('li');
    li.textContent = entry;
    elements.historyList.appendChild(li);
  });
}

function checkInningsEnd() {
  if (state.wickets >= state.maxWickets) {
    addHistory(`Innings ${state.innings} ended: all out at ${state.runs}/${state.wickets} in ${formatOvers(state.overs, state.ballsInOver)}`);
    state.inningsRecords[state.innings] = {runs: state.runs, wickets: state.wickets, overs: state.overs + state.ballsInOver / 6};
    state.matchEnded = state.innings === 2;
    if (!state.matchEnded) {
      state.innings += 1;
      state.overs = 0; state.ballsInOver = 0; state.runs = 0; state.wickets = 0; state.extras=0; state.wide=0; state.noball=0; state.bye=0; state.legbye=0;
      addHistory(`Start innings ${state.innings}`);
    } else {
      computeResult();
      elements.matchResultCard.style.display = 'block';
    }
  }
  updateUI();
}

function computeResult() {
  const first = state.inningsRecords[1];
  const second = state.inningsRecords[2] || {runs: state.runs};
  if (!first || !second) return;
  if (second.runs > first.runs) {
    elements.resultText.textContent = `${state.teamB} wins by ${10 - state.wickets} wickets (target ${first.runs + 1}).`;
  } else if (second.runs < first.runs) {
    elements.resultText.textContent = `${state.teamA} wins by ${first.runs - second.runs} runs.`;
  } else {
    elements.resultText.textContent = `Match tied at ${first.runs}.`;
  }
}

function resetMatch() {
  state.teamA = elements.teamAInput.value.trim() || 'Team A';
  state.teamB = elements.teamBInput.value.trim() || 'Team B';
  state.innings = 1;
  state.overs = 0; state.ballsInOver = 0;
  state.runs = 0; state.wickets = 0; state.extras = 0; state.wide = 0; state.noball = 0; state.bye = 0; state.legbye = 0;
  state.history = [];
  state.inningsRecords = [null, null, null];
  state.matchEnded = false;
  state.started = false;

  setBattingSelectors();

  loadDefaultPlayers();
  renderPlayers();

  addHistory(`Match setup: ${state.teamA} vs ${state.teamB}.`);
  updateUI();
  setViewForSetup();
}

function ballDelivered(runsAdded = 0, isExtra = false, extraType = null) {
  if (isExtra) {
    state.extras += runsAdded;
    if (extraType === 'WIDE') state.wide += runsAdded;
    if (extraType === 'NOBALL') state.noball += runsAdded;
    if (extraType === 'BYE') state.bye += runsAdded;
    if (extraType === 'LEG_BYE') state.legbye += runsAdded;
    state.runs += runsAdded;
    addHistory(`Extra (${extraType} +${runsAdded}) => ${state.runs}/${state.wickets} ${formatOvers(state.overs,state.ballsInOver)}`);
  } else {
    state.runs += runsAdded;
    state.ballsInOver += 1;
    if (state.ballsInOver >= 6) { state.overs += 1; state.ballsInOver = 0; }
    addHistory(`${runsAdded} run${runsAdded===1?'':'s'} ball => ${state.runs}/${state.wickets} ${formatOvers(state.overs,state.ballsInOver)}`);
  }
  updateUI();
  checkInningsEnd();
}

function actionWicket() {
  state.wickets += 1;
  state.ballsInOver += 1;
  if (state.ballsInOver >= 6) { state.overs += 1; state.ballsInOver = 0; }
  addHistory(`Wicket! ${state.runs}/${state.wickets} ${formatOvers(state.overs,state.ballsInOver)}`);
  updateUI();
  checkInningsEnd();
}

function undoAction() {
  if (!state.history.length) return;
  state.history.shift();
  const raw = [...state.history];

  state.innings = 1; state.overs = 0; state.ballsInOver = 0;
  state.runs = 0; state.wickets = 0; state.extras = 0; state.wide = 0; state.noball = 0; state.bye = 0; state.legbye = 0;
  state.inningsRecords = [null, null, null]; state.matchEnded = false; state.history = [];

  raw.forEach((entry) => {
    const text = entry.toLowerCase();
    if (text.includes('match started')) {
      state.history.push(entry);
      return;
    }
    if (text.includes('start innings 2')) {
      state.innings = 2;
      state.overs = 0;
      state.ballsInOver = 0;
      state.runs = 0;
      state.wickets = 0;
      state.extras = 0;
      state.wide = 0;
      state.noball = 0;
      state.bye = 0;
      state.legbye = 0;
      state.history.push(entry);
      return;
    }
    if (text.includes('innings 1 ended')) {
      state.inningsRecords[1] = {runs: state.runs, wickets: state.wickets, overs: state.overs + state.ballsInOver / 6};
      state.innings = 2;
      state.overs = 0;
      state.ballsInOver = 0;
      state.runs = 0;
      state.wickets = 0;
      state.extras = 0;
      state.wide = 0;
      state.noball = 0;
      state.bye = 0;
      state.legbye = 0;
      state.history.push(entry);
      return;
    }
    if (text.includes('wicket!')) {
      actionWicket();
      return;
    }
    if (text.includes('extra')) {
      let extra = null;
      if (text.includes('wide')) extra = 'WIDE';
      else if (text.includes('no-ball')) extra = 'NOBALL';
      else if (text.includes('leg bye')) extra = 'LEG_BYE';
      else if (text.includes('bye')) extra = 'BYE';
      ballDelivered(1, true, extra);
      return;
    }
    const numberRun = text.match(/^(\d+) run/);
    if (numberRun) {
      const val = Number(numberRun[1]);
      ballDelivered(val, false);
      return;
    }
    if (text.includes('end of over')) {
      state.overs += 1;
      state.ballsInOver = 0;
      addHistory(entry);
    }
  });

  updateUI();
}

elements.newMatchBtn.addEventListener('click', resetMatch);

elements.chooseBatA.addEventListener('click', () => {
  state.firstBatting = 'A';
  setBattingSelectors();
});

elements.chooseBatB.addEventListener('click', () => {
  state.firstBatting = 'B';
  setBattingSelectors();
});

elements.teamAInput.addEventListener('input', (e) => {
  state.teamA = e.target.value.trim() || 'Team A';
  elements.teamAHeader.textContent = state.teamA;
});

elements.teamBInput.addEventListener('input', (e) => {
  state.teamB = e.target.value.trim() || 'Team B';
  elements.teamBHeader.textContent = state.teamB;
});

elements.scoreButtons.addEventListener('click', (e) => {
  if (e.target.matches('button[data-run]')) {
    const runs = Number(e.target.getAttribute('data-run'));
    ballDelivered(runs, false);
  } else if (e.target.matches('button[data-extra]')) {
    const extraType = e.target.getAttribute('data-extra');
    ballDelivered(1, true, extraType);
  }
});

elements.wicketBtn.addEventListener('click', actionWicket);

elements.undoBtn.addEventListener('click', undoAction);

elements.endOverBtn.addEventListener('click', () => {
  state.overs += 1;
  state.ballsInOver = 0;
  addHistory(`End of over ${state.overs}. Score ${state.runs}/${state.wickets}`);
  updateUI();
});

elements.swapInningsBtn.addEventListener('click', () => {
  if (state.innings === 1) {
    state.inningsRecords[1] = {runs: state.runs, wickets: state.wickets, overs: state.overs + state.ballsInOver / 6};
    state.innings = 2;
    state.overs = 0; state.ballsInOver = 0; state.runs = 0; state.wickets = 0; state.extras = 0; state.wide = 0; state.noball = 0; state.bye = 0; state.legbye = 0;
    addHistory(`Switch to innings 2. Target is ${state.inningsRecords[1].runs + 1}.`);
  } else {
    state.inningsRecords[2] = {runs: state.runs, wickets: state.wickets, overs: state.overs + state.ballsInOver / 6};
    state.matchEnded = true;
    computeResult();
    addHistory(`Innings 2 finished at ${state.runs}/${state.wickets}`);
    elements.matchResultCard.style.display = 'block';
  }
  updateUI();
});

elements.endMatchBtn.addEventListener('click', () => {
  state.matchEnded = true;
  computeResult();
  elements.matchResultCard.style.display = 'block';
  updateUI();
});

function startMatch() {
  state.started = true;
  state.teamA = elements.teamAInput.value.trim() || 'Team A';
  state.teamB = elements.teamBInput.value.trim() || 'Team B';
  state.innings = 1;
  state.overs = 0;
  state.ballsInOver = 0;
  state.runs = 0;
  state.wickets = 0;
  state.extras = 0;
  state.wide = 0;
  state.noball = 0;
  state.bye = 0;
  state.legbye = 0;
  state.history = [];
  state.inningsRecords = [null, null, null];
  state.matchEnded = false;

  setBattingSelectors();
  setViewForMatch();

  addHistory(`Match started: ${state.teamA} vs ${state.teamB}. Innings 1`);
  updateUI();
}

elements.newMatchBtn.addEventListener('click', () => {
  if (state.started) resetMatch();
  else startMatch();
});

generatePlayerFields();
resetMatch();
