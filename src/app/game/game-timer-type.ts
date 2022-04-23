import { Country } from "app/country/country-type";
import { GamePlayer } from "app/player/player-type";
import { Scoreboard } from "app/scoreboard/scoreboard-type";
import { PlayGlobalSound } from "libs/utils";
import { HexColors } from "resources/hexColors";
import { Timer } from "w3ts";
import { GameTracking } from "./game-tracking-type";
import { Game } from "./game-type";

export class GameTimer {
	private static instance: GameTimer
	private timer: Timer = new Timer();
	private duration: number;
	private _tick: number;
	private turn: number;

	constructor() {
		this.duration = 60;
		this._tick = this.duration;
		this.turn = 1;
	}

	public static getInstance() {
		if (this.instance == null) {
			this.instance = new GameTimer();
		}
		return this.instance;
	}

	public start() {
		this.timer.start(1.00, true, () => {
			let roundUpdate: boolean = false;

			try {
			if (this._tick == this.duration) roundUpdate = this.roundUpdate();
			this.updateBoard(roundUpdate);
			this.updateUI();
			this._tick--;
			} catch (error) {
				print(error)
			}


			if (this._tick == 0) {
				this._tick = this.duration;
				this.turn++;
			}
		})
	}

	public reset() {
		this.timer = new Timer();
		this._tick = this.duration;
		this.turn = 1;
	}

	public stop() {
		this.timer.pause();
		this.timer.destroy();
	}

	public get tick(): number {
		return this._tick;
	}

	private updateBoard(turnUpdate: boolean) {
		let row: number = 2;

		Scoreboard.getInstance().playersOnBoard.forEach(gPlayer => {
			Scoreboard.getInstance().updateBoard(gPlayer, row, turnUpdate);
			row++;
		})

		const tColor: string = this._tick <= 3 ? HexColors.RED : HexColors.WHITE;
		Scoreboard.getInstance().updateTitle(`${GameTracking.getInstance().leader.coloredName()} ${GameTracking.getInstance().leader.cities.length} / ${GameTracking.getInstance().citiesToWin} ${HexColors.RED}-|r Turn Time: ${tColor}${this._tick}|r`);
	}

	private updateUI() {
		let upkeepString: string = `${this._tick}`;

		if (this._tick <= 3) {
			//Utils.globalSound("Sound\\Interface\\BattleNetTick.flac"); //TODO play sound
			upkeepString = `${HexColors.RED}${this._tick}`;
		}

		BlzFrameSetText(BlzGetFrameByName("ResourceBarUpkeepText", 0), upkeepString);
		BlzFrameSetText(BlzGetFrameByName("ResourceBarSupplyText", 0), `${this.turn}`);
	}

	private roundUpdate(): boolean {
		const gameOver: boolean = GameTracking.getInstance().cityVictory();
		if (gameOver) {
			this.stop();
		}

		Country.fromName.forEach(country => {
			if (country.isOwned()) {
				country.step();
			}
		});

		if (GameTracking.getInstance().leader.cities.length >= Math.floor(GameTracking.getInstance().citiesToWin * 0.70)) {
			ClearTextMessages();

			GamePlayer.fromPlayer.forEach(gPlayer =>{
				DisplayTimedTextToPlayer(gPlayer.player, 0.46, 0.81, 5.00, `${HexColors.RED}WARNING:|r ${gPlayer.coloredName()} owns ${HexColors.RED}${gPlayer.cities.length}|r cities, they need ${HexColors.RED}${gPlayer.cities.length - GameTracking.getInstance().citiesToWin}|r more to win!`);
			})

			PlayGlobalSound("Sound\\Interface\\QuestCompleted.flac");
		}

		Scoreboard.getInstance().playersOnBoard.sort((p1, p2) => {
			if (p1.income < p2.income) return 1;
			if (p1.income > p2.income) return -1;
			return 0;
		})

		return true;
	}
}