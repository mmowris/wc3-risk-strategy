import { GamePlayer } from "app/player/player-type";
import { Scoreboard } from "app/scoreboard/scoreboard-type";
import { PlayGlobalSound } from "libs/utils";
import { PLAYER_COLOR_CODES } from "resources/colordata";
import { HexColors } from "resources/hexColors";
import { NEUTRAL_HOSTILE } from "resources/constants";
import { GameRankingHelper } from "./game-ranking-helper-type";
import { RoundSettings } from "./settings-data";
import { Alliances } from "./round-allies";

export class GameTracking {
	private static instance: GameTracking;
	private _leader: GamePlayer;
	private _citiesToWin: number;
	public roundInProgress: boolean;
	public static canReset: boolean = false;

	constructor() {
		this.roundInProgress = false;
	}

	public get leader(): GamePlayer {
		return this._leader;
	}

	public set leader(who: GamePlayer) {
		this._leader = who;
	}

	public get citiesToWin(): number {
		return this._citiesToWin;
	}

	public set citiesToWin(value: number) {
		this._citiesToWin = value;
	}

	public koVictory(): boolean {
		let counter: number = 0;
		let who: GamePlayer;

		GamePlayer.fromPlayer.forEach(gPlayer => {
			if (gPlayer.player == NEUTRAL_HOSTILE) return;
			if (!gPlayer.isAlive()) return

			counter++;
			who = gPlayer;
		});

		if (counter == 1) {
			this._leader = who;
			return this.giveVictory(this._leader);
		}
	}

	public cityVictory(): boolean {
		let who: GamePlayer;

		GamePlayer.fromPlayer.forEach(gPlayer => {
			if (gPlayer.cities.length >= this._citiesToWin) {
				gPlayer.player == NEUTRAL_HOSTILE ? null : who = gPlayer;
			}
		})

		return this.giveVictory(who);
	}

	private giveVictory(who?: GamePlayer): boolean {
		if (!who) return false;
		if (!this.roundInProgress) return false;

		this.leader = who;
		this.roundInProgress = false;
		GameTracking.canReset = true;

		ClearTextMessages();

		GamePlayer.fromPlayer.forEach(gPlayer => {
			if (GetLocalPlayer() == gPlayer.player) {
				BlzEnableSelections(false, false);
			}

			gPlayer.setName(gPlayer.names.acct);

			if (RoundSettings.diplomancy > 0) {
				DisplayTimedTextToPlayer(gPlayer.player, 0.73, 0.81, 180.00, `             ${HexColors.WHITE}Team ${Alliances.getInstance().getPlayerTeam(who.player)}|r ${HexColors.TANGERINE}is ${PLAYER_COLOR_CODES[who.names.colorIndex]}victorious|r${HexColors.TANGERINE}!|r`);
				DisplayTimedTextToPlayer(gPlayer.player, 0.73, 0.81, 180.00, `${HexColors.WHITE}Team ${Alliances.getInstance().getPlayerTeam(who.player)}|r ${HexColors.TANGERINE}won the game with|r ${Alliances.getInstance().getTeamCities(Alliances.getInstance().getPlayerTeam(who.player))} ${HexColors.TANGERINE}cities!|r`);
			} else {
				DisplayTimedTextToPlayer(gPlayer.player, 0.73, 0.81, 180.00, `             ${PLAYER_COLOR_CODES[who.names.colorIndex]}${who.names.acct}|r ${HexColors.TANGERINE}is ${PLAYER_COLOR_CODES[who.names.colorIndex]}victorious|r${HexColors.TANGERINE}!|r`);
				DisplayTimedTextToPlayer(gPlayer.player, 0.73, 0.81, 180.00, `${PLAYER_COLOR_CODES[who.names.colorIndex]}${who.names.acct}|r ${HexColors.TANGERINE}won the game with|r ${PLAYER_COLOR_CODES[who.names.colorIndex]}${who.cities.length}|r ${HexColors.TANGERINE}cities!|r`);
			}
			DisplayTimedTextToPlayer(gPlayer.player, 0.73, 0.81, 180.00, `             ${HexColors.TANGERINE}Discord: discord.me/risk|r`);

			if (gPlayer != who && gPlayer.isAlive() || gPlayer.isNomad()) {
				GameRankingHelper.getInstance().setLoser(gPlayer.player);
			}
		})

		PlayGlobalSound("Sound\\Interface\\QuestCompleted.flac");

		let row: number = 2;

		Scoreboard.getInstance().playersOnBoard.forEach(gPlayer => {
			Scoreboard.getInstance().victoryUpdate(who, gPlayer, row);
			row++;
		})

		GameRankingHelper.getInstance().setWinner(who.player);

		const timer: timer = CreateTimer();
		let count: number = 0;

		TimerStart(timer, 0.5, true, () => {
			if (count > 23) {
				PauseTimer(timer);
				DestroyTimer(timer);
			} else {
				if (GamePlayer.fromPlayer.has(Player(count)) && !GamePlayer.get(Player(count)).isObserving()) {
					GameRankingHelper.getInstance().setData(GamePlayer.get(Player(count)));
				}
			}

			count++;
		});
		
		//TODO:
		//Track data and bot exit

		return true;
	}

	//Static API
	public static getInstance() {
		if (this.instance == null) {
			this.instance = new GameTracking();
		}
		return this.instance;
	}
}