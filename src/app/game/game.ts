import CameraControls from "app/camera-controls";
import { CommandProcessor } from "app/commands/command-processor";
import { City } from "app/country/city-type";
import { Country } from "app/country/country-type";
import { ModeUI } from "app/mode-ui-type";
import { GamePlayer, PlayerNames } from "app/player/player-type";
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

		ModeUI.buildModeFrame();
		ModeUI.toggleModeFrame(true);

		let tick: number = 15
		const modeTimer: Timer = new Timer();
		modeTimer.start(1.00, true, () => {
			if (tick >= 1) {
				tick--
				BlzFrameSetText(BlzGetFrameByName("cTimer", 0), `Game starts in ${tick} seconds`);
				BlzDestroyFrame(BlzGetFrameByName("pList", 0));
				ModeUI.pList(BlzGetFrameByName("EscMenuBackdrop", 0));
			} else {
				modeTimer.pause();
				modeTimer.destroy();
				BlzFrameSetVisible(BlzGetFrameByName("EscMenuBackdrop", 0), false);
				//randomize colors
			}
		})
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
		
	}
}