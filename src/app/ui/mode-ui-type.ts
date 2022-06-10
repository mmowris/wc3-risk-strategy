import { HexColors } from "resources/hexColors";
import { NEUTRAL_HOSTILE } from "resources/constants";
import CameraControls, { PlayerCamData } from "../commands/camera-controls-type";
import { GamePlayer, PlayerStatus } from "../player/player-type";
import { GameType } from "app/modes/gameType";
import { Frame } from "w3ts";
import { Settings } from "app/game/round-settings";
import { AllyLimit } from "app/modes/allyLimit";
import { Diplomancy } from "app/modes/diplomancy";
import { Fog } from "app/modes/fog";
import { GoldSending } from "app/modes/goldSending";
import { NomadTimeLimit } from "app/modes/nomadTimeLimit";
import { ShipsAllowed } from "app/modes/shipsAllowed";
import { TransportLanding } from "app/modes/transports";
import { Slider } from "./slider";
import { RoundSettings } from "app/game/settings-data";

export class ModeUI {
	public static frame: Map<string, framehandle> = new Map<string, framehandle>();
	public static frameFunc: Map<string, Function> = new Map<string, Function>();
	public static fullControlBox: Frame;
	public static startPressed: boolean = false;

	public static buildModeFrame() {
		//Backdrop
		const backdrop: framehandle = BlzCreateFrame("EscMenuBackdrop", BlzGetOriginFrame(ORIGIN_FRAME_GAME_UI, 0), 0, 0);
		BlzFrameSetAbsPoint(backdrop, FRAMEPOINT_CENTER, 0.4, 0.36);
		BlzFrameSetSize(backdrop, 0.80, 0.46);

		//Title
		const title: framehandle = BlzCreateFrameByType("BACKDROP", "title", backdrop, "", 0);
		BlzFrameSetSize(title, 0.20, 0.15);
		BlzFrameSetPoint(title, FRAMEPOINT_CENTER, backdrop, FRAMEPOINT_TOP, 0.00, -0.045);
		BlzFrameSetTexture(title, "war3mapimported\\ModeTitle.dds", 0, true);

		//Player List
		ModeUI.pList(backdrop);

		//Command List
		const cList: framehandle = BlzCreateFrameByType("TEXTAREA", "cList", backdrop, "BattleNetTextAreaTemplate", 0);
		BlzFrameSetSize(cList, 0.30, 0.26);
		BlzFrameSetPoint(cList, FRAMEPOINT_TOP, backdrop, FRAMEPOINT_TOP, 0.00, -0.1);
		//Commands
		BlzFrameAddText(cList, `${HexColors.RED}Typed Commands:|r`)
		BlzFrameAddText(cList, `${HexColors.TANGERINE}-cam ####|r  Changes the camera view distance`)
		BlzFrameAddText(cList, `${HexColors.TANGERINE}-def|r  Changes the camera to the default settings`)
		BlzFrameAddText(cList, `${HexColors.TANGERINE}-forfeit / -ff|r  Forfeit the game without exiting`)
		BlzFrameAddText(cList, `${HexColors.TANGERINE}-restart / -ng|r  Restart the current game if it's over`)
		BlzFrameAddText(cList, `${HexColors.TANGERINE}-names / -players|r  Lists active players`)
		//BlzFrameAddText(cList, `${HexColors.TANGERINE}-sb 1 / -sb 2|r  Changes the scoreboard layout`)
		BlzFrameAddText(cList, `${HexColors.TANGERINE}-stfu name|r  Globally mute a player for 5 minutes`)
		BlzFrameAddText(cList, `${HexColors.TANGERINE}-g name #|r  Send a player gold`)
		//Hotkeys
		BlzFrameAddText(cList, `|n${HexColors.RED}Hotkeys:|r`)
		BlzFrameAddText(cList, `${HexColors.TANGERINE}F1|r  Opens player tools`)
		//BlzFrameAddText(cList, `${HexColors.TANGERINE}F2|r  Changes scoreboard layout`)
		BlzFrameAddText(cList, `${HexColors.TANGERINE}F8|r  Cycles owned spawners`)

		//Timer
		const timer: framehandle = BlzCreateFrameByType("Text", "cTimer", backdrop, "EscMenuLabelTextTemplate", 0);
		BlzFrameSetPoint(timer, FRAMEPOINT_BOTTOMRIGHT, backdrop, FRAMEPOINT_BOTTOMRIGHT, -0.135, 0.043);
		BlzFrameSetText(timer, "Autostart in: 20 seconds");

		//Discord box
		const dBox: framehandle = BlzCreateFrame("EscMenuEditBoxTemplate", backdrop, 0, 1);
		BlzFrameSetPoint(dBox, FRAMEPOINT_BOTTOMLEFT, cList, FRAMEPOINT_TOPLEFT, 0.00, 0.003);
		BlzFrameSetSize(dBox, 0.11, 0.03);
		BlzFrameSetText(dBox, "discord.me/risk");
		//dBox reset
		const dtrig: trigger = CreateTrigger();
		BlzTriggerRegisterFrameEvent(dtrig, dBox, FRAMEEVENT_EDITBOX_TEXT_CHANGED);
		TriggerAddAction(dtrig, () => {
			const p: player = GetTriggerPlayer();

			if (GetLocalPlayer() == p) {
				BlzFrameSetText(dBox, "discord.me/risk");
			}
		});

		//Camera box
		const cBox: framehandle = BlzCreateFrame("EscMenuEditBoxTemplate", backdrop, 0, 0);
		BlzFrameSetPoint(cBox, FRAMEPOINT_BOTTOMRIGHT, cList, FRAMEPOINT_TOPRIGHT, 0.00, 0.003);
		BlzFrameSetSize(cBox, 0.05, 0.03);
		BlzFrameSetText(cBox, "");

		//cBox update
		const ctrig: trigger = CreateTrigger();
		BlzTriggerRegisterFrameEvent(ctrig, cBox, FRAMEEVENT_EDITBOX_TEXT_CHANGED);
		TriggerAddAction(ctrig, () => {
			const distance: string = BlzGetTriggerFrameText();
			const p: player = GetTriggerPlayer();

			if (GetLocalPlayer() == p) {
				BlzFrameSetTextSizeLimit(cBox, 4);
				CameraControls.getInstance().checkCamData(PlayerCamData.get(p), [distance])
			}
		});

		//cBox text
		const cBoxText: framehandle = BlzCreateFrameByType("TEXT", "cBoxText", cBox, "EscMenuLabelTextTemplate", 0);

		BlzFrameSetPoint(cBoxText, FRAMEPOINT_RIGHT, cBox, FRAMEPOINT_LEFT, 0, -0.001);
		BlzFrameSetText(cBoxText, `Enter Cam Distance`);

		//Observe button
		const obsStr: string = "OBSERVE GAME"
		ModeUI.createButton(obsStr, FRAMEPOINT_TOP, cList, FRAMEPOINT_BOTTOM, 0, -0.01, 0.2, 0.06);
		ModeUI.frameFunc.set(obsStr, () => {
			const player: GamePlayer = GamePlayer.fromPlayer.get(GetTriggerPlayer());

			try {
				if (player.isPlaying()) {
					player.setStatus(PlayerStatus.OBSERVING);
					//SetPlayerState(player.player, PLAYER_STATE_OBSERVER, 1)
					if (GetLocalPlayer() == player.player) {
						BlzFrameSetText(ModeUI.frame.get(obsStr), "PLAY GAME");
					}
				} else {
					player.setStatus(PlayerStatus.PLAYING);
					//SetPlayerState(player.player, PLAYER_STATE_OBSERVER, 0)
					if (GetLocalPlayer() == player.player) {
						BlzFrameSetText(ModeUI.frame.get(obsStr), obsStr);
					}
				}
			} catch (error) {
				print(error)
			}
		})

		//Pro mode button
		const proMode: string = "PRO MODE"
		ModeUI.createButton(proMode, FRAMEPOINT_BOTTOMLEFT, backdrop, FRAMEPOINT_BOTTOMLEFT, 0.17, 0.03, 0.09, 0.035);
		ModeUI.frameFunc.set(proMode, () => {
			Frame.fromName("Game Type slider", 0).setValue(0);
			Frame.fromName("Ally Limit slider", 0).setValue(0);
			Frame.fromName("Diplomancy slider", 0).setValue(1);
			Frame.fromName("Fog slider", 0).setValue(1);
			Frame.fromName("Nomad Time Limit slider", 0).setValue(0);
			Frame.fromName("Gold Sending slider", 0).setValue(0);
			Frame.fromName("Ships Allowed slider", 0).setValue(0);
			Frame.fromName("Transports Load/Unload slider", 0).setValue(0);
			RoundSettings.promode = true;
		})

		//default settings button
		const standardMode: string = "DEFAULT SETTINGS"
		ModeUI.createButton(standardMode, FRAMEPOINT_BOTTOMLEFT, backdrop, FRAMEPOINT_BOTTOMLEFT, 0.03, 0.03, 0.13, 0.035);
		ModeUI.frameFunc.set(standardMode, () => {
			Frame.fromName("Game Type slider", 0).setValue(0);
			Frame.fromName("Ally Limit slider", 0).setValue(0);
			Frame.fromName("Diplomancy slider", 0).setValue(0);
			Frame.fromName("Fog slider", 0).setValue(0);
			Frame.fromName("Nomad Time Limit slider", 0).setValue(0);
			Frame.fromName("Gold Sending slider", 0).setValue(0);
			Frame.fromName("Ships Allowed slider", 0).setValue(0);
			Frame.fromName("Transports Load/Unload slider", 0).setValue(0);
			RoundSettings.promode = false;
		})

		//Start button
		const startButton: string = "START NOW";
		ModeUI.createButton(startButton, FRAMEPOINT_BOTTOMRIGHT, backdrop, FRAMEPOINT_BOTTOMRIGHT, -0.03, 0.03, 0.1, 0.035);
		ModeUI.frameFunc.set(startButton, () => {
			this.startPressed = true;
		})

		new Slider("Game Type", backdrop, 0.058, -0.06, 0.002, GameType, () => {
			Settings.getInstance().gameType = BlzFrameGetValue(Slider.fromName("Game Type").slider);

			if (BlzFrameGetValue(Slider.fromName("Game Type").slider) > 0) {
				BlzFrameSetTextColor(Slider.fromName("Game Type").text, BlzConvertColor(255, 255, 0, 0))
			} else {
				BlzFrameSetTextColor(Slider.fromName("Game Type").text, BlzConvertColor(255, 255, 255, 255))
			}
		});

		new Slider("Diplomancy", backdrop, 0.061, -0.10, -0.001, Diplomancy, () => {
			let val: number = BlzFrameGetValue(Slider.fromName("Diplomancy").slider)

			Settings.getInstance().diplomancy = val;

			const aLimit: Slider = Slider.fromName("Ally Limit");

			if (val > 0) {
				BlzFrameSetEnable(fControlBox, true);
			} else {
				BlzFrameSetEnable(fControlBox, false);
			}

			if (val > 1) {
				BlzFrameSetEnable(aLimit.slider, true);
			} else {
				BlzFrameSetEnable(aLimit.slider, false);
			}

			if (BlzFrameGetValue(Slider.fromName("Diplomancy").slider) > 0) {
				BlzFrameSetTextColor(Slider.fromName("Diplomancy").text, BlzConvertColor(255, 255, 0, 0))
			} else {
				BlzFrameSetTextColor(Slider.fromName("Diplomancy").text, BlzConvertColor(255, 255, 255, 255))
			}
		});

		new Slider("Ally Limit", backdrop, 0.053, -0.14, 0.007, AllyLimit, () => {
			Settings.getInstance().allyLimit = (BlzFrameGetValue(Slider.fromName("Ally Limit").slider) + 1);
		});
		BlzFrameSetEnable(Slider.fromName("Ally Limit").slider, false);

		//Ally control box
		const fControlBox: framehandle = BlzCreateFrameByType("CHECKBOX","FUnit Control", backdrop, "QuestCheckBox2", 0);
		const fUnitTitle: framehandle = BlzCreateFrameByType("TEXT", "FUnit Title", fControlBox, "EscMenuLabelTextTemplate", 0);
		const fullControlTrigger: trigger = CreateTrigger();

		BlzFrameSetPoint(fControlBox, FRAMEPOINT_CENTER, Slider.fromName("Ally Limit").slider, FRAMEPOINT_BOTTOMLEFT, 0.01, -0.01);
		BlzFrameSetPoint(fUnitTitle, FRAMEPOINT_LEFT, fControlBox, FRAMEPOINT_RIGHT, 0, 0)
		BlzFrameSetText(fUnitTitle, "Full Unit Control?")

		BlzTriggerRegisterFrameEvent(fullControlTrigger, fControlBox, FRAMEEVENT_CHECKBOX_CHECKED);
		BlzTriggerRegisterFrameEvent(fullControlTrigger, fControlBox, FRAMEEVENT_CHECKBOX_UNCHECKED);

		TriggerAddAction(fullControlTrigger, () => {
			if (BlzGetTriggerFrameEvent() == FRAMEEVENT_CHECKBOX_CHECKED) {
				Settings.getInstance().alliesControl = 1
			} else {
				Settings.getInstance().alliesControl = 0
			}
		})

		BlzFrameSetVisible(fControlBox, false);
		BlzFrameSetEnable(fControlBox, false);

		new Slider("Fog", backdrop, 0.039, -0.19, 0.021, Fog, () => {
			Settings.getInstance().fog = BlzFrameGetValue(Slider.fromName("Fog").slider);

			if (BlzFrameGetValue(Slider.fromName("Fog").slider) > 0) {
				BlzFrameSetTextColor(Slider.fromName("Fog").text, BlzConvertColor(255, 255, 0, 0))
			} else {
				BlzFrameSetTextColor(Slider.fromName("Fog").text, BlzConvertColor(255, 255, 255, 255))
			}
		});

		new Slider("Nomad Time Limit", backdrop, 0.075, -0.23, -0.015, NomadTimeLimit, () => {
			Settings.getInstance().nomad = BlzFrameGetValue(Slider.fromName("Nomad Time Limit").slider);

			if (BlzFrameGetValue(Slider.fromName("Nomad Time Limit").slider) > 0) {
				BlzFrameSetTextColor(Slider.fromName("Nomad Time Limit").text, BlzConvertColor(255, 255, 0, 0))
			} else {
				BlzFrameSetTextColor(Slider.fromName("Nomad Time Limit").text, BlzConvertColor(255, 255, 255, 255))
			}
		});

		new Slider("Gold Sending", backdrop, 0.064, -0.27, -0.004, GoldSending, () => {
			Settings.getInstance().gold = BlzFrameGetValue(Slider.fromName("Gold Sending").slider);

			if (BlzFrameGetValue(Slider.fromName("Gold Sending").slider) > 0) {
				BlzFrameSetTextColor(Slider.fromName("Gold Sending").text, BlzConvertColor(255, 255, 0, 0))
			} else {
				BlzFrameSetTextColor(Slider.fromName("Gold Sending").text, BlzConvertColor(255, 255, 255, 255))
			}
		});

		new Slider("Ships Allowed", backdrop, 0.066, -0.31, -0.006, ShipsAllowed, () => {
			Settings.getInstance().ships = BlzFrameGetValue(Slider.fromName("Ships Allowed").slider);

			const transports: Slider = Slider.fromName("Transports Load/Unload");

			if (Settings.getInstance().ships == 1) {
				BlzFrameSetValue(transports.slider, 1);
				BlzFrameSetEnable(transports.slider, false);
			} else {
				BlzFrameSetValue(transports.slider, 0);
				BlzFrameSetEnable(transports.slider, true);
			}

			if (BlzFrameGetValue(Slider.fromName("Ships Allowed").slider) > 0) {
				BlzFrameSetTextColor(Slider.fromName("Ships Allowed").text, BlzConvertColor(255, 255, 0, 0))
			} else {
				BlzFrameSetTextColor(Slider.fromName("Ships Allowed").text, BlzConvertColor(255, 255, 255, 255))
			}
		});

		new Slider("Transports Load/Unload", backdrop, 0.089, -0.35, -0.029, TransportLanding, () => {
			Settings.getInstance().transport = BlzFrameGetValue(Slider.fromName("Transports Load/Unload").slider);

			if (BlzFrameGetValue(Slider.fromName("Transports Load/Unload").slider) > 0) {
				BlzFrameSetTextColor(Slider.fromName("Transports Load/Unload").text, BlzConvertColor(255, 255, 0, 0))
			} else {
				BlzFrameSetTextColor(Slider.fromName("Transports Load/Unload").text, BlzConvertColor(255, 255, 255, 255))
			}
		});
		// //Modes Info
		// const modesInfo: framehandle = BlzCreateFrameByType("TEXT", "modesInfo", backdrop, "EscMenuLabelTextTemplate", 0);
		// BlzFrameSetPoint(modesInfo, FRAMEPOINT_TOP, backdrop, FRAMEPOINT_TOP, -0.27, -0.11);
		// const modesText: string = `${HexColors.RED}Game Settings|r\nGame Tracking: ${HexColors.GREEN}Unranked|r\nDiplomancy: ${HexColors.GREEN}FFA|r\nFog: ${HexColors.GREEN}Off|r\nNomad Time: ${HexColors.GREEN}60 Seconds|r\nGold Sending: ${HexColors.GREEN}Disabled|r\nShips Allowed: ${HexColors.GREEN}All|r\nTransport Load/Unload: ${HexColors.GREEN}Ports Only|r`
		// BlzFrameSetText(modesInfo, modesText);
	}

	private static createButton(name: string, framePoint: framepointtype, parent: framehandle, parentPoint: framepointtype, x: number, y: number, width: number, height: number) {
		let bFrame: framehandle = BlzCreateFrameByType("GLUETEXTBUTTON", name, parent, "ScriptDialogButton", 0);
		BlzFrameSetPoint(bFrame, framePoint, parent, parentPoint, x, y);
		BlzFrameSetText(bFrame, name);
		BlzFrameSetSize(bFrame, width, height);

		ModeUI.frame.set(name, bFrame);

		let frameTrig: trigger = CreateTrigger();
		BlzTriggerRegisterFrameEvent(frameTrig, bFrame, FRAMEEVENT_CONTROL_CLICK);
		TriggerAddAction(frameTrig, () => {
			ModeUI.frameFunc.get(name)();
			BlzFrameSetEnable(bFrame, false);
			BlzFrameSetEnable(bFrame, true);
		})

		BlzFrameSetVisible(bFrame, false);

		frameTrig = null;
		bFrame = null;
	}

	public static pList(backdrop: framehandle) {
		const pList: framehandle = BlzCreateFrameByType("TEXTAREA", "pList", backdrop, "BattleNetTextAreaTemplate", 0);
		BlzFrameSetSize(pList, 0.20, 0.36);
		BlzFrameSetPoint(pList, FRAMEPOINT_TOPRIGHT, backdrop, FRAMEPOINT_TOPRIGHT, -0.025, -0.025);

		GamePlayer.fromPlayer.forEach(gPlayer => {
			if (gPlayer.player == NEUTRAL_HOSTILE)
				return;

			BlzFrameAddText(pList, `${gPlayer.names.acct} is ${gPlayer.status}`);
		});
	}

	public static toggleForPlayer(frame: framehandle, p: player, bool: boolean) {
		if (GetLocalPlayer() == p) {
			BlzFrameSetVisible(frame, bool);
		}
	}

	public static toggleOptions(bool: boolean) {
		//TODO instead of playe(0) it would be better to find an alive/human player
		ModeUI.toggleForPlayer(BlzGetFrameByName("Game Type slider", 0), Player(0), bool);
		ModeUI.toggleForPlayer(BlzGetFrameByName("Diplomancy slider", 0), Player(0), bool);
		ModeUI.toggleForPlayer(BlzGetFrameByName("Ally Limit slider", 0), Player(0), bool);
		ModeUI.toggleForPlayer(BlzGetFrameByName("FUnit Control", 0), Player(0), bool);
		ModeUI.toggleForPlayer(BlzGetFrameByName("Fog slider", 0), Player(0), bool);
		ModeUI.toggleForPlayer(BlzGetFrameByName("Nomad Time Limit slider", 0), Player(0), bool);
		ModeUI.toggleForPlayer(BlzGetFrameByName("Gold Sending slider", 0), Player(0), bool);
		ModeUI.toggleForPlayer(BlzGetFrameByName("Ships Allowed slider", 0), Player(0), bool);
		ModeUI.toggleForPlayer(BlzGetFrameByName("Transports Load/Unload slider", 0), Player(0), bool);
		ModeUI.toggleForPlayer(BlzGetFrameByName("PRO MODE", 0), Player(0), bool);
		ModeUI.toggleForPlayer(BlzGetFrameByName("START NOW", 0), Player(0), bool);
		ModeUI.toggleForPlayer(BlzGetFrameByName("DEFAULT SETTINGS", 0), Player(0), bool);
	}

	public static toggleModeFrame(bool: boolean) {
		BlzFrameSetVisible(BlzGetFrameByName("EscMenuBackdrop", 0), bool);

		if (bool) ModeUI.toggleOptions(bool);
		if (bool) ModeUI.toggleObsButton(bool);
	}

	public static toggleObsButton(bool: boolean) {
		BlzFrameSetVisible(BlzGetFrameByName("OBSERVE GAME", 0), bool);
	}
}