// Ensure board is properly initialized
function ensureBoardInitialized() {
    if (!board || !Array.isArray(board) || board.length !== BOARD_SIZE) {
        console.log('Reinitializing board...');
        board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
        console.log('Board reinitialized:', board);
    }
}

// Load teams from localStorage
const player1TeamIds = JSON.parse(localStorage.getItem('player1Selections') || '[]');
const player2TeamIds = JSON.parse(localStorage.getItem('player2Selections') || '[]');

console.log('Loaded team IDs:', { player1TeamIds, player2TeamIds });

const player1Team = player1TeamIds.map(id => ({ ...getCharacter(id), id, player: 1 }));
const player2Team = player2TeamIds.map(id => ({ ...getCharacter(id), id, player: 2 }));

console.log('Loaded teams:', { player1Team, player2Team });

// Board state: 8x8 grid, null or champion object
const BOARD_SIZE = 8;
let board = null;

console.log('About to initialize board...');

try {
    board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    console.log('Board initialized successfully:', board);
    console.log('Board type:', typeof board);
    console.log('Board is array:', Array.isArray(board));
    console.log('Board length:', board.length);
    console.log('First row:', board[0]);
} catch (error) {
    console.error('Error initializing board:', error);
    board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

console.log('Board after initialization:', board);

// Place champions: Player 1 bottom row, Player 2 top row
if (player1Team && player1Team.length > 0) {
    console.log('Placing Player 1 team...');
    player1Team.forEach((champ, i) => {
        if (champ && BOARD_SIZE-1 >= 0 && i*2+1 < BOARD_SIZE) {
            console.log(`Placing ${champ.name} at position [${BOARD_SIZE-1}][${i*2+1}]`);
            board[BOARD_SIZE-1][i*2+1] = { ...champ, hp: champ.hp, hasMoved: false };
        }
    });
}

if (player2Team && player2Team.length > 0) {
    console.log('Placing Player 2 team...');
    player2Team.forEach((champ, i) => {
        if (champ && 0 < BOARD_SIZE && i*2+1 < BOARD_SIZE) {
            console.log(`Placing ${champ.name} at position [0][${i*2+1}]`);
            board[0][i*2+1] = { ...champ, hp: champ.hp, hasMoved: false };
        }
    });
}

console.log('Board after placing champions:', board);

let currentPlayer = 1;
let selected = null; // {x, y}
let possibleMoves = [];
let possibleAttacks = [];
let hasMovedThisTurn = false;

// Multiplayer logic for single shared board
let socket = null;

let lastTurnPlayer = null;

function serializeGameState() {
    return {
        board,
        currentPlayer,
        player1Team,
        player2Team
    };
}
function deserializeGameState(state) {
    console.log('deserializeGameState called with:', state);
    if (!state) {
        console.log('No state provided, returning early');
        return;
    }
    
    console.log('Previous board state:', board);
    console.log('New board state from server:', state.board);
    
    if (state.board && Array.isArray(state.board)) {
        board = state.board;
        console.log('Board updated from server');
    } else {
        console.error('Invalid board state from server:', state.board);
    }
    
    if (state.currentPlayer) {
        // Show turn overlay if the player changed
        if (lastTurnPlayer !== null && lastTurnPlayer !== state.currentPlayer) {
            showTurnOverlay(state.currentPlayer);
        }
        lastTurnPlayer = state.currentPlayer;
        currentPlayer = state.currentPlayer;
        console.log('Current player updated to:', currentPlayer);
        
        // Update the turn indicator when receiving state updates
        const turnIndicator = document.getElementById('game-turn-indicator');
        if (turnIndicator) {
            turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
            console.log('Turn indicator updated from server to:', turnIndicator.textContent);
        }
    }
    
    console.log('Final board state after deserialization:', board);
}

function sendGameState() {
    if (socket) {
        socket.emit('updateState', { state: serializeGameState() });
    }
}

// Patch onTileClick to always sync state after move/attack
const originalOnTileClick = onTileClick;
onTileClick = function(x, y) {
    const prevState = JSON.stringify(board);
    originalOnTileClick.call(this, x, y);
    if (JSON.stringify(board) !== prevState) {
        sendGameState();
    }
};

function setupMultiplayer() {
    socket = io();
    socket.on('update', ({ state }) => {
        deserializeGameState(state);
        renderBoard();
        renderSidebars();
    });
}

function isOwnChampion(champ) {
    return champ && champ.player === currentPlayer;
}

function isEnemyChampion(champ) {
    return champ && champ.player !== currentPlayer;
}

function resetChampionMoves() {
    console.log('resetChampionMoves called');
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y] && board[y][x]) {
                const champ = board[y][x];
                console.log(`Resetting ${champ.name} at [${x},${y}]`);
                champ.hasMoved = false;
                champ.hasAttacked = false;
            }
        }
    }
    console.log('All champion moves reset');
}

function renderBoard() {
    const boardDiv = document.getElementById('game-board');
    if (!boardDiv) {
        console.error('game-board element not found!');
        return;
    }
    
    // Ensure board is properly initialized
    ensureBoardInitialized();
    
    if (!board || !Array.isArray(board)) {
        console.error('Board is not properly initialized!');
        return;
    }
    
    boardDiv.innerHTML = '';
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const tile = document.createElement('div');
            tile.className = 'game-tile';
            // Add checkered pattern
            if ((x + y) % 2 === 1) tile.classList.add('checkered');
            tile.dataset.x = x;
            tile.dataset.y = y;
            if (selected && selected.x === x && selected.y === y) {
                tile.classList.add('selected');
            }
            if (possibleMoves.some(m => m.x === x && m.y === y)) {
                tile.classList.add('movable');
            }
            if (possibleAttacks.some(a => a.x === x && a.y === y)) {
                tile.classList.add('attackable');
            }
            if (board[y] && board[y][x]) {
                const champ = board[y][x];
                const img = document.createElement('img');
                img.src = champ.image;
                img.className = `champion-piece player${champ.player}`;
                img.alt = champ.name;
                // Add border color class based on element
                tile.classList.add(`${champ.element}-border`);
                tile.appendChild(img);
            }
            tile.addEventListener('click', () => onTileClick(x, y));
            boardDiv.appendChild(tile);
        }
    }
}

function onTileClick(x, y) {
    if (!board || !board[y]) {
        console.error('Board access error at position:', { x, y });
        return;
    }
    
    const champ = board[y][x];
    // Select your own champion if not already selected and hasn't moved/attacked
    if (!selected && champ && isOwnChampion(champ) && !champ.hasMoved && !champ.hasAttacked) {
        selected = { x, y };
        possibleMoves = getPossibleMoves(x, y, champ.movement);
        possibleAttacks = [];
        hasMovedThisTurn = false;
        renderBoard();
        return;
    }
    // Move to a possible tile
    if (selected && possibleMoves.some(m => m.x === x && m.y === y)) {
        const { x: sx, y: sy } = selected;
        if (board[sy] && board[sy][sx]) {
            board[y][x] = { ...board[sy][sx], hasMoved: true };
            board[sy][sx] = null;
            selected = { x, y };
            possibleMoves = [];
            // After moving, show possible attacks
            possibleAttacks = getPossibleAttacks(x, y);
            hasMovedThisTurn = true;
            renderBoard();
            console.log('Checking if turn should end after move with no attacks...');
            if (allChampionsMovedAndAttacked()) {
                console.log('All champions done after move, ending turn in 500ms...');
                setTimeout(() => {
                    endTurn();
                }, 500);
            } else {
                console.log('Not all champions done yet after move');
            }
        }
        return;
    }
    // Attack an adjacent enemy
    if (selected && possibleAttacks.some(a => a.x === x && a.y === y)) {
        const { x: sx, y: sy } = selected;
        if (board[sy] && board[sy][sx] && board[y] && board[y][x]) {
            const attacker = board[sy][sx];
            const defender = board[y][x];
            // Animate attack
            animateAttack(x, y, attacker.element, () => {
                const damage = calculateDamage(attacker, defender);
                console.log(`Attack: ${attacker.name} (${attacker.attack} ATK) attacks ${defender.name} (${defender.defense} DEF)`);
                console.log(`Damage calculated: ${damage}`);
                console.log(`Defender HP before: ${defender.hp}`);
                
                // Show floating damage number
                showDamageFloat(x, y, damage);
                
                defender.hp -= damage;
                console.log(`Defender HP after: ${defender.hp}`);
                
                // Remove defender if defeated
                if (defender.hp <= 0) {
                    console.log(`${defender.name} defeated!`);
                    board[y][x] = null;
                }
                // Mark attacker as finished
                board[sy][sx].hasAttacked = true;
                selected = null;
                possibleMoves = [];
                possibleAttacks = [];
                renderSidebars();
                renderBoard();
                
                // Synchronize the damage to other players
                console.log('Synchronizing damage to server...');
                sendGameState();
                
                // Check for victory
                if (checkVictory()) return;
                // End turn if all champions have acted
                console.log('Checking if turn should end after attack...');
                if (allChampionsMovedAndAttacked()) {
                    console.log('All champions done, ending turn in 500ms...');
                    setTimeout(() => {
                        endTurn();
                    }, 500);
                } else {
                    console.log('Not all champions done yet');
                }
            });
        }
        return;
    }
    // If just moved and there are no attackable enemies, mark as finished
    if (selected && hasMovedThisTurn && possibleAttacks.length === 0) {
        const { x: sx, y: sy } = selected;
        if (board[sy] && board[sy][sx]) {
            board[sy][sx].hasAttacked = true;
            selected = null;
            possibleMoves = [];
            possibleAttacks = [];
            renderBoard();
            if (allChampionsMovedAndAttacked()) {
                setTimeout(() => {
                    endTurn();
                }, 500);
            }
        }
        return;
    }
    // Deselect if clicking elsewhere
    selected = null;
    possibleMoves = [];
    possibleAttacks = [];
    renderBoard();
}

function getPossibleMoves(x, y, mov) {
    // BFS for all reachable tiles within mov, not through other pieces
    let visited = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(false));
    let queue = [{ x, y, dist: 0 }];
    visited[y][x] = true;
    let moves = [];
    while (queue.length) {
        const { x: cx, y: cy, dist } = queue.shift();
        if (dist > 0) moves.push({ x: cx, y: cy });
        if (dist === mov) continue;
        for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) {
            const nx = cx + dx, ny = cy + dy;
            if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && !visited[ny][nx] && !board[ny][nx]) {
                visited[ny][nx] = true;
                queue.push({ x: nx, y: ny, dist: dist + 1 });
            }
        }
    }
    return moves;
}

function getPossibleAttacks(x, y) {
    const result = [];
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
            const champ = board[ny][nx];
            if (champ && isEnemyChampion(champ)) {
                result.push({ x: nx, y: ny });
            }
        }
    }
    return result;
}

function calculateDamage(attacker, defender) {
    let base = attacker.attack - defender.defense;
    if (base < 1) base = 1;
    
    console.log(`Damage calculation: ${attacker.attack} ATK - ${defender.defense} DEF = ${base} base damage`);
    
    // Elemental advantage
    if (elementalAdvantages[attacker.element] === defender.element) {
        base = Math.floor(base * 1.5);
        console.log(`Elemental advantage! ${attacker.element} > ${defender.element}, damage increased to ${base}`);
    } else {
        console.log(`No elemental advantage. ${attacker.element} vs ${defender.element}`);
    }
    
    console.log(`Final damage: ${base}`);
    return base;
}

function allChampionsMovedAndAttacked() {
    console.log('Checking if all champions moved and attacked for player:', currentPlayer);
    let allDone = true;
    
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const champ = board[y][x];
            if (champ && champ.player === currentPlayer) {
                console.log(`Champion ${champ.name} at [${x},${y}]: hasMoved=${champ.hasMoved}, hasAttacked=${champ.hasAttacked}`);
                if (!champ.hasMoved || !champ.hasAttacked) {
                    allDone = false;
                }
            }
        }
    }
    
    console.log('All champions moved and attacked:', allDone);
    return allDone;
}

function checkVictory() {
    let p1 = 0, p2 = 0;
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const champ = board[y][x];
            if (champ) {
                if (champ.player === 1) p1++;
                if (champ.player === 2) p2++;
            }
        }
    }
    if (p1 === 0 || p2 === 0) {
        setTimeout(() => {
            alert(p1 === 0 && p2 === 0 ? 'Draw!' : p1 === 0 ? 'Player 2 Wins!' : 'Player 1 Wins!');
            window.location.href = 'index.html';
        }, 300);
        return true;
    }
    return false;
}

function showTurnOverlay(player) {
    // Remove any existing overlay
    let old = document.getElementById('turn-overlay');
    if (old) old.remove();
    const overlay = document.createElement('div');
    overlay.className = 'turn-overlay';
    overlay.id = 'turn-overlay';
    overlay.innerHTML = `<div class="turn-overlay-content">Player ${player}'s Turn!</div>`;
    document.body.appendChild(overlay);
    setTimeout(() => {
        overlay.remove();
    }, 1100);
}

function pulseTurnIndicator() {
    const el = document.getElementById('game-turn-indicator');
    el.classList.remove('pulse');
    void el.offsetWidth; // force reflow
    el.classList.add('pulse');
}

function endTurn() {
    console.log('endTurn called! Current player before change:', currentPlayer);
    
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    console.log('Current player after change:', currentPlayer);
    
    resetChampionMoves();
    selected = null;
    possibleMoves = [];
    possibleAttacks = [];
    hasMovedThisTurn = false;
    
    const turnIndicator = document.getElementById('game-turn-indicator');
    if (turnIndicator) {
        turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
        console.log('Turn indicator updated to:', turnIndicator.textContent);
    } else {
        console.error('Turn indicator element not found!');
    }
    
    pulseTurnIndicator();
    showTurnOverlay(currentPlayer);
    renderBoard();
    
    // Synchronize the turn change to all other clients
    console.log('Synchronizing turn change to server...');
    sendGameState();
    
    console.log('Turn transition complete');
}

function renderSidebars() {
    console.log('renderSidebars called');
    const p1Div = document.getElementById('player1-team');
    const p2Div = document.getElementById('player2-team');
    p1Div.innerHTML = '';
    p2Div.innerHTML = '';
    
    console.log('Rendering Player 1 team...');
    player1Team.forEach(champ => {
        const current = findChampionOnBoard(champ.id, 1);
        const hp = current ? current.hp : 0;
        const maxHp = champ.hp;
        const percent = Math.max(0, Math.min(1, hp / maxHp));
        console.log(`${champ.name}: ${hp}/${maxHp} HP (${Math.round(percent*100)}%)`);
        
        let barClass = '';
        if (percent <= 0.33) barClass = 'low';
        else if (percent <= 0.66) barClass = 'mid';
        const card = document.createElement('div');
        card.className = 'sidebar-champion-card';
        card.innerHTML = `
            <img src="${champ.image}" alt="${champ.name}">
            <div class="sidebar-champion-content">
                <div class="sidebar-champion-name">${champ.name}</div>
                <div class="sidebar-champion-element ${champ.element}">${champ.element}</div>
                <div class="sidebar-hp-bar">
                    <div class="sidebar-hp-bar-inner ${barClass}" style="width: ${percent*100}%"></div>
                    <span class="sidebar-hp-label">${hp} / ${maxHp}</span>
                </div>
                <div class="sidebar-champion-stats">
                    <span class="sidebar-champion-stat atk"><span class="sidebar-champion-stat-label">ATK</span> ${champ.attack}</span>
                    <span class="sidebar-champion-stat def"><span class="sidebar-champion-stat-label">DEF</span> ${champ.defense}</span>
                    <span class="sidebar-champion-stat mov"><span class="sidebar-champion-stat-label">MOV</span> ${champ.movement}</span>
                </div>
            </div>
        `;
        p1Div.appendChild(card);
    });
    
    console.log('Rendering Player 2 team...');
    player2Team.forEach(champ => {
        const current = findChampionOnBoard(champ.id, 2);
        const hp = current ? current.hp : 0;
        const maxHp = champ.hp;
        const percent = Math.max(0, Math.min(1, hp / maxHp));
        console.log(`${champ.name}: ${hp}/${maxHp} HP (${Math.round(percent*100)}%)`);
        
        let barClass = '';
        if (percent <= 0.33) barClass = 'low';
        else if (percent <= 0.66) barClass = 'mid';
        const card = document.createElement('div');
        card.className = 'sidebar-champion-card';
        card.innerHTML = `
            <img src="${champ.image}" alt="${champ.name}">
            <div class="sidebar-champion-content">
                <div class="sidebar-champion-name">${champ.name}</div>
                <div class="sidebar-champion-element ${champ.element}">${champ.element}</div>
                <div class="sidebar-hp-bar">
                    <div class="sidebar-hp-bar-inner ${barClass}" style="width: ${percent*100}%"></div>
                    <span class="sidebar-hp-label">${hp} / ${maxHp}</span>
                </div>
                <div class="sidebar-champion-stats">
                    <span class="sidebar-champion-stat atk"><span class="sidebar-champion-stat-label">ATK</span> ${champ.attack}</span>
                    <span class="sidebar-champion-stat def"><span class="sidebar-champion-stat-label">DEF</span> ${champ.defense}</span>
                    <span class="sidebar-champion-stat mov"><span class="sidebar-champion-stat-label">MOV</span> ${champ.movement}</span>
                </div>
            </div>
        `;
        p2Div.appendChild(card);
    });
}

function findChampionOnBoard(id, player) {
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const champ = board[y][x];
            if (champ && champ.id === id && champ.player === player) {
                return champ;
            }
        }
    }
    return null;
}

function animateAttack(x, y, element, callback) {
    const boardDiv = document.getElementById('game-board');
    const idx = y * BOARD_SIZE + x;
    const tile = boardDiv.children[idx];
    if (!tile) { callback(); return; }
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = `attack-anim ${element}`;
    tile.appendChild(overlay);
    setTimeout(() => {
        tile.removeChild(overlay);
        callback();
    }, 500);
}

// Helper to show floating damage numbers
function showDamageFloat(x, y, damage) {
    const boardDiv = document.getElementById('game-board');
    if (!boardDiv) return;
    const idx = y * BOARD_SIZE + x;
    const tile = boardDiv.children[idx];
    if (!tile) return;
    // Create damage float
    const float = document.createElement('div');
    float.className = 'damage-float';
    float.textContent = `-${damage}`;
    tile.style.position = 'relative';
    tile.appendChild(float);
    setTimeout(() => {
        if (float.parentNode) float.parentNode.removeChild(float);
    }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    renderBoard();
    renderSidebars();
    document.getElementById('game-turn-indicator').textContent = "Player 1's Turn";
    const restartBtn = document.getElementById('restart-game');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            localStorage.removeItem('player1Selections');
            localStorage.removeItem('player2Selections');
            window.location.href = 'index.html';
        });
    }
    setupMultiplayer();
}); 