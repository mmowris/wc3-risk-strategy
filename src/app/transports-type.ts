/** 
 * For use with TriggerRegisterPlayerUnitEvent
 * EVENT_PLAYER_UNIT_LOADED =
 * GetTransportUnit = The transport being loaded
 * GetLoadedUnit = The unit being loaded
 * GetTriggerUnit = The unit being loaded
 * 
 * IsUnitInTransport = Check if given unit is loaded into given transport
 * IsUnitLoaded = Check if given unit is loaded into any transport
*/

import { ErrorMessage } from "libs/utils";
import { UTYPE } from "resources/unitTypes";
import { RoundSettings } from "./game/settings-data";

export const onLoadTrig: trigger = CreateTrigger();

export class Transports {
	private static instance: Transports;
	public static loadedUnits: Map<unit, unit[]> = new Map<unit, unit[]>();

	public static getInstance() {
		if (this.instance == null) {
			this.instance = new Transports();
		}
		return this.instance;
	}

	constructor() {
		Transports.onLoad();
	}

	public static onLoad() {
		for (let i = 0; i < bj_MAX_PLAYERS; i++) {
			TriggerRegisterPlayerUnitEvent(onLoadTrig, Player(i), EVENT_PLAYER_UNIT_LOADED, null);
		}

		TriggerAddCondition(onLoadTrig, (Condition(() => {
			if (!RoundSettings.transport) return false;
			let trans: unit = GetTransportUnit();
			let loadedUnit: unit = GetLoadedUnit();

			Transports.loadedUnits.get(trans).push(loadedUnit)
			//print(`there is ${Transports.loadedUnits.get(trans).length} units loaded`)
			//print(`-----------------------------------`)

			trans = null;
			loadedUnit = null
			return true
		})));
	}

	public static orderUnload() {
		if (!RoundSettings.transport) return false;
		if (!IsUnitType(GetTriggerUnit(), UTYPE.TRANSPORT)) return false;

		let trans = GetTriggerUnit(); //Trigger unit = transport unloading

		//print(`target x:${GetOrderPointX}, y:${GetOrderPointY}`);
		//print(`trans x:${GetUnitX(trans)}, y:${GetUnitY(trans)}`);

		if (GetTerrainType(GetUnitX(trans), GetUnitY(trans)) != FourCC("Vcbp")) {
			BlzPauseUnitEx(trans, true);
			BlzPauseUnitEx(trans, false);
			IssueImmediateOrder(trans, "stop");
			ErrorMessage(GetOwningPlayer(trans), "You may only unload on pebble terrain!");
		} else {
			let unloadedUnit: unit = GetOrderTargetUnit();

			Transports.loadedUnits.set(trans, Transports.loadedUnits.get(trans).filter(unit => unit !== unloadedUnit))

			//print(`there is ${Transports.loadedUnits.get(trans).length} units loaded`)
			//print(`-----------------------------------`)

			unloadedUnit = null;
		}

		trans = null
	}

	public static onLoadCast() {
		if (!RoundSettings.transport) return false;
		let trans: unit = GetTriggerUnit();

		IssueImmediateOrder(trans, "stop");
		BlzPauseUnitEx(trans, true);
		BlzPauseUnitEx(trans, false);
		ErrorMessage(GetOwningPlayer(trans), "You may only load on pebble terrain!");

		trans = null;
	}

	public static onUnloadCast() {
		if (!RoundSettings.transport) return false;
		let trans: unit = GetTriggerUnit();

		IssueImmediateOrder(trans, "stop");
		ErrorMessage(GetOwningPlayer(trans), "You may only unload on pebble terrain!");

		trans = null;
	}

	public static onUnloadEndCast() {
		if (!RoundSettings.transport) return false;

		let trans: unit = GetTriggerUnit();

		Transports.loadedUnits.set(trans, Transports.loadedUnits.get(trans).filter(unit => IsUnitInTransport(unit, trans)))

		//print(`there is ${Transports.loadedUnits.get(trans).length} units loaded`)
		//print(`-----------------------------------`)

		trans = null;

		return false
	}

	public static onCreate(trans: unit) {
		if (!RoundSettings.transport) return false;

		Transports.loadedUnits.set(trans, [] = []);
	}

	public static onDeath(trans: unit, killer: unit) {
		if (!RoundSettings.transport) return false;
		if (!IsUnitType(trans, UTYPE.TRANSPORT)) return false;

		if (GetTerrainType(GetUnitX(trans), GetUnitY(trans)) != FourCC("Vcbp")) {
			Transports.loadedUnits.get(trans).forEach(unit => {
				BlzSetUnitMaxHP(unit, 1);
				UnitDamageTarget(killer, unit, 100, true, false, ATTACK_TYPE_CHAOS, DAMAGE_TYPE_NORMAL, WEAPON_TYPE_WHOKNOWS);
			});
		}

		Transports.loadedUnits.delete(trans);
	}
}