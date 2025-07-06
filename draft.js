// Draft system state
let currentPlayer = 1;
let currentPick = 1;
let maxPicks = 3;
let player1Selections = [];
let player2Selections = [];
let selectedCharacterId = null;

// DOM elements
const characterGrid = document.getElementById('character-grid');
const player1Selected = document.getElementById('player1-selected');
const player2Selected = document.getElementById('player2-selected');
const turnIndicator = document.getElementById('turn-indicator');
const currentPlayerSpan = document.getElementById('current-player');
const pickNumberSpan = document.getElementById('pick-number');
const startGameBtn = document.getElementById('start-game');
const resetDraftBtn = document.getElementById('reset-draft');

// Initialize the draft system
function initDraft() {
    console.log('Initializing draft system...');
    console.log('DOM elements found:', {
        characterGrid: !!characterGrid,
        player1Selected: !!player1Selected,
        player2Selected: !!player2Selected,
        turnIndicator: !!turnIndicator,
        currentPlayerSpan: !!currentPlayerSpan,
        pickNumberSpan: !!pickNumberSpan,
        startGameBtn: !!startGameBtn,
        resetDraftBtn: !!resetDraftBtn
    });
    
    renderCharacterGrid();
    updateTurnIndicator();
    updateSelectedCharacters();
    
    // Event listeners
    startGameBtn.addEventListener('click', startGame);
    resetDraftBtn.addEventListener('click', resetDraft);
}

// Render the character grid
function renderCharacterGrid() {
    characterGrid.innerHTML = '';
    
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
        // Create a column for this element
        const groupColumn = document.createElement('div');
        groupColumn.className = 'element-group-column';
        
        // Create element header
        const groupHeader = document.createElement('div');
        groupHeader.className = 'element-group-header';
        groupHeader.style.background = element.color;
        groupHeader.style.color = element.text;
        groupHeader.innerHTML = `<span class=\"element-group-bar\" style=\"background:${element.text}\"></span> <span class=\"element-group-title\">${element.label}</span>`;
        groupColumn.appendChild(groupHeader);
        
        // Create a group container with element class
        const groupContainer = document.createElement('div');
        groupContainer.className = `element-group-container ${element.key}`;
        
        // Add all characters of this element
        getCharactersByElement(element.key).forEach(character => {
            const card = createCharacterCard(character);
            card.classList.add(element.key); // Add element class to card
            groupContainer.appendChild(card);
        });
        groupColumn.appendChild(groupContainer);
        characterGrid.appendChild(groupColumn);
    });
}

// Create a character card element
function createCharacterCard(character) {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.dataset.characterId = character.id;
    
    // Check if character is already selected
    const isSelected = player1Selections.includes(character.id) || player2Selections.includes(character.id);
    if (isSelected) {
        card.classList.add('disabled');
    }
    
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
    
    // Add click event
    card.addEventListener('click', () => {
        if (!isSelected) {
            selectCharacter(character.id);
        }
    });
    
    return card;
}

// Handle character selection
function selectCharacter(characterId) {
    console.log('Character selected:', characterId, 'by Player', currentPlayer);
    selectedCharacterId = characterId;
    
    // Add to current player's selections
    if (currentPlayer === 1) {
        player1Selections.push(characterId);
    } else {
        player2Selections.push(characterId);
    }
    
    console.log('Player 1 selections:', player1Selections);
    console.log('Player 2 selections:', player2Selections);
    
    // Update UI
    updateSelectedCharacters();
    renderCharacterGrid();
    
    // Check if draft is complete
    if (player1Selections.length === maxPicks && player2Selections.length === maxPicks) {
        console.log('Draft complete!');
        completeDraft();
        // Automatically start the game after a short delay
        setTimeout(() => {
            startGame();
        }, 1500);
    } else {
        // Switch players after each pick
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        currentPick = Math.min(player1Selections.length, player2Selections.length) + 1;
        
        console.log('Switched to Player', currentPlayer, 'Pick', currentPick);
        
        // Update turn indicator for the next player
        updateTurnIndicator();
    }
}

// Update the turn indicator
function updateTurnIndicator() {
    console.log('Updating turn indicator - Player:', currentPlayer);
    
    if (!currentPlayerSpan || !pickNumberSpan) {
        console.error('Turn indicator elements not found!');
        return;
    }
    
    currentPlayerSpan.textContent = `Player ${currentPlayer}'s Turn`;
    
    // Calculate accurate pick information
    const totalPicks = player1Selections.length + player2Selections.length;
    const currentRound = Math.ceil((totalPicks + 1) / 2);
    
    console.log('Total picks:', totalPicks, 'Current round:', currentRound);
    
    pickNumberSpan.textContent = `${currentRound}`;
    
    // Update visual feedback for character cards
    const cards = document.querySelectorAll('.character-card');
    cards.forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.characterId === selectedCharacterId) {
            card.classList.add('selected');
        }
    });
    
    // Update player section highlighting
    const player1Section = document.querySelector('.player-section:first-child');
    const player2Section = document.querySelector('.player-section:last-child');
    
    if (player1Section && player2Section) {
        player1Section.classList.remove('active');
        player2Section.classList.remove('active');
        
        if (currentPlayer === 1) {
            player1Section.classList.add('active');
        } else {
            player2Section.classList.add('active');
        }
    }
}

// Update the selected characters display
function updateSelectedCharacters() {
    // Update Player 1 selections
    player1Selected.innerHTML = '';
    for (let i = 0; i < maxPicks; i++) {
        const slot = document.createElement('div');
        slot.className = 'character-slot';
        
        if (player1Selections[i]) {
            const character = getCharacter(player1Selections[i]);
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
    for (let i = 0; i < maxPicks; i++) {
        const slot = document.createElement('div');
        slot.className = 'character-slot';
        
        if (player2Selections[i]) {
            const character = getCharacter(player2Selections[i]);
            slot.innerHTML = `<img src="${character.image}" alt="${character.name}">`;
            slot.classList.add('selected');
        } else {
            slot.className = 'empty-slot';
            slot.textContent = 'Empty';
        }
        
        player2Selected.appendChild(slot);
    }
}

// Complete the draft
function completeDraft() {
    startGameBtn.disabled = false;
    startGameBtn.textContent = 'Starting Battle...';
    
    // Show completion message
    currentPlayerSpan.textContent = 'Draft Complete!';
    pickNumberSpan.textContent = '3';
    
    // Add celebration effect
    turnIndicator.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
}

// Start the game
function startGame() {
    if (player1Selections.length === maxPicks && player2Selections.length === maxPicks) {
        // Store selections in localStorage for the game to use
        localStorage.setItem('player1Selections', JSON.stringify(player1Selections));
        localStorage.setItem('player2Selections', JSON.stringify(player2Selections));
        
        // Show team summary
        const player1Team = player1Selections.map(id => getCharacter(id).name).join(', ');
        const player2Team = player2Selections.map(id => getCharacter(id).name).join(', ');
        
        // For now, show a detailed alert. In the future, this would navigate to the game
        alert(`🎮 Game Starting!\n\nPlayer 1 Team: ${player1Team}\nPlayer 2 Team: ${player2Team}\n\nReady to battle!`);
        
        // Redirect to game.html
        window.location.href = 'game.html';
    }
}

// Reset the draft
function resetDraft() {
    currentPlayer = 1;
    currentPick = 1;
    player1Selections = [];
    player2Selections = [];
    selectedCharacterId = null;
    
    startGameBtn.disabled = true;
    startGameBtn.textContent = 'Start Battle';
    
    turnIndicator.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    
    // Clear active states
    const player1Section = document.querySelector('.player-section:first-child');
    const player2Section = document.querySelector('.player-section:last-child');
    player1Section.classList.remove('active');
    player2Section.classList.remove('active');
    
    updateTurnIndicator();
    updateSelectedCharacters();
    renderCharacterGrid();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initDraft);

// Export functions for potential use in other modules
window.DraftSystem = {
    getPlayer1Selections: () => player1Selections,
    getPlayer2Selections: () => player2Selections,
    getCurrentPlayer: () => currentPlayer,
    getCurrentPick: () => currentPick,
    isDraftComplete: () => player1Selections.length === maxPicks && player2Selections.length === maxPicks
}; 