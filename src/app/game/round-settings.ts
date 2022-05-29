import { GamePlayer } from "app/player/player-type";
import { UserInterface } from "app/ui/user-interface-type";
import { MAX_PLAYERS } from "resources/constants";
import { UID } from "resources/unitID";
import { RoundSettings } from "./settings-data";

export class Settings {
	private static instance: Settings;
	public gameType: number = 0;
	public diplomancy: number = 0;
	public allies: number = 1;
	public alliesControl: number = 0;
	public fog: number = 0;
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

		RoundSettings.gameType = this.gameType;
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

		RoundSettings.diplomancy = this.diplomancy;
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
		RoundSettings.allies = this.allies;
	}

	/**
	 * alliesControlSetup
	 */
	private alliesControlSetup() {
		RoundSettings.alliesControl = this.alliesControl;
		//TODO
	}

	/**
	 * fogSetup
	 */
	public fogSetup() {
		switch (this.fog) {
			case 1:
				GamePlayer.fromPlayer.forEach(player => {
					if (player.isAlive()) FogModifierStop(player.fog);
				})
				break;
			case 2:
			default:
				GamePlayer.fromPlayer.forEach(player => {
					if (player.isAlive()) FogModifierStart(player.fog);
				})
				break;
		}

		RoundSettings.fog = this.fog;
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
				this.nomad = 0; //Unlimited Time
				break;
			case 6:
				this.nomad = -1; //Insta Death
				break;
			default:
				this.nomad = 60;
				break;
		}

		RoundSettings.nomad = this.nomad;
	}

	/**
	 * goldSetup
	 */
	private goldSetup() {
		switch (this.gold) {
			case 1:
				RoundSettings.gold = true;
				break;
			default:
				RoundSettings.gold = false;
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

		RoundSettings.ships = this.ships;
	}

	/**
	 * transportSetup
	 */
	private transportSetup() {
		if (this.transport == 1) {
			RoundSettings.transport = true
		} else {
			RoundSettings.transport = false;
		}
	}
}