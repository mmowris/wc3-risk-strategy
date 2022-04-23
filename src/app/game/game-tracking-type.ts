import { GamePlayer } from "app/player/player-type";

export class GameTracking {
	private static instance: GameTracking;
	private _leader: GamePlayer;
	private _citiesToWin: number;

	constructor() {
		this._leader = GamePlayer.fromID.get(Math.floor(Math.random() * GamePlayer.fromID.size - 1));
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

	public koVictory() {
		let counter: number = 0;
		let who: GamePlayer;

		GamePlayer.fromID.forEach(gPlayer => {
			if (gPlayer.player == Player(24)) return;

			if (gPlayer.isAlive() || gPlayer.isNomad()) {
				counter++;
				who = gPlayer;
			}
		});

		if (counter == 1) {
			this._leader = who;
			this.giveVictory(who);
		}
	}

	public cityVictory(): boolean {
		let who: GamePlayer;

		GamePlayer.fromID.forEach(gPlayer => {
			if (gPlayer.player == Player(24)) return;

			if (gPlayer.cities.length >= this.citiesToWin) {
				return who = gPlayer;
			}
		})

		return this.giveVictory(who);
	}

	private giveVictory(who?: GamePlayer): boolean {
		if (!who) {
			return false;
		}

		GamePlayer.fromID.forEach(gPlayer => {
			if (GetLocalPlayer() == gPlayer.player) {
				BlzEnableSelections(false, false);
			}
		})

		ClearTextMessages();

		//Todo
		// Players.forEach(player => {
		//     DisplayTimedTextToPlayer(player.handle, 0.73, 0.81, 180.00, `             ${gPlayer.acctName} ${HexColors.TANGERINE}is ${PLAYER_COLOR_CODES[GamePlayers[Data.LeaderID].colorIndex]}victorious|r${HexColors.TANGERINE}!|r|r`);
		//     DisplayTimedTextToPlayer(player.handle, 0.73, 0.81, 180.00, `${gPlayer.acctName} ${HexColors.TANGERINE}won the game with|r ${PLAYER_COLOR_CODES[GamePlayers[Data.LeaderID].colorIndex]}${gPlayer.ownedCities.length}|r ${HexColors.TANGERINE}cities!|r`);
		//     DisplayTimedTextToPlayer(player.handle, 0.73, 0.81, 180.00, `             ${HexColors.TANGERINE}Discord:|r  ${PLAYER_COLOR_CODES[GamePlayers[Data.LeaderID].colorIndex]}discord.me/risk`);
		// });
	
		// Utils.globalSound("Sound\\Interface\\QuestCompleted.flac");

		//Scoreboard victory update

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