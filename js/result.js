window.addEventListener('load', () => {
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
      const team = index === 0 ? (result.setup.firstBatting === 'A' ? result.setup.teamA : result.setup.teamB) : (result.setup.firstBatting === 'A' ? result.setup.teamB : result.setup.teamA);
      const li = document.createElement('li');
      li.textContent = `Innings ${index + 1} (${team}): ${rec.runs}/${rec.wickets} in ${rec.overs.toFixed(1)} overs`;
      finalInningsList.appendChild(li);
    });
  }
});
