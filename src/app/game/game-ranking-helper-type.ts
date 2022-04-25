import { File, Timer } from "w3ts";
import { setPlayerFlag } from "w3ts-w3mmd";
import { Players } from "w3ts/globals";

export class GameRankingHelper {
	private static instance: GameRankingHelper;

	constructor() { }

	public static getInstance() {
		if (this.instance == null) {
			this.instance = new GameRankingHelper();
		}
		return this.instance;
	}

	public writeExitFile() {
		File.write("wc3mt.txt", "wc3mt-GameEnd");
	}

	public setWinner(who: player) {
		const timer: Timer = new Timer();
		let counter: number = 0;

		//~2.4 seconds
		timer.start(.10, true, () => {
			if (counter > 23) {
				timer.pause();
				timer.destroy();
			} else {
				if (Player(counter) != who) {
					setPlayerFlag(Player(counter), "loser");
				}
			}

			counter++;
		});

		setPlayerFlag(who, "winner");
	}
}