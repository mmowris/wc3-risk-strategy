import { distanceBetweenPoints } from "libs/utils";
import { UID } from "resources/unitID";
import { UTYPE } from "resources/unitTypes";
import { City } from "./country/city-type";
import { FilterEnemyValidGuards, FilterFriendlyValidGuards, FilterOwnedGuards } from "./country/guard-filters";
import { compareValue } from "./country/guard-options";
import { Spawner } from "./country/spawner-type";
import { GameTimer } from "./game/game-timer-type";
import { GameTracking } from "./game/game-tracking-type";
import { GamePlayer, PlayerStatus } from "./player/player-type";
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

		if (dUnitOwner.getUnitCount() <= 0 && dUnitOwner.cities.length <= 0) {
			dUnitOwner.setStatus(PlayerStatus.DEAD);

			if (dUnitOwner.turnDied == -1) {
				dUnitOwner.setTurnDied(GameTimer.getInstance().turn);
			}

			if (dUnitOwner.cityData.endCities == 0) {
				dUnitOwner.cityData.endCities = dUnitOwner.cities.length
			}
		}

		if (GameTracking.getInstance().koVictory()) GameTimer.getInstance().stop();

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
	if (!guardChoice) guardChoice = enemySearch(guardChoice, city, kUnit, dUnit);
	if (!guardChoice) guardChoice = CreateUnit(city.getOwner(), UID.DUMMY_GUARD, city.x, city.y, 270);

	city.changeGuard(guardChoice);
	city.setOwner(GetOwningPlayer(guardChoice));
}


/**
 * @returns Valid allied/owned unit in the cop
 */
function alliedCOPSearch(guardChoice: unit, city: City, kUnit: unit): unit {
	let g: group = CreateGroup();
	let radius: number = 235;
	if (GetOwningPlayer(kUnit) == city.getOwner() || IsPlayerAlly(GetOwningPlayer(kUnit), city.getOwner())) radius = 550;

	GroupEnumUnitsInRange(g, city.x, city.y, radius, FilterOwnedGuards(city));

	if (BlzGroupGetSize(g) == 0) {
		GroupEnumUnitsInRange(g, city.x, city.y, radius, FilterFriendlyValidGuards(city));
		if (BlzGroupGetSize(g) == 0) return guardChoice = null;
	}

	if (!guardChoice) guardChoice = GroupPickRandomUnit(g);

	ForGroup(g, () => {
		guardChoice = compareValue(GetEnumUnit(), guardChoice);
	});

	DestroyGroup(g);
	g = null;
	return guardChoice;
}

/**
 * @returns Valid guard enemy of city
 */
function enemySearch(guardChoice: unit, city: City, kUnit: unit, dUnit: unit): unit {
	let g: group = CreateGroup();
	let radius: number = 600;

	if (IsUnitType(kUnit, UTYPE.SHIP) && city.isPort()) radius = 720;
	if (GetUnitTypeId(kUnit) == UID.MORTAR) radius = 900;
	if (IsUnitType(kUnit, UTYPE.ARTILLERY)) radius = 1000;

	GroupEnumUnitsInRange(g, GetUnitX(city.guard), GetUnitY(city.guard), radius, FilterEnemyValidGuards(city, kUnit));

	if (BlzGroupGetSize(g) == 0) GroupEnumUnitsInRange(g, GetUnitX(kUnit), GetUnitY(kUnit), 200, FilterEnemyValidGuards(city, kUnit));

	guardChoice = BlzGroupGetSize(g) == 0 ? kUnit : GroupPickRandomUnit(g)

	ForGroup(g, () => {
		guardChoice = compareValue(GetEnumUnit(), guardChoice);
	});

	if (IsUnitType(guardChoice, UTYPE.ARTILLERY)) guardChoice = CreateUnit(GetOwningPlayer(kUnit), UID.DUMMY_GUARD, city.x, city.y, 270);
	if (IsUnitType(guardChoice, UTYPE.GUARD)) guardChoice = CreateUnit(GetOwningPlayer(kUnit), UID.DUMMY_GUARD, city.x, city.y, 270);
	if (IsUnitType(guardChoice, UTYPE.SHIP) && !city.isPort()) guardChoice = null;

	if (IsUnitType(kUnit, UTYPE.CITY)) guardChoice = CreateUnit(GetOwningPlayer(dUnit), UID.DUMMY_GUARD, city.x, city.y, 270);

	DestroyGroup(g);
	g = null;
	return guardChoice;
}