import { gameService } from './model/game-service.js';

// Model
let WaitingTimer;
let waitingTime = 0;
let handSelected = false;

let name = '';
let currentView = 'main';

// View
const mainPage = document.querySelector('#main-page');
const gamePage = document.querySelector('#game-page');

const playerNameForm = document.querySelector('#player-name-form');
const playerName = document.querySelector('#player-name');

const rankingTable = document.querySelector('#ranking');

const playerHandElement = document.querySelector('#player-hand');
const gamePromptElement = document.querySelector('#game-prompt');
const opponentHandElement = document.querySelector('#opponent-hand');

const homeButton = document.querySelector('#home-button');
const resultsTable = document.querySelector('#results');

async function renderRankings() {
    let rankings = await gameService.getRankings();

    rankingTable.innerHTML = '';

    rankings.forEach((rankingEntry) => {
        const ranking = `
        <div>
            <div>${rankingEntry.rank}. Rang mit ${rankingEntry.wins} wins:</div>
            <div>${rankingEntry.players}</div>
        </div>
        `;
        rankingTable.insertAdjacentHTML('beforeend', ranking);
    });
}

renderRankings();

function renderHistoryEntry(entry) {
    const entryElement = document.createElement('tr');
    let iconElement = entryElement.insertCell(0);

    switch (entry.result) {
        case 1:
            iconElement.classList.add('icon-win', 'win');
            break;
        case -1:
            iconElement.classList.add('icon-lose', 'lose');
            break;
        default:
            iconElement.classList.add('icon-draw', 'draw');
            break;
    }

    const playerElement = entryElement.insertCell(1);
    playerElement.textContent = entry.playerHand;
    const systemElement = entryElement.insertCell(2);
    systemElement.textContent = entry.systemHand;

    resultsTable.insertBefore(entryElement, resultsTable.firstChild);
}

function renderGamePrompt(newStart = false) {
    if (waitingTime >= 3 || newStart) {
        gamePromptElement.textContent = 'VS';
        waitingTime = 0;
    } else {
        gamePromptElement.textContent = `Next round in ${3 - waitingTime} seconds`;
        waitingTime += 1;
    }
}

function renderOpponentHand(hand) {
    opponentHandElement.textContent = hand;
}

async function onHandSelect(event) {
    if (handSelected) {
        return;
    }

    handSelected = true;

    const hand = event.target.getAttribute('data-hand');
    const { playerHand, systemHand, result } = await gameService.evaluate(name, hand);
    renderHistoryEntry({ playerHand, systemHand, result });

    if (result === 1) {
        event.target.classList.add('win');
    } else if (result === -1) {
        event.target.classList.add('lose');
    } else {
        event.target.classList.add('draw');
    }

    renderOpponentHand(systemHand);
    renderGamePrompt();

    WaitingTimer = setInterval(() => {
        if (waitingTime >= 3) {
            clearInterval(WaitingTimer);

            event.target.classList.remove('win', 'lose', 'draw');
            opponentHandElement.textContent = '?';
            handSelected = false;
        }

        renderGamePrompt();
    }, 1000);

}

function renderHand() {
    playerHandElement.innerHTML = '';

    for (const hand of gameService.possibleHands) {
        const button = document.createElement('button');
        button.textContent = hand;
        button.setAttribute('data-hand', hand);
        button.addEventListener('click', onHandSelect);

        playerHandElement.appendChild(button);
    }
}

function renderView() {
    mainPage.classList.toggle('hidden');
    gamePage.classList.toggle('hidden');

    if (currentView === 'main') {
        currentView = 'game';
        clearInterval(WaitingTimer);
        WaitingTimer = 0;
        handSelected = false;
        renderGamePrompt(true);
        renderHand();
        renderOpponentHand('?');
    } else {
        currentView = 'main';
        renderRankings();
    }
}

// Controller
playerNameForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(playerNameForm);
    name = formData.get('name');

    playerName.textContent = `${name} choose your hand`;

    renderView();
});

homeButton.addEventListener('click', () => {
    resultsTable.innerHTML = '';
    renderView();
});
