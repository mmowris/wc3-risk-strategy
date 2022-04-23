import { GameTracking } from "app/game/game-tracking-type";
import { GamePlayer } from "app/player/player-type";
import { City } from "./city-type";
import { Country } from "./country-type";

export function onOwnerChange() {
	const ownerChange: trigger = CreateTrigger();

	for (let i = 0; i < bj_MAX_PLAYERS; i++) {
		TriggerRegisterPlayerUnitEvent(ownerChange, Player(i), EVENT_PLAYER_UNIT_CHANGE_OWNER, null);
	}

	TriggerAddCondition(ownerChange, Condition(() => {
		let city: City = City.fromBarrack.get(GetChangingUnit());
		let country: Country = Country.fromCity.get(city);
		let prevOwner: GamePlayer = GamePlayer.fromPlayer.get(GetChangingUnitPrevOwner());
		let owner: GamePlayer = GamePlayer.fromPlayer.get(city.getOwner());

		prevOwner.cities.splice(prevOwner.cities.indexOf(city.barrack), 1);
		country.citiesOwned.set(prevOwner, country.citiesOwned.get(prevOwner) - 1);

		owner.cities.push(city.barrack);
		country.citiesOwned.set(owner, country.citiesOwned.get(owner) + 1);

		if (owner.cities.length > GameTracking.getInstance().leader.cities.length) GameTracking.getInstance().leader = owner;

		//print(`${owner.names.acct} owns ${country.citiesOwned.get(owner)} cities in ${country.name} and they own ${owner.cities.length} total`)
		return true;
	}));
}
