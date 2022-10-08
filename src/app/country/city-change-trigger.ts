import { GameTimer } from "app/game/game-timer-type";
import { GameTracking } from "app/game/game-tracking-type";
import { GamePlayer, PlayerStatus } from "app/player/player-type";
import { Scoreboard } from "app/scoreboard/scoreboard-type";
import { PLAYER_COLOR_CODES } from "resources/colordata";
import { HexColors } from "resources/hexColors";
import { NEUTRAL_HOSTILE } from "resources/constants";
import { Timer } from "w3ts";
import { City } from "./city-type";
import { Country } from "./country-type";
import { MessageAll } from "libs/utils";
import { RoundSettings } from "app/game/settings-data";

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

		//Process previous player - Remove city from .cities, remove # of cities owned in country, set country to NH if no longer owned
		prevOwner.cities.splice(prevOwner.cities.indexOf(city.barrack), 1);
		country.citiesOwned.set(prevOwner, country.citiesOwned.get(prevOwner) - 1);
		if (country.owner == prevOwner.player) country.setOwner(NEUTRAL_HOSTILE);

		if (prevOwner.cities.length == 0 && prevOwner.player != NEUTRAL_HOSTILE && !prevOwner.isLeft()) {
			if (prevOwner.getUnitCount() <= 0 || RoundSettings.nomad < 0) {
				prevOwner.setStatus(PlayerStatus.DEAD);
				MessageAll(true, `${PLAYER_COLOR_CODES[prevOwner.names.colorIndex]}${prevOwner.names.acct}|r has been ${HexColors.TANGERINE}defeated|r!`)

				if (prevOwner.turnDied == -1) {
					prevOwner.setTurnDied(GameTimer.getInstance().turn);
				}

				if (prevOwner.cityData.endCities == 0) {
					prevOwner.cityData.endCities = prevOwner.cities.length
				}

				if (GameTracking.getInstance().koVictory()) GameTimer.getInstance().stop();
			} else if (RoundSettings.nomad > 0) {
				const nomadTimer: Timer = new Timer();
				let duration: number = RoundSettings.nomad

				prevOwner.setStatus(PlayerStatus.NOMAD);
				nomadTimer.start(1, true, () => {
					if (!prevOwner.isNomad()) {
						nomadTimer.pause();
						nomadTimer.destroy();
						return;
					}

					if (duration < 1) {
						if (!prevOwner.isLeft() || !prevOwner.isForfeit()) {
							prevOwner.setStatus(PlayerStatus.DEAD);
						}

						if (prevOwner.turnDied == -1) {
							prevOwner.setTurnDied(GameTimer.getInstance().turn);
						}

						if (prevOwner.cityData.endCities == 0) {
							prevOwner.cityData.endCities = prevOwner.cities.length
						}
						
						MessageAll(true, `${PLAYER_COLOR_CODES[prevOwner.names.colorIndex]}${prevOwner.names.acct}|r has been ${HexColors.TANGERINE}defeated|r!`)

						nomadTimer.pause();
						nomadTimer.destroy();
						if (GameTracking.getInstance().koVictory()) GameTimer.getInstance().stop();
					}

					if (duration >= 1) {
						prevOwner.status = `${PlayerStatus.NOMAD} ${duration}|r`;
					}

					duration--;
				});
			}
		}

		//Process new owner - Add city to .cities, add to cities owned in country, set owner of country if they own it.
		owner.cities.push(city.barrack);
		country.citiesOwned.set(owner, country.citiesOwned.get(owner) + 1);
		if (country.cities.length == country.citiesOwned.get(owner)) {
			country.setOwner(owner.player)
			if (owner.player != NEUTRAL_HOSTILE) Scoreboard.getInstance().countryClaimed(owner, country.name);
		}

		if (owner.cities.length > GameTracking.getInstance().leader.cities.length) GameTracking.getInstance().leader = owner;
		if (owner.cities.length == 1) owner.setStatus(PlayerStatus.ALIVE);

		//print(`${owner.names.acct} owns ${country.citiesOwned.get(owner)} cities in ${country.name} and they own ${owner.cities.length} total`)

		if (owner.cityData.maxCities < owner.cities.length) owner.cityData.maxCities = owner.cities.length;

		return true;
	}));
}
