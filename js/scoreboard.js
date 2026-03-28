function loadSetup() {
  const raw = localStorage.getItem('cricketSetup');
  if (!raw) {
    window.location.href = 'setup.html';
    return null;
  }
  return JSON.parse(raw);
}

function loadState() {
  const raw = localStorage.getItem('cricketState');
  return raw ? JSON.parse(raw) : null;
}

function saveState(state) {
  localStorage.setItem('cricketState', JSON.stringify(state));
}

function getBattingTeam(setup, state) {
  if (setup.firstBatting === 'A') {
    return state.innings === 1 ? setup.teamA : setup.teamB;
  }
  return state.innings === 1 ? setup.teamB : setup.teamA;
}

function getBowlingTeam(setup, state) {
  if (setup.firstBatting === 'A') {
    return state.innings === 1 ? setup.teamB : setup.teamA;
  }
  return state.innings === 1 ? setup.teamA : setup.teamB;
}

function updateSummary(setup, state) {
  const summaryDiv = document.getElementById('inningsSummary');
  if (!state.inningsSummary || !state.inningsSummary.length) {
    summaryDiv.textContent = 'No previous innings yet.';
    return;
  }

  const lines = state.inningsSummary.map((rec, idx) => {
    const team = idx === 0 ? (setup.firstBatting === 'A' ? setup.teamA : setup.teamB) : (setup.firstBatting === 'A' ? setup.teamB : setup.teamA);
    return `${team} (Innings ${idx + 1}): ${rec.runs}/${rec.wickets} in ${rec.overs.toFixed(1)} overs`;
  });

  summaryDiv.innerHTML = lines.join('<br>');
}

function render(state, setup) {
  document.getElementById('matchTeams').textContent = `${setup.teamA} vs ${setup.teamB}`;
  document.getElementById('currentBatting').textContent = `Batting: ${getBattingTeam(setup, state)}`;
  document.getElementById('inningsText').textContent = state.innings;
  document.getElementById('oversText').textContent = `${state.overs}.${state.balls}`;
  document.getElementById('scoreText').textContent = `${state.runs}/${state.wickets}`;
  document.getElementById('extrasText').textContent = state.extras;
  document.getElementById('widesText').textContent = state.wide;
  document.getElementById('noballsText').textContent = state.noball;
  document.getElementById('byesText').textContent = state.bye;
  document.getElementById('legbyesText').textContent = state.legbye;

  updateSummary(setup, state);

  const historyList = document.getElementById('historyList');
  historyList.innerHTML = '';
  state.history.slice().reverse().forEach((line) => {
    const li = document.createElement('li');
    li.textContent = line;
    historyList.appendChild(li);
  });
}

function addHistory(state, text) {
  state.history.push(text);
  saveState(state);
  const historyList = document.getElementById('historyList');
  const li = document.createElement('li');
  li.textContent = text;
  historyList.appendChild(li);
}

function computeResult(setup, state) {
  if (!state.inningsSummary || state.inningsSummary.length < 2) return 'No full match results yet';

  const s1 = state.inningsSummary[0].runs;
  const s2 = state.inningsSummary[1].runs;

  const team1 = setup.firstBatting === 'A' ? setup.teamA : setup.teamB;
  const team2 = setup.firstBatting === 'A' ? setup.teamB : setup.teamA;

  if (s2 > s1) {
    return `${team2} wins by ${10 - state.inningsSummary[1].wickets} wickets (target ${s1 + 1}).`;
  } if (s2 < s1) {
    return `${team1} wins by ${s1 - s2} runs.`;
  }
  return `Match tied at ${s1}.`;
}

function endMatch(setup, state) {
  if (!state.inningsSummary) state.inningsSummary = [];
  if (state.inningsSummary.length < 2) {
    const record = {
      runs: state.runs,
      wickets: state.wickets,
      overs: state.overs + state.balls / 6,
    };
    state.inningsSummary.push(record);
  }
  state.matchEnded = true;

  saveState(state);
  const result = {
    setup,
    state,
    finalResult: computeResult(setup, state),
  };
  localStorage.setItem('cricketResult', JSON.stringify(result));
  window.location.href = 'result.html';
}

window.addEventListener('load', () => {
  const setup = loadSetup();
  if (!setup) return;
  let state = loadState();
  if (!state) {
    window.location.href = 'setup.html';
    return;
  }

  render(state, setup);

  document.getElementById('scoreButtons').addEventListener('click', (event) => {
    const runAttr = event.target.getAttribute('data-run');
    if (runAttr != null) {
      const runs = Number(runAttr);
      state.runs += runs;
      state.balls += 1;
      if (state.balls === 6) {
        state.overs += 1;
        state.balls = 0;
      }
      addHistory(state, `${getBattingTeam(setup,state)} +${runs} (${state.runs}/${state.wickets})`);
    }
    const extraAttr = event.target.getAttribute('data-extra');
    if (extraAttr) {
      state.extras += 1;
      state[extraAttr.toLowerCase()] += 1;
      state.runs += 1;
      addHistory(state, `Extra ${extraAttr} (+1) => ${state.runs}/${state.wickets}`);
    }

    if (event.target.id === 'wicketBtn') {
      state.wickets += 1;
      state.balls += 1;
      if (state.balls === 6) {
        state.overs += 1;
        state.balls = 0;
      }
      addHistory(state, `Wicket! ${state.runs}/${state.wickets}`);
    }

    saveState(state);
    render(state, setup);
  });

  document.getElementById('switchInningsBtn').addEventListener('click', () => {
    state.inningsSummary = state.inningsSummary || [];
    state.inningsSummary.push({
      runs: state.runs,
      wickets: state.wickets,
      overs: state.overs + state.balls / 6,
    });
    state.innings = 2;
    state.overs = 0;
    state.balls = 0;
    state.runs = 0;
    state.wickets = 0;
    state.extras = 0;
    state.wide = 0;
    state.noball = 0;
    state.bye = 0;
    state.legbye = 0;
    state.history = [];
    state.matchEnded = false;
    saveState(state);
    render(state, setup);
  });

  document.getElementById('endMatchBtn').addEventListener('click', () => endMatch(setup, state));
});
