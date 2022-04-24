import { UID } from "resources/unitID";
import { UTYPE } from "resources/unitTypes";
import { City, CityRegionSize } from "./country/city-type";
import { FilterEnemyValidGuards, FilterFriendlyValidGuards, isGuardValid } from "./country/guard-filters";
import { compareValue } from "./country/guard-options";
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
		if (IsUnitType(dyingUnit, UTYPE.GUARD)) guardDies(dyingUnit, killingUnit);

		dyingUnit = null;
		killingUnit = null;

		return false;
	}));
}

function guardDies(dUnit: unit, kUnit: unit) {
	if (!IsUnitType(dUnit, UTYPE.GUARD)) return;

	const city: City = City.fromGuard.get(dUnit);
	let guardChoice: unit = null;

	guardChoice = alliedCOPSearch(guardChoice, city, kUnit);
	if (!guardChoice) guardChoice = enemySearch(guardChoice, city, kUnit);
	//if (!guardChoice) guardChoice = killerSearch(guardChoice, city, kUnit);
	if (!guardChoice) guardChoice = CreateUnit(GetOwningPlayer(guardChoice), UID.DUMMY_GUARD, city.x, city.y, 270);
	
	city.changeGuard(guardChoice);
	city.setOwner(GetOwningPlayer(guardChoice));
}


/**
 * @returns Valid allied/owned unit in the cop
 */
function alliedCOPSearch(guardChoice: unit, city: City, kUnit: unit): unit {
	let g: group = CreateGroup();
	let radius: number = 225;
	if (GetOwningPlayer(kUnit) == city.getOwner() || IsPlayerAlly(GetOwningPlayer(kUnit), city.getOwner())) radius = 550;

	GroupEnumUnitsInRange(g, city.x, city.y, radius, FilterFriendlyValidGuards(city));

	if (BlzGroupGetSize(g) == 0) return guardChoice = null;
	if (!guardChoice) guardChoice = GroupPickRandomUnit(g);

	ForGroup(g, () => {
		guardChoice = compareValue(GetEnumUnit(), guardChoice);
	});

	DestroyGroup(g);
	g = null;
	return guardChoice;
}

/**
 * @returns Valid enemy unit within 200 range of killer & 600-720 max range of city
 */
function enemySearch(guardChoice: unit, city: City, kUnit: unit): unit {
	let g: group = CreateGroup();
	let radius: number = 550;

	if (IsUnitType(kUnit, UTYPE.SHIP) == true && !city.isPort()) radius = 700;

	GroupEnumUnitsInRange(g, city.x, city.y, radius, FilterEnemyValidGuards(city, kUnit));

	if (BlzGroupGetSize(g) == 0) return guardChoice = null;
	print(`size ${BlzGroupGetSize(g)}`)
	if (!guardChoice) guardChoice = GroupPickRandomUnit(g);

	ForGroup(g, () => {
		guardChoice = compareValue(GetEnumUnit(), guardChoice);
	});

	DestroyGroup(g);
	g = null;
	return guardChoice;
}