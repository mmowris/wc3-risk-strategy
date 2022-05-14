import { GameTimer } from "app/game/game-timer-type";
import { GameTracking } from "app/game/game-tracking-type";
import { Scoreboard } from "app/scoreboard/scoreboard-type";
import { PlayGlobalSound } from "libs/utils";
import { PLAYER_COLOR_CODES } from "resources/colordata";
import { HexColors } from "resources/hexColors";
import { Trigger } from "w3ts";
import { Players } from "w3ts/globals";
import { GamePlayer, PlayerStatus } from "./player-type";

export function PlayerLeaves() {
	const t = new Trigger();
    
	for (let index = 0; index < bj_MAX_PLAYERS; index++) {
	    t.registerPlayerEvent(Players[index], EVENT_PLAYER_LEAVE);
	}
    
	t.addCondition(Condition(() => {
		const gPlayer: GamePlayer = GamePlayer.fromPlayer.get(GetTriggerPlayer());
		gPlayer.setStatus(PlayerStatus.LEFT);

		if (Scoreboard.getInstance().size > 0 && !GameTracking.getInstance().roundInProgress) {
			let row: number = 2;

			Scoreboard.getInstance().playersOnBoard.forEach(gPlayer => {
				Scoreboard.getInstance().victoryUpdate(GameTracking.getInstance().leader, gPlayer, row);
				row++;
			})
		}

		if (!GameTracking.getInstance().roundInProgress) return;
		
		ClearTextMessages();

		Players.forEach(player => {
		    DisplayTimedTextToPlayer(player.handle, 0.92, 0.81, 5.00, `${PLAYER_COLOR_CODES[gPlayer.names.colorIndex]}${gPlayer.names.acct}|r has ${HexColors.TANGERINE}left|r the game!`);
		});
	
		PlayGlobalSound("Sound\\Interface\\SecretFound.flac");

		if (GameTracking.getInstance().koVictory()) GameTimer.getInstance().stop();
	    
	    return false;
	}));
    }