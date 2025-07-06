// Load teams from localStorage
const player1TeamIds = JSON.parse(localStorage.getItem('player1Selections') || '[]');
const player2TeamIds = JSON.parse(localStorage.getItem('player2Selections') || '[]');

const player1Team = player1TeamIds.map(id => ({ ...getCharacter(id), id, player: 1 }));
const player2Team = player2TeamIds.map(id => ({ ...getCharacter(id), id, player: 2 }));

// Board state: 8x8 grid, null or champion object
const BOARD_SIZE = 8;
let board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));

// Place champions: Player 1 bottom row, Player 2 top row
player1Team.forEach((champ, i) => {
    board[BOARD_SIZE-1][i*2+1] = { ...champ, hp: champ.hp, hasMoved: false };
});
player2Team.forEach((champ, i) => {
    board[0][i*2+1] = { ...champ, hp: champ.hp, hasMoved: false };
});

let currentPlayer = 1;
let selected = null; // {x, y}
let possibleMoves = [];
let possibleAttacks = [];
let hasMovedThisTurn = false;

function isOwnChampion(champ) {
    return champ && champ.player === currentPlayer;
}

function isEnemyChampion(champ) {
    return champ && champ.player !== currentPlayer;
}

function resetChampionMoves() {
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x]) {
                board[y][x].hasMoved = false;
                board[y][x].hasAttacked = false;
            }
        }
    }
}

function renderBoard() {
    const boardDiv = document.getElementById('game-board');
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
            if (board[y][x]) {
                const champ = board[y][x];
                const img = document.createElement('img');
                img.src = champ.image;
                img.className = `champion-piece player${champ.player}`;
                img.alt = champ.name;
                tile.appendChild(img);
            }
            tile.addEventListener('click', () => onTileClick(x, y));
            boardDiv.appendChild(tile);
        }
    }
}

function onTileClick(x, y) {
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
        board[y][x] = { ...board[sy][sx], hasMoved: true };
        board[sy][sx] = null;
        selected = { x, y };
        possibleMoves = [];
        // After moving, show possible attacks
        possibleAttacks = getPossibleAttacks(x, y);
        hasMovedThisTurn = true;
        renderBoard();
        return;
    }
    // Attack an adjacent enemy
    if (selected && possibleAttacks.some(a => a.x === x && a.y === y)) {
        const { x: sx, y: sy } = selected;
        const attacker = board[sy][sx];
        const defender = board[y][x];
        // Animate attack
        animateAttack(x, y, attacker.element, () => {
            const damage = calculateDamage(attacker, defender);
            defender.hp -= damage;
            // Remove defender if defeated
            if (defender.hp <= 0) {
                board[y][x] = null;
            }
            // Mark attacker as finished
            board[sy][sx].hasAttacked = true;
            selected = null;
            possibleMoves = [];
            possibleAttacks = [];
            renderSidebars();
            renderBoard();
            // Check for victory
            if (checkVictory()) return;
            // End turn if all champions have acted
            if (allChampionsMovedAndAttacked()) {
                setTimeout(() => {
                    endTurn();
                }, 500);
            }
        });
        return;
    }
    // If just moved and there are no attackable enemies, mark as finished
    if (selected && hasMovedThisTurn && possibleAttacks.length === 0) {
        const { x: sx, y: sy } = selected;
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
    // Elemental advantage
    if (elementalAdvantages[attacker.element] === defender.element) {
        base = Math.floor(base * 1.5);
    }
    return base;
}

function allChampionsMovedAndAttacked() {
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const champ = board[y][x];
            if (champ && champ.player === currentPlayer && (!champ.hasMoved || !champ.hasAttacked)) return false;
        }
    }
    return true;
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
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    resetChampionMoves();
    selected = null;
    possibleMoves = [];
    possibleAttacks = [];
    hasMovedThisTurn = false;
    document.getElementById('game-turn-indicator').textContent = `Player ${currentPlayer}'s Turn`;
    pulseTurnIndicator();
    showTurnOverlay(currentPlayer);
    renderBoard();
}

function renderSidebars() {
    const p1Div = document.getElementById('player1-team');
    const p2Div = document.getElementById('player2-team');
    p1Div.innerHTML = '';
    p2Div.innerHTML = '';
    player1Team.forEach(champ => {
        const current = findChampionOnBoard(champ.id, 1);
        const hp = current ? current.hp : 0;
        const maxHp = champ.hp;
        const percent = Math.max(0, Math.min(1, hp / maxHp));
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
    player2Team.forEach(champ => {
        const current = findChampionOnBoard(champ.id, 2);
        const hp = current ? current.hp : 0;
        const maxHp = champ.hp;
        const percent = Math.max(0, Math.min(1, hp / maxHp));
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
}); 