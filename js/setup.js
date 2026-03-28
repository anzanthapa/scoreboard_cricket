function createPlayerInputs(containerId, prefix) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  for (let i = 1; i <= 15; i += 1) {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = `${prefix}-player-${i}`;
    input.value = `${prefix}${i}`;
    input.className = 'player-input';
    input.style.marginBottom = '4px';
    input.style.width = '100%';
    input.style.boxSizing = 'border-box';
    container.appendChild(input);
  }
}

function setFirstBattingButton(selected) {
  const firstBatA = document.getElementById('firstBatA');
  const firstBatB = document.getElementById('firstBatB');
  if (selected === 'A') {
    firstBatA.classList.add('btn-active');
    firstBatB.classList.remove('btn-active');
  } else {
    firstBatA.classList.remove('btn-active');
    firstBatB.classList.add('btn-active');
  }
}

function getPlayers(prefix) {
  const players = [];
  for (let i = 1; i <= 15; i += 1) {
    const input = document.getElementById(`${prefix}-player-${i}`);
    players.push(input.value.trim() || `${prefix}${i}`);
  }
  return players;
}

function saveSetup() {
  const teamA = document.getElementById('teamAInput').value.trim() || 'Team A';
  const teamB = document.getElementById('teamBInput').value.trim() || 'Team B';
  const firstBatting = document.getElementById('firstBatA').classList.contains('btn-active') ? 'A' : 'B';

  const setup = {
    teamA,
    teamB,
    firstBatting,
    playersA: getPlayers('A'),
    playersB: getPlayers('B'),
  };

  localStorage.setItem('cricketSetup', JSON.stringify(setup));
  const initialGame = {
    innings: 1,
    overs: 0,
    balls: 0,
    runs: 0,
    wickets: 0,
    extras: 0,
    wide: 0,
    noball: 0,
    bye: 0,
    legbye: 0,
    history: [],
    inningsSummary: [],
    matchEnded: false,
  };
  localStorage.setItem('cricketState', JSON.stringify(initialGame));
  window.location.href = 'scoreboard.html';
}

window.addEventListener('load', () => {
  createPlayerInputs('teamAPlayers', 'A');
  createPlayerInputs('teamBPlayers', 'B');
  setFirstBattingButton('A');

  document.getElementById('firstBatA').addEventListener('click', () => setFirstBattingButton('A'));
  document.getElementById('firstBatB').addEventListener('click', () => setFirstBattingButton('B'));
  document.getElementById('startBtn').addEventListener('click', saveSetup);
});
