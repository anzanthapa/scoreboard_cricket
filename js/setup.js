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
  const scorerPassword = document.getElementById('scorerPassword').value.trim();
  const viewerPassword = document.getElementById('viewerPassword').value.trim();

  if (!scorerPassword || !viewerPassword) {
    alert('Please create both scorer and viewer passwords to protect access.');
    return;
  }

  const setup = {
    teamA,
    teamB,
    firstBatting,
    playersA: getPlayers('A'),
    playersB: getPlayers('B'),
    scorerPassword,
    viewerPassword
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
  window.location.href = 'controller_scoreboard.html';
}

function validateTeamName(input) {
  let value = input.value.replace(/[^a-zA-Z0-9 ]/g, ''); // only letters, numbers, spaces
  if (value.length > 20) {
    value = value.substring(0, 20);
  }
  input.value = value.trim();
}

function updateTeamHeader(team, headerId) {
  const header = document.getElementById(headerId);
  header.textContent = team || 'Team ' + (headerId === 'teamAHeader' ? 'A' : 'B');
  updateFirstBatButtons();
}

function updateFirstBatButtons() {
  const teamA = document.getElementById('teamAInput').value || 'Team A';
  const teamB = document.getElementById('teamBInput').value || 'Team B';
  document.getElementById('firstBatA').innerHTML = `🏏 ${teamA}`;
  document.getElementById('firstBatB').innerHTML = `🏏 ${teamB}`;
}

function checkAndResetDailyData() {
  const today = new Date().toDateString();
  const lastReset = localStorage.getItem('cricketLastReset');

  if (lastReset !== today) {
    // Clear all cricket data
    localStorage.removeItem('cricketSetup');
    localStorage.removeItem('cricketState');
    localStorage.removeItem('cricketResult');
    localStorage.setItem('cricketLastReset', today);
  }
}

window.addEventListener('load', () => {
  checkAndResetDailyData();
  createPlayerInputs('teamAPlayers', 'A');
  createPlayerInputs('teamBPlayers', 'B');
  setFirstBattingButton('A');

  const teamAInput = document.getElementById('teamAInput');
  const teamBInput = document.getElementById('teamBInput');

  teamAInput.addEventListener('input', () => {
    validateTeamName(teamAInput);
    updateTeamHeader(teamAInput.value, 'teamAHeader');
  });

  teamBInput.addEventListener('input', () => {
    validateTeamName(teamBInput);
    updateTeamHeader(teamBInput.value, 'teamBHeader');
  });

  // Initial update
  updateTeamHeader(teamAInput.value, 'teamAHeader');
  updateTeamHeader(teamBInput.value, 'teamBHeader');
  updateFirstBatButtons();

  document.getElementById('firstBatA').addEventListener('click', () => setFirstBattingButton('A'));
  document.getElementById('firstBatB').addEventListener('click', () => setFirstBattingButton('B'));
  document.getElementById('startBtn').addEventListener('click', saveSetup);
});
