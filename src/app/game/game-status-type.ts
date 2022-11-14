import { MapPlayer, Unit } from "w3ts";
import { Players } from "w3ts/globals";

export class GameStatus {
	private static instance: GameStatus;
	readonly ONLINE: number = 0;
	readonly OFFLINE: number = 1;
	readonly REPLAY: number = 2;
	private status: number;

	private constructor() {
		let humanPlayer: MapPlayer;

		Players.every(p => {
			if (p.slotState == PLAYER_SLOT_STATE_PLAYING && p.controller == MAP_CONTROL_USER) {
				humanPlayer = p;
				return false;
			}
		})

		const dummy: Unit = new Unit(humanPlayer, FourCC('hfoo'), 0.00, 0.00, 270);
		dummy.select(true);

		const selected = dummy.isSelected(humanPlayer);
		dummy.destroy();

		if (selected) {
			if (ReloadGameCachesFromDisk()) {
				this.status = 1;
			} else {
				this.status = 2;
			}
		} else {
			this.status = 0;
		}
	}

	public static getInstance() {
		if (this.instance == null) {
			this.instance = new GameStatus();
		}
		return this.instance;
	}

	public get(): number {
		return this.status;
	}

	public toString(): string {
		let result: string;

		switch (this.status) {
			case 0:
				result = "ONLINE";
				break;
			case 1:
				result = "OFFLINE";
				break;
			case 2:
				result = `REPLAY`;
				break;
			default:
				result = `Unhandled case in GameStatus.toString() Case #: ${this.status}`;
				break;
		}

		return result
	}
}