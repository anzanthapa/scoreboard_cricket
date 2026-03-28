const DEFAULT_PLAYERS = 11;
const MIN_PLAYERS = 1;
const MAX_PLAYERS = 20;
const playerCounts = {
  A: DEFAULT_PLAYERS,
  B: DEFAULT_PLAYERS,
};

function createPlayerInputs(containerId, prefix, count, existingNames = []) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  for (let i = 1; i <= count; i += 1) {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.marginBottom = '4px';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = `${prefix}-player-${i}`;
    input.value = (existingNames[i - 1] && existingNames[i - 1].trim())
      ? existingNames[i - 1].trim()
      : `${prefix}${i}`;
    input.className = 'player-input';
    input.style.flex = '1';
    input.style.boxSizing = 'border-box';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = '–';
    removeBtn.title = 'Remove this player';
    removeBtn.style.marginLeft = '8px';
    removeBtn.style.width = '32px';
    removeBtn.style.height = '32px';
    removeBtn.style.cursor = 'pointer';
    removeBtn.addEventListener('click', () => {
      if (playerCounts[prefix] > MIN_PLAYERS) {
        const currentNames = getPlayers(prefix);
        currentNames.splice(i - 1, 1);
        setPlayerCount(prefix, playerCounts[prefix] - 1, currentNames);
      } else {
        alert(`At least ${MIN_PLAYERS} players required`);
      }
    });

    wrapper.appendChild(input);
    wrapper.appendChild(removeBtn);
    container.appendChild(wrapper);
  }
}

function getPlayers(prefix) {
  const container = document.getElementById(`team${prefix}Players`);
  if (!container) {
    return [];
  }
  const inputs = container.querySelectorAll('input');
  return Array.from(inputs).map((input, idx) => {
    const value = input.value.trim();
    return value || `${prefix}${idx + 1}`;
  });
}

function updatePlayerCountDisplay(prefix) {
  const countEl = document.getElementById(`team${prefix}PlayerCount`);
  if (countEl) {
    countEl.textContent = `${playerCounts[prefix]} player${playerCounts[prefix] === 1 ? '' : 's'}`;
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

function setPlayerCount(prefix, value, existingNames) {
  playerCounts[prefix] = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, value));
  const names = existingNames || getPlayers(prefix);
  createPlayerInputs(`team${prefix}Players`, prefix, playerCounts[prefix], names);
  updatePlayerCountDisplay(prefix);
}

function addPlayer(prefix) {
  if (playerCounts[prefix] < MAX_PLAYERS) {
    setPlayerCount(prefix, playerCounts[prefix] + 1);
  } else {
    alert(`Maximum ${MAX_PLAYERS} players allowed`);
  }
}

function removePlayer(prefix) {
  if (playerCounts[prefix] > MIN_PLAYERS) {
    setPlayerCount(prefix, playerCounts[prefix] - 1);
  } else {
    alert(`At least ${MIN_PLAYERS} players required`);
  }
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
  localStorage.setItem('justSetup', 'true'); // Flag to skip password check on first access
  window.location.href = 'scorer_scoreboard.html';
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
    localStorage.removeItem('justSetup');
    localStorage.setItem('cricketLastReset', today);
  }
}

window.addEventListener('load', () => {
  checkAndResetDailyData();

  // Password inputs are shown as text to stay visible on one line
  const scorerPasswordInput = document.getElementById('scorerPassword');
  const viewerPasswordInput = document.getElementById('viewerPassword');

  scorerPasswordInput.type = 'text';
  viewerPasswordInput.type = 'text';
  createPlayerInputs('teamAPlayers', 'A', playerCounts.A);
  createPlayerInputs('teamBPlayers', 'B', playerCounts.B);
  updatePlayerCountDisplay('A');
  updatePlayerCountDisplay('B');
  setFirstBattingButton('A');

  document.getElementById('teamAAdd').addEventListener('click', () => addPlayer('A'));
  document.getElementById('teamARemove').addEventListener('click', () => removePlayer('A'));
  document.getElementById('teamBAdd').addEventListener('click', () => addPlayer('B'));
  document.getElementById('teamBRemove').addEventListener('click', () => removePlayer('B'));

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
