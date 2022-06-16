import CameraControls, { CamSettings, PlayerCamData } from "app/commands/camera-controls-type";
import { GameTimer } from "app/game/game-timer-type";
import { GameTracking } from "app/game/game-tracking-type";
import { bS, GamePlayer, PlayerNames, PlayerStatus } from "app/player/player-type";
import { Util } from "libs/translators";
import { ErrorMessage, MessageAll, PlayGlobalSound } from "libs/utils";
import { PLAYER_COLOR_CODES } from "resources/colordata";
import { HexColors } from "resources/hexColors";
import { NEUTRAL_HOSTILE } from "resources/constants";
import { File, Timer } from "w3ts";
import { CleanMap, FastRestart, ResetGame, SlowRestart } from "./restart";
import { RoundSettings } from "app/game/settings-data";
import { Alliances } from "app/game/round-allies";

export const enableList: Map<GamePlayer, boolean> = new Map<GamePlayer, boolean>();

export const CommandProcessor = () => {
	const t: trigger = CreateTrigger();

	for (let i = 0; i < bj_MAX_PLAYERS; i++) {
		TriggerRegisterPlayerChatEvent(t, Player(i), "-", false);
	}

	TriggerAddCondition(t, Condition(() => {
		const command: string = StringCase(GetEventPlayerChatString().split(' ')[0], false);
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

					if (gPlayer.turnDied == -1) {
						gPlayer.setTurnDied(GameTimer.getInstance().turn);
					}

					if (gPlayer.cityData.endCities == 0) {
						gPlayer.cityData.endCities = gPlayer.cities.length
					}
				}

				MessageAll(true, `${PLAYER_COLOR_CODES[gPlayer.names.colorIndex]}${gPlayer.names.acct}|r has ${HexColors.TANGERINE}forfeit|r the round!`)
				//PlayGlobalSound("Sound\\Interface\\SecretFound.flac");

				if (GameTracking.getInstance().koVictory()) GameTimer.getInstance().stop();

				break;

			case "-restart":
			case "-ng":
				if (!GameTracking.canReset) return;

				GameTracking.canReset = false;

				MessageAll(true, `${HexColors.RED}The game has been restarted!|r \n${HexColors.TANGERINE}Please wait while it loads.|r`, 0.62, 0.81);
				PlayGlobalSound("Sound\\Interface\\Goodjob.flac");

				CleanMap();
				ResetGame();

				const firstTImer: Timer = new Timer();
				firstTImer.start(2.00, false, () => {

					if (RoundSettings.fog == 1) {
						GamePlayer.fromPlayer.forEach(player => {
							if (player.isAlive() || player.isPlaying()) FogModifierStop(player.fog);
						})
					}

				})
				//MessageAll(false, "Fog set", 0, 0);
				const quickTimer: Timer = new Timer();
				quickTimer.start(5.00, false, () => {
					//MessageAll(false, "Calling Restart...", 0, 0);
					if (command === "-restart") SlowRestart();
					if (command === "-ng") FastRestart();
				});

				break;

			case "-names":
			case "-players":
				if (!GameTracking.getInstance().roundInProgress) return;
				if (!enableList.has(gPlayer)) enableList.set(gPlayer, false);

				let counter: number = 0;
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

			case "-g":
				if (!GameTracking.getInstance().roundInProgress) return;
				if (GetPlayerState(gPlayer.player, PLAYER_STATE_RESOURCE_GOLD) == 0) {
					ErrorMessage(gPlayer.player, "You have no gold to send!");
					return;
				}

				try {
					const pName: string = StringCase(GetEventPlayerChatString().split(' ')[1], false);
					if (!pName) return;

					let gQty: number = S2I(GetEventPlayerChatString().split(' ')[2]);
					if (!gQty) return;

					let gCounter: number = 0;
					let receiver: GamePlayer;

					GamePlayer.fromPlayer.forEach(tPlayer => {
						const compareName: string = (RoundSettings.promode) ? tPlayer.names.acct.toLowerCase() : tPlayer.names.color.toLowerCase()

						if (compareName.slice(0, pName.length) == pName) {
							gCounter++;
							receiver = tPlayer;
						}
					})

					if (!receiver) {
						ErrorMessage(gPlayer.player, "Player not found!");
						return;
					}

					if (gCounter > 1) {
						ErrorMessage(gPlayer.player, "Multiple matches found, try a longer name!")
						return;
					}

					if (gPlayer == receiver) {
						ErrorMessage(gPlayer.player, "You can't send gold to yourself, retard!")
						return;
					}

					if (!RoundSettings.gold && (IsPlayerEnemy(gPlayer.player, receiver.player))) {
						ErrorMessage(gPlayer.player, `You may not send gold to ${receiver.coloredName()}`);
						return;
					}

					if (gQty > GetPlayerState(gPlayer.player, PLAYER_STATE_RESOURCE_GOLD)) {
						gQty = GetPlayerState(gPlayer.player, PLAYER_STATE_RESOURCE_GOLD);
					}

					SetPlayerState(gPlayer.player, PLAYER_STATE_RESOURCE_GOLD, GetPlayerState(gPlayer.player, PLAYER_STATE_RESOURCE_GOLD) - gQty);
					SetPlayerState(receiver.player, PLAYER_STATE_RESOURCE_GOLD, GetPlayerState(receiver.player, PLAYER_STATE_RESOURCE_GOLD) + gQty);
					DisplayTimedTextToPlayer(gPlayer.player, 0, 0, 3, `You sent ${HexColors.TANGERINE}${gQty}|r gold to ${receiver.coloredName()}`);
					DisplayTimedTextToPlayer(receiver.player, 0, 0, 3, `You received ${HexColors.TANGERINE}${gQty}|r gold from ${gPlayer.coloredName()}`);

				} catch (error) {
					print(error)
				}
				break;
			case "-ally":
			case "-peace":
				if (!GameTracking.getInstance().roundInProgress) return;
				if (RoundSettings.diplomancy != 3) return;

				try {
					const pName: string = StringCase(GetEventPlayerChatString().split(' ')[1], false);
					if (!pName) return;

					let gCounter: number = 0;
					let receiver: GamePlayer;

					GamePlayer.fromPlayer.forEach(tPlayer => {
						const compareName: string = (RoundSettings.promode) ? tPlayer.names.acct.toLowerCase() : tPlayer.names.color.toLowerCase()

						if (compareName.slice(0, pName.length) == pName) {
							gCounter++;
							receiver = tPlayer;
						}
					})

					if (!receiver) {
						ErrorMessage(gPlayer.player, "Player not found!");
						return;
					}

					if (gCounter > 1) {
						ErrorMessage(gPlayer.player, "Multiple matches found, try a longer name!")
						return;
					}

					if (gPlayer == receiver) {
						ErrorMessage(gPlayer.player, "You cant ally yourself. Duh!")
						return;
					}

					if (IsPlayerAlly(gPlayer.player, receiver.player)) {
						ErrorMessage(gPlayer.player, `You are already allied to ${receiver.coloredName()}`)
						return;
					}

					Alliances.getInstance().setAlliance(gPlayer.player, receiver.player, true);

					MessageAll(false, `${gPlayer.coloredName()} has allied ${receiver.coloredName()}`, 0.0, 0.0);
				} catch (error) {
					print(error)
				}
				break;
			case "-unally":
			case "-war":
				if (!GameTracking.getInstance().roundInProgress) return;
				if (RoundSettings.diplomancy != 3) return;

				try {
					const pName: string = StringCase(GetEventPlayerChatString().split(' ')[1], false);
					if (!pName) return;

					let gCounter: number = 0;
					let receiver: GamePlayer;

					GamePlayer.fromPlayer.forEach(tPlayer => {
						const compareName: string = (RoundSettings.promode) ? tPlayer.names.acct.toLowerCase() : tPlayer.names.color.toLowerCase()

						if (compareName.slice(0, pName.length) == pName) {
							gCounter++;
							receiver = tPlayer;
						}
					})

					if (!receiver) {
						ErrorMessage(gPlayer.player, "Player not found!");
						return;
					}

					if (gCounter > 1) {
						ErrorMessage(gPlayer.player, "Multiple matches found, try a longer name!")
						return;
					}

					if (gPlayer == receiver) {
						ErrorMessage(gPlayer.player, "Come on, really?")
						return;
					}

					if (IsPlayerEnemy(gPlayer.player, receiver.player)) {
						ErrorMessage(gPlayer.player, `You are not allied to ${receiver.coloredName()}`)
						return;
					}

					Alliances.getInstance().setAlliance(gPlayer.player, receiver.player, false);
					Alliances.getInstance().setAlliance(receiver.player, gPlayer.player, false);

					MessageAll(false, `${gPlayer.coloredName()} and ${receiver.coloredName()} are no longer allies!`, 0.0, 0.0);
				} catch (error) {
					print(error)
				}
				break;
			case "-testMode":
				// if (!gPlayer.admin) return;
				// if (!GameTracking.getInstance().roundInProgress) return;

				// gPlayer.giveGold(10000);

				break;
			default:
				break;

		}

		return true;
	}))
}