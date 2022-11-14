import { GamePlayer } from "app/player/player-type";
import { UserInterface } from "app/ui/user-interface-type";
import { UID } from "resources/unitID";
import { Alliances } from "./round-allies";
import { RoundSettings } from "./settings-data";

export class Settings {
	private static instance: Settings;
	public gameType: number = 0;
	public diplomancy: number = 0;
	public allyLimit: number = 1;
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
		this.alliesControlSetup();
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
		Alliances.getInstance();

		switch (this.diplomancy) {
			case 1: //Lobby Teams
				//TODO: Set adv control
				SetMapFlag(MAP_LOCK_ALLIANCE_CHANGES, true);
				Alliances.teamGame = true;
				break;

			case 2: //Random Teams
				Alliances.getInstance().unAllyLobby()
				SetMapFlag(MAP_LOCK_ALLIANCE_CHANGES, true);
				Alliances.teamGame = true;
				//TODO: Create random teams based off allies number
				break;

			case 3: //Free Ally
				Alliances.getInstance().unAllyLobby();
				Alliances.teamGame = true;

				break;
			default: //FFA
				Alliances.getInstance().unAllyLobby()
				UserInterface.ffaSetup();
				SetMapFlag(MAP_LOCK_ALLIANCE_CHANGES, true);
				break;
		}

		RoundSettings.diplomancy = this.diplomancy;
	}

	/**
	 * alliesSetup
	 */
	private alliesSetup() {
		RoundSettings.allies = this.allyLimit;
	}

	/**
	 * alliesControlSetup
	 */
	private alliesControlSetup() {
		RoundSettings.alliesControl = this.alliesControl;
	}

	/**
	 * fogSetup
	 */
	public fogSetup() {
		switch (this.fog) {
			case 1://Fog On
				GamePlayer.fromPlayer.forEach(player => {
					if (player.isAlive() || player.isPlaying()) FogModifierStop(player.fog);
				})
				break;
			case 2:
			default://Fog Off
				GamePlayer.fromPlayer.forEach(player => {
					if (player.isAlive() || player.isPlaying()) FogModifierStart(player.fog);
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

					if (RoundSettings.promode) {
						SetPlayerTechMaxAllowed(gPlayer.player, UID.WARSHIP_B, 0);
						SetPlayerTechMaxAllowed(gPlayer.player, UID.WARSHIP_B_PROMODE, -1);
					} else {
						SetPlayerTechMaxAllowed(gPlayer.player, UID.WARSHIP_B, -1);
						SetPlayerTechMaxAllowed(gPlayer.player, UID.WARSHIP_B_PROMODE, 0);
					}

				});
				break;
			case 2: //No SS
				GamePlayer.fromPlayer.forEach(gPlayer => {
					SetPlayerTechMaxAllowed(gPlayer.player, UID.BATTLESHIP_SS, 0);

					if (RoundSettings.promode) {
						SetPlayerTechMaxAllowed(gPlayer.player, UID.WARSHIP_B, 0);
					} else {
						SetPlayerTechMaxAllowed(gPlayer.player, UID.WARSHIP_B_PROMODE, 0);
					}
				});
				break;
			default:
				GamePlayer.fromPlayer.forEach(gPlayer => {
					if (RoundSettings.promode) {
						SetPlayerTechMaxAllowed(gPlayer.player, UID.WARSHIP_B, 0);
						SetPlayerTechMaxAllowed(gPlayer.player, UID.WARSHIP_B_PROMODE, -1);
					} else {
						SetPlayerTechMaxAllowed(gPlayer.player, UID.WARSHIP_B, -1);
						SetPlayerTechMaxAllowed(gPlayer.player, UID.WARSHIP_B_PROMODE, 0);
					}
				});
				break;
		}

		RoundSettings.ships = this.ships;
	}

	/**
	 * transportSetup
	 */
	private transportSetup() {
		if (this.transport == 1) {
			RoundSettings.transport = false
		} else {
			RoundSettings.transport = true;
		}
	}
}