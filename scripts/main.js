import {gameService} from './model/game-service.js';
import {Utils} from "./utils/utils.js";

// Model
const waitingTime = 3;
let waitingCounter = 0;
let name = '';

// View
const mainPage = document.querySelector('#main-page-article');
const gamePage = document.querySelector('#game-page-article');

const connectionSwitch = document.querySelector('#connection-switch');

const playerNameForm = document.querySelector('#player-name-form');
const playerNameTitle = document.querySelector('#player-name-title');

const rankingList = document.querySelector('#ranking-list');

const playerHandSelectionDiv = document.querySelector('#player-hand-selection-div');
const gamePromptParagraph = document.querySelector('#game-prompt-paragraph');
const opponentHandParagraph = document.querySelector('#opponent-hand-paragraph');

const homeButton = document.querySelector('#home-button');
const historyTableBody = document.querySelector('#history-table-body');

async function renderRankings() {
    const rankings = await gameService.getRankings();

    rankingList.innerHTML = '';
    for (const ranking of rankings) {
        const rankingItem = document.createElement('li');
        rankingItem.textContent = `${ranking.rank}. rank with ${ranking.wins} wins: ${ranking.players.join(', ',)}`;
        rankingList.appendChild(rankingItem);
    }
}

function renderHistoryEntry(entry) {
    const entryElement = document.createElement('tr');
    const iconElement = entryElement.insertCell(0);

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

    historyTableBody.insertBefore(entryElement, historyTableBody.firstChild);
}

function renderGamePrompt(newStart = false) {
    if (waitingCounter > waitingTime || newStart) {
        gamePromptParagraph.textContent = 'VS';
        waitingCounter = 0;
    } else {
        gamePromptParagraph.textContent = `Next round in ${waitingTime - waitingCounter} seconds`;
        waitingCounter += 1;
    }
}

function renderOpponentHand(hand) {
    opponentHandParagraph.textContent = hand;
}

function toggleGameButtons() {
    const handButtons = playerHandSelectionDiv.querySelectorAll('button');
    for (const button of handButtons) {
        button.disabled = !button.disabled;
    }
    homeButton.disabled = !homeButton.disabled;
}

async function onHandSelect(event) {

    toggleGameButtons();

    const hand = event.target.getAttribute('data-hand');
    const { playerHand, systemHand, result } = await gameService.evaluate(name, hand);
    renderHistoryEntry({ playerHand, systemHand, result });

    switch (result) {
        case 1:
            event.target.classList.add('win');
            break;
        case -1:
            event.target.classList.add('lose');
            break;
        default:
            event.target.classList.add('draw');
            break;
    }

    renderOpponentHand(systemHand);
    renderGamePrompt();

    const WaitingTimer = setInterval(() => {
        if (waitingCounter > waitingTime) {
            clearInterval(WaitingTimer);

            event.target.classList.remove('win', 'lose', 'draw');
            opponentHandParagraph.textContent = '?';
            toggleGameButtons();
        }

        renderGamePrompt();
    }, 1000);
}

function renderHand() {
    playerHandSelectionDiv.innerHTML = '';

    for (const hand of gameService.possibleHands) {
        const button = document.createElement('button');
        button.textContent = Utils.formatHandName(hand);
        button.setAttribute('data-hand', hand);

        playerHandSelectionDiv.appendChild(button);
    }
}

function renderView(view) {
    mainPage.classList.toggle('hidden');
    gamePage.classList.toggle('hidden');

    if (view === 'game') {
        renderGamePrompt(true);
        renderHand();
        renderOpponentHand('?');
    } else {
        renderRankings().then();
    }
}

// Controller
function startGame(event) {
    event.preventDefault();
    const formData = new FormData(playerNameForm);
    name = formData.get('name');

    playerNameTitle.textContent = `${name} choose your hand`;

    renderView('game');
}

function returnToMenu() {
    historyTableBody.innerHTML = '';
    renderView('main');
}

function playerHandListener(event) {
    event.preventDefault();
    const clickedElement = event.target;

    if (clickedElement.tagName === 'BUTTON') {
        onHandSelect(event).then();
    }
}

function switchConnection() {
    const connection = connectionSwitch.getAttribute('data-connected');
    if (connection === 'Local') {
        connectionSwitch.setAttribute('data-connected', 'Server');
    } else {
        connectionSwitch.setAttribute('data-connected', 'Local');
    }
    connectionSwitch.textContent = `Switch to ${connection}`;
    gameService.isOnline = !gameService.isOnline;
    renderRankings().then();
}

connectionSwitch.addEventListener('click', switchConnection);
playerNameForm.addEventListener('submit', startGame);
homeButton.addEventListener('click', returnToMenu);
playerHandSelectionDiv.addEventListener('click', playerHandListener);
