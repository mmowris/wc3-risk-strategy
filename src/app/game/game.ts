import CameraControls, { PlayerCamData } from "app/camera-controls";
import { CommandProcessor } from "app/commands/command-processor";
import { City } from "app/country/city-type";
import { Country } from "app/country/country-type";
import { GamePlayer, PlayerNames, PlayerStatus } from "app/player/player-type";
import { unitSpellEffect } from "app/spells/unitSpellEffect";
import { Trees } from "app/Trees";
import { UserInterface } from "app/user-interface-type";
import { PLAYER_COLORS } from "libs/playerColorData";
import { Util } from "libs/translators";
import { HexColors } from "resources/hexColors";
import { Timer } from "w3ts";
import { Players } from "w3ts/globals";
import { GameStatus } from "./game-status";

export class Game {
	private static instance: Game;
	public static promode: boolean;

	constructor() {
		Game.onInit();

		const loadTimer = new Timer();
		loadTimer.start(0.0, false, () => {
			try {
				Game.onLoad();
			}
			catch (e) {
				print(e);
			}
		});
	}

	public static getInstance() {
		if (this.instance == null) {
			this.instance = new Game();
		}
		return this.instance;
	}

	private static onInit() {
		if (!BlzLoadTOCFile("war3mapimported\\Risk.toc")) {
			print("Failed to load TOC file!");
		};

		if (!BlzChangeMinimapTerrainTex("minimap.blp")) {
			print("Failed to load minimap file!");
		};

		SetGameSpeed(MAP_SPEED_FASTEST);
		SetMapFlag(MAP_LOCK_SPEED, true);
		SetMapFlag(MAP_USE_HANDICAPS, true);
		SetMapFlag(MAP_LOCK_ALLIANCE_CHANGES, true);
		SetTimeOfDay(12.00);
		SetTimeOfDayScale(0.00);
		SetAllyColorFilterState(0);
		FogEnable(false);
		FogMaskEnable(false);

		Players.forEach(player => {
			PlayerNames.push(player.name);
			player.name = "Player";
		});

		//Type init functions
		City.init();
		Country.init();

		//Singletons

		//Triggers
		unitSpellEffect();
		CommandProcessor();
	}

	private static onLoad() {
		print(`${Util.RandomEnumKey(HexColors)}Game type is:|r ${Util.RandomEnumKey(HexColors)}${GameStatus.getInstance().toString()}|r`);
		UserInterface.onLoad();
		CameraControls.getInstance();
		Trees.getInstance();

		const colors: playercolor[] = [];
		let tracker: number = 0;

		Players.forEach(player => {
			player.name = PlayerNames.shift();

			if (player.slotState == PLAYER_SLOT_STATE_PLAYING) {
				if (player.id >= 25) return; //Exclude ai that is not neutral hostile

				GamePlayer.fromID.set(player.id, new GamePlayer(player.handle));

				if (player.id >= 24) return; //Exclude neutral hostile

				colors.push(PLAYER_COLORS[tracker]);
				tracker++;
			}
		})

		Game.buildInfoFrame();
		//Run Round.Pre here
		//game options (promode/standard)
		//obverse or play

		//Create ui with 2 buttons and 2 "tooltip" boxes
		//Left side only host can see buttons, others see text
		//Left side will have "promode" and "standard" buttons
		//Under buttons will be explanation box
		//Right side will have observer options

		//
		//  *********************************************************
		//  *   Game Options                            Logo        *
		//  * *              *                       Lobby List     *
		//  * *              *                    *              *  *
		//  * *              *                    *              *  *
		//  * ****************                    *              *  *
		//  * Observer Options                    *              *  *
		//  *                *                    *              *  *
		//  *                *                    *              *  *
		//  *                *                    *              *  *
		//  ******************                    *              *  *
		//  *                                     ************** *  *
		//  *                                                       *
		//  *********************************************************
		//

		Util.ShuffleArray(colors);

		GamePlayer.fromID.forEach(gPlayer => {
			//     if (gPlayer.player == Player(24)) return; //Exclude neutral hostile

			//     SetPlayerColor(gPlayer.player, colors.pop());
			//     //TODO: promode, edit below
			//     for (let i = 0; i < GamePlayer.fromID.size; i++) {
			//         if (GetPlayerColor(gPlayer.player) == PLAYER_COLORS[i]) {
			//             gPlayer.names.color = PLAYER_COLOR_NAMES[i]
			//             SetPlayerName(gPlayer.player, PLAYER_COLOR_NAMES[i])
			//         }
			//     }

			//     //Round.Start - v2
			//     if (GetLocalPlayer() == gPlayer.player) {
			//         EnableDragSelect(false, true);
			//         EnableSelect(false, true);
			//     }

			//     //Create Player Tools
			//     SetUnitPathing(CreateUnit(gPlayer.player, UID.PLAYER_TOOLS, 18750.00, -16200.00, 270), false);

			//     //TODO: Round.preRound() - Settings/Promode Check/Observer Check
			//     gPlayer.setStatus(PlayerStatus.ALIVE);
			//     //TODO: Add to multiboard array

			//     //TODO: Allocate cities
			//     //TODO: Update city counts
			//     //TODO: Update unit counts

			//     //TODO: 1 Second timer that has:
			//     //Multiboard creation
			//     //Turn timer start
			//     //Enable selection
		});
	}

	private static preRound() {
		//Create game options UI
		//Create 15 second timer that will close game options UI
		//After 15 seconds create UI with lobby list and game options/explanation
	}

	private static buildInfoFrame() {
		//Backdrop
		const backdrop: framehandle = BlzCreateFrame("EscMenuBackdrop", BlzGetOriginFrame(ORIGIN_FRAME_GAME_UI, 0), 0, 0);
		BlzFrameSetAbsPoint(backdrop, FRAMEPOINT_CENTER, 0.4, 0.3);
		BlzFrameSetSize(backdrop, 0.80, 0.46);
		BlzFrameSetVisible(backdrop, true);

		//Title
		const title: framehandle = BlzCreateFrameByType("BACKDROP", "title", backdrop, "", 0);
		BlzFrameSetSize(title, 0.20, 0.15);
		BlzFrameSetPoint(title, FRAMEPOINT_CENTER, backdrop, FRAMEPOINT_TOP, 0.00, -0.045);
		BlzFrameSetTexture(title, "war3mapimported\\ModeTitle.dds", 0, true);

		//Player List
		const pList: framehandle = BlzCreateFrameByType("TEXTAREA", "pList", backdrop, "BattleNetTextAreaTemplate", 0);
		BlzFrameSetSize(pList, 0.20, 0.38);
		BlzFrameSetPoint(pList, FRAMEPOINT_TOPRIGHT, backdrop, FRAMEPOINT_TOPRIGHT, -0.025, -0.025);

		GamePlayer.fromID.forEach(gPlayer => {
			if (gPlayer.isPlaying() || gPlayer.isObserving()) {
				if (gPlayer.player == Player(24)) return;

				BlzFrameAddText(pList, `${gPlayer.names.acct} is ${gPlayer.status}`)
			}
		});

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
		BlzFrameAddText(cList, `${HexColors.TANGERINE}-names / -players|r  Show players that were in the lobby`)
		BlzFrameAddText(cList, `${HexColors.TANGERINE}-sb 1 / -sb 2|r  Changes the scoreboard layout`)
		BlzFrameAddText(cList, `${HexColors.TANGERINE}-stfu name|r  Globally mute a player for 90 seconds`)
		//Hotkeys
		BlzFrameAddText(cList, `|n${HexColors.RED}Hotkeys:|r`)
		BlzFrameAddText(cList, `${HexColors.TANGERINE}F1|r  Opens player tools`)
		BlzFrameAddText(cList, `${HexColors.TANGERINE}F2|r  Changes scoreboard layout`)
		BlzFrameAddText(cList, `${HexColors.TANGERINE}F8|r  Cycles owned spawners`)

		//Timer
		const timer: framehandle = BlzCreateFrameByType("Text", "timer", backdrop, "EscMenuLabelTextTemplate", 0);
		BlzFrameSetPoint(timer, FRAMEPOINT_RIGHT, backdrop, FRAMEPOINT_BOTTOMRIGHT, -0.03, 0.04);
		BlzFrameSetText(timer, "Game starts in 45 seconds");

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
		BlzFrameSetSize(cBox, 0.12, 0.03);
		BlzFrameSetText(cBox, "Enter Cam Distance");
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

		//Start button
		UserInterface.CreateButton(`${HexColors.TURQUOISE}START GAME|r`, FRAMEPOINT_RIGHT, cList, FRAMEPOINT_BOTTOMRIGHT, 0, -0.037, 0.1, 0.06);
		UserInterface.frameFunc.set(`${HexColors.TURQUOISE}START GAME|r`, () => {
			print("start test")
			//this.endModeSelection();
		})

		UserInterface.toggleForPlayer(`${HexColors.TURQUOISE}START GAME|r`, Player(0), true); //TODO: introduce a global called "host player"

		//Observe button
		UserInterface.CreateButton("OBSERVE GAME", FRAMEPOINT_LEFT, cList, FRAMEPOINT_BOTTOMLEFT, 0, -0.037, 0.2, 0.06);
		UserInterface.frameFunc.set("OBSERVE GAME", () => {
			const player: GamePlayer = GamePlayer.fromID.get(GetPlayerId(GetTriggerPlayer()));

			if (player.isPlaying()) {
				player.setStatus(PlayerStatus.OBSERVING);

				if (GetLocalPlayer() == player.player) {
					BlzFrameSetText(UserInterface.frame.get("OBSERVE GAME"), "PLAY GAME");
				}
			} else {
				player.setStatus(PlayerStatus.PLAYING);

				if (GetLocalPlayer() == player.player) {
					BlzFrameSetText(UserInterface.frame.get("OBSERVE GAME"), "OBSERVE GAME");
				}
			}
		})

		GamePlayer.fromID.forEach(gPlayer => {
			UserInterface.toggleForPlayer(`OBSERVE GAME`, gPlayer.player, true);
		});
	}
}