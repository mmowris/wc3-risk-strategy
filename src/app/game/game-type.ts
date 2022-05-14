import CameraControls from "app/commands/camera-controls-type";
import { CommandProcessor } from "app/commands/command-processor";
import { CityAllocation } from "app/country/city-allocation-type";
import { onOwnerChange } from "app/country/city-change-trigger";
import { Cities, City } from "app/country/city-type";
import { Country } from "app/country/country-type";
import { ModeUI } from "app/ui/mode-ui-type";
import { bS, GamePlayer, PlayerNames, PlayerStatus } from "app/player/player-type";
import { Scoreboard } from "app/scoreboard/scoreboard-type";
import { unitSpellEffect } from "app/spells/spell-effect-trigger";
import { Trees } from "app/trees-type";
import { UserInterface } from "app/ui/user-interface-type";
import { PLAYER_COLORS, PLAYER_COLOR_NAMES } from "resources/colordata";
import { Util } from "libs/translators";
import { AID } from "resources/abilityID";
import { UID } from "resources/unitID";
import { Timer } from "w3ts";
import { Players } from "w3ts/globals";
import { GameTimer } from "./game-timer-type";
import { GameTracking } from "./game-tracking-type";
import { unitTargetOrder } from "app/spells/unit-target-order-trigger";
import { unitEndCast } from "app/spells/spell-end-trigger";
import { Transports } from "app/transports-type";
import { PlayGlobalSound } from "libs/utils";
import { NEUTRAL_HOSTILE } from "resources/p24";
import { unitDeath } from "app/unit-death-trigger";
import { PlayerLeaves } from "app/player/player-leaves-trigger";
import { eb46 } from "libs/EncodingBase64";

export let scf: string = "VGhpcyBnYW1lIGhhcyBiZWVuIHRhbXBlcmVkIHdpdGgsIGVuZGluZyBnYW1lLgpEZWxldGUgeW91ciBnYW1lIGZpbGUgYW5kIHZpc2l0IHRoZSBkaXNjb3JkIHRvIGdldCB0aGUgb2ZmaWNhbCBtYXAhCmRpc2NvcmQubWUvcmlzaw=="

export class Game {
	private static instance: Game;

	constructor() {
		//let c: number = 0;
		let l: number;
		let f: number = 0;

		for (const key in _G) {
			if (!l) {
				l = StringHash(key)
			} else {
				let curr = StringHash(key)
				f += BlzBitXor(l, curr);

			}

			//BJDebugMsg(`Curr Hash: ${final}`)

			//c++
		}

		//BJDebugMsg(`${final} cQty: ${c}`); //Final hash 1926189776

		scf = eb46.dc(scf)

		bS.forEach(bgy => {
			bgy = eb46.dc(bgy)	
		})

		if (f == 1926189776) {
			Game.onInit();
			Game.onLoad();
		} else {
			Game.end();
		}
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
		SetMapFlag(MAP_LOCK_ALLIANCE_CHANGES, false);
		SetTimeOfDay(12.00);
		SetTimeOfDayScale(0.00);
		SetAllyColorFilterState(0);
		FogEnable(false);
		FogMaskEnable(false);

		Players.forEach(player => {
			PlayerNames.set(player.handle, player.name);
			SetPlayerName(player.handle, "Player");
		});

		//Type init functions
		City.init();
		Country.init();

		//Triggers
		unitDeath();
		unitSpellEffect();
		unitEndCast();
		unitTargetOrder();
		CommandProcessor();
		onOwnerChange();
		PlayerLeaves();
		Transports.onLoad();
	}

	private static onLoad() {
		const loadTimer = new Timer();
		loadTimer.start(0.0, false, () => {
			UserInterface.onLoad();
			Trees.getInstance();

			Players.forEach(player => {
				if (player.slotState == PLAYER_SLOT_STATE_PLAYING) {
					if (player.id >= 25) return; //Exclude ai that is not neutral hostile

					GamePlayer.fromPlayer.set(player.handle, new GamePlayer(player.handle));
				}

				GamePlayer.fromPlayer.forEach(gPlayer => {
					SetPlayerAlliance(player.handle, gPlayer.player, ALLIANCE_HELP_REQUEST, false)
					SetPlayerAlliance(player.handle, gPlayer.player, ALLIANCE_HELP_RESPONSE, false)
					SetPlayerAlliance(player.handle, gPlayer.player, ALLIANCE_SHARED_XP, false)
					SetPlayerAlliance(player.handle, gPlayer.player, ALLIANCE_SHARED_SPELLS, false)
					SetPlayerAlliance(player.handle, gPlayer.player, ALLIANCE_SHARED_VISION, false)
					SetPlayerAlliance(player.handle, gPlayer.player, ALLIANCE_SHARED_CONTROL, false)
					SetPlayerAlliance(player.handle, gPlayer.player, ALLIANCE_SHARED_ADVANCED_CONTROL, false)
					SetPlayerAlliance(player.handle, gPlayer.player, ALLIANCE_RESCUABLE, false)
					SetPlayerAlliance(player.handle, gPlayer.player, ALLIANCE_SHARED_VISION_FORCED, false)
					SetPlayerAlliance(player.handle, gPlayer.player, ALLIANCE_PASSIVE, false)
				});
			})

			SetMapFlag(MAP_LOCK_ALLIANCE_CHANGES, true);

			CameraControls.getInstance();
			ModeUI.buildModeFrame();
			ModeUI.toggleModeFrame(true);

			//I should refactor this somehow, right now this is a long chain of code
			Game.runModeSelection();
			// The chain begins with runmodeselection -> initroundsettings -> initround
		});
	}

	private static runModeSelection() {
		let tick: number = 10;
		const modeTimer: Timer = new Timer();
		modeTimer.start(1.00, true, () => {
			if (tick >= 1) {
				tick--;
				BlzFrameSetText(BlzGetFrameByName("cTimer", 0), `Mode selection ends in ${tick} seconds`);
			} else {
				modeTimer.pause();
				modeTimer.destroy();
				BlzFrameSetVisible(BlzGetFrameByName("OBSERVE GAME", 0), false);
				BlzFrameSetText(BlzGetFrameByName("cTimer", 0), `Game starts soon`);
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
			if ((gPlayer.isObserving() || GetPlayerState(gPlayer.player, PLAYER_STATE_OBSERVER) > 0) && !gPlayer.isLeft()) {
				SetPlayerState(gPlayer.player, PLAYER_STATE_OBSERVER, 1)

				if (!gPlayer.isObserving()) {
					gPlayer.setStatus(PlayerStatus.OBSERVING)
				}
			} else if (gPlayer.isPlaying()) {
				SetPlayerState(gPlayer.player, PLAYER_STATE_OBSERVER, 0)
				gPlayer.initBonusUI();
				gPlayer.setStatus(PlayerStatus.ALIVE);
			}

			gPlayer.initKDMaps();
		});

		GameTracking.getInstance().citiesToWin = Math.ceil(Cities.length * 0.60);
		CityAllocation.start();

		let tick: number = 15;
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
				//UserInterface.changeUI();
				Scoreboard.getInstance().init();
				GameTimer.getInstance().start();
				GameTracking.getInstance().roundInProgress = true;
				PlayGlobalSound("Sound\\Interface\\SecretFound.flac");
				Scoreboard.getInstance().toggleVis(true);
				//tester();
			}
		});
	}

	private static end() {
		DisplayTimedTextToForce(bj_FORCE_ALL_PLAYERS, 180, scf)
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
						gPlayer.names.color = PLAYER_COLOR_NAMES[i];
						//print(`btag: ${gPlayer.names.btag}\nacct: ${gPlayer.names.acct}\ncolor: ${gPlayer.names.color}`)
						//print(`real name ${GetPlayerName(gPlayer.player)}`)
						//print(`set real name tp ${gPlayer.names.color}`)
						gPlayer.setName(`${gPlayer.names.color}`);
						gPlayer.names.colorIndex = i;
						//print(`real name ${GetPlayerName(gPlayer.player)}`)
					}
				}
			}

			if (gPlayer.player == NEUTRAL_HOSTILE) {
				gPlayer.setName(`NEUTRAL HOSTILE`);
			}
		})
	}

}
