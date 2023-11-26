import { Utils } from '../utils/utils.js';

export class OfflineGameService {
    static DELAY_MS = 1000;

    constructor() {
        this.possibleHands = Object.keys(this.#resultLookup);
    }

    // same data structure as server
    #playerState = {};

    // Can be used to check if the selected hand wins/loses
    #resultLookup = {
        scissors: {
            scissors: 0,
            stone: 1,
            paper: -1,
            spock: 1,
            lizard: -1,
        },
        stone: {
            scissors: -1,
            stone: 0,
            paper: 1,
            spock: 1,
            lizard: -1,
        },
        paper: {
            scissors: 1,
            stone: -1,
            paper: 0,
            spock: -1,
            lizard: 1,
        },
        spock: {
            scissors: -1,
            stone: -1,
            paper: 1,
            spock: 0,
            lizard: 1,
        },
        lizard: {
            scissors: 1,
            stone: 1,
            paper: -1,
            spock: -1,
            lizard: 0,
        }
    };

    async getRankings() {
        let rankings = [];

        for (const value of Object.values(this.#playerState)) {
            if (rankings.find((ranking) => ranking.wins === value.win)) {
                rankings.find((ranking) => ranking.wins === value.win).players.push(value.user);
            } else {
                rankings.push({
                    rank: 0,
                    wins: value.win,
                    players: [value.user],
                });
            }
        }

        rankings = rankings
            .sort((a, b) => b.wins - a.wins)
            .map((ranking, index) => ({
                rank: index + 1,
                wins: ranking.wins,
                players: ranking.players,
            }));

        return Promise.resolve(rankings);
    }

    async evaluate(playerName, playerHand) {
        const systemHand = this.possibleHands[Math.floor(Math.random() * this.possibleHands.length)];
        const gameEval = this.#resultLookup[systemHand][playerHand];

        await Utils.wait(OfflineGameService.DELAY_MS); // emulate async

        const result = {
            playerHand,
            systemHand,
            result: gameEval,
        };

        if (!this.#playerState[playerName]) {
            this.#playerState[playerName] = {
                user: playerName,
                win: 0,
                lost: 0,
            };
        }

        this.#playerState[playerName].win += gameEval === 1 ? 1 : 0;
        this.#playerState[playerName].lost += gameEval === -1 ? 1 : 0;

        return result;
    }
}
