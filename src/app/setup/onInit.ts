import { CommandProcessor } from "app/commands/command-processor";
import { City } from "app/country/city-type";
import { Country } from "app/country/country-type";
import { unitSpellEffect } from "app/spells/unitSpellEffect";
import { Players } from "w3ts/globals";

/**
 * Runs all code that is neccesary to run during map load
 */
export function onInit() {
    if (!BlzLoadTOCFile("war3mapimported\\Risk.toc")) {
        print("Failed to load TOC file!");
    };

    if (!BlzChangeMinimapTerrainTex("minimap.blp")) {
        print("Failed to load minimap file!");
    };

    SetGameSpeed(MAP_SPEED_FASTEST);
    SetMapFlag(MAP_LOCK_SPEED, true);
    SetMapFlag(MAP_USE_HANDICAPS, true);
    SetMapFlag(MAP_LOCK_ALLIANCE_CHANGES, true);
    SetTimeOfDay(12.00);
    SetTimeOfDayScale(0.00);
    SetAllyColorFilterState(0);
    FogEnable(false);
    FogMaskEnable(false);

    Players.forEach(player => {
        //Data.PlayerNames.push(player.name); //save names. possibly move this to a name class
        player.name = "Player";
    });

    //Type init functions
    City.init();
    Country.init();

    //Singletons

    //Triggers
    unitSpellEffect();
    CommandProcessor();
}