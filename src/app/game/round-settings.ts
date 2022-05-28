import { GamePlayer } from "app/player/player-type";
import { UserInterface } from "app/ui/user-interface-type";
import { MAX_PLAYERS } from "resources/constants";
import { UID } from "resources/unitID";
import { UTYPE } from "resources/unitTypes";

export interface RoundSettings {
	gameType: number;
	diplomancy: number;
	allies: number;
	alliesControl: number;
	fog: number;
	names: number;
	nomad: number;
	gold: number;
	ships: number;
	transport: number;
}

// private test: RoundSettings = {
// 	gameType: 0,
// 	diplomancy: 0,
// 	allies: 0,
// 	alliesControl: 0,
// 	fog: 0,
// 	names: 0,
// 	nomad: 0,
// 	gold: 0,
// 	ships: 0,
// 	transport: 0,
// }

export class Settings {
	private static instance: Settings;
	public gameType: number = 0;
	public diplomancy: number = 0;
	public allies: number = 1;
	public alliesControl: number = 0;
	public fog: number = 0;
	public names: number = 0;
	public nomad: number = 0;
	public gold: number = 0;
	public ships: number = 0;
	public transport: number = 0;

	public static getInstance() {
		if (this.instance == null) {
			this.instance = new Settings();
		}
		return this.instance;
	}

	constructor() { }

	/**
	 * processSettings
	 */
	public processSettings() {
		this.gameTypeSetup();
		this.diplomancySetup();
		this.alliesSetup();
		this.fogSetup();
		this.namesSetup();
		this.nomadSetup();
		this.goldSetup();
		this.shipsSetup();
		this.transportSetup();
	}

	/**
	 * gameTypeSetup
	 */
	private gameTypeSetup() {
		//TODO: I can turn the win condition into a function member of the Round class. This can be used to define the function
		switch (this.gameType) {
			case 1:

				break;

			case 2:

				break;

			default: //Conquest
				break;
		}
	}

	/**
	 * diplomancySetup
	 */
	private diplomancySetup() {
		switch (this.diplomancy) {
			case 1: //Lobby Teams
				//TODO: Nothing?
				break;

			case 2: //Random Teams
				this.unallyLobby();
				//TODO: Create random teams based off allies number
				break;

			case 3: //Free Ally
				//TODO: Turn on trigger that will allow players to ally one another
				this.unallyLobby();
				SetMapFlag(MAP_LOCK_ALLIANCE_CHANGES, false);
				break;
			default: //FFA
				this.unallyLobby();
				UserInterface.ffaSetup();
				break;
		}

		if (this.alliesControl == 1) {
			this.alliesControlSetup();
		}
	}

	/**
	 * unallyLobby
	 */
	private unallyLobby() {
		for (let i = 0; i < MAX_PLAYERS; i++) {
			for (let j = 0; j < MAX_PLAYERS; j++) {
				SetPlayerAlliance(Player(i), Player(j), ALLIANCE_HELP_REQUEST, false)
				SetPlayerAlliance(Player(i), Player(j), ALLIANCE_HELP_RESPONSE, false)
				SetPlayerAlliance(Player(i), Player(j), ALLIANCE_SHARED_XP, false)
				SetPlayerAlliance(Player(i), Player(j), ALLIANCE_SHARED_SPELLS, false)
				SetPlayerAlliance(Player(i), Player(j), ALLIANCE_SHARED_VISION, false)
				SetPlayerAlliance(Player(i), Player(j), ALLIANCE_SHARED_CONTROL, false)
				SetPlayerAlliance(Player(i), Player(j), ALLIANCE_SHARED_ADVANCED_CONTROL, false)
				SetPlayerAlliance(Player(i), Player(j), ALLIANCE_RESCUABLE, false)
				SetPlayerAlliance(Player(i), Player(j), ALLIANCE_SHARED_VISION_FORCED, false)
				SetPlayerAlliance(Player(i), Player(j), ALLIANCE_PASSIVE, false)
			}
		}
	}

	/**
	 * alliesSetup
	 */
	private alliesSetup() {
		//TODO Set Ally Limit
	}

	/**
	 * alliesControlSetup
	 */
	private alliesControlSetup() {
		//TODO
	}

	/**
	 * fogSetup
	 */
	public fogSetup() {
		FogMaskEnable(false);
		//FogEnable(true);

		switch (this.fog) {
			case 1:
				FogEnable(true);
				//FogMaskEnable(true);
				break;
			case 2:
				FogEnable(false);
				//Data.NightFog = true;
				break;
			default:
				FogEnable(false);
				break;
		}

		// GetPlayers.forEach(gPlayer => {
		// 	if (gPlayer.isObserving()) {
		// 		if (gPlayer.player.isLocal()) {
		// 			FogMaskEnable(false);
		// 			FogEnable(false);
		// 		}
		// 	}
		// })
	}

	/**
	 * namesSetup
	 */
	private namesSetup() {
		switch (this.names) {
			case 1:
				//Data.NamesOnDefeat = false;
				break;
			default:
				//Data.NamesOnDefeat = true;
				break;
		}
	}

	/**
	 * nomadSetup
	 */
	private nomadSetup() {
		switch (this.nomad) {
			case 1:
				this.nomad = 90;
				break;
			case 2:
				this.nomad = 120;
				break;
			case 3:
				this.nomad = 150;
				break;
			case 4:
				this.nomad = 180;
				break;
			case 5:
				this.nomad = 0;
				break;
			default:
				this.nomad = 60;
				break;
		}
	}

	/**
	 * goldSetup
	 */
	private goldSetup() {
		switch (this.gold) {
			case 1:
				//Data.SendGold = true;
				break;
			default:
				//Data.SendGold = false;
				break;
		}
	}

	/**
	 * shipsSetup
	 */
	private shipsSetup() {
		switch (this.ships) {
			case 1: //Transport only
				GamePlayer.fromPlayer.forEach(gPlayer => {
					SetPlayerTechMaxAllowed(gPlayer.player, UID.BATTLESHIP_SS, 0);
					SetPlayerTechMaxAllowed(gPlayer.player, UID.WARSHIP_A, 0);
					SetPlayerTechMaxAllowed(gPlayer.player, UID.WARSHIP_B, 0);
				});
				break;
			case 2: //No SS
				GamePlayer.fromPlayer.forEach(gPlayer => {
					SetPlayerTechMaxAllowed(gPlayer.player, UID.BATTLESHIP_SS, 0);
				});
				break;
			default:
				break;
		}
	}

	/**
	 * transportSetup
	 */
	private transportSetup() {
		if (this.transport == 1) {
			//Data.TransportAnywhere = true;
		} else {
			//Data.TransportAnywhere = false;
		}
	}
}