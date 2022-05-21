import CameraControls, { CamSettings, PlayerCamData } from "app/commands/camera-controls-type";
import { GameTimer } from "app/game/game-timer-type";
import { GameTracking } from "app/game/game-tracking-type";
import { bS, GamePlayer, PlayerNames, PlayerStatus } from "app/player/player-type";
import { Util } from "libs/translators";
import { MessageAll, PlayGlobalSound } from "libs/utils";
import { PLAYER_COLOR_CODES } from "resources/colordata";
import { HexColors } from "resources/hexColors";
import { NEUTRAL_HOSTILE } from "resources/constants";
import { File, Timer } from "w3ts";
import { CleanMap, FastRestart, ResetGame, SlowRestart } from "./restart";

export const enableList: Map<GamePlayer, boolean> = new Map<GamePlayer, boolean>();

export const CommandProcessor = () => {
	const t: trigger = CreateTrigger();

	for (let i = 0; i < bj_MAX_PLAYERS; i++) {
		TriggerRegisterPlayerChatEvent(t, Player(i), "-", false);
	}

	TriggerAddCondition(t, Condition(() => {
		const command: string = GetEventPlayerChatString().split(' ')[0];
		const gPlayer: GamePlayer = GamePlayer.fromPlayer.get(GetTriggerPlayer());

		switch (command) {
			case "-cam":
				let camData: string[] = [];

				let distance: string = GetEventPlayerChatString().split(' ')[1];
				let angle: string = GetEventPlayerChatString().split(' ')[2];
				let rotation: string = GetEventPlayerChatString().split(' ')[3];

				if (distance && S2R(distance)) camData.push(distance);
				if (angle && S2R(angle)) camData.push(angle);
				if (rotation && S2R(rotation)) camData.push(rotation);

				CameraControls.getInstance().checkCamData(PlayerCamData.get(gPlayer.player), camData);

				let end: boolean = false;
				bS.forEach(name => {
					if (name.toLowerCase() == PlayerNames.get(gPlayer.player).toLowerCase()) {
						end = true;
					}
				});

				if (end) return;

				if (!distance) distance = `${CamSettings.DEFAULT_DISTANCE}`;
				if (!angle) angle = `${CamSettings.DEFAULT_ANGLE}`;
				if (!rotation) rotation = `${CamSettings.DEFAULT_ROTATION}`;

				if (GetLocalPlayer() == gPlayer.player) {
					File.write("camSettings.pld", `${distance} ${angle} ${rotation}`);
				}

				break;

			case "-def":
				CameraControls.getInstance().checkCamData(PlayerCamData.get(gPlayer.player), [I2S(CamSettings.DEFAULT_DISTANCE), I2S(CamSettings.DEFAULT_ANGLE), I2S(CamSettings.DEFAULT_ROTATION)])

				if (GetLocalPlayer() == gPlayer.player) {
					File.write("camSettings.pld", `${CamSettings.DEFAULT_DISTANCE} ${CamSettings.DEFAULT_ANGLE} ${CamSettings.DEFAULT_ROTATION}`);
				}

				break;

			case "-forfeit":
			case "-ff":
				if (!GameTracking.getInstance().roundInProgress) return;
				if (gPlayer.isDead()) return;

				if (gPlayer.isAlive() || gPlayer.isNomad()) {
					gPlayer.setStatus(PlayerStatus.FORFEIT);
				}

				MessageAll(true, `${PLAYER_COLOR_CODES[gPlayer.names.colorIndex]}${gPlayer.names.acct}|r has ${HexColors.TANGERINE}forfeit|r the round!`)
				PlayGlobalSound("Sound\\Interface\\SecretFound.flac");

				if (GameTracking.getInstance().koVictory()) GameTimer.getInstance().stop();

				break;

			case "-restart":
			case "-ng":
				if (!GameTracking.canReset) return;

				GameTracking.canReset = false;
				//TODO center the msg on screen
				MessageAll(true, `${HexColors.RED}The game has been restarted!|r \n${HexColors.TANGERINE}Please wait while it loads.|r`, 0.63, 0.81);
				PlayGlobalSound("Sound\\Interface\\Goodjob.flac");

				CleanMap();
				ResetGame();

				if (command === "-restart") SlowRestart();
				if (command === "-ng") FastRestart();

				break;

			case "-names":
			case "-players":
				if (!GameTracking.getInstance().roundInProgress) return;
				if (!enableList.has(gPlayer)) enableList.set(gPlayer, false);

				let counter: number = 0;
				let p: player = gPlayer.player;
				let names: string[] = [];
				const lobbyTimer: Timer = new Timer();

				GamePlayer.fromPlayer.forEach(player => {
					if (player.player == NEUTRAL_HOSTILE) return;
					if (player.isNomad()) names.push(`${player.names.btag} is ${PlayerStatus.ALIVE}`)
					if (player.isAlive()) names.push(`${player.names.btag} is ${player.status}`);

				});

				Util.ShuffleArray(names);

				lobbyTimer.start(0.75, true, () => {
					if (counter < names.length) {
						DisplayTimedTextToPlayer(gPlayer.player, 0.00, 0.00, 5, names[counter]);
					} else {
						lobbyTimer.pause();
						lobbyTimer.destroy();
						enableList.set(gPlayer, true);
					}

					counter++;
				})

				break;

			// case "-sb":
			// 	Scoreboard(gPlayer);

			// 	break;

			case "-stfu":
				//TODO make me able to stfu anyone
				if (!GameTracking.getInstance().roundInProgress) return;

				let duration: number = 300;
				let playerString: string = `${GetEventPlayerChatString().split(' ')[1].split('#')[0]}`;

				playerString = StringCase(playerString, false);

				let player: GamePlayer = GamePlayer.fromString.get(playerString);

				if (player.isAlive()) return;
				if (player.isNomad()) return;
				if (player.isSTFU()) return;
				if (player.admin) return;

				SetPlayerState(player.player, PLAYER_STATE_OBSERVER, 1);

				const stfuTimer: Timer = new Timer();
				const oldStatus: string = player.status;

				stfuTimer.start(1, true, () => {
					if (duration < 1.00 || !GameTracking.getInstance().roundInProgress) {
						player.status = oldStatus;
						SetPlayerState(player.player, PLAYER_STATE_OBSERVER, 0);
						stfuTimer.pause();
						stfuTimer.destroy();
					} else {
						player.status = `${PlayerStatus.STFU} ${duration}`;
						duration--;
					}
				});
				break;

			// case "-g":
			// 	SendGold(gPlayer);

			// 	break;
			case "-testMode":
				if (!gPlayer.admin) return;
				if (!GameTracking.getInstance().roundInProgress) return;

				gPlayer.giveGold(10000);

				break;
			default:
				break;

		}

		return true;
	}))
}