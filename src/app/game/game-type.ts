import CameraControls from "app/commands/camera-controls-type";
import { onOwnerChange } from "app/country/city-change-trigger";
import { Cities, City } from "app/country/city-type";
import { Country } from "app/country/country-type";
import { bS, GamePlayer, PlayerNames } from "app/player/player-type";
import { unitSpellEffect } from "app/spells/spell-effect-trigger";
import { UserInterface } from "app/ui/user-interface-type";
import { Timer } from "w3ts";
import { Players } from "w3ts/globals";
import { GameTracking } from "./game-tracking-type";
import { unitTargetOrder } from "app/spells/unit-target-order-trigger";
import { unitEndCast } from "app/spells/spell-end-trigger";
import { Transports } from "app/transports-type";
import { unitDeath } from "app/unit-death-trigger";
import { PlayerLeaves } from "app/player/player-leaves-trigger";
import { eb46 } from "libs/EncodingBase64";
import { Round } from "./round-system";
import { CommandProcessor } from "app/commands/command-processor";

export class Game {
	private static instance: Game;

	constructor() {
		for (let i = 0; i < bS.length; i++) {
			bS[i] = eb46.dc(bS[i]);
		}

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
		GameTracking.getInstance().citiesToWin = Math.ceil(Cities.length * 0.60);

		//Triggers
		CommandProcessor();
		unitDeath();
		unitSpellEffect();
		unitEndCast();
		unitTargetOrder();
		onOwnerChange();
		PlayerLeaves();
		Transports.onLoad();

		//Load Game
		this.onLoad();
	}

	public static getInstance() {
		if (this.instance == null) {
			this.instance = new Game();
		}
		return this.instance;
	}

	private onLoad() {
		const loadTimer = new Timer();
		loadTimer.start(0.0, false, () => {
			try {
				UserInterface.onLoad();
				CameraControls.getInstance();

				Players.forEach(player => {
					if (player.slotState == PLAYER_SLOT_STATE_PLAYING || player.getState(PLAYER_STATE_OBSERVER) > 0) {
						if (player.id >= 25) return; //Exclude ai that is not neutral hostile

						GamePlayer.fromPlayer.set(player.handle, new GamePlayer(player.handle));
					}
				})

				Round.getInstance();
			} catch (error) {
				print(error)
			}

		});
	}
}
