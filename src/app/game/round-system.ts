import { CityAllocation } from "app/country/city-allocation-type";
import { Cities } from "app/country/city-type";
import { GamePlayer, PlayerStatus } from "app/player/player-type";
import { Scoreboard } from "app/scoreboard/scoreboard-type";
import { Trees } from "app/trees-type";
import { ModeUI } from "app/ui/mode-ui-type";
import { UserInterface } from "app/ui/user-interface-type";
import { Util } from "libs/translators";
import { MessageAll, PlayGlobalSound } from "libs/utils";
import { AID } from "resources/abilityID";
import { PLAYER_COLORS, PLAYER_COLOR_NAMES } from "resources/colordata";
import { MAX_PLAYERS, NEUTRAL_HOSTILE } from "resources/constants";
import { HexColors } from "resources/hexColors";
import { UID } from "resources/unitID";
import { Timer } from "w3ts";
import { Players } from "w3ts/globals";
import { GameTimer } from "./game-timer-type";
import { GameTracking } from "./game-tracking-type";
import { Settings } from "./round-settings";

export class Round {
	private static instance: Round;
	private count: number;
	private modes: boolean;

	constructor() {
		try {
			this.count = 0;
			this.modes = false;
			Trees.getInstance();
			GameTracking.getInstance().leader = GamePlayer.fromPlayer.get(Player(Math.floor(Math.random() * (GamePlayer.fromPlayer.size - 1))));

			ModeUI.buildModeFrame();
			FogEnable(true);
			this.runModeSelection();
		} catch (error) {
			Players.forEach(p => {
				DisplayTimedTextToPlayer(p.handle, 0, 0, 35.00, `${error}\nPlease take a screenshot and report this on the official discord!\ndiscord.me/risk\nEC:1`);
			});
		}
	}

	public runModeSelection() {
		ModeUI.toggleModeFrame(true);

		let tick: number = 45;
		const modeTimer: Timer = new Timer();
		modeTimer.start(1.00, true, () => {
			if (tick >= 1 && !ModeUI.startPressed) {//TODO tick >= 1 or start press == true
				tick--;
				BlzFrameSetText(BlzGetFrameByName("cTimer", 0), `Autostart in: ${tick} seconds`);
			} else {
				modeTimer.pause();
				modeTimer.destroy();
				ModeUI.toggleOptions(false);
				ModeUI.toggleObsButton(false);
				ModeUI.startPressed = false;
				BlzFrameSetText(BlzGetFrameByName("cTimer", 0), "");

				this.start();
			}

			BlzDestroyFrame(BlzGetFrameByName("pList", 0));
			ModeUI.pList(BlzGetFrameByName("EscMenuBackdrop", 0));
		});
	}

	public start() {
		try {
			this.count++;

			this.assignColors();
			this.setupPlayerStatus();

			Settings.getInstance().processSettings();
			CityAllocation.start();

			let tick: number = 7;
			const modeTimer: Timer = new Timer();
			modeTimer.start(1.00, true, () => {
				if (tick >= 1) {
					BlzFrameSetText(BlzGetFrameByName("cTimer", 0), `Game begins in ${tick} seconds`);
					BlzDestroyFrame(BlzGetFrameByName("pList", 0));
					ModeUI.pList(BlzGetFrameByName("EscMenuBackdrop", 0));
					tick--;
				} else {
					try {
						modeTimer.pause();
						modeTimer.destroy();
						ModeUI.toggleModeFrame(false);
						UserInterface.hideUI(false);
						Scoreboard.getInstance().init();
						GameTimer.getInstance().start();
						GameTracking.getInstance().roundInProgress = true;
						PlayGlobalSound("Sound\\Interface\\SecretFound.flac");
						Scoreboard.getInstance().toggleVis(true);
					} catch (error) {
						Players.forEach(p => {
							DisplayTimedTextToPlayer(p.handle, 0, 0, 35.00, `${error}\nPlease take a screenshot and report this on the official discord!\ndiscord.me/risk\nEC:3`);
						});
					}
				}
			});
		} catch (error) {
			Players.forEach(p => {
				DisplayTimedTextToPlayer(p.handle, 0, 0, 35.00, `${error}\nPlease take a screenshot and report this on the official discord!\ndiscord.me/risk\nEC:2`);
			});
		}
	}

	public quickStart() {
		this.setupPlayerStatus();
		CityAllocation.start();

		MessageAll(true, `${HexColors.TANGERINE}The round will start in a few seconds!|r`)
		this.count++;
		
		let tick: number = 3;
		const quickTimer: Timer = new Timer();
		quickTimer.start(1.00, true, () => {
			if (tick >= 1) {
				tick--;
			} else {
				quickTimer.pause();
				quickTimer.destroy();
				Scoreboard.getInstance().init();
				UserInterface.hideUI(false);
				GameTimer.getInstance().start();
				GameTracking.getInstance().roundInProgress = true;
				PlayGlobalSound("Sound\\Interface\\SecretFound.flac");
				Scoreboard.getInstance().toggleVis(true);
			}
		});
	}

	public end() {

	}

	public saveRound() {

	}

	public static getInstance() {
		if (this.instance == null) {
			this.instance = new Round();
		}
		return this.instance;
	}

	private assignColors() {
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
						gPlayer.setName(`${gPlayer.names.color}`);
						gPlayer.names.colorIndex = i;
					}
				}
			}
		})
	}

	private setupPlayerStatus() {
		GamePlayer.fromPlayer.forEach(gPlayer => {
			//Create player tools
			if (!gPlayer.tools) {
				gPlayer.tools = CreateUnit(gPlayer.player, UID.PLAYER_TOOLS, 18750.00, -16200.00, 270);
				SetUnitPathing(gPlayer.tools, false);
				UnitRemoveAbility(gPlayer.tools, AID.LOW_HEALTH_DEFENDER);
				UnitRemoveAbility(gPlayer.tools, AID.LOW_VALUE_DEFENDER);
				UnitRemoveAbility(gPlayer.tools, AID.ALLOW_PINGS);
				UnitRemoveAbility(gPlayer.tools, AID.FORFEIT);
			}

			//Set Players
			if ((gPlayer.isObserving() || GetPlayerState(gPlayer.player, PLAYER_STATE_OBSERVER) > 0) && !gPlayer.isLeft()) {
				SetPlayerState(gPlayer.player, PLAYER_STATE_OBSERVER, 1)
				FogModifierStart(gPlayer.fog);

				if (!gPlayer.isObserving()) {
					gPlayer.setStatus(PlayerStatus.OBSERVING)
				}
			} else if (gPlayer.isPlaying()) {
				SetPlayerState(gPlayer.player, PLAYER_STATE_OBSERVER, 0)
				if (gPlayer.bonus.bar === null) gPlayer.initBonusUI();
				gPlayer.setStatus(PlayerStatus.ALIVE);
			}

			gPlayer.initKDMaps();

			if (gPlayer.player == NEUTRAL_HOSTILE) {
				gPlayer.setName(`NEUTRAL HOSTILE`);
			}
		});
	}
}
