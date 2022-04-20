import { Scoreboard } from "app/scoreboard/scoreboard-type";
import { HexColors } from "resources/hexColors";
import { Timer } from "w3ts";

export class GameTimer {
	private static instance: GameTimer
	private timer: Timer = new Timer();
	private duration: number;
	private currTime: number;
	private turn: number;

	constructor() {
		this.duration = 60;
		this.currTime = this.duration;
		this.turn = 1;
	}

	public static getInstance() {
		if (this.instance == null) {
			this.instance = new GameTimer();
		}
		return this.instance;
	}

	public start() {

	}

	/**
	 * reset - Prepare GameTimer for new round
	 */
	public reset() {
		this.timer.pause();
		this.timer.destroy();
		this.timer = new Timer();
		this.turn = 1;
	}

	private updateBoard() {
		let row: number = 2;

		Scoreboard.getInstance().playersOnBoard.forEach(gPlayer => {
			Scoreboard.getInstance().updateBoard(gPlayer, row, this.currTime);
			row++;
		})
	}

	private updateUI() {
		let upkeepString: string = `${this.currTime}`;

		if (this.currTime <= 3) {
			//Utils.globalSound("Sound\\Interface\\BattleNetTick.flac"); //TODO play sound
			upkeepString = `${HexColors.RED}${this.currTime}`;
		}

		BlzFrameSetText(BlzGetFrameByName("ResourceBarUpkeepText", 0), upkeepString);
		BlzFrameSetText(BlzGetFrameByName("ResourceBarSupplyText", 0), `${this.turn}`);
	}

	private roundUpdate() {

	}
}