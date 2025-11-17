// Player data storage
// let players = [
//     { name: "João", level: 15 },
//     { name: "Maria", level: 12 },
//     { name: "Pedro", level: 18 },
//     { name: "Ana", level: 10 },
//     { name: "Carlos", level: 14 },
//     { name: "Juliana", level: 16 },
//     { name: "Lucas", level: 11 },
//     { name: "Fernanda", level: 13 },
//     { name: "Rafael", level: 17 },
//     { name: "Beatriz", level: 9 }
// ];

// DOM Elements
const playerNameInput = document.getElementById('playerName');
const playerLevelSelect = document.getElementById('playerLevel');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const drawTeamsBtn = document.getElementById('drawTeamsBtn');
const redoDrawBtn = document.getElementById('redoDrawBtn');
const playersList = document.getElementById('playersList');
const playersCount = document.getElementById('playersCount');
const resultsSection = document.getElementById('resultsSection');
const blueTeam = document.getElementById('blueTeam');
const redTeam = document.getElementById('redTeam');

// Captain Draw Elements
const captain1Input = document.getElementById('captain1Name');
const captain2Input = document.getElementById('captain2Name');
const drawCaptainBtn = document.getElementById('drawCaptainBtn');
const captainResult = document.getElementById('captainResult');
const winnerName = document.getElementById('winnerName');

// Pick/Ban Elements
const team1NameInput = document.getElementById('team1Name');
const team2NameInput = document.getElementById('team2Name');
const startPickBanBtn = document.getElementById('startPickBanBtn');
const pickBanInterface = document.getElementById('pickBanInterface');
const currentTurnEl = document.getElementById('currentTurn');
const currentActionEl = document.getElementById('currentAction');
const actionHistoryEl = document.getElementById('actionHistory');
const resetPickBanBtn = document.getElementById('resetPickBanBtn');
const pickBanResult = document.getElementById('pickBanResult');
const finalMapEl = document.getElementById('finalMap');
const mapCards = document.querySelectorAll('.map-card');

// Pick/Ban State
let pickBanState = {
    team1: '',
    team2: '',
    currentTeam: 1,
    phase: 0, // 0: ban, 1: ban, 2: ban, 3: ban, 4: ban, 5: ban, 6: remaining map is picked
    bannedMaps: [],
    pickedMap: null,
    history: []
};

// Pick/Ban Functions
function startPickBan() {
    const team1 = team1NameInput.value.trim();
    const team2 = team2NameInput.value.trim();

    if (!team1 || !team2) {
        alert('Preencha os nomes dos dois times!');
        return;
    }

    if (team1.toLowerCase() === team2.toLowerCase()) {
        alert('Os times precisam ter nomes diferentes!');
        return;
    }

    // Initialize state
    pickBanState.team1 = team1;
    pickBanState.team2 = team2;
    pickBanState.currentTeam = 1;
    pickBanState.phase = 0;
    pickBanState.bannedMaps = [];
    pickBanState.pickedMap = null;
    pickBanState.history = [];

    // Show interface
    pickBanInterface.classList.remove('hidden');
    pickBanResult.classList.add('hidden');
    actionHistoryEl.innerHTML = '<p class="text-gray-400 italic text-sm">Nenhuma ação ainda</p>';
    
    // Reset all map cards
    mapCards.forEach(card => {
        card.classList.remove('banned', 'picked', 'active');
        card.querySelector('.map-status').textContent = '';
    });

    updatePickBanUI();
    pickBanInterface.scrollIntoView({ behavior: 'smooth' });
}

function updatePickBanUI() {
    const currentTeamName = pickBanState.currentTeam === 1 ? pickBanState.team1 : pickBanState.team2;
    currentTurnEl.textContent = currentTeamName;
    
    if (pickBanState.phase < 6) {
        currentActionEl.textContent = '🚫 BANIR um mapa';
    }

    // Highlight available maps
    mapCards.forEach(card => {
        if (!card.classList.contains('banned')) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

function handleMapClick(event) {
    const card = event.currentTarget;
    const mapName = card.dataset.map;

    // Check if map is already banned or picked
    if (card.classList.contains('banned') || card.classList.contains('picked')) {
        return;
    }

    // Check if pick/ban is active
    if (pickBanInterface.classList.contains('hidden')) {
        return;
    }

    // Ban the map
    if (pickBanState.phase < 6) {
        banMap(card, mapName);
    }
}

function banMap(card, mapName) {
    const currentTeamName = pickBanState.currentTeam === 1 ? pickBanState.team1 : pickBanState.team2;
    
    // Add to banned maps
    pickBanState.bannedMaps.push(mapName);
    card.classList.add('banned');
    card.classList.remove('active');
    card.querySelector('.map-status').textContent = '❌ BANIDO';

    // Add to history
    const historyItem = document.createElement('div');
    historyItem.className = 'text-sm bg-red-900/30 p-2 rounded';
    historyItem.innerHTML = `<strong>${currentTeamName}</strong> baniu <strong>${mapName}</strong>`;
    
    if (actionHistoryEl.querySelector('.text-gray-400')) {
        actionHistoryEl.innerHTML = '';
    }
    actionHistoryEl.appendChild(historyItem);
    pickBanState.history.push({ team: currentTeamName, action: 'ban', map: mapName });

    // Move to next phase
    pickBanState.phase++;

    // Check if we reached the final map
    if (pickBanState.phase === 6) {
        // Find the remaining map
        const remainingMap = Array.from(mapCards).find(card => !card.classList.contains('banned'));
        if (remainingMap) {
            pickMap(remainingMap, remainingMap.dataset.map);
        }
        return;
    }

    // Alternate teams
    pickBanState.currentTeam = pickBanState.currentTeam === 1 ? 2 : 1;
    updatePickBanUI();
}

function pickMap(card, mapName) {
    pickBanState.pickedMap = mapName;
    card.classList.add('picked');
    card.classList.remove('active');
    card.querySelector('.map-status').textContent = '✅ ESCOLHIDO';

    // Show final result
    finalMapEl.textContent = mapName;
    pickBanResult.classList.remove('hidden');
    currentActionEl.textContent = '✅ Processo finalizado!';
    
    // Remove active state from all cards
    mapCards.forEach(c => c.classList.remove('active'));

    // Add to history
    const historyItem = document.createElement('div');
    historyItem.className = 'text-sm bg-green-900/30 p-2 rounded font-bold';
    historyItem.innerHTML = `🎮 Mapa final: <strong>${mapName}</strong>`;
    actionHistoryEl.appendChild(historyItem);

    pickBanResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function resetPickBan() {
    pickBanInterface.classList.add('hidden');
    pickBanResult.classList.add('hidden');
    
    // Reset all map cards
    mapCards.forEach(card => {
        card.classList.remove('banned', 'picked', 'active');
        card.querySelector('.map-status').textContent = '';
    });

    // Reset state
    pickBanState = {
        team1: '',
        team2: '',
        currentTeam: 1,
        phase: 0,
        bannedMaps: [],
        pickedMap: null,
        history: []
    };
}

// Captain Draw Function
function drawCaptain() {
    const captain1 = captain1Input.value.trim();
    const captain2 = captain2Input.value.trim();

    if (!captain1 || !captain2) {
        alert('Preencha os nomes dos dois capitães!');
        return;
    }

    if (captain1.toLowerCase() === captain2.toLowerCase()) {
        alert('Os capitães precisam ter nomes diferentes!');
        return;
    }

    // Add spin animation to button
    drawCaptainBtn.classList.add('spin');

    // Random selection after a short delay
    setTimeout(() => {
        const winner = Math.random() < 0.5 ? captain1 : captain2;
        winnerName.textContent = winner;
        captainResult.classList.remove('hidden');
        captainResult.classList.add('winner-glow');
        
        // Remove spin animation
        drawCaptainBtn.classList.remove('spin');
        
        // Scroll to result
        captainResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Remove glow after animation
        setTimeout(() => {
            captainResult.classList.remove('winner-glow');
        }, 1000);
    }, 500);
}

// Add player function
function addPlayer() {
    const name = playerNameInput.value.trim();
    const level = playerLevelSelect.value;

    if (!name) {
        alert('Bota um nome decente aí!');
        return;
    }

    if (!level) {
        alert('Seleciona o level primeiro, sem migué.');
        return;
    }

    const alreadyExists = players.some(player => player.name.toLowerCase() === name.toLowerCase());
    if (alreadyExists) {
        alert('Esse ser humaninho já tá na lista.');
        return;
    }

    players.push({ name, level: parseInt(level) });
    updatePlayersList();
    playerNameInput.value = '';
    playerLevelSelect.selectedIndex = 0;
    playerNameInput.focus();
    
    // Enable draw button if we have enough players
    if (players.length >= 10) {
        drawTeamsBtn.disabled = false;
        drawTeamsBtn.classList.remove('pulse');
    }
}

// Update players list display
function updatePlayersList() {
    playersCount.textContent = players.length;
    
    if (players.length === 0) {
        playersList.innerHTML = '<div class="text-gray-400 italic text-center py-4">Nenhum jogador adicionado ainda</div>';
        return;
    }
    
    playersList.innerHTML = '';
    players.forEach((player, index) => {
        const playerElement = document.createElement('div');
        playerElement.className = 'player-item bg-gray-700/50 p-3 rounded-lg flex justify-between items-center animate-fadeIn';
        playerElement.innerHTML = `
            <span>${player.name} <span class="text-gray-300 text-sm">(${player.level})</span></span>
            <button onclick="removePlayer(${index})" class="text-red-400 hover:text-red-300">&times;</button>
        `;
        playersList.appendChild(playerElement);
    });
}

// Remove player function
function removePlayer(index) {
    players.splice(index, 1);
    updatePlayersList();
    
    // Disable draw button if we don't have enough players anymore
    if (players.length < 10) {
        drawTeamsBtn.disabled = true;
        drawTeamsBtn.classList.add('pulse');
    }
}

// Shuffle array function (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Balanceia times usando algoritmo otimizado para níveis Gamersclub (1-21)
// Com níveis de 1 a 21, a diferença entre jogadores pode ser muito grande
// Prioriza distribuição equilibrada considerando skill gaps
function balanceTeams(playerPool) {
    // Pega apenas os 10 primeiros jogadores
    const playersToUse = playerPool.slice(0, 10);
    
    let bestTeamA = [];
    let bestTeamB = [];
    let bestDifference = Infinity;
    
    // Tenta 500 combinações para encontrar o melhor equilíbrio
    for (let attempt = 0; attempt < 500; attempt++) {
        const shuffledPlayers = [...playersToUse];
        shuffleArray(shuffledPlayers);
        
        // Ordena do maior para o menor level
        shuffledPlayers.sort((a, b) => b.level - a.level);
        
        const teamA = [];
        const teamB = [];
        
        // Distribui jogadores alternadamente, sempre colocando no time com menor total
        for (let i = 0; i < shuffledPlayers.length; i++) {
            const player = shuffledPlayers[i];
            
            // Se um time já tem 5, adiciona ao outro
            if (teamA.length === 5) {
                teamB.push(player);
            } else if (teamB.length === 5) {
                teamA.push(player);
            } else {
                // Calcula total atual de cada time
                const totalA = teamA.reduce((sum, p) => sum + p.level, 0);
                const totalB = teamB.reduce((sum, p) => sum + p.level, 0);
                
                // Adiciona ao time com menor total
                if (totalA <= totalB) {
                    teamA.push(player);
                } else {
                    teamB.push(player);
                }
            }
        }
        
        // Calcula a diferença de level total
        const totalA = teamA.reduce((sum, p) => sum + p.level, 0);
        const totalB = teamB.reduce((sum, p) => sum + p.level, 0);
        const difference = Math.abs(totalA - totalB);
        
        // Mantém a melhor combinação
        if (difference < bestDifference) {
            bestDifference = difference;
            bestTeamA = [...teamA];
            bestTeamB = [...teamB];
            
            // Se encontrou equilíbrio perfeito (diferença 0 ou 1), para
            if (difference <= 1) break;
        }
    }
    
    return [bestTeamA, bestTeamB];
}

// Calcula variância para medir dispersão de skill no time
function calculateVariance(levels) {
    if (levels.length === 0) return 0;
    const mean = levels.reduce((sum, level) => sum + level, 0) / levels.length;
    const squaredDiffs = levels.map(level => Math.pow(level - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / levels.length;
}

// Draw teams function with improved logic
function drawTeams() {
    if (players.length < 10) {
        alert("Você precisa adicionar pelo menos 10 jogadores para sortear os times!");
        return;
    }
    
    console.log('Sorteando times com jogadores:', players);
    const [blueTeamPlayers, redTeamPlayers] = balanceTeams(players);
    console.log('Times sorteados:', { blue: blueTeamPlayers, red: redTeamPlayers });
    
    // Verificação adicional
    if (!blueTeamPlayers || !redTeamPlayers) {
        alert('Erro ao balancear times. Tente novamente.');
        return;
    }
    
    // Display teams
    displayTeams(blueTeamPlayers, redTeamPlayers);
    
    // Show results section
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Highlight the first team member
    setTimeout(() => {
        const firstPlayer = blueTeam.querySelector('li');
        if (firstPlayer) {
            firstPlayer.classList.add('highlight');
        }
    }, 500);
}

// Redo draw function - uses existing players
function redoDraw() {
    if (players.length < 10) {
        alert("Você precisa adicionar pelo menos 10 jogadores para sortear os times!");
        return;
    }
    
    const [blueTeamPlayers, redTeamPlayers] = balanceTeams(players);
    
    // Display teams
    displayTeams(blueTeamPlayers, redTeamPlayers);
    
    // Highlight the first team member
    setTimeout(() => {
        const firstPlayer = blueTeam.querySelector('li');
        if (firstPlayer) {
            firstPlayer.classList.add('highlight');
        }
    }, 500);
}

// Display teams in UI
function displayTeams(bluePlayers, redPlayers) {
    // Verificação de segurança
    if (!bluePlayers || !redPlayers || bluePlayers.length === 0 || redPlayers.length === 0) {
        console.error('Erro: Times vazios ou indefinidos', { bluePlayers, redPlayers });
        alert('Erro ao sortear times. Tente novamente.');
        return;
    }
    
    // Clear existing content
    blueTeam.innerHTML = '';
    redTeam.innerHTML = '';
    
    // Calculate totals
    const blueTotal = bluePlayers.reduce((sum, p) => sum + p.level, 0);
    const redTotal = redPlayers.reduce((sum, p) => sum + p.level, 0);
    const blueAvg = (blueTotal / bluePlayers.length).toFixed(1);
    const redAvg = (redTotal / redPlayers.length).toFixed(1);
    
    // Add players to blue team
    bluePlayers.forEach(player => {
        const li = document.createElement('li');
        li.className = 'bg-blue-800/50 p-2 rounded flex justify-between items-center';
        li.innerHTML = `<span>${player.name}</span><span class="font-bold text-blue-300">Lvl ${player.level}</span>`;
        blueTeam.appendChild(li);
    });
    
    // Add total for blue team
    const blueTotalLi = document.createElement('li');
    blueTotalLi.className = 'bg-blue-900/70 p-3 rounded font-bold text-center mt-2 border-2 border-blue-400';
    blueTotalLi.innerHTML = `Total: ${blueTotal} | Média: ${blueAvg}`;
    blueTeam.appendChild(blueTotalLi);
    
    // Add players to red team
    redPlayers.forEach(player => {
        const li = document.createElement('li');
        li.className = 'bg-red-800/50 p-2 rounded flex justify-between items-center';
        li.innerHTML = `<span>${player.name}</span><span class="font-bold text-red-300">Lvl ${player.level}</span>`;
        redTeam.appendChild(li);
    });
    
    // Add total for red team
    const redTotalLi = document.createElement('li');
    redTotalLi.className = 'bg-red-900/70 p-3 rounded font-bold text-center mt-2 border-2 border-red-400';
    redTotalLi.innerHTML = `Total: ${redTotal} | Média: ${redAvg}`;
    redTeam.appendChild(redTotalLi);
}

// Reset everything
function reset() {
    players = [];
    updatePlayersList();
    resultsSection.classList.add('hidden');
    drawTeamsBtn.disabled = true;
    drawTeamsBtn.classList.add('pulse');
    playerNameInput.value = '';
    playerLevelSelect.selectedIndex = 0;
}

// Event Listeners
addPlayerBtn.addEventListener('click', addPlayer);
drawTeamsBtn.addEventListener('click', drawTeams);
redoDrawBtn.addEventListener('click', redoDraw);
drawCaptainBtn.addEventListener('click', drawCaptain);
startPickBanBtn.addEventListener('click', startPickBan);
resetPickBanBtn.addEventListener('click', resetPickBan);

// Add click handlers to map cards
mapCards.forEach(card => {
    card.addEventListener('click', handleMapClick);
});

// Tab Navigation
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Show corresponding tab content
        const activeTab = document.getElementById(tabName + 'Tab');
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // If results section should be shown (for teams tab)
        if (tabName === 'teams' && !resultsSection.classList.contains('hidden')) {
            resultsSection.classList.add('active');
        }
    });
});

playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addPlayer();
    }
});

playerLevelSelect.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addPlayer();
    }
});

captain1Input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        captain2Input.focus();
    }
});

captain2Input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        drawCaptain();
    }
});

// Initialize
updatePlayersList();
// Habilita o botão de sortear já que temos 10 jogadores de teste
drawTeamsBtn.disabled = false;
drawTeamsBtn.classList.remove('pulse');
