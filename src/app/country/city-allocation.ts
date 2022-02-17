import { Util } from "libs/translators";
import { City } from "./city-type";
import { Country } from "./country-type";

export namespace CityAllocation {
    function start() {
        let playerPool: player[] = this.buildPlayerPool();
        let cityPool: City[] = this.buildCityPool();
        let citiesMax: number = this.setCitiesPerPlayer(playerPool, cityPool);






        playerPool = null;
        cityPool = null;
    }

    function buildPlayerPool(): player[] {
        let result: player[] = [];

        for (let i = 0; i < bj_MAX_PLAYERS; i++) {
            if (GetPlayerSlotState(Player(i)) == PLAYER_SLOT_STATE_PLAYING && GetPlayerState(Player(i), PLAYER_STATE_OBSERVER) == 0) {
                result.push(Player(i));
            }
        }

        return result
    }

    function buildCityPool(): City[] {
        let result: City[] = [];

        for (let [k, v] of Country.fromName ) {
            if (v.size > 1) {
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

    function setCitiesPerPlayer(playerPool: player[], cityPool: City[]): number {
        let numOfCities: number = (playerPool.length == 2) ? 18 : Math.floor(cityPool.length / playerPool.length); //18 for 1v1

        return Math.min(numOfCities, 20); //Never more then 20 cities
    }

    function getPlayerFromPool(playerPool: player[], citiesMax: number): player | null {
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

    function getCityFromPool(cityPool: City[]): City | null {
        if (cityPool.length == 0) return null;

        let city: City = cityPool[Math.floor(Math.random() * cityPool.length)];

        if (city.getOwner() != Player(25)) {
            cityPool.splice(cityPool.indexOf(city), 1);
            city = this.getCityFromPool(cityPool);
        }

        return city;
    }
}