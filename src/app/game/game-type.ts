import CameraControls from "app/commands/camera-controls-type";
import { CommandProcessor } from "app/commands/command-processor";
import { CityAllocation } from "app/country/city-allocation-type";
import { onOwnerChange } from "app/country/city-change-trigger";
import { Cities, City } from "app/country/city-type";
import { Country } from "app/country/country-type";
import { ModeUI } from "app/ui/mode-ui-type";
import { GamePlayer, PlayerNames, PlayerStatus } from "app/player/player-type";
import { Scoreboard } from "app/scoreboard/scoreboard-type";
import { unitSpellEffect } from "app/spells/spell-effect-trigger";
import { Trees } from "app/trees-type";
import { UserInterface } from "app/ui/user-interface-type";
import { PLAYER_COLORS, PLAYER_COLOR_NAMES } from "resources/colordata";
import { Util } from "libs/translators";
import { AID } from "resources/abilityID";
import { HexColors } from "resources/hexColors";
import { UID } from "resources/unitID";
import { Timer } from "w3ts";
import { Players } from "w3ts/globals";
import { GameStatus } from "./game-status-type";
import { GameTimer } from "./game-timer-type";
import { GameTracking } from "./game-tracking-type";
import { unitTargetOrder } from "app/spells/unit-target-order-trigger";
import { unitEndCast } from "app/spells/spell-end-trigger";
import { Transports } from "app/transports-type";
import { PlayGlobalSound } from "libs/utils";
import { NEUTRAL_HOSTILE } from "resources/p24";
import { unitDeath } from "app/unit-death-trigger";

const bList: string[] = [
	"HotWheel95#2632",
	"footman#11549",
	"Selinace#1683",
	"RiskRiskRisk#1582"
];

export class Game {
	private static instance: Game;

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
		unitDeath();
		unitSpellEffect();
		unitEndCast();
		unitTargetOrder();
		CommandProcessor();
		onOwnerChange();
		Transports.onLoad();
	}

	private static onLoad() {
		print(`${Util.RandomEnumKey(HexColors)}Game type is:|r ${Util.RandomEnumKey(HexColors)}${GameStatus.getInstance().toString()}|r`);
		UserInterface.onLoad();
		CameraControls.getInstance();
		Trees.getInstance();

		Players.forEach(player => {
			player.name = PlayerNames.shift();

			bList.forEach(name => {
				if (player.name.toLowerCase() == name.toLowerCase()) {
					CustomDefeatBJ(player.handle, "Banned for malicious behavior");
					Players.forEach(player => {
						DisplayTimedTextToPlayer(player.handle, 0.0, 0.0, 180.00, `${player.name} is banned for malicious behavior`);
					});
				}
			});

			if (player.slotState == PLAYER_SLOT_STATE_PLAYING) {
				if (player.id >= 25) return; //Exclude ai that is not neutral hostile

				GamePlayer.fromPlayer.set(player.handle, new GamePlayer(player.handle));
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
			} else {
				modeTimer.pause();
				modeTimer.destroy();
				BlzFrameSetVisible(BlzGetFrameByName("OBSERVE GAME", 0), false);
				BlzFrameSetText(BlzGetFrameByName("cTimer", 0), `Game starts in 5 seconds`);
				Game.initRound();
			}

			BlzDestroyFrame(BlzGetFrameByName("pList", 0));
			ModeUI.pList(BlzGetFrameByName("EscMenuBackdrop", 0));
		});
	}

	private static initRound() {
		Game.assignColors();
		GamePlayer.fromPlayer.forEach(gPlayer => {
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

			gPlayer.initKDMaps();
		});

		GameTracking.getInstance().citiesToWin = Math.ceil(Cities.length * 0.60);
		CityAllocation.start();

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
				Scoreboard.getInstance().init();
				GameTimer.getInstance().start();
				GameTracking.getInstance().roundInProgress = true;
				PlayGlobalSound("Sound\\Interface\\SecretFound.flac");
			}
		});
	}

	private static assignColors() {
		const colors: playercolor[] = [];
		let tracker: number = 0;

		GamePlayer.fromPlayer.forEach(gPlayer => {
			if (gPlayer.isPlaying()) {
				if (GetPlayerId(gPlayer.player) >= 24) return; //Exclude neutral ai

				colors.push(PLAYER_COLORS[tracker]);
				tracker++;
			}
		})

		Util.ShuffleArray(colors);

		GamePlayer.fromPlayer.forEach(gPlayer => {
			if (gPlayer.isPlaying()) {
				if (GetPlayerId(gPlayer.player) >= 24) return; //Exclude neutral ai

				SetPlayerColor(gPlayer.player, colors.pop())

				for (let i = 0; i < PLAYER_COLORS.length; i++) {
					if (GetPlayerColor(gPlayer.player) == PLAYER_COLORS[i]) {
						gPlayer.names.color = PLAYER_COLOR_NAMES[i]
						//print(`btag: ${gPlayer.names.btag}\nacct: ${gPlayer.names.acct}\ncolor: ${gPlayer.names.color}`)
						//print(`real name ${GetPlayerName(gPlayer.player)}`)
						//print(`set real name tp ${gPlayer.names.color}`)
						gPlayer.setName(`${gPlayer.names.color}`);
						gPlayer.names.colorIndex = i;
						//print(`real name ${GetPlayerName(gPlayer.player)}`)
					}
				}
			}

			if (gPlayer.player == NEUTRAL_HOSTILE ) {
				gPlayer.setName(`${`NEUTRAL HOSTILE`}`)
			}
		})
	}

}
