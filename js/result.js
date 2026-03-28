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

  const enteredPassword = prompt('Enter scorer password:');
  if (enteredPassword !== storedPassword) {
    alert('Incorrect password. Access denied.');
    window.location.href = 'index.html';
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
  if (!checkScorerPassword()) return;

  const raw = localStorage.getItem('cricketResult');
  if (!raw) {
    document.getElementById('finalResult').textContent = 'No match data available. Start from match setup.';
    return;
  }
  const result = JSON.parse(raw);
  document.getElementById('finalResult').textContent = result.finalResult || 'No result';

  const finalInningsList = document.getElementById('finalInningsList');
  finalInningsList.innerHTML = '';

  if (result.state && result.state.inningsSummary) {
    result.state.inningsSummary.forEach((rec, index) => {
      const team = rec.batting || (index === 0 ? (result.setup.firstBatting === 'A' ? result.setup.teamA : result.setup.teamB) : (result.setup.firstBatting === 'A' ? result.setup.teamB : result.setup.teamA));
      const box = document.createElement('div');
      box.style.background = index === 0 ? 'linear-gradient(90deg, #142850, #27496d)' : 'linear-gradient(90deg, #4062bb, #84c7f5)';
      box.style.padding = '10px';
      box.style.borderRadius = '8px';
      box.style.marginBottom = '8px';
      box.style.color = 'white';
      box.innerHTML = `<strong>Innings ${index + 1}: ${team}</strong><br>
                       Score: ${rec.runs}/${rec.wickets} in ${rec.overs.toFixed(1)} overs<br>
                       Batting: ${rec.battingPlayers ? rec.battingPlayers.join(', ') : 'N/A'}<br>
                       Bowler: ${rec.bowler || 'N/A'}`;
      finalInningsList.appendChild(box);
    });
  }

  // Display match statistics
  const matchStatsDiv = document.getElementById('matchStats');
  if (result.state && result.setup) {
    const stats = generateMatchStatistics(result.setup, result.state);
    matchStatsDiv.innerHTML = stats;
  } else {
    matchStatsDiv.innerHTML = 'No statistics available.';
  }

  // Add PDF export functionality
  document.getElementById('exportResultPDFBtn').addEventListener('click', () => {
    exportMatchPDF(result.setup, result.state);
  });
});

function generateMatchStatistics(setup, state) {
  let stats = '<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0;">';
  
  // Match duration and basic info
  stats += `<h4>Match Overview</h4>`;
  stats += `<p><strong>Teams:</strong> ${setup.teamA} vs ${setup.teamB}</p>`;
  stats += `<p><strong>Total Overs:</strong> ${state.overs + state.balls/6} (${state.overs} overs ${state.balls} balls)</p>`;
  stats += `<p><strong>Total Runs:</strong> ${state.runs}</p>`;
  stats += `<p><strong>Total Wickets:</strong> ${state.wickets}</p>`;
  
  // Extras breakdown
  stats += `<h4>Extras Breakdown</h4>`;
  stats += `<p><strong>Total Extras:</strong> ${state.extras}</p>`;
  stats += `<ul style="list-style: none; padding: 0;">`;
  stats += `<li>• Wides: ${state.wide || 0}</li>`;
  stats += `<li>• No-balls: ${state.noball || 0}</li>`;
  stats += `<li>• Byes: ${state.bye || 0}</li>`;
  stats += `<li>• Leg-byes: ${state.legbye || 0}</li>`;
  stats += `</ul>`;
  
  // Run rate
  const totalBalls = state.overs * 6 + state.balls;
  const runRate = totalBalls > 0 ? (state.runs / (totalBalls / 6)).toFixed(2) : 0;
  stats += `<p><strong>Overall Run Rate:</strong> ${runRate} runs per over</p>`;
  
  // Commentary count
  const commentaryCount = state.history ? state.history.length : 0;
  stats += `<p><strong>Total Commentary Entries:</strong> ${commentaryCount}</p>`;
  
  stats += `</div>`;
  return stats;
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
  doc.text('Final Score:', 20, 105);
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
