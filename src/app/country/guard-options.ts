import { GamePlayer } from "app/player/player-type";

export function compareValue(filterUnit: unit, compareUnit: unit): unit { //compareUnit = current guardChoice
	if (filterUnit == compareUnit) return compareUnit;

	let wantedUnit: unit = compareUnit;
	const gPlayer: GamePlayer = GamePlayer.fromPlayer.get(GetOwningPlayer(filterUnit));

	if (!gPlayer.value && GetUnitPointValue(filterUnit) < GetUnitPointValue(compareUnit)) {
		wantedUnit = filterUnit;
	}

	if (gPlayer.value && GetUnitPointValue(filterUnit) > GetUnitPointValue(compareUnit)) {
		wantedUnit = filterUnit;
	}

	if (GetUnitPointValue(filterUnit) == GetUnitPointValue(compareUnit)) {
		wantedUnit = compareHealth(filterUnit, compareUnit);
	}

	return wantedUnit;
}

export function compareHealth(filterUnit: unit, compareUnit: unit): unit {
	if (filterUnit == compareUnit) return compareUnit;

	let wantedUnit: unit = compareUnit;
	const gPlayer: GamePlayer = GamePlayer.fromPlayer.get(GetOwningPlayer(filterUnit));

	if (!gPlayer.health && GetUnitState(filterUnit, UNIT_STATE_LIFE) < GetUnitState(compareUnit, UNIT_STATE_LIFE)) {
		wantedUnit = filterUnit;
	}

	if (gPlayer.health && GetUnitState(filterUnit, UNIT_STATE_LIFE) > GetUnitState(compareUnit, UNIT_STATE_LIFE)) {
		wantedUnit = filterUnit;
	}

	return wantedUnit;
}