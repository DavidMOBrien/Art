// Shared Draft system state (synchronized via server)
let socket = null;
let globalState = null;

// DOM elements
const characterGrid = document.getElementById('character-grid');
const player1Selected = document.getElementById('player1-selected');
const player2Selected = document.getElementById('player2-selected');
const turnIndicator = document.getElementById('turn-indicator');
const currentPlayerSpan = document.getElementById('current-player');
const pickNumberSpan = document.getElementById('pick-number');
const startGameBtn = document.getElementById('start-game');
const resetDraftBtn = document.getElementById('reset-draft');

function getDraft() { return globalState?.draft || {}; }
function getPhase() { return globalState?.phase || 'draft'; }

function renderDraft() {
    const draft = getDraft();
    console.log('renderDraft called with draft:', draft);
    console.log('Player 1 selections:', draft.player1Selections);
    console.log('Player 2 selections:', draft.player2Selections);
    console.log('Max picks:', draft.maxPicks);
    
    // Render grid and selections from shared state
    renderCharacterGrid();
    updateTurnIndicator();
    updateSelectedCharacters();
    
    const isComplete = draft.player1Selections.length === draft.maxPicks && draft.player2Selections.length === draft.maxPicks;
    console.log('Draft complete check:', isComplete);
    
    if (isComplete) {
        console.log('Calling completeDraft...');
        completeDraft();
    }
}

function renderCharacterGrid() {
    characterGrid.innerHTML = '';
    const draft = getDraft();
    
    // Group characters by element
    const elements = [
        { key: 'pyros', label: 'Pyros', color: '#fed7d7', text: '#c53030' },
        { key: 'aquos', label: 'Aquos', color: '#bee3f8', text: '#2b6cb0' },
        { key: 'ventos', label: 'Ventos', color: '#c6f6d5', text: '#2f855a' },
        { key: 'terros', label: 'Terros', color: '#fef5e7', text: '#d69e2e' },
        { key: 'haos', label: 'Haos', color: '#fffbeb', text: '#fbbf24' },
        { key: 'darkos', label: 'Darkos', color: '#f3f4f6', text: '#6b7280' }
    ];
    
    elements.forEach(element => {
        const charactersForElement = getCharactersByElement(element.key);
        
        const groupColumn = document.createElement('div');
        groupColumn.className = 'element-group-column';
        const groupHeader = document.createElement('div');
        groupHeader.className = 'element-group-header';
        groupHeader.style.background = element.color;
        groupHeader.style.color = element.text;
        groupHeader.innerHTML = `<span class="element-group-bar" style="background:${element.text}"></span> <span class="element-group-title">${element.label}</span>`;
        groupColumn.appendChild(groupHeader);
        const groupContainer = document.createElement('div');
        groupContainer.className = `element-group-container ${element.key}`;
        charactersForElement.forEach(character => {
            const card = createCharacterCard(character, draft);
            card.classList.add(element.key);
            groupContainer.appendChild(card);
        });
        groupColumn.appendChild(groupContainer);
        characterGrid.appendChild(groupColumn);
    });
}

function createCharacterCard(character, draft) {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.dataset.characterId = character.id;
    const isSelected = draft.player1Selections.includes(character.id) || draft.player2Selections.includes(character.id);
    if (isSelected) card.classList.add('disabled');
    card.innerHTML = `
        <img src="${character.image}" alt="${character.name}" class="character-image">
        <div class="character-name">${character.name}</div>
        <div class="character-element">
            <span class="element-badge element-${character.element}">${character.element}</span>
        </div>
        <div class="character-stats">
            HP: ${character.hp} | ATK: ${character.attack} | DEF: ${character.defense} | MOV: ${character.movement}
        </div>
    `;
    card.addEventListener('click', () => {
        if (!isSelected && getPhase() === 'draft') {
            selectCharacter(character.id);
        }
    });
    return card;
}

function selectCharacter(characterId) {
    const draft = { ...getDraft() };
    draft.selectedCharacterId = characterId;
    if (draft.currentPlayer === 1) {
        draft.player1Selections = [...draft.player1Selections, characterId];
    } else {
        draft.player2Selections = [...draft.player2Selections, characterId];
    }
    if (draft.player1Selections.length === draft.maxPicks && draft.player2Selections.length === draft.maxPicks) {
        // Draft complete, handled in renderDraft
    } else {
        draft.currentPlayer = draft.currentPlayer === 1 ? 2 : 1;
        draft.currentPick = Math.min(draft.player1Selections.length, draft.player2Selections.length) + 1;
    }
    // Broadcast new draft state
    socket.emit('updateState', { state: { ...globalState, draft } });
}

function updateTurnIndicator() {
    const draft = getDraft();
    if (!currentPlayerSpan || !pickNumberSpan) {
        console.error('currentPlayerSpan or pickNumberSpan not found!');
        return;
    }
    
    currentPlayerSpan.textContent = `Player ${draft.currentPlayer}'s Turn`;
    const totalPicks = draft.player1Selections.length + draft.player2Selections.length;
    const currentRound = Math.ceil((totalPicks + 1) / 2);
    pickNumberSpan.textContent = `${currentRound}`;
    
    // Update visual feedback for character cards
    const cards = document.querySelectorAll('.character-card');
    cards.forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.characterId === draft.selectedCharacterId) {
            card.classList.add('selected');
        }
    });
    
    // Update player section highlighting
    const player1Section = document.querySelector('.player-section:first-child');
    const player2Section = document.querySelector('.player-section:last-child');
    
    if (player1Section && player2Section) {
        player1Section.classList.remove('active');
        player2Section.classList.remove('active');
        
        if (draft.currentPlayer === 1) {
            player1Section.classList.add('active');
        } else {
            player2Section.classList.add('active');
        }
    }
}

function updateSelectedCharacters() {
    const draft = getDraft();
    // Update Player 1 selections
    player1Selected.innerHTML = '';
    for (let i = 0; i < draft.maxPicks; i++) {
        const slot = document.createElement('div');
        slot.className = 'character-slot';
        if (draft.player1Selections[i]) {
            const character = getCharacter(draft.player1Selections[i]);
            slot.innerHTML = `<img src="${character.image}" alt="${character.name}">`;
            slot.classList.add('selected');
        } else {
            slot.className = 'empty-slot';
            slot.textContent = 'Empty';
        }
        player1Selected.appendChild(slot);
    }
    
    // Update Player 2 selections
    player2Selected.innerHTML = '';
    for (let i = 0; i < draft.maxPicks; i++) {
        const slot = document.createElement('div');
        slot.className = 'character-slot';
        if (draft.player2Selections[i]) {
            const character = getCharacter(draft.player2Selections[i]);
            slot.innerHTML = `<img src="${character.image}" alt="${character.name}">`;
            slot.classList.add('selected');
        } else {
            slot.className = 'empty-slot';
            slot.textContent = 'Empty';
        }
        player2Selected.appendChild(slot);
    }
}

function completeDraft() {
    console.log('completeDraft called');
    console.log('startGameBtn:', startGameBtn);
    
    if (startGameBtn) {
        startGameBtn.disabled = false;
        startGameBtn.textContent = 'Start Battle';
        
        // Remove any existing click handlers and add new one
        startGameBtn.removeEventListener('click', startBattle);
        startGameBtn.addEventListener('click', startBattle);
        
        console.log('Button enabled, text changed to:', startGameBtn.textContent);
        console.log('Button disabled state:', startGameBtn.disabled);
        console.log('Click handler added to start button');
    } else {
        console.error('startGameBtn not found!');
    }
    
    if (currentPlayerSpan) {
        currentPlayerSpan.textContent = 'Draft Complete!';
    } else {
        console.error('currentPlayerSpan not found!');
    }
    
    if (pickNumberSpan) {
        pickNumberSpan.textContent = '3';
    } else {
        console.error('pickNumberSpan not found!');
    }
    
    if (turnIndicator) {
        turnIndicator.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
    } else {
        console.error('turnIndicator not found!');
    }
}

function startBattle() {
    console.log('Starting battle...');
    console.log('Current globalState:', globalState);
    console.log('Current draft:', getDraft());
    
    // Tell server to switch to battle phase
    socket.emit('updateState', { state: { ...globalState, phase: 'battle' } });
    
    // Store selections for game.js to use
    const draft = getDraft();
    localStorage.setItem('player1Selections', JSON.stringify(draft.player1Selections));
    localStorage.setItem('player2Selections', JSON.stringify(draft.player2Selections));
    
    console.log('Stored selections in localStorage');
    console.log('Navigating to game.html...');
    
    // Navigate to game page
    window.location.href = 'game.html';
}

function resetDraft() {
    socket.emit('resetGame');
}

function handlePhaseSwitch() {
    if (getPhase() === 'battle') {
        // Store selections for game.js to use
        const draft = getDraft();
        localStorage.setItem('player1Selections', JSON.stringify(draft.player1Selections));
        localStorage.setItem('player2Selections', JSON.stringify(draft.player2Selections));
        window.location.href = 'game.html';
    }
}

function setupDraftMultiplayer() {
    socket = io();
    
    socket.on('update', ({ state }) => {
        globalState = state;
        renderDraft();
        handlePhaseSwitch();
    });
    
    resetDraftBtn.addEventListener('click', resetDraft);
}

document.addEventListener('DOMContentLoaded', setupDraftMultiplayer);

// Export functions for potential use in other modules
window.DraftSystem = {
    getPlayer1Selections: () => getDraft().player1Selections,
    getPlayer2Selections: () => getDraft().player2Selections,
    getCurrentPlayer: () => getDraft().currentPlayer,
    getCurrentPick: () => getDraft().currentPick,
    isDraftComplete: () => getDraft().player1Selections.length === getDraft().maxPicks && getDraft().player2Selections.length === getDraft().maxPicks
}; 