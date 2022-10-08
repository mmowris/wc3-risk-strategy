import { Cities } from "app/country/city-type";
import { Country } from "app/country/country-type";
import { GameTimer } from "app/game/game-timer-type";
import { Round } from "app/game/round-system";
import { GamePlayer } from "app/player/player-type";
import { Scoreboard } from "app/scoreboard/scoreboard-type";
import { Trees } from "app/trees-type";
import { ModeUI } from "app/ui/mode-ui-type";
import { UserInterface } from "app/ui/user-interface-type";
import { MessageAll } from "libs/utils";
import { MAX_PLAYERS } from "resources/constants";
import { UTYPE } from "resources/unitTypes";

export function CleanMap() {
	let uGroup = CreateGroup();

	for (let i = 0; i < MAX_PLAYERS; i++) {
		GroupEnumUnitsOfPlayer(uGroup, Player(i), Filter(() => {
			let u = GetFilterUnit();

			if (!IsUnitType(u, UTYPE.BUILDING) && !IsUnitType(u, UTYPE.GUARD)) {
				RemoveUnit(u);
			}

			return u = null;
		}));

		GroupClear(uGroup);
	}

	DestroyGroup(uGroup);
	uGroup = null;

	Scoreboard.getInstance().destory();
	MessageAll(false, "Map Cleaned", 0, 0);
}

export function ResetGame() {
	try {
		Trees.getInstance().reset();
		
		Cities.forEach(city => {
			city.reset();
		})

		Country.fromName.forEach(country => {
			country.reset();
		});

		GamePlayer.fromPlayer.forEach(gPlayer => {
			gPlayer.reset();
		})

		GameTimer.getInstance().reset();

	} catch (error) {
		print(error)
	}
	MessageAll(false, "Game Reset", 0, 0);
}

export function SlowRestart() {
	try {
		//MessageAll(false, "Slow Restart", 0, 0);
		UserInterface.hideUI(true);
		//MessageAll(false, "UI Hidden", 0, 0);
		BlzFrameSetVisible(BlzGetFrameByName("OBSERVE GAME", 0), true);
		//MessageAll(false, "Obs Button Visable", 0, 0);
		Round.getInstance().runModeSelection();
	} catch (error) {
		print(error)
	}
}

export function FastRestart() {
	try {
		Round.getInstance().quickStart();
	} catch (error) {
		print(error)
	}
}