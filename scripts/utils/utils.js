export class Utils {
    static async wait(ms) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }

    static formatHandName(hand) {
        return hand ? hand.charAt(0).toUpperCase() + hand.slice(1) : '?';
    }
}
