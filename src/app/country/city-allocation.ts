import { GamePlayer } from "app/player/player-type";
import { Util } from "libs/translators";
import { City } from "./city-type";
import { Country } from "./country-type";

export class CityAllocation {
	constructor() { }

	public static start() {
		let playerPool: player[] = this.buildPlayerPool();
		let cityPool: City[] = this.buildCityPool();
		let citiesMax: number = (Math.min((playerPool.length == 2) ? 18 : Math.floor(cityPool.length / playerPool.length), 20)); // TODO: refactor when promode is created

		while (playerPool.length > 0) {
			let gPlayer: GamePlayer = GamePlayer.fromID.get(GetPlayerId(playerPool.shift()));
			let city: City = this.getCityFromPool(cityPool);
			let country: Country = Country.fromCity.get(city);

			if (country.citiesOwned.get(gPlayer) < country.allocLim) {
				CityAllocation.changeOwner(city, gPlayer, cityPool);
			} else {
				let counter: number = 0;

				do {
				    city = this.getCityFromPool(cityPool);
				} while (country.citiesOwned.get(gPlayer) >= country.allocLim || counter == 50 || city == null);
	    
				if (city == null) print(`Error in CityAllocation, No cities avaiable in pool`)
				if (counter >= 50) print(`Error in CityAllocation, No valid city found in pool`)
	    
				CityAllocation.changeOwner(city, gPlayer, cityPool);
			}

			if (gPlayer.cities.length < citiesMax) {
				playerPool.push(gPlayer.player)
			}
		}




		playerPool = null;
		cityPool = null;
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

		GamePlayer.fromID.forEach(gPlayer => {
			if (gPlayer.isPlaying()) {
				result.push(gPlayer.player);
			}
		})

		return result
	}

	private static getPlayerFromPool(playerPool: player[], citiesMax: number): player | null {
		//Ends our recursive search if no player is avaiable
		if (playerPool.length == 0) return null;

		//Get random player from pool
		let player: player = playerPool[Math.floor(Math.random() * playerPool.length)];

		//TODO
		// if (player.ownedCities.length >= citiesMax) {
		//     //Remove player from pool if they have to enough cities
		//     playerPool.splice(playerPool.indexOf(player), 1)
		//     //Recursive search for a new player
		//     return this.getPlayerFromPool(playerPool, citiesMax);
		// }

		//Assume that the player is allowed to receive another city, thus returning that player
		return player;
	}

	private static getCityFromPool(cityPool: City[]): City | null {
		if (cityPool.length == 0) return null;

		let city: City = cityPool[Math.floor(Math.random() * cityPool.length)];

		if (city.getOwner() != Player(25)) {
			cityPool.splice(cityPool.indexOf(city), 1);
			city = this.getCityFromPool(cityPool);
		}

		return city;
	}

	private static changeOwner(city: City, player: GamePlayer, cityPool: City[]) {
		city.setOwner(player.player);
		city.changeGuardOwner();
		player.cities.push(city.barrack);
		cityPool.splice(cityPool.indexOf(city), 1);
	}
}