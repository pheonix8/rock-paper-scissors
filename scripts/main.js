import { gameService } from './model/game-service.js';


let WaitingTimer;
let waitingTime = 0;
let handSelected = false;

let name = '';
let currentView = 'main';


const mainPage = document.querySelector('#main-page');
const gamePage = document.querySelector('#game-page');

const playerNameForm = document.querySelector('#player-name-form');
const playerName = document.querySelector('#player-name');

const rankingTable = document.querySelector('#ranking');

const playerHand = document.querySelector('#player-hand');
const gamePrompt = document.querySelector('#game-prompt');
const opponentHand = document.querySelector('#opponent-hand');

const homeButton = document.querySelector('#home-button');
const resultsTable = document.querySelector('#results');


async function renderRankings() {
    let rankings = await gameService.getRankings();
    rankings = rankings.slice(0, 10);

    rankingTable.innerHTML = '';

    rankings.forEach((rankingEntry) => {
        let ranking = `
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
    let icon = '';

    switch (entry.result) {
        case 1:
            icon = '&#10003;';
            break;
        case -1:
            icon = '&#10005;';
            break;
        default:
            icon = '-';
            break;
    }

    entryElement.innerHTML = `
        <td>${icon}</td>
        <td>${entry.playerHand}</td>
        <td>${entry.systemHand}</td>
    `;

    resultsTable.insertBefore(entryElement, resultsTable.firstChild);
}

function renderHand() {
    playerHand.innerHTML = '';

    for (const hand of gameService.possibleHands) {
        const button = document.createElement('button');
        button.textContent = hand;
        button.setAttribute('data-hand', hand);
        button.addEventListener('click', onHandSelect);

        playerHand.appendChild(button);
    }
}

function renderGamePrompt(newStart = false) {
    if (waitingTime >= 3 || newStart) {
        gamePrompt.textContent = 'VS';
        waitingTime = 0;
    } else {
        gamePrompt.textContent = `Next round in ${3 - waitingTime} seconds`;
        waitingTime += 1;
    }
}

function renderOpponentHand(hand) {
    opponentHand.textContent = hand;
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
            opponentHand.textContent = '?';
            handSelected = false;
        }

        renderGamePrompt();
    }, 1000);

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
        //render history
    } else {
        currentView = 'main';
        renderRankings();
    }
}

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



