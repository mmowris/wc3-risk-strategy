import { Cities } from "app/country/city-type";
import { Country } from "app/country/country-type";
import { GameTimer } from "app/game/game-timer-type";
import { Game } from "app/game/game-type";
import { Round } from "app/game/round-system";
import { GamePlayer } from "app/player/player-type";
import { Scoreboard } from "app/scoreboard/scoreboard-type";
import { Trees } from "app/trees-type";
import { ModeUI } from "app/ui/mode-ui-type";
import { UserInterface } from "app/ui/user-interface-type";
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
}

export function ResetGame() {
	try {
		Cities.forEach(city => {
			city.reset();
		})

		Country.fromName.forEach(country => {
			country.reset();
		});

		GamePlayer.fromPlayer.forEach(gPlayer => {
			gPlayer.reset();
		})

		Trees.getInstance().reset();
		GameTimer.getInstance().reset();
		//FogEnable(true);
		//If fast restart, enable selection and reset
		//If slow restart, bring up ui
	} catch (error) {
		print(error)
	}
}

//TODO no obs button on modeui
//TODO reset game timer
export function SlowRestart() {
	try {
		UserInterface.hideUI(true);
		ModeUI.toggleModeFrame(true);
		BlzFrameSetVisible(BlzGetFrameByName("OBSERVE GAME", 0), true);
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