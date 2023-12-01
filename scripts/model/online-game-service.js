export class OnlineGameService {

    constructor() {
        this.possibleHands = Object.keys(this.#handMap);

        this.url = 'https://stone.sifs0005.infs.ch';
    }

    #handMap = {
        'scissors': 'Schere',
        'stone': 'Stein',
        'paper': 'Papier',
        'spock': 'Spock',
        'lizard': 'Echse',
    };

    #reverseHandMap = {
        'Schere': 'scissors',
        'Stein': 'stone',
        'Papier': 'paper',
        'Spock': 'spock',
        'Echse': 'lizard',
    };

    async getRankings() {
        let rankings = [];
        const response = await fetch(`${this.url}/ranking`);
        const data = await response.json();
        console.log(data);
        for (const value of Object.values(data)) {
            rankings.push({
                rank: 0,
                wins: value.win,
                players: [value.user],
            });
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
        const response = await fetch(
            `${this.url}/play?playerName=${playerName}&playerHand=${this.#handMap[playerHand]}&mode=spock`
        );
        const data = await response.json();
        const systemHand = this.#reverseHandMap[data['choice']];
        let result = 0;
        if ('win' in data)  {
            if (data['win']) {
                result = 1;
            } else {
                result = -1;
            }
        }
        return {
            playerHand,
            systemHand,
            result: result,
        };
    }
}
