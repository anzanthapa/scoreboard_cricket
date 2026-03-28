function loadSetup() {
  const raw = localStorage.getItem('cricketSetup');
  if (!raw) {
    window.location.href = 'match_setup.html';
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
    const noSummary = 'No previous innings yet.';
    if (summaryDiv) summaryDiv.textContent = noSummary;
    return noSummary;
  }

  const lines = state.inningsSummary.map((rec, idx) => {
    const team = idx === 0
      ? (setup.firstBatting === 'A' ? setup.teamA : setup.teamB)
      : (setup.firstBatting === 'A' ? setup.teamB : setup.teamA);
    return `${team} (Innings ${idx + 1}): ${rec.runs}/${rec.wickets} in ${rec.overs.toFixed(1)} overs`;
  });

  const summaryText = lines.join('\n');
  if (summaryDiv) summaryDiv.innerHTML = lines.map(line => `<div>${line}</div>`).join('');
  return summaryText;
}

function currentBattingPlayers(setup, state) {
  const battingTeam = getBattingTeam(setup, state);
  const players = setup.firstBatting === 'A' ? setup.playersA : setup.playersB;
  const other = setup.firstBatting === 'A' ? setup.playersB : setup.playersA;

  if (state.innings === 2) {
    if (setup.firstBatting === 'A') return setup.playersB;
    return setup.playersA;
  }
  return players;
}

function currentBowlingPlayers(setup, state) {
  if (state.innings === 1) {
    return setup.firstBatting === 'A' ? setup.playersB : setup.playersA;
  }
  return setup.firstBatting === 'A' ? setup.playersA : setup.playersB;
}

function setPlayerControls(setup, state) {
  const battingPlayers = currentBattingPlayers(setup, state);

  const b1 = document.getElementById('battingPlayer1');
  const b2 = document.getElementById('battingPlayer2');
  const bowler = document.getElementById('bowlerSelect');

  const fillSelect = (el, list, selected) => {
    el.innerHTML = '';
    list.forEach((p, idx) => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.text = p;
      if (p === selected) opt.selected = true;
      el.appendChild(opt);
    });
  };

  // Set default values if not set
  if (!state.battingPlayer1) state.battingPlayer1 = battingPlayers[0] || '';
  if (!state.battingPlayer2) state.battingPlayer2 = battingPlayers[1] || battingPlayers[0] || '';
  if (!state.bowler) state.bowler = '';

  // Populate batsman dropdowns
  fillSelect(b1, battingPlayers, state.battingPlayer1);
  fillSelect(b2, battingPlayers, state.battingPlayer2);

  // Set bowler text input
  bowler.value = state.bowler;
}


function render(state, setup) {
  document.getElementById('matchTeams').textContent = `${setup.teamA} vs ${setup.teamB}`;
  setPlayerControls(setup, state);
  document.getElementById('battingTeam').textContent = getBattingTeam(setup, state);
  document.getElementById('bowlingTeam').textContent = getBowlingTeam(setup, state);
  document.getElementById('inningsText').textContent = state.innings;
  document.getElementById('oversText').textContent = `${state.overs}.${state.balls}`;
  document.getElementById('scoreText').textContent = `${state.runs}/${state.wickets}`;
  document.getElementById('extrasText').textContent = state.extras;
  document.getElementById('widesText').textContent = state.wide;
  document.getElementById('noballsText').textContent = state.noball;
  document.getElementById('byesText').textContent = state.bye;
  document.getElementById('legbyesText').textContent = state.legbye;

  updateCommentary(state);

  const historyList = document.getElementById('historyList');
  if (historyList) {
    historyList.innerHTML = '';
    state.history.slice().reverse().forEach((line) => {
      const li = document.createElement('li');
      li.textContent = line;
      historyList.appendChild(li);
    });
  }

  const endMatchBtn = document.getElementById('endMatchBtn');
  const switchInningsBtn = document.getElementById('switchInningsBtn');
  if (state.innings === 2) {
    endMatchBtn.style.display = 'inline-block';
    switchInningsBtn.style.display = 'none';
  } else {
    endMatchBtn.style.display = 'none';
    switchInningsBtn.style.display = 'inline-block';
  }
}

function updateCommentary(state) {
  const commentary = document.getElementById('commentaryBox');
  if (!commentary) return;
  const len = state.history.length;
  const lastTwoOvers = state.history.slice(Math.max(0, len - 12), len);
  if (lastTwoOvers.length === 0) {
    commentary.textContent = 'Match started — no commentary yet.';
    return;
  }
  commentary.innerHTML = lastTwoOvers
    .reverse()
    .map((entry) => `<div>${entry}</div>`)
    .join('');
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
  const record = {
    runs: state.runs,
    wickets: state.wickets,
    overs: state.overs + state.balls / 6,
    batting: getBattingTeam(setup, state),
    bowling: getBowlingTeam(setup, state),
    battingPlayers: [state.battingPlayer1, state.battingPlayer2],
    bowler: state.bowler,
  };
  // Prevent duplicate push on repeated end clicks
  const last = state.inningsSummary[state.inningsSummary.length - 1];
  if (!last || last.runs !== record.runs || last.wickets !== record.wickets || last.overs !== record.overs || last.batting !== record.batting) {
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
  window.location.href = 'match_summary.html';
}

function checkScorerPassword() {
  const rawSetup = localStorage.getItem('cricketSetup');
  if (!rawSetup) {
    alert('No match setup found. Please set up a match first.');
    window.location.href = 'index.html';
    return false;
  }

  const setup = JSON.parse(rawSetup);
  const storedPassword = setup.scorerPassword;
  if (!storedPassword) {
    alert('No scorer password set. Please set up a match first.');
    window.location.href = 'index.html';
    return false;
  }

  // Check if user just set up the match - skip password prompt
  if (localStorage.getItem('justSetup') === 'true') {
    localStorage.removeItem('justSetup'); // Clear the flag
    return true;
  }

  const enteredPassword = prompt('Enter scorer password:');
  if (enteredPassword !== storedPassword) {
    alert('Incorrect password. Access denied.');
    window.location.href = 'index.html';
    return false;
  }

  return true;
}

function exportMatchData(setup, state) {
  const matchData = {
    exportDate: new Date().toISOString(),
    setup: setup,
    currentState: state,
    inningsSummary: state.inningsSummary || [],
    commentary: state.history || [],
    metadata: {
      exportedBy: 'Cricket Scoreboard System',
      version: '1.0',
      totalRuns: state.runs,
      totalWickets: state.wickets,
      totalOvers: state.overs + state.balls / 6,
      currentInnings: state.innings,
      matchStatus: state.matchEnded ? 'Completed' : 'In Progress'
    }
  };

  const dataStr = JSON.stringify(matchData, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});

  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `cricket_match_${setup.teamA}_vs_${setup.teamB}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportMatchPDF(setup, state) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('Cricket Match Report', 105, 20, { align: 'center' });
  
  // Match Info
  doc.setFontSize(14);
  doc.text(`${setup.teamA} vs ${setup.teamB}`, 105, 35, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
  doc.text(`First Batting: ${setup.firstBatting === 'A' ? setup.teamA : setup.teamB}`, 20, 60);
  
  // Passwords (as requested)
  doc.setFontSize(10);
  doc.text(`Scorer Password: ${setup.scorerPassword || 'Not set'}`, 20, 75);
  doc.text(`Viewer Password: ${setup.viewerPassword || 'Not set'}`, 20, 85);
  
  // Current Score
  doc.setFontSize(14);
  doc.text('Current Score:', 20, 105);
  doc.setFontSize(12);
  doc.text(`${getBattingTeam(setup, state)}: ${state.runs}/${state.wickets} (${state.overs}.${state.balls} overs)`, 30, 115);
  doc.text(`Extras: ${state.extras} (W:${state.wide}, NB:${state.noball}, B:${state.bye}, LB:${state.legbye})`, 30, 125);
  
  // Players
  doc.text(`Striker: ${state.battingPlayer1 || 'Not set'}`, 30, 140);
  doc.text(`Non-striker: ${state.battingPlayer2 || 'Not set'}`, 30, 150);
  doc.text(`Bowler: ${state.bowler || 'Not set'}`, 30, 160);
  
  let yPos = 180;
  
  // Innings Summary
  if (state.inningsSummary && state.inningsSummary.length > 0) {
    doc.setFontSize(14);
    doc.text('Innings Summary:', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(10);
    state.inningsSummary.forEach((inning, idx) => {
      doc.text(`${inning.batting}: ${inning.runs}/${inning.wickets} in ${inning.overs.toFixed(1)} overs`, 30, yPos);
      yPos += 10;
    });
    yPos += 10;
  }
  
  // Final Result
  if (state.matchEnded) {
    doc.setFontSize(14);
    doc.text('Final Result:', 20, yPos);
    doc.setFontSize(12);
    doc.text(computeResult(setup, state), 30, yPos + 15);
    yPos += 35;
  }
  
  // Recent Commentary (last 10 entries)
  if (state.history && state.history.length > 0) {
    doc.setFontSize(14);
    doc.text('Recent Commentary:', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(8);
    const recentCommentary = state.history.slice(-10);
    recentCommentary.forEach((entry, idx) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(entry, 30, yPos);
      yPos += 8;
    });
  }
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Generated by Cricket Scoreboard System - Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
  }
  
  // Save the PDF
  const filename = `cricket_match_${setup.teamA}_vs_${setup.teamB}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
  alert('Match report exported as PDF successfully!');
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
  if (!checkScorerPassword()) return;

  const setup = loadSetup();
  if (!setup) return;
  let state = loadState();
  if (!state) {
    window.location.href = 'match_setup.html';
    return;
  }

  render(state, setup);

  document.getElementById('exportDataBtn').addEventListener('click', () => {
    exportMatchData(setup, state);
  });

  document.getElementById('showSummaryBtn').addEventListener('click', () => {
    const summary = updateSummary(setup, state);
    const exportChoice = confirm(`Match Summary:\n\n${summary}\n\nWould you like to export this match as a PDF report?`);
    if (exportChoice) {
      exportMatchPDF(setup, state);
    }
  });

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
      batting: getBattingTeam(setup, state),
      bowling: getBowlingTeam(setup, state),
      battingPlayers: [state.battingPlayer1, state.battingPlayer2],
      bowler: state.bowler,
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
    state.battingPlayer1 = null;
    state.battingPlayer2 = null;
    state.bowler = null;
    saveState(state);
    render(state, setup);
  });

  document.getElementById('battingPlayer1').addEventListener('change', (e) => {
    state.battingPlayer1 = e.target.value;
    saveState(state);
    render(state, setup);
  });
  document.getElementById('battingPlayer2').addEventListener('change', (e) => {
    state.battingPlayer2 = e.target.value;
    saveState(state);
    render(state, setup);
  });
  document.getElementById('bowlerSelect').addEventListener('input', (e) => {
    state.bowler = e.target.value;
    saveState(state);
  });

  document.getElementById('endMatchBtn').addEventListener('click', () => endMatch(setup, state));
});
