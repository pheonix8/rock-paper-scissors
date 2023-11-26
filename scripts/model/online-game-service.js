export class OnlineGameService {

    constructor() {
        // The toServerHandMapper maps, the english words to german
        this.toServerHandMapper = new Map(this.#handMap);

        // The toGameHandMapper maps, the german words to english
        this.toGameHandMapper = new Map();
        for (const [key, value] of this.#handMap) {
            this.toGameHandMapper.set(value, key);
        }

        this.possibleHands = Object.keys(this.toServerHandMapper);

        this.url = 'https://stone.sifs0005.infs.ch';
    }

     #handMap = [
        ['scissors', 'Schere'],
        ['stone',    'Stein'],
        ['paper',    'Papier'],
        ['spock',    'Spock'],
        ['lizard',   'Echse']
    ]

    async getRankings() {

        fetch()

        // TODO Server API CALL
        Promise.resolve([]);
        'https://stone.sifs0005.infs.ch/ranking'
    }

    // TODO
    async evaluate(playerName, playerHand) {
        console.log(playerName, playerHand);
        // TODO Server API CALL
        'https://stone.sifs0005.infs.ch/play?playerName=DemoUser&playerHand=Stein&mode=spock'
        return -1;
    }
}
