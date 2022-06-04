import { RoundSettings } from "app/game/settings-data";
import { GamePlayer } from "app/player/player-type";
import { Util } from "libs/translators";
import { NEUTRAL_HOSTILE } from "resources/constants";
import { City } from "./city-type";
import { Country } from "./country-type";

export class CityAllocation {
	constructor() { }

	public static start() {
		try {
			let playerPool: player[] = this.buildPlayerPool();
			let cityPool: City[] = this.buildCityPool();
			let citiesMax: number = (RoundSettings.promode == true) ? Math.min(Math.floor(cityPool.length / playerPool.length), 18) : Math.min(Math.floor(cityPool.length / playerPool.length), 20);

			while (playerPool.length > 0) {
				let gPlayer: GamePlayer = GamePlayer.fromPlayer.get(playerPool.shift());
				let city: City = this.getCityFromPool(cityPool);
				let country: Country = Country.fromCity.get(city);

				if (country.citiesOwned.get(gPlayer) < country.allocLim) {
					CityAllocation.changeOwner(city, gPlayer, cityPool);

				} else {
					let counter: number = 0;
					do {
						city = this.getCityFromPool(cityPool);
						country = Country.fromCity.get(city);
					} while (country.citiesOwned.get(gPlayer) >= country.allocLim || counter == 50 || city == null);

					if (city == null) print(`Error in CityAllocation, No cities avaiable in pool`)
					if (counter >= 50) print(`Error in CityAllocation, No valid city found in pool`)

					CityAllocation.changeOwner(city, gPlayer, cityPool);
				}

				if (gPlayer.cities.length < citiesMax) {
					playerPool.push(gPlayer.player)
				}
			}

			playerPool.length = 0;
			playerPool = null;
			cityPool.length = 0;
			cityPool = null;

		} catch (error) {
			print(error)
		}

	}

	private static buildCityPool(): City[] {
		let result: City[] = [];

		for (let [, v] of Country.fromName) {
			v.initCitiesOwned();

			if (v.cities.length > 1) {
				v.cities.forEach(city => {
					result.push(city);
				})
			}
		}

		Util.ShuffleArray(result);

		return result;
	}

	private static buildPlayerPool(): player[] {
		let result: player[] = [];

		GamePlayer.fromPlayer.forEach(gPlayer => {
			if (GetPlayerId(gPlayer.player) >= 24) return;

			if (gPlayer.isAlive()) {
				result.push(gPlayer.player);
			}
		})

		return result
	}

	private static getCityFromPool(cityPool: City[]): City | null {
		if (cityPool.length == 0) return null;

		let city: City = cityPool[Math.floor(Math.random() * cityPool.length)];

		if (city.getOwner() != NEUTRAL_HOSTILE) {
			cityPool.splice(cityPool.indexOf(city), 1);
			city = this.getCityFromPool(cityPool);
		}

		return city;
	}

	private static changeOwner(city: City, player: GamePlayer, cityPool: City[]) {
		city.setOwner(player.player);
		city.changeGuardOwner();
		cityPool.splice(cityPool.indexOf(city), 1);
	}
}