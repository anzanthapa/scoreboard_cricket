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
});
