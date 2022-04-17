import CameraControls from "app/camera-controls";
import { CommandProcessor } from "app/commands/command-processor";
import { CityAllocation } from "app/country/city-allocation";
import { onOwnerChange } from "app/country/city-owner-change-trigger";
import { City } from "app/country/city-type";
import { Country } from "app/country/country-type";
import { ModeUI } from "app/mode-ui-type";
import { GamePlayer, PlayerNames, PlayerStatus } from "app/player/player-type";
import { unitSpellEffect } from "app/spells/unitSpellEffect";
import { Trees } from "app/Trees";
import { UserInterface } from "app/user-interface-type";
import { PLAYER_COLORS, PLAYER_COLOR_NAMES } from "libs/playerColorData";
import { Util } from "libs/translators";
import { AID } from "resources/abilityID";
import { HexColors } from "resources/hexColors";
import { UID } from "resources/unitID";
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
		onOwnerChange();
	}

	private static onLoad() {
		print(`${Util.RandomEnumKey(HexColors)}Game type is:|r ${Util.RandomEnumKey(HexColors)}${GameStatus.getInstance().toString()}|r`);
		UserInterface.onLoad();
		CameraControls.getInstance();
		Trees.getInstance();

		Players.forEach(player => {
			player.name = PlayerNames.shift();

			if (player.slotState == PLAYER_SLOT_STATE_PLAYING) {
				if (player.id >= 25) return; //Exclude ai that is not neutral hostile

				GamePlayer.fromID.set(player.id, new GamePlayer(player.handle));

				if (player.id >= 24) return; //Exclude neutral hostile
			}
		})

		ModeUI.buildModeFrame();
		ModeUI.toggleModeFrame(true);

		//I should refactor this somehow, right now this is a long chain of code
		Game.runModeSelection();
		// The chain begins with runmodeselection -> initroundsettings -> initround
	}

	private static runModeSelection() {
		let tick: number = 5;
		const modeTimer: Timer = new Timer();
		modeTimer.start(1.00, true, () => {
			if (tick >= 1) {
				tick--;
				BlzFrameSetText(BlzGetFrameByName("cTimer", 0), `Mode selection ends in ${tick} seconds`);
				BlzDestroyFrame(BlzGetFrameByName("pList", 0));
				ModeUI.pList(BlzGetFrameByName("EscMenuBackdrop", 0));
			} else {
				modeTimer.pause();
				modeTimer.destroy();
				BlzFrameSetVisible(BlzGetFrameByName("OBSERVE GAME", 0), false);
				BlzFrameSetText(BlzGetFrameByName("cTimer", 0), `Game starts in 5 seconds`);
				Game.initRound();
			}
		});
	}

	private static initRound() {
		Game.assignColors();
		GamePlayer.fromID.forEach(gPlayer => {
			//Create player tools
			let u: unit = CreateUnit(gPlayer.player, UID.PLAYER_TOOLS, 18750.00, -16200.00, 270);
			SetUnitPathing(u, false);
			UnitRemoveAbility(u, AID.LOW_HEALTH_DEFENDER);
			UnitRemoveAbility(u, AID.LOW_VALUE_DEFENDER);
			UnitRemoveAbility(u, AID.ALLOW_PINGS);
			UnitRemoveAbility(u, AID.FORFEIT);
			//Set Players
			if (gPlayer.isPlaying()) {
				gPlayer.initBonusUI();
				gPlayer.setStatus(PlayerStatus.ALIVE);
			}
		});

		CityAllocation.start();
		//Create scoreboard
		//Start turn timer

		let tick: number = 5;
		const modeTimer: Timer = new Timer();
		modeTimer.start(1.00, true, () => {
			if (tick >= 1) {
				BlzFrameSetText(BlzGetFrameByName("cTimer", 0), `Game starts in ${tick} seconds`);
				BlzDestroyFrame(BlzGetFrameByName("pList", 0));
				ModeUI.pList(BlzGetFrameByName("EscMenuBackdrop", 0));
				tick--;
			} else {
				modeTimer.pause();
				modeTimer.destroy();
				BlzFrameSetVisible(BlzGetFrameByName("EscMenuBackdrop", 0), false);
				UserInterface.hideUI(false);
				//TODO: Maybe a sound? at this point gmae is loaded and starting
			}
		});
	}

	private static assignColors() {
		const colors: playercolor[] = [];
		let tracker: number = 0;

		GamePlayer.fromID.forEach(gPlayer => {
			if (gPlayer.isPlaying()) {
				if (GetPlayerId(gPlayer.player) >= 24) return; //Exclude neutral ai

				colors.push(PLAYER_COLORS[tracker]);
				tracker++;
			}
		})

		Util.ShuffleArray(colors);

		GamePlayer.fromID.forEach(gPlayer => {
			if (gPlayer.isPlaying()) {
				if (GetPlayerId(gPlayer.player) >= 24) return; //Exclude neutral ai

				SetPlayerColor(gPlayer.player, colors.pop())

				for (let i = 0; i < PLAYER_COLORS.length; i++) {
					if (GetPlayerColor(gPlayer.player) == PLAYER_COLORS[i]) {
						gPlayer.names.color = PLAYER_COLOR_NAMES[i]
						//print(`btag: ${gPlayer.names.btag}\nacct: ${gPlayer.names.acct}\ncolor: ${gPlayer.names.color}`)
						//print(`real name ${GetPlayerName(gPlayer.player)}`)
						//print(`set real name tp ${gPlayer.names.color}`)
						SetPlayerName(gPlayer.player, gPlayer.names.color); //TODO: turn this to a func in player-type
						//print(`real name ${GetPlayerName(gPlayer.player)}`)
					}
				}
			}
		})
	}

}
