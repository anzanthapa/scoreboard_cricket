let currentMatchId = null;
let socket = null;

function loadSetup() {
  const raw = localStorage.getItem('cricketSetup');
  if (!raw) {
    document.body.innerHTML = '<div style="text-align:center; padding:50px;"><h2>No match in progress</h2><p>Please start a match first.</p></div>';
    return null;
  }
  return JSON.parse(raw);
}

function loadState() {
  const raw = localStorage.getItem('cricketState');
  return raw ? JSON.parse(raw) : null;
}

function getBattingTeam(setup, state) {
  if (setup.firstBatting === 'A') {
    return state.innings === 1 ? setup.teamA : setup.teamB;
  } else {
    return state.innings === 1 ? setup.teamB : setup.teamA;
  }
}

function getBowlingTeam(setup, state) {
  if (setup.firstBatting === 'A') {
    return state.innings === 1 ? setup.teamB : setup.teamA;
  } else {
    return state.innings === 1 ? setup.teamA : setup.teamB;
  }
}

function render(state, setup) {
  document.getElementById('matchTeams').textContent = `${setup.teamA} vs ${setup.teamB}`;
  document.getElementById('battingTeam').textContent = getBattingTeam(setup, state);
  document.getElementById('bowlingTeam').textContent = getBowlingTeam(setup, state);
  document.getElementById('inningsText').textContent = state.innings;
  document.getElementById('oversText').textContent = `${Math.floor(state.overs)}.${state.balls}`;
  document.getElementById('scoreText').textContent = `${state.runs}/${state.wickets}`;
  document.getElementById('extrasText').textContent = state.extras;
  document.getElementById('widesText').textContent = state.wide;
  document.getElementById('noballsText').textContent = state.noball;
  document.getElementById('byesText').textContent = state.bye;
  document.getElementById('legbyesText').textContent = state.legbye;

  updateCommentary(state);
}

function updateCommentary(state) {
  const commentaryBox = document.getElementById('commentaryBox');
  if (state.history.length === 0) {
    commentaryBox.textContent = 'Match started — no commentary yet.';
    return;
  }

  // Show last 2 overs (approximately last 12 balls)
  const recentBalls = state.history.slice(-12);
  const commentary = recentBalls.map(ball => {
    let text = `${ball.over}.${ball.ball}: `;
    if (ball.run !== undefined) {
      text += `${ball.run} run${ball.run !== 1 ? 's' : ''}`;
      if (ball.extra) text += ` (${ball.extra})`;
      if (ball.wicket) text += ' + WICKET!';
    } else if (ball.extra) {
      text += `${ball.extra}`;
    }
    return text;
  }).join('\n');

  commentaryBox.textContent = commentary || 'No recent balls.';
}

function checkViewerPassword() {
  const rawSetup = localStorage.getItem('cricketSetup');
  if (!rawSetup) {
    document.body.innerHTML = '<div style="text-align:center; padding:50px;"><h2>No match available</h2><p>Please check back later or ask the scorer for the viewer password.</p></div>';
    return false;
  }

  const setup = JSON.parse(rawSetup);
  const storedPassword = setup.viewerPassword;
  if (!storedPassword) {
    document.body.innerHTML = '<div style="text-align:center; padding:50px;"><h2>Viewer access not configured</h2><p>Please ask the scorer to set up viewer access.</p></div>';
    return false;
  }

  const enteredPassword = prompt('Enter viewer password:');
  if (enteredPassword !== storedPassword) {
    document.body.innerHTML = '<div style="text-align:center; padding:50px;"><h2>Access denied</h2><p>Incorrect password. Please ask the scorer for the correct viewer password.</p></div>';
    return false;
  }

  return true;
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
  if (!checkViewerPassword()) return;

  const setup = loadSetup();
  if (!setup) {
    document.body.innerHTML = '<div style="text-align:center; padding:50px;"><h2>No match available</h2><p>Please check back later or contact the scorer.</p></div>';
    return;
  }
  const state = loadState();
  if (!state) {
    document.body.innerHTML = '<div style="text-align:center; padding:50px;"><h2>Match not started yet</h2><p>Please wait for the scorer to begin, or contact them for the viewer password.</p></div>';
    return;
  }

  render(state, setup);

  // Manual refresh button
  document.getElementById('refreshBtn').addEventListener('click', () => {
    const currentState = loadState();
    const currentSetup = loadSetup();
    if (currentState && currentSetup) {
      render(currentState, currentSetup);
    }
  });

  // Auto-refresh every 10 seconds
  setInterval(() => {
    const currentState = loadState();
    if (currentState) {
      render(currentState, setup);
    }
  }, 10000);
});