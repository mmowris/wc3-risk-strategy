import CameraControls, { CamSettings, PlayerCamData } from "app/commands/camera-controls-type";
import { GameTimer } from "app/game/game-timer-type";
import { GameTracking } from "app/game/game-tracking-type";
import { GamePlayer, PlayerStatus } from "app/player/player-type";
import { Util } from "libs/translators";
import { PlayGlobalSound } from "libs/utils";
import { HexColors } from "resources/hexColors";
import { Timer } from "w3ts";

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
				break;

			case "-def":
				CameraControls.getInstance().checkCamData(PlayerCamData.get(gPlayer.player), [I2S(CamSettings.DEFAULT_DISTANCE), I2S(CamSettings.DEFAULT_ANGLE), I2S(CamSettings.DEFAULT_ROTATION)])

				break;

			case "-forfeit":
			case "-ff":
				if (!GameTracking.getInstance().roundInProgress) return;

				if (gPlayer.isAlive() || gPlayer.isNomad()) {
					gPlayer.setStatus(PlayerStatus.FORFEIT);
				}

				ClearTextMessages();

				GamePlayer.fromPlayer.forEach(player => {
					DisplayTimedTextToPlayer(player.player, 0.92, 0.81, 5.00, `${gPlayer.names.acct} has ${HexColors.TANGERINE}forfeit!`);
				})

				PlayGlobalSound("Sound\\Interface\\SecretFound.flac");

				if (GameTracking.getInstance().koVictory()) GameTimer.getInstance().stop();


				break;

			// case "-restart":
			// case "-ng":
			// 	Restart();

			// 	break;

			case "-names":
			case "-players":
				if (!GameTracking.getInstance().roundInProgress) return;
				if (!enableList.has(gPlayer)) enableList.set(gPlayer, false);

				let counter: number = 0;
				let p: player = gPlayer.player;
				let names: string[] = [];
				const lobbyTimer: Timer = new Timer();

				GamePlayer.fromPlayer.forEach(player => {
					if (!player.isLeft() && player.player != Player(24)) {
						if (player.isNomad()) {
							names.push(`${player.names.btag} is ${PlayerStatus.ALIVE}`)
						} else {
							names.push(`${player.names.btag} is ${player.status}`)
						}
					}
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

				if (!player.isDead() || !player.isForfeit() || player.admin) return;
				if (player.isSTFU()) return;

				const stfuTimer: Timer = new Timer();
				const oldStatus: string = player.status;

				SetPlayerState(player.player, PLAYER_STATE_OBSERVER, 1);

				stfuTimer.start(1, true, () => {
					player.status = PlayerStatus.STFU + duration;

					if (duration < 1.00 || !GameTracking.getInstance().roundInProgress) {
						player.status = oldStatus;
						SetPlayerState(player.player, PLAYER_STATE_OBSERVER, 0);

						stfuTimer.pause();
						stfuTimer.destroy();
					} else {
						duration--;
					}
				});
				break;

			// case "-g":
			// 	SendGold(gPlayer);

			// 	break;
			default:
				break;

		}

		return true;
	}))
}