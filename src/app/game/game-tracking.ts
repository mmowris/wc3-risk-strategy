import { GamePlayer } from "app/player/player-type";
import { Scoreboard } from "app/scoreboard/scoreboard-type";

export class GameTracking {
	private static instance: GameTracking;
	private leader: GamePlayer;
	private citiesToWin: number;

	constructor() {
		//TODO set cities to win
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
			this.leader = who;
			this.giveVictory(who);
		}
	}

	public cityVictory() {
		let who: GamePlayer;

		GamePlayer.fromID.forEach(gPlayer => {
			if (gPlayer.player == Player(24)) return;

			if (gPlayer.cities.length >= this.citiesToWin) {
				return who = gPlayer;
			}
		})

		if (who) {
			this.leader = who;
			this.giveVictory(who);
		}
		
	}

	private giveVictory(who: GamePlayer) {

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
	}








	//Static API
	public static getInstance() {
		if (this.instance == null) {
			this.instance = new GameTracking();
		}
		return this.instance;
	}
}