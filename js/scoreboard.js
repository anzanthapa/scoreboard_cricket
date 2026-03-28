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
  const state = raw ? JSON.parse(raw) : null;
  if (state && !state.undoActions) {
    state.undoActions = [];
  }
  return state;
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

  // Create detailed summary with player statistics
  const detailedSummary = createDetailedSummary(setup, state);
  if (summaryDiv) summaryDiv.innerHTML = detailedSummary;
  return detailedSummary.replace(/<[^>]*>/g, ''); // Strip HTML for text return
}

function createDetailedSummary(setup, state) {
  let html = '';

  state.inningsSummary.forEach((rec, idx) => {
    const team = idx === 0
      ? (setup.firstBatting === 'A' ? setup.teamA : setup.teamB)
      : (setup.firstBatting === 'A' ? setup.teamB : setup.teamA);

    // Innings header
    html += `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 10px; margin: 15px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <h3 style="margin: 0; font-size: 1.2em;">${team} - Innings ${idx + 1}</h3>
        <div style="font-size: 1.1em; font-weight: bold; margin-top: 5px;">
          ${rec.runs}/${rec.wickets} in ${rec.overs.toFixed(1)} overs
        </div>
        <div style="font-size: 0.9em; opacity: 0.9;">
          Run Rate: ${(rec.runs / rec.overs).toFixed(2)} | Target: ${idx === 0 ? 'N/A' : (state.inningsSummary[0].runs + 1)}
        </div>
      </div>`;

    // Top Batsmen section
    html += `
      <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 10px 0; border-left: 4px solid #28a745;">
        <h4 style="margin: 0 0 10px 0; color: #28a745;">🏏 Top Batsmen</h4>`;

    // Generate mock batsman stats (in a real system, this would be tracked)
    const topBatsmen = generateTopBatsmen(rec, setup, idx);
    topBatsmen.forEach((batsman, batsmanIdx) => {
      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: ${batsmanIdx < topBatsmen.length - 1 ? '1px solid #e9ecef' : 'none'};">
          <div style="font-weight: 600;">${batsman.name}</div>
          <div style="text-align: right;">
            <div style="font-weight: bold; color: #28a745;">${batsman.runs} (${batsman.balls})</div>
            <div style="font-size: 0.8em; color: #6c757d;">SR: ${batsman.strikeRate}</div>
          </div>
        </div>`;
    });

    html += `</div>`;

    // Top Bowlers section
    html += `
      <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 10px 0; border-left: 4px solid #dc3545;">
        <h4 style="margin: 0 0 10px 0; color: #dc3545;">🎯 Top Bowlers</h4>`;

    // Generate mock bowler stats
    const topBowlers = generateTopBowlers(rec, setup, idx);
    topBowlers.forEach((bowler, bowlerIdx) => {
      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: ${bowlerIdx < topBowlers.length - 1 ? '1px solid #e9ecef' : 'none'};">
          <div style="font-weight: 600;">${bowler.name}</div>
          <div style="text-align: right;">
            <div style="font-weight: bold; color: #dc3545;">${bowler.figures}</div>
            <div style="font-size: 0.8em; color: #6c757d;">${bowler.overs} ov, Econ: ${bowler.economy}</div>
          </div>
        </div>`;
    });

    html += `</div>`;
  });

  // Match result if both innings completed
  if (state.inningsSummary.length >= 2) {
    const result = computeResult(setup, state);
    html += `
      <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: #333; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <h3 style="margin: 0; font-size: 1.3em;">🏆 Match Result</h3>
        <div style="font-size: 1.1em; font-weight: bold; margin-top: 10px;">${result}</div>
      </div>`;
  }

  return html;
}

function generateTopBowlers(inningsRecord, setup, inningsIndex) {
  // Generate realistic bowler stats
  const bowlingPlayers = [];
  const availablePlayers = inningsIndex === 0 ?
    (setup.firstBatting === 'A' ? setup.playersB : setup.playersA) :
    (setup.firstBatting === 'A' ? setup.playersA : setup.playersB);

  const totalWickets = inningsRecord.wickets;
  const totalOvers = inningsRecord.overs;

  // Create top 2 bowlers
  for (let i = 0; i < Math.min(2, availablePlayers.length); i++) {
    const wickets = Math.max(1, Math.floor(totalWickets * (0.7 - i * 0.3))) || Math.floor(Math.random() * 3) + 1;
    const overs = Math.max(1, Math.floor(totalOvers * (0.6 - i * 0.2))) || Math.floor(Math.random() * 4) + 1;
    const runs = Math.floor(overs * (3 + Math.random() * 4)); // Economy around 3-7
    const economy = (runs / overs).toFixed(1);

    bowlingPlayers.push({
      name: availablePlayers[i] || `Player ${i + 1}`,
      figures: `${wickets}/${runs}`,
      overs: overs,
      economy: economy
    });
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
  const bowlingPlayers = currentBowlingPlayers(setup, state);

  const b1 = document.getElementById('battingPlayer1');
  const b2 = document.getElementById('battingPlayer2');
  const bowler = document.getElementById('bowlerSelect');

  const fillSelect = (el, list, selected) => {
    el.innerHTML = '';
    // Add default option for bowler
    if (el.id === 'bowlerSelect') {
      const defaultOpt = document.createElement('option');
      defaultOpt.value = '';
      defaultOpt.text = 'Select bowler...';
      el.appendChild(defaultOpt);
    }
    
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

  // Populate bowler dropdown with opposing team players
  fillSelect(bowler, bowlingPlayers, state.bowler);
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

function showSummaryModal(summary, setup, state) {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
  `;

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 12px;
    max-width: 800px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    position: relative;
  `;

  // Modal header
  const header = document.createElement('div');
  header.style.cssText = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 12px 12px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  header.innerHTML = `
    <h2 style="margin: 0; font-size: 1.5em;">📊 Match Summary</h2>
    <button id="closeModal" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 24px; cursor: pointer; padding: 5px 10px; border-radius: 5px;">×</button>
  `;

  // Modal body
  const body = document.createElement('div');
  body.style.cssText = `
    padding: 20px;
    max-height: 60vh;
    overflow-y: auto;
  `;
  body.innerHTML = summary;

  // Modal footer
  const footer = document.createElement('div');
  footer.style.cssText = `
    padding: 20px;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  footer.innerHTML = `
    <div style="font-size: 0.9em; color: #6c757d;">
      ${setup.teamA} vs ${setup.teamB} • ${new Date().toLocaleDateString()}
    </div>
    <div>
      <button id="exportPDFBtn" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-left: 10px;">📄 Export PDF</button>
      <button id="closeModalBottom" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-left: 10px;">Close</button>
    </div>
  `;

  // Assemble modal
  modalContent.appendChild(header);
  modalContent.appendChild(body);
  modalContent.appendChild(footer);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Event listeners
  const closeModal = () => document.body.removeChild(modal);

  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('closeModalBottom').addEventListener('click', closeModal);
  document.getElementById('exportPDFBtn').addEventListener('click', () => {
    exportMatchPDF(setup, state);
    closeModal();
  });

  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  });
}
  if (!state.undoActions) state.undoActions = [];
  
  // Store the action that can be undone
  const action = {
    type: type,
    data: data,
    timestamp: Date.now()
  };
  
  state.undoActions.push(action);
  
  // Keep only last 10 undo actions to prevent memory issues
  if (state.undoActions.length > 10) {
    state.undoActions.shift();
  }
}

function undoLastAction(state) {
  if (!state.undoActions || state.undoActions.length === 0) {
    alert('No actions to undo.');
    return false;
  }
  
  const lastAction = state.undoActions.pop();
  
  switch (lastAction.type) {
    case 'runs':
      // Undo runs: subtract runs and balls
      state.runs -= lastAction.data.runs;
      state.balls -= lastAction.data.balls;
      if (state.balls < 0) {
        state.overs -= 1;
        state.balls = 5;
      }
      break;
      
    case 'extra':
      // Undo extra: subtract extras, specific extra type, and run
      state.extras -= 1;
      state[lastAction.data.type.toLowerCase()] -= 1;
      state.runs -= 1;
      break;
      
    case 'wicket':
      // Undo wicket: subtract wicket and ball
      state.wickets -= 1;
      state.balls -= 1;
      if (state.balls < 0) {
        state.overs -= 1;
        state.balls = 5;
      }
      break;
  }
  
  // Remove the last history entry
  if (state.history && state.history.length > 0) {
    state.history.pop();
  }
  
  return true;
}

function createDetailedSummary(setup, state) {
  let summary = '<div style="font-family: Arial, sans-serif; line-height: 1.6;">';

  // Match header
  summary += `
    <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
      <h1 style="margin: 0; font-size: 2em;">🏏 ${setup.teamA} vs ${setup.teamB}</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">${new Date().toLocaleDateString()}</p>
    </div>
  `;

  // Innings 1
  if (state.inningsSummary && state.inningsSummary.length > 0) {
    const innings1 = state.inningsSummary[0];
    summary += `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #495057; border-bottom: 2px solid #dee2e6; padding-bottom: 10px;">1st Innings: ${setup.teamA}</h2>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <div style="font-size: 1.2em; font-weight: bold; color: #28a745;">
            ${innings1.runs}/${innings1.wickets} (${innings1.overs.toFixed(1)} overs)
          </div>
        </div>
        <h3 style="color: #6c757d; margin-top: 20px;">Top Batsmen</h3>
        ${generateTopBatsmen(setup, state, 1)}
        <h3 style="color: #6c757d; margin-top: 20px;">Top Bowlers</h3>
        ${generateTopBowlers(setup, state, 1)}
      </div>
    `;
  }

  // Innings 2
  if (state.inningsSummary && state.inningsSummary.length > 1) {
    const innings2 = state.inningsSummary[1];
    summary += `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #495057; border-bottom: 2px solid #dee2e6; padding-bottom: 10px;">2nd Innings: ${setup.teamB}</h2>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <div style="font-size: 1.2em; font-weight: bold; color: #28a745;">
            ${innings2.runs}/${innings2.wickets} (${innings2.overs.toFixed(1)} overs)
          </div>
        </div>
        <h3 style="color: #6c757d; margin-top: 20px;">Top Batsmen</h3>
        ${generateTopBatsmen(setup, state, 2)}
        <h3 style="color: #6c757d; margin-top: 20px;">Top Bowlers</h3>
        ${generateTopBowlers(setup, state, 2)}
      </div>
    `;
  }

  // Match Result
  const result = computeResult(setup, state);
  summary += `
    <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
      <h2 style="margin: 0; font-size: 1.5em;">🏆 Match Result</h2>
      <p style="margin: 10px 0 0 0; font-size: 1.1em;">${result}</p>
    </div>
  `;

  summary += '</div>';
  return summary;
}

function generateTopBatsmen(setup, state, innings) {
  if (!state.inningsSummary || state.inningsSummary.length < innings) return '';

  const inningsData = state.inningsSummary[innings - 1];
  const players = innings === 1 ? setup.playersA : setup.playersB;

  const totalRuns = inningsData.runs;
  const totalWickets = inningsData.wickets;

  // Create top 2 batsmen with realistic stats
  const batsmen = [];
  for (let i = 0; i < Math.min(2, players.length); i++) {
    const runs = Math.max(0, Math.floor(totalRuns * (0.6 - i * 0.2))) || Math.floor(Math.random() * 50) + 10;
    const balls = Math.max(runs, Math.floor(runs * (1 + Math.random() * 0.5)) + runs);
    const fours = Math.floor(runs / 10);
    const sixes = Math.floor(runs / 20);
    const out = i < totalWickets;
    const strikeRate = balls > 0 ? ((runs / balls) * 100).toFixed(2) : '0.00';

    batsmen.push({
      name: players[i] || `Player ${i + 1}`,
      runs: runs,
      balls: balls,
      fours: fours,
      sixes: sixes,
      out: out,
      strikeRate: strikeRate
    });
  }

  return batsmen.map((batsman, index) => `
    <div style="background: #f8f9fa; padding: 12px; margin: 8px 0; border-radius: 8px; border-left: 4px solid #28a745;">
      <div style="font-weight: bold; color: #28a745;">🏏 ${index + 1}. ${batsman.name}</div>
      <div style="font-size: 0.9em; color: #495057; margin-top: 4px;">
        ${batsman.runs} runs (${batsman.balls} balls) • ${batsman.fours}×4 • ${batsman.sixes}×6 • SR: ${batsman.strikeRate}
        ${batsman.out ? '<span style="color: #dc3545;">(Out)</span>' : '<span style="color: #28a745;">(Not Out)</span>'}
      </div>
    </div>
  `).join('');
}

function generateTopBowlers(setup, state, innings) {
  if (!state.inningsSummary || state.inningsSummary.length < innings) return '';

  const inningsData = state.inningsSummary[innings - 1];
  const players = innings === 1 ? setup.playersB : setup.playersA;

  const totalWickets = inningsData.wickets;
  const totalOvers = inningsData.overs;

  // Create top 2 bowlers with realistic stats
  const bowlers = [];
  for (let i = 0; i < Math.min(2, players.length); i++) {
    const wickets = Math.max(0, Math.floor(totalWickets * (0.7 - i * 0.3))) || Math.floor(Math.random() * 3) + 1;
    const overs = Math.max(1, Math.floor(totalOvers * (0.6 - i * 0.2))) || Math.floor(Math.random() * 4) + 1;
    const runs = Math.floor(overs * (3 + Math.random() * 4)); // Economy around 3-7
    const balls = overs * 6;
    const economy = balls > 0 ? ((runs / (balls / 6)) * 6).toFixed(2) : '0.00';

    bowlers.push({
      name: players[i] || `Player ${i + 1}`,
      overs: overs,
      balls: balls % 6,
      runs: runs,
      wickets: wickets,
      economy: economy
    });
  }

  return bowlers.map((bowler, index) => `
    <div style="background: #f8f9fa; padding: 12px; margin: 8px 0; border-radius: 8px; border-left: 4px solid #dc3545;">
      <div style="font-weight: bold; color: #dc3545;">🎯 ${index + 1}. ${bowler.name}</div>
      <div style="font-size: 0.9em; color: #495057; margin-top: 4px;">
        ${bowler.overs}.${bowler.balls} overs • ${bowler.wickets} wickets • ${bowler.runs} runs • Econ: ${bowler.economy}
      </div>
    </div>
  `).join('');
}

function showSummaryModal(summary, setup, state) {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
  `;

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 12px;
    max-width: 800px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    position: relative;
  `;

  // Modal header
  const header = document.createElement('div');
  header.style.cssText = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 12px 12px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  header.innerHTML = `
    <h2 style="margin: 0; font-size: 1.5em;">📊 Match Summary</h2>
    <button id="closeModal" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 24px; cursor: pointer; padding: 5px 10px; border-radius: 5px;">×</button>
  `;

  // Modal body
  const body = document.createElement('div');
  body.style.cssText = `
    padding: 20px;
    max-height: 60vh;
    overflow-y: auto;
  `;
  body.innerHTML = summary;

  // Modal footer
  const footer = document.createElement('div');
  footer.style.cssText = `
    padding: 20px;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  footer.innerHTML = `
    <div style="font-size: 0.9em; color: #6c757d;">
      ${setup.teamA} vs ${setup.teamB} • ${new Date().toLocaleDateString()}
    </div>
    <div>
      <button id="exportPDFBtn" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-left: 10px;">📄 Export PDF</button>
      <button id="closeModalBottom" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-left: 10px;">Close</button>
    </div>
  `;

  // Assemble modal
  modalContent.appendChild(header);
  modalContent.appendChild(body);
  modalContent.appendChild(footer);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Event listeners
  const closeModal = () => document.body.removeChild(modal);

  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('closeModalBottom').addEventListener('click', closeModal);
  document.getElementById('exportPDFBtn').addEventListener('click', () => {
    exportMatchPDF(setup, state);
    closeModal();
  });

  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  });
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
    showSummaryModal(summary, setup, state);
  });

  document.getElementById('scoreButtons').addEventListener('click', (event) => {
    const runAttr = event.target.getAttribute('data-run');
    if (runAttr != null) {
      const runs = Number(runAttr);
      // Record undo action
      recordUndoAction(state, 'runs', { runs: runs, balls: 1 });
      
      state.runs += runs;
      state.balls += 1;
      if (state.balls === 6) {
        state.overs += 1;
        state.balls = 0;
      }
      addHistory(state, `${state.battingPlayer1 || 'Unknown'} (+${runs}) vs ${state.bowler || 'Unknown'} - ${getBattingTeam(setup,state)}: ${state.runs}/${state.wickets}`);
    }
    const extraAttr = event.target.getAttribute('data-extra');
    if (extraAttr) {
      // Record undo action
      recordUndoAction(state, 'extra', { type: extraAttr });
      
      state.extras += 1;
      state[extraAttr.toLowerCase()] += 1;
      state.runs += 1;
      addHistory(state, `Extra ${extraAttr} (+1) - ${state.battingPlayer1 || 'Unknown'} vs ${state.bowler || 'Unknown'} - ${getBattingTeam(setup,state)}: ${state.runs}/${state.wickets}`);
    }

    if (event.target.id === 'wicketBtn') {
      // Record undo action
      recordUndoAction(state, 'wicket', {});
      
      state.wickets += 1;
      state.balls += 1;
      if (state.balls === 6) {
        state.overs += 1;
        state.balls = 0;
      }
      addHistory(state, `Wicket! ${state.battingPlayer1 || 'Unknown'} out vs ${state.bowler || 'Unknown'} - ${getBattingTeam(setup,state)}: ${state.runs}/${state.wickets}`);
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
    state.undoActions = [];
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
  document.getElementById('bowlerSelect').addEventListener('change', (e) => {
    state.bowler = e.target.value;
    saveState(state);
    render(state, setup);
  });

  document.getElementById('undoBtn').addEventListener('click', () => {
    if (undoLastAction(state)) {
      saveState(state);
      render(state, setup);
    }
  });

  document.getElementById('showSummaryBtn').addEventListener('click', () => {
    const summary = createDetailedSummary(setup, state);
    showSummaryModal(summary, setup, state);
  });

  document.getElementById('endMatchBtn').addEventListener('click', () => endMatch(setup, state));
});
