import { Country } from "app/country/country-type";
import { GamePlayer } from "app/player/player-type";
import { Scoreboard } from "app/scoreboard/scoreboard-type";
import { MessageAll, PlayGlobalSound } from "libs/utils";
import { HexColors } from "resources/hexColors";
import { Timer } from "w3ts";
import { GameTracking } from "./game-tracking-type";
import { Alliances } from "./round-allies";
import { Round } from "./round-system";
import { RoundSettings } from "./settings-data";

export class GameTimer {
	private static instance: GameTimer
	private timer: Timer = new Timer();
	private duration: number;
	private _tick: number;
	private turn: number;
	private fog: number = -1;

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
			if (this._tick == this.duration) roundUpdate = this.roundUpdate();
			this.updateBoard(roundUpdate);
			this.updateUI();
			if (this.turn == 1) Scoreboard.getInstance().toggleVis(true);

			this._tick--;

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

	public stop(): boolean {
		this.timer.pause();
		this.timer.destroy();
		return true;
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

		if (Scoreboard.getInstance().allyBoard) {
			Scoreboard.getInstance().updateTitle(`${HexColors.WHITE}Team ${Alliances.getInstance().leadingTeam}|r ${Alliances.getInstance().getTeamCities(Alliances.getInstance().leadingTeam)} / ${GameTracking.getInstance().citiesToWin} ${HexColors.RED}-|r Turn Time: ${tColor}${this._tick}|r`);
		} else {
			Scoreboard.getInstance().updateTitle(`${GameTracking.getInstance().leader.coloredName()} ${GameTracking.getInstance().leader.cities.length} / ${GameTracking.getInstance().citiesToWin} ${HexColors.RED}-|r Turn Time: ${tColor}${this._tick}|r`);
		}
	}

	private updateUI() {
		let upkeepString: string = `${this._tick}`;

		if (this._tick <= 3) {
			PlayGlobalSound("Sound\\Interface\\BattleNetTick.flac");
			upkeepString = `${HexColors.RED}${this._tick}`;
		}

		BlzFrameSetText(BlzGetFrameByName("ResourceBarUpkeepText", 0), upkeepString);
		BlzFrameSetText(BlzGetFrameByName("ResourceBarSupplyText", 0), `${this.turn}`);
	}

	private roundUpdate(): boolean {
		if (this.turn > 1) {
			const gameOver: boolean = GameTracking.getInstance().cityVictory();
			if (gameOver) return this.stop();
		}

		Country.fromName.forEach(country => {
			if (country.isOwned()) {
				country.step();
			}
		});

		let citiesWarning: number = Math.floor(GameTracking.getInstance().citiesToWin * 0.70);
		let played: boolean = false;
		GamePlayer.fromPlayer.forEach(gPlayer => {
			gPlayer.giveGold();

			if (gPlayer.cities.length >= citiesWarning) {

				MessageAll(false, `${HexColors.RED}WARNING:|r ${gPlayer.coloredName()} owns ${HexColors.RED}${gPlayer.cities.length}|r cities and needs ${HexColors.RED}${GameTracking.getInstance().citiesToWin - gPlayer.cities.length}|r more to win!`, 0.46)

				if (!played) {
					PlayGlobalSound("Sound\\Interface\\SecretFound.flac");
					played = true;
				}
			}
		})
		if (RoundSettings.diplomancy == 1 || RoundSettings.diplomancy == 2) {

			Scoreboard.getInstance().playersOnBoard.length = 0;
			Alliances.getInstance().shitSort().forEach(player => {
				Scoreboard.getInstance().playersOnBoard.push(GamePlayer.get(player))
			})
		} else {
			Scoreboard.getInstance().playersOnBoard.sort((p1, p2) => {
				if (p1.income < p2.income) return 1;
				if (p1.income > p2.income) return -1;
				return 0;
			})
		}


		if (RoundSettings.fog == 2) {
			this.fog++;

			if (this.fog == 2) {
				SetTimeOfDay(24.00);
				GamePlayer.fromPlayer.forEach(player => {
					if (player.isAlive()) FogModifierStop(player.fog);
				})
			} else if (this.fog == 4) {
				SetTimeOfDay(12.00);
				GamePlayer.fromPlayer.forEach(player => {
					if (player.isAlive()) FogModifierStart(player.fog);
				})
				this.fog = 0;
			}
		}

		return true;

	}
}