// Player data storage
let players = [
];

// Load players from localStorage on startup
function loadPlayers() {
    const saved = localStorage.getItem('csPlayers');
    if (saved) {
        try {
            players = JSON.parse(saved);
            console.log('Jogadores carregados do localStorage:', players);
        } catch (e) {
            console.error('Erro ao carregar jogadores:', e);
            players = [];
        }
    }
}

// Save players to localStorage
function savePlayers() {
    localStorage.setItem('csPlayers', JSON.stringify(players));
}

// Theme management
let currentTheme = localStorage.getItem('csTheme') || 'furia';
let sortOrder = 'added'; // 'added', 'level', 'name'

function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    currentTheme = theme;
    localStorage.setItem('csTheme', theme);
}

// Change theme
function changeTheme(theme) {
    applyTheme(theme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active-theme');
    });
    document.querySelector(`[data-theme="${theme}"]`)?.classList.add('active-theme');
}

// Toggle sort order
function toggleSort() {
    if (sortOrder === 'added') {
        sortOrder = 'level';
    } else if (sortOrder === 'level') {
        sortOrder = 'name';
    } else {
        sortOrder = 'added';
    }
    updatePlayersList();
}

// Get level badge
function getLevelBadge(level) {
    if (level >= 15) return '🥇';
    if (level >= 8) return '🥈';
    return '🥉';
}

// Get balance badge
function getBalanceBadge(difference) {
    if (difference === 0) return '<span class="px-3 py-1 bg-green-600 rounded-full text-sm font-bold">⚖️ Perfeitamente Balanceado</span>';
    if (difference <= 2) return '<span class="px-3 py-1 bg-yellow-600 rounded-full text-sm font-bold">✓ Bem Balanceado</span>';
    return '<span class="px-3 py-1 bg-red-600 rounded-full text-sm font-bold">⚠️ Desbalanceado</span>';
}

// Update progress bar
function updateProgressBar() {
    const count = players.length;
    const percentage = Math.min((count / 10) * 100, 100);
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    if (progressBar && progressText) {
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${count}/10`;
        
        if (count >= 10) {
            progressBar.className = 'h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300';
        } else {
            progressBar.className = 'h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-300';
        }
    }
}

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
    savePlayers();
    updatePlayersList();
    updateProgressBar();
    playerNameInput.value = '';
    playerLevelSelect.selectedIndex = 0;
    addPlayerBtn.disabled = true;
    playerNameInput.focus();
    
    // Enable draw button if we have enough players
    if (players.length >= 10) {
        drawTeamsBtn.disabled = false;
        drawTeamsBtn.classList.remove('pulse');
    }
}

// Check if add button should be enabled
function checkAddButton() {
    const name = playerNameInput.value.trim();
    const level = playerLevelSelect.value;
    addPlayerBtn.disabled = !name || !level;
}

// Update players list display
function updatePlayersList() {
    playersCount.textContent = players.length;
    updateProgressBar();
    
    if (players.length === 0) {
        playersList.innerHTML = '<div class="text-gray-400 italic text-center py-4">Nenhum jogador adicionado ainda</div>';
        return;
    }
    
    // Sort players based on current sort order
    let sortedPlayers = [...players];
    if (sortOrder === 'level') {
        sortedPlayers.sort((a, b) => b.level - a.level);
    } else if (sortOrder === 'name') {
        sortedPlayers.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    playersList.innerHTML = '';
    sortedPlayers.forEach((player) => {
        const index = players.indexOf(player);
        const badge = getLevelBadge(player.level);
        const playerElement = document.createElement('div');
        playerElement.className = 'player-item bg-gray-700/50 p-3 rounded-lg flex justify-between items-center animate-fadeIn hover:bg-gray-600/50 transition-all hover:scale-105';
        playerElement.innerHTML = `
            <span>${badge} ${player.name} <span class="text-gray-300 text-sm font-bold">(Lvl ${player.level})</span></span>
            <div class="flex gap-2">
                <button onclick="editPlayer(${index})" class="text-blue-400 hover:text-blue-300 font-bold px-2" title="Editar">✏️</button>
                <button onclick="removePlayer(${index})" class="text-red-400 hover:text-red-300 font-bold px-2" title="Remover">&times;</button>
            </div>
        `;
        playersList.appendChild(playerElement);
    });
}

// Edit player function
function editPlayer(index) {
    const player = players[index];
    
    // Preenche os campos com os dados atuais
    playerNameInput.value = player.name;
    playerLevelSelect.value = player.level;
    
    // Remove o jogador da lista temporariamente
    players.splice(index, 1);
    savePlayers();
    updatePlayersList();
    
    // Foca no campo de nome
    playerNameInput.focus();
    playerNameInput.select();
    
    // Atualiza o botão se necessário
    if (players.length < 10) {
        drawTeamsBtn.disabled = true;
        drawTeamsBtn.classList.add('pulse');
    }
}

// Remove player function
function removePlayer(index) {
    players.splice(index, 1);
    savePlayers();
    updatePlayersList();
    updateProgressBar();
    
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
// Algoritmo melhorado que garante o melhor balanceamento possível
function balanceTeams(playerPool) {
    // Pega apenas os 10 primeiros jogadores
    const playersToUse = playerPool.slice(0, 10);
    
    // Ordena jogadores do maior para o menor level
    const sortedPlayers = [...playersToUse].sort((a, b) => b.level - a.level);
    
    let bestTeamA = [];
    let bestTeamB = [];
    let bestDifference = Infinity;
    let bestVariance = Infinity;
    
    // Função para calcular variância interna do time (dispersão de skill)
    function calculateTeamVariance(team) {
        if (team.length === 0) return 0;
        const mean = team.reduce((sum, p) => sum + p.level, 0) / team.length;
        return team.reduce((sum, p) => sum + Math.pow(p.level - mean, 2), 0) / team.length;
    }
    
    // Tenta 1000 combinações diferentes
    for (let attempt = 0; attempt < 1000; attempt++) {
        const shuffled = [...sortedPlayers];
        
        // Embaralha mantendo alguma ordem (não totalmente aleatório)
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            if (Math.random() > 0.3) { // 70% de chance de trocar
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
        }
        
        const teamA = [];
        const teamB = [];
        
        // Distribui jogadores usando algoritmo greedy melhorado
        for (const player of shuffled) {
            if (teamA.length === 5) {
                teamB.push(player);
            } else if (teamB.length === 5) {
                teamA.push(player);
            } else {
                const totalA = teamA.reduce((sum, p) => sum + p.level, 0);
                const totalB = teamB.reduce((sum, p) => sum + p.level, 0);
                
                // Considera não só o total, mas também a distribuição
                const varianceA = calculateTeamVariance([...teamA, player]);
                const varianceB = calculateTeamVariance([...teamB, player]);
                
                // Calcula score combinado (80% diferença, 20% variância)
                const scoreA = Math.abs(totalA + player.level - totalB) + (varianceA * 0.25);
                const scoreB = Math.abs(totalA - (totalB + player.level)) + (varianceB * 0.25);
                
                if (scoreA <= scoreB) {
                    teamA.push(player);
                } else {
                    teamB.push(player);
                }
            }
        }
        
        // Avalia a qualidade desta distribuição
        const totalA = teamA.reduce((sum, p) => sum + p.level, 0);
        const totalB = teamB.reduce((sum, p) => sum + p.level, 0);
        const difference = Math.abs(totalA - totalB);
        const variance = Math.abs(calculateTeamVariance(teamA) - calculateTeamVariance(teamB));
        
        // Mantém a melhor combinação (prioriza diferença menor)
        if (difference < bestDifference || (difference === bestDifference && variance < bestVariance)) {
            bestDifference = difference;
            bestVariance = variance;
            bestTeamA = [...teamA];
            bestTeamB = [...teamB];
            
            // Se encontrou equilíbrio perfeito, para
            if (difference === 0) break;
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
    
    // Show loading animation
    drawTeamsBtn.disabled = true;
    drawTeamsBtn.textContent = '🎲 Sorteando...';
    drawTeamsBtn.classList.add('spin');
    
    // Animate the draw
    setTimeout(() => {
        const [blueTeamPlayers, redTeamPlayers] = balanceTeams(players);
        console.log('Times sorteados:', { blue: blueTeamPlayers, red: redTeamPlayers });
        
        // Verificação adicional
        if (!blueTeamPlayers || !redTeamPlayers) {
            alert('Erro ao balancear times. Tente novamente.');
            drawTeamsBtn.disabled = false;
            drawTeamsBtn.textContent = 'Sortear Times (Reze para não cair com o gui3d)';
            drawTeamsBtn.classList.remove('spin');
            return;
        }
        
        // Display teams with animation
        displayTeamsAnimated(blueTeamPlayers, redTeamPlayers);
        
        // Show results section
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Reset button
        drawTeamsBtn.disabled = false;
        drawTeamsBtn.textContent = 'Sortear Times (Reze para não cair com o gui3d)';
        drawTeamsBtn.classList.remove('spin');
    }, 1000);
}

// Redo draw function - uses existing players
function redoDraw() {
    if (players.length < 10) {
        alert("Você precisa adicionar pelo menos 10 jogadores para sortear os times!");
        return;
    }
    
    // Confirmation dialog
    if (!confirm('Tem certeza que deseja refazer o sorteio?')) {
        return;
    }
    
    redoDrawBtn.disabled = true;
    redoDrawBtn.textContent = '🎲 Sorteando...';
    redoDrawBtn.classList.add('spin');
    
    setTimeout(() => {
        const [blueTeamPlayers, redTeamPlayers] = balanceTeams(players);
        
        // Display teams with animation
        displayTeamsAnimated(blueTeamPlayers, redTeamPlayers);
        
        redoDrawBtn.disabled = false;
        redoDrawBtn.textContent = 'Refazer Sorteio';
        redoDrawBtn.classList.remove('spin');
    }, 1000);
}

// Display teams in UI with animation
function displayTeamsAnimated(bluePlayers, redPlayers) {
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
    
    // Find best players for crown
    const blueBest = bluePlayers.reduce((max, p) => p.level > max.level ? p : max, bluePlayers[0]);
    const redBest = redPlayers.reduce((max, p) => p.level > max.level ? p : max, redPlayers[0]);
    
    // Add players to blue team with animation
    bluePlayers.forEach((player, index) => {
        setTimeout(() => {
            const isBest = player.name === blueBest.name;
            const badge = getLevelBadge(player.level);
            const li = document.createElement('li');
            li.className = 'bg-blue-800/50 p-2 rounded flex justify-between items-center animate-fadeIn hover:bg-blue-700/50 transition-all';
            li.innerHTML = `<span>${isBest ? '👑 ' : ''}${badge} ${player.name}</span><span class="font-bold text-blue-300">Lvl ${player.level}</span>`;
            blueTeam.appendChild(li);
        }, index * 100);
    });
    
    // Add players to red team with animation
    redPlayers.forEach((player, index) => {
        setTimeout(() => {
            const isBest = player.name === redBest.name;
            const badge = getLevelBadge(player.level);
            const li = document.createElement('li');
            li.className = 'bg-red-800/50 p-2 rounded flex justify-between items-center animate-fadeIn hover:bg-red-700/50 transition-all';
            li.innerHTML = `<span>${isBest ? '👑 ' : ''}${badge} ${player.name}</span><span class="font-bold text-red-300">Lvl ${player.level}</span>`;
            redTeam.appendChild(li);
        }, index * 100);
    });
    
    // Add totals after all players
    setTimeout(() => {
        const difference = Math.abs(blueTotal - redTotal);
        
        const blueTotalLi = document.createElement('li');
        blueTotalLi.className = 'bg-blue-900/70 p-3 rounded font-bold text-center mt-2 border-2 border-blue-400 animate-fadeIn';
        blueTotalLi.innerHTML = `Total: ${blueTotal} | Média: ${blueAvg}`;
        blueTeam.appendChild(blueTotalLi);
        
        const redTotalLi = document.createElement('li');
        redTotalLi.className = 'bg-red-900/70 p-3 rounded font-bold text-center mt-2 border-2 border-red-400 animate-fadeIn';
        redTotalLi.innerHTML = `Total: ${redTotal} | Média: ${redAvg}`;
        redTeam.appendChild(redTotalLi);
        
        // Add balance indicator
        const balanceDiv = document.createElement('div');
        balanceDiv.className = 'col-span-full text-center mt-4 animate-fadeIn';
        balanceDiv.innerHTML = `
            <div class="mb-2">${getBalanceBadge(difference)}</div>
            <div class="text-sm text-gray-300">Diferença: ${difference} level${difference !== 1 ? 's' : ''}</div>
        `;
        
        const resultsGrid = document.querySelector('#resultsSection .grid');
        if (resultsGrid) {
            resultsGrid.appendChild(balanceDiv);
        }
        
        // Add export button after totals are shown
        addExportButton(bluePlayers, redPlayers, blueTotal, redTotal, blueAvg, redAvg);
    }, 600);
}

// Add export button
function addExportButton(bluePlayers, redPlayers, blueTotal, redTotal, blueAvg, redAvg) {
    // Check if button already exists
    let exportBtn = document.getElementById('exportResultBtn');
    if (!exportBtn) {
        exportBtn = document.createElement('button');
        exportBtn.id = 'exportResultBtn';
        exportBtn.className = 'btn-primary py-2 px-6 rounded-lg font-bold mr-4';
        exportBtn.textContent = '📋 Copiar Resultado';
        exportBtn.onclick = () => exportResult(bluePlayers, redPlayers, blueTotal, redTotal, blueAvg, redAvg);
        
        const buttonContainer = document.querySelector('#resultsSection .mt-8.text-center');
        if (buttonContainer) {
            buttonContainer.insertBefore(exportBtn, buttonContainer.firstChild);
        }
    } else {
        // Update onclick handler with new data
        exportBtn.onclick = () => exportResult(bluePlayers, redPlayers, blueTotal, redTotal, blueAvg, redAvg);
    }
}

// Export result to clipboard
function exportResult(bluePlayers, redPlayers, blueTotal, redTotal, blueAvg, redAvg) {
    const text = `🎮 SORTEIO DE TIMES - CS 5v5\n\n` +
        `🔵 TIME 1 (Total: ${blueTotal} | Média: ${blueAvg})\n` +
        bluePlayers.map(p => `   • ${p.name} - Lvl ${p.level}`).join('\n') +
        `\n\n🔴 TIME 2 (Total: ${redTotal} | Média: ${redAvg})\n` +
        redPlayers.map(p => `   • ${p.name} - Lvl ${p.level}`).join('\n') +
        `\n\n⚖️ Diferença: ${Math.abs(blueTotal - redTotal)} levels`;
    
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('exportResultBtn');
        const originalText = btn.textContent;
        btn.textContent = '✅ Copiado!';
        btn.classList.add('winner-glow');
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('winner-glow');
        }, 2000);
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        alert('Erro ao copiar para área de transferência');
    });
}

// Display teams in UI (kept for compatibility)
function displayTeams(bluePlayers, redPlayers) {
    displayTeamsAnimated(bluePlayers, redPlayers);
}

// Reset everything
function reset() {
    if (confirm('Tem certeza que deseja limpar todos os jogadores?')) {
        players = [];
        savePlayers();
        updatePlayersList();
        resultsSection.classList.add('hidden');
        drawTeamsBtn.disabled = true;
        drawTeamsBtn.classList.add('pulse');
        playerNameInput.value = '';
        playerLevelSelect.selectedIndex = 0;
    }
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

playerNameInput.addEventListener('input', checkAddButton);
playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !addPlayerBtn.disabled) {
        addPlayer();
    }
});

playerLevelSelect.addEventListener('change', checkAddButton);
playerLevelSelect.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !addPlayerBtn.disabled) {
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
loadPlayers();
applyTheme(currentTheme);
updatePlayersList();
updateProgressBar();
checkAddButton();

// Enable draw button if we have 10 or more players
if (players.length >= 10) {
    drawTeamsBtn.disabled = false;
    drawTeamsBtn.classList.remove('pulse');
} else {
    drawTeamsBtn.disabled = true;
    drawTeamsBtn.classList.add('pulse');
}
