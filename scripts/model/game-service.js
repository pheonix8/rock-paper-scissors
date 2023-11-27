import { OfflineGameService } from './offline-game-service.js';
import { OnlineGameService } from './online-game-service.js';

class GameService {
    isOnline = false;

    constructor() {
        this.offlineService = new OfflineGameService();
        this.onlineGameService = new OnlineGameService();
    }

    get service() {
        return this.isOnline ? this.onlineGameService : this.offlineService;
    }

    async getRankings() {
        const rankings = await this.service.getRankings();
        return rankings.slice(0, 10);
    }

    async evaluate(playerName, playerHand) {
        return this.service.evaluate(playerName, playerHand);
    }

    get possibleHands() {
        return this.service.possibleHands;
    }

}

export const gameService = new GameService();
