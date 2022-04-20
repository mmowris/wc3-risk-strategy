import { MapPlayer } from "w3ts";
import { UID } from "./unitID";

export const FilterIsOwnedSpawner = (p: MapPlayer) => Filter(() => {
	const u = GetFilterUnit();

	return (GetUnitTypeId(u) == UID.SPAWNER && GetOwningPlayer(u) == p.handle) ? true : false;
})