import { UID } from "resources/unitID";
import { UTYPE } from "resources/unitTypes";
import { City } from "./country/city-type";
import { FilterEnemyValidGuards, FilterFriendlyValidGuards } from "./country/guard-filters";
import { compareValue } from "./country/guard-options";
import { Spawner } from "./country/spawner-type";
import { GameRankingHelper } from "./game/game-ranking-helper-type";
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

		if (kUnitOwner.getUnitCount() <= 0 && kUnitOwner.cities.length <= 0) {
			this.setStatus(PlayerStatus.DEAD);
			GameRankingHelper.getInstance().setLoser(kUnitOwner.player);
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
	if (!guardChoice) guardChoice = enemySearch(guardChoice, city, kUnit);
	if (!guardChoice) guardChoice = killerSearch(guardChoice, city, kUnit);
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

	if (IsUnitType(kUnit, UTYPE.SHIP) == true && city.isPort()) radius = 700;

	GroupEnumUnitsInRange(g, city.x, city.y, radius, FilterEnemyValidGuards(city, kUnit));
	GroupEnumUnitsInRange(g, GetUnitX(city.guard), GetUnitY(city.guard), radius, FilterEnemyValidGuards(city, kUnit));

	if (BlzGroupGetSize(g) == 0) return guardChoice = null;
	if (!guardChoice) guardChoice = GroupPickRandomUnit(g);

	ForGroup(g, () => {
		guardChoice = compareValue(GetEnumUnit(), guardChoice);
	});

	//print(`gChoice, eSearch: ${GetUnitName(guardChoice)} radius: ${radius}`)
	DestroyGroup(g);
	g = null;
	return guardChoice;
}

/**
 * @returns Valid enemy unit within 200 range of killer & 600-720 max range of city
 */
function killerSearch(guardChoice: unit, city: City, kUnit: unit): unit {
	let g: group = CreateGroup();
	let radius: number = 600;

	if (IsUnitType(kUnit, UTYPE.ARTILLERY) == true) radius = 1000;
	if (GetUnitTypeId(kUnit) == UID.MORTAR) radius = 900;

	//Fix a bug with ships not taking cities in very rare cases
	if (IsUnitType(kUnit, UTYPE.SHIP) == true && city.isPort()) {
		radius = 720;
		guardChoice = kUnit
	}

	GroupEnumUnitsInRange(g, GetUnitX(city.guard), GetUnitY(city.guard), radius, FilterEnemyValidGuards(city, kUnit));
	//print(`${BlzGroupGetSize(g)}`)
	if (IsUnitType(kUnit, UTYPE.SHIP) == true && city.isPort() && BlzGroupGetSize(g) == 0) {
		GroupEnumUnitsInRange(g, GetUnitX(kUnit), GetUnitY(kUnit), 200, FilterEnemyValidGuards(city, kUnit));
		//print(`${BlzGroupGetSize(g)}`)
	}

	if (BlzGroupGetSize(g) >= 1) {
		guardChoice = GroupPickRandomUnit(g);

		ForGroup(g, () => {
			guardChoice = compareValue(GetEnumUnit(), guardChoice);
		});
	}

	//At this point there is no viable guard that we found within 1000 range. so we create a dummy for ourselfs and it will take the city
	if (IsUnitType(kUnit, UTYPE.ARTILLERY)) guardChoice = CreateUnit(GetOwningPlayer(kUnit), UID.DUMMY_GUARD, city.x, city.y, 270);
	if (IsUnitType(kUnit, UTYPE.GUARD)) guardChoice = CreateUnit(GetOwningPlayer(kUnit), UID.DUMMY_GUARD, city.x, city.y, 270);
	//If there is still no guard the city will not change owner but a dummy is created

	//print(`gChoice, kSearch: ${GetUnitName(guardChoice)} radius: ${radius}`)
	DestroyGroup(g);
	g = null;
	return guardChoice;
}