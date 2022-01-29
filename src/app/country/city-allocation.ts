import { Util } from "libs/translators";
import { Players } from "w3ts/globals";
import { City } from "./city-type";
import { Country } from "./country-type";

export class CityAllocation {

    public static start() {
        let playerPool: player[] = this.buildPlayerPool();
        let cityPool: City[] = this.buildCityPool();
        let citiesMax: number = this.setCitiesPerPlayer(playerPool, cityPool);






        playerPool = null;
        cityPool = null;
    }

    private static buildPlayerPool(): player[] {
        throw new Error("Method not implemented.");
    }

    private static buildCityPool(): City[] {
        let result: City[] = [];

        for (let [k, v] of Country.fromName ) {
            if (v.getSize() > 1) {
                v.cities.forEach(city => {
                    result.push(city);
                })
            }
        }

        Util.ShuffleArray(result);
        result.reverse();
        Util.ShuffleArray(result);

        return result;
    }

    private static setCitiesPerPlayer(playerPool: player[], cityPool: City[]): number {
        let numOfCities: number = (playerPool.length == 2) ? 18 : Math.floor(cityPool.length / playerPool.length); //18 for 1v1

        return Math.min(numOfCities, 20); //Never more then 20 cities
    }

    private static getPlayerFromPool(playerPool: player[], citiesMax: number): player | null {
        //Ends our recursive search if no player is avaiable
        if (playerPool.length == 0) return null;

        //Get random player from pool
        let player: player = playerPool[Math.floor(Math.random() * playerPool.length)];

        if (player.ownedCities.length >= citiesMax) {
            //Remove player from pool if they have to enough cities
            playerPool.splice(playerPool.indexOf(player), 1)
            //Recursive search for a new player
            return this.getPlayerFromPool(playerPool, citiesMax);
        }

        //Assume that the player is allowed to receive another city, thus returning that player
        return player;
    }

    private static getCityFromPool(cityPool: City[]): City | null {
        if (cityPool.length == 0) return null;

        let city: City = cityPool[Math.floor(Math.random() * cityPool.length)];

        if (city.getOwner() != Players[24].handle) {
            cityPool.splice(cityPool.indexOf(city), 1);
            city = this.getCityFromPool(cityPool);
        }

        return city;
    }
}