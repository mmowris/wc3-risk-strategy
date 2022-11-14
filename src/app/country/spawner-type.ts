import { GamePlayer } from "app/player/player-type";
import { AID } from "resources/abilityID";
import { NEUTRAL_HOSTILE } from "resources/constants";
import { UID } from "resources/unitID";
import { UTYPE } from "resources/unitTypes";
import { Group } from "w3ts";

const SpawnTypeID: number = UID.RIFLEMEN;
const SpawnTurnLimit: number = 5;

export class Spawner {
	private _unit: unit;
	private playerSpawns: Map<GamePlayer, unit[]>;
	private country: string;
	private spawnAmount: number;
	private spawnMax: number;

	public static fromUnit:Map<unit, Spawner> = new Map<unit, Spawner>(); //Set in constructor

	constructor(country: string, x: number, y: number, countrySize: number) {
		this.playerSpawns = new Map<GamePlayer, unit[]>();
		this.create(x, y);
		this.spawnAmount = Math.floor((countrySize + 1) / 2);
		this.spawnMax = this.spawnAmount * SpawnTurnLimit;
		this.country = country;
		this.setName();
	}

	//Static API
	/**
	 * onCast runs when a spawner cast any ability
	 */
	public static onCast() {
		let area: number;

		if (GetSpellAbilityId() == AID.SPWN_ALL) area = 12000;
		if (GetSpellAbilityId() == AID.SPWN_6000) area = 6000;
		if (GetSpellAbilityId() == AID.SPWN_3000) area = 3000;
		if (GetSpellAbilityId() == AID.SPWN_RESET) area = 50000;

		const group: Group = new Group();
		const u: unit = GetTriggerUnit();

		group.enumUnitsInRange(GetUnitX(u), GetUnitY(u), area, () => {
			const fU: unit = GetFilterUnit();

			if (GetUnitTypeId(fU) == UID.SPAWNER && GetOwningPlayer(fU) == GetOwningPlayer(u)) {
				if (GetSpellAbilityId() == AID.SPWN_RESET) {
					IssuePointOrder(fU, "setrally", GetUnitX(fU), GetUnitY(fU));
				} else {
					if (GetOwningPlayer(fU) == GetLocalPlayer()) {
						SelectUnit(fU, true);
					}
				}

			}

			return false;
		});

		group.destroy();
	}

	//Public API
	public get unit(): unit {
		return this._unit;
	}

	/**
	 * Sets this.units owner, changes the spawners name to correctly reflect the new owners spawn count.
	 * The spawners rally point is also reset.
	 * @param newOwner - The new owner. If the country is unowned, the owner will be Player 25 (N.H.)
	 */
	public setOwner(newOwner: player) {
		SetUnitOwner(this.unit, newOwner, true);

		if (!this.playerSpawns.has(GamePlayer.fromPlayer.get(newOwner))) {
			this.playerSpawns.set(GamePlayer.fromPlayer.get(newOwner), [])
		}

		this.setName();
		IssuePointOrder(this.unit, "setrally", GetUnitX(this.unit), GetUnitY(this.unit));
	}

	/**
	 * Spawns units for owning player
	 * Takes into consideration available spawns for the owner, it will not spawn if they are maxed.
	 */
	public step() {
		const owner: GamePlayer = GamePlayer.fromPlayer.get(GetOwningPlayer(this.unit));

		if (owner.player == NEUTRAL_HOSTILE) return;
		if (GetPlayerSlotState(owner.player) != PLAYER_SLOT_STATE_PLAYING) return;

		const spawnCount: number = this.playerSpawns.get(owner).length;

		if (spawnCount >= this.spawnMax) return;

		const amount: number = Math.min(this.spawnAmount, this.spawnMax - spawnCount);

		for (let i = 0; i < amount; i++) {
			let u: unit = CreateUnit(owner.player, SpawnTypeID, GetUnitX(this.unit), GetUnitY(this.unit), 270);
			let loc: location = GetUnitRallyPoint(this.unit);

			UnitAddType(u, UTYPE.SPAWN);
			this.playerSpawns.get(owner).push(u);
			Spawner.fromUnit.set(u, this);
			IssuePointOrderLoc(u, "attack", loc);

			RemoveLocation(loc);
			loc = null;
			u = null;
		}

		this.setName();
	}

	public static onSpawnDeath(owner: GamePlayer, u: unit, spawner: Spawner) {
		spawner.playerSpawns.get(owner).splice(spawner.playerSpawns.get(owner).indexOf(u), 1);

		if (GetOwningPlayer(spawner.unit) == owner.player) spawner.setName();

		Spawner.fromUnit.delete(u);
	}

	/**
	 * Used for game resetting
	 * The spawner unit is deleted and remade, this is done to clear control groups between games.
	 */
	public reset() {
		const x: number = GetUnitX(this.unit);
		const y: number = GetUnitY(this.unit);

		this.playerSpawns.clear();
		RemoveUnit(this.unit);
		this._unit = null;

		this.create(x, y);
		this.setName();
	}

	//Internal Functions
	private create(x: number, y: number) {
		this._unit = CreateUnit(NEUTRAL_HOSTILE, UID.SPAWNER, x, y, 270);
		SetUnitPathing(this.unit, false);
	}

	private setName() {
		if (GetOwningPlayer(this.unit) == NEUTRAL_HOSTILE) {
			BlzSetUnitName(this.unit, `${this.country} is unowned`);
			SetUnitAnimation(this.unit, "death");
		} else {
			const spawnCount: number = this.playerSpawns.get(GamePlayer.fromPlayer.get(GetOwningPlayer(this.unit))).length;

			BlzSetUnitName(this.unit, `${this.country}  ${spawnCount} / ${this.spawnMax}`);
			SetUnitAnimation(this.unit, "stand");
		}
	}
}