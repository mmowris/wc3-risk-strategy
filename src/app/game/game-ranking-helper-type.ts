import { GamePlayer } from "app/player/player-type";
import { File, Timer } from "w3ts";
import { setPlayerFlag } from "w3ts-w3mmd";

export class GameRankingHelper {
	private static instance: GameRankingHelper;

	constructor() { }

	public static getInstance() {
		if (this.instance == null) {
			this.instance = new GameRankingHelper();
		}
		return this.instance;
	}

	public endTracking() {
		File.write("wc3mt.txt", "wc3mt-GameEnd");
	}

	public setLosers(who: player) {
		const timer: Timer = new Timer();
		let counter: number = 0;

		timer.start(.05, true, () => {
			if (counter > 23) {
				timer.pause();
				timer.destroy();
			} else {
				if (Player(counter) != who && GamePlayer.fromPlayer.has(Player(counter))) {
					setPlayerFlag(Player(counter), "loser");
				}
			}

			counter++;
		});
	}

	public setWinner(who: player) {
		setPlayerFlag(who, "winner");
	}
}