import { UTYPE } from "resources/unitTypes";
import { Spawner } from "./country/spawner-type";
import { GameTracking } from "./game/game-tracking-type";
import { GamePlayer } from "./player/player-type";
import { Transports } from "./transports-type";

export const unitDeathTrig: trigger = CreateTrigger();

export function unitDeath() {
	for (let i = 0; i < bj_MAX_PLAYER_SLOTS; i++) {
		TriggerRegisterPlayerUnitEvent(unitDeathTrig, Player(i), EVENT_PLAYER_UNIT_DEATH, null);
	}

	TriggerAddCondition(unitDeathTrig, Condition(() => {
		if (!GameTracking.getInstance().roundInProgress) return;

		let dyingUnit: unit = GetTriggerUnit();
		let killingUnit: unit = GetKillingUnit();
		let dUnitOwner: GamePlayer = GamePlayer.fromPlayer.get(GetOwningPlayer(dyingUnit));
		let kUnitOwner: GamePlayer = GamePlayer.fromPlayer.get(GetOwningPlayer(killingUnit));

		kUnitOwner.onKill(dUnitOwner, dyingUnit);
		dUnitOwner.onDeath(kUnitOwner, dyingUnit)
		Transports.onDeath(dyingUnit, killingUnit);

		if (Spawner.fromUnit.has(dyingUnit)) Spawner.onSpawnDeath(dUnitOwner, dyingUnit, Spawner.fromUnit.get(dyingUnit));
		if (IsUnitType(dyingUnit, UTYPE.GUARD)) guardDies()

		dyingUnit = null;
		killingUnit = null;

		return false;
	}));
}

function guardDies() {

}