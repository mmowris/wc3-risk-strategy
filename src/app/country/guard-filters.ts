import { UID } from "resources/unitID";
import { UTYPE } from "resources/unitTypes";
import { City } from "./city-type";

export const isGuardValid = (city: City, fUnit?: unit) => {
    if (!fUnit) fUnit = city.guard;

    if (IsUnitType(fUnit, UTYPE.GUARD)) return false;
    if (IsUnitType(fUnit, UTYPE.TRANSPORT)) return false;
    if (IsUnitType(fUnit, UTYPE.CITY)) return false;
    if (!UnitAlive(fUnit)) return false;
    if (GetUnitTypeId(city.barrack) == UID.CITY && IsUnitType(fUnit, UTYPE.SHIP)) return false;

    return true;
}

export const FilterFriendlyValidGuards = (city: City) => Filter(() => {
    let fUnit: unit = GetFilterUnit();

    if (!isGuardValid(city, fUnit)) return false;
    if (IsUnitEnemy(fUnit, GetOwningPlayer(city.barrack))) return false;

    fUnit = null;
    return true;
});

export const FilterEnemyValidGuards = (city: City) => Filter(() => {
    let fUnit: unit = GetFilterUnit();

    if (!isGuardValid(city, fUnit)) return false;
    if (IsUnitAlly(fUnit, GetOwningPlayer(city.barrack))) return false;

    fUnit = null;
    return true;
});