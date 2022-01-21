import { Util } from "libs/translators";
import { GameStatus } from "resources/gameStatus";
import { HexColors } from "resources/hexColors";
import { MapPlayer, Timer, Unit } from "w3ts";
import { Players } from "w3ts/globals";

export class Game {
    private static instance: Game;

    public static getInstance() {
        if (this.instance == null) {
            this.instance = new Game();
        }
        return this.instance;
    }

    constructor() {
        this.preLoad();

        const loadTimer = new Timer();
        loadTimer.start(0.0, false, () => {
            try {
                this.onLoad();
            }
            catch (e) {
                print(e);
            }
        });
    }

    /** Static API */
    public static hideUI(hidden: boolean) {
        BlzHideOriginFrames(hidden)
        BlzFrameSetVisible(BlzGetFrameByName("ConsoleUIBackdrop", 0), !hidden);
        BlzFrameSetVisible(BlzGetFrameByName("UpperButtonBarFrame", 0), !hidden);

        //Eye Candy
        print(`${Util.RandomEnumKey(HexColors)}Hiding User Interface`);
    }

    /** Preload Functions */
    private preLoad() {
        if (!BlzLoadTOCFile("war3mapimported\\Risk.toc")) {
            print("Failed to load TOC file!");
        }

        if (!BlzChangeMinimapTerrainTex("minimap.blp")) {
            print("Failed to load minimap file!");
        }

        this.initMapSettings();
        this.changeNames();
    }

    private initMapSettings() {
        SetGameSpeed(MAP_SPEED_FASTEST);
        SetMapFlag(MAP_LOCK_SPEED, true);
        SetMapFlag(MAP_USE_HANDICAPS, true);
        SetMapFlag(MAP_LOCK_ALLIANCE_CHANGES, true);
        SetTimeOfDay(12.00);
        SetTimeOfDayScale(0.00);
        SetAllyColorFilterState(0);
        FogEnable(false); //TODO remove
        FogMaskEnable(false); //TODO remove
    }

    /**
     * Prevents the namebug in warcraft 3 reforged 1.32
     */
    private changeNames() {
        Players.forEach(player => {
            //Data.PlayerNames.push(player.name); //save names. possibly move this to a name class
            player.name = "Player";
        })
    }

    /** Postload Functions */
    private onLoad() {
        print(`${Util.RandomEnumKey(HexColors)}Game type is:|r ${HexColors.TANGERINE}${this.getGameStatus()}|r`);
        this.initUI();
        print(`${Util.RandomEnumKey(HexColors)}Loading User Interface`);

    }

    private initUI() {
        //Disable Resource Tooltips
        const resourceFrame: framehandle = BlzGetFrameByName("ResourceBarFrame", 0);
        BlzFrameSetVisible(BlzFrameGetChild(resourceFrame, 1), false); //lumber
        BlzFrameSetVisible(BlzFrameGetChild(resourceFrame, 2), false); //upkeep
        BlzFrameSetVisible(BlzFrameGetChild(resourceFrame, 3), false); //supply

        //Reposition Resource Frames
        const upkeepFrame: framehandle = BlzGetFrameByName("ResourceBarUpkeepText", 0);
        BlzFrameSetAbsPoint(upkeepFrame, FRAMEPOINT_TOPRIGHT, 0.6485, 0.5972);
        BlzFrameSetText(upkeepFrame, "");

        const lumberFrame: framehandle = BlzGetFrameByName("ResourceBarLumberText", 0);
        BlzFrameSetText(lumberFrame, "");
        BlzFrameSetSize(lumberFrame, 0.0000001, 0.0000001);
    }

    private getGameStatus(): string {
        let humanPlayer: MapPlayer;
        let result: string;

        Players.every(p => {
            if (p.slotState == PLAYER_SLOT_STATE_PLAYING && p.controller == MAP_CONTROL_USER) {
                humanPlayer = p
                return false;
            }
        })

        const dummy: Unit = new Unit(humanPlayer, FourCC('hfoo'), 0.00, 0.00, 270);
        dummy.select(true)
        const selected = dummy.isSelected(humanPlayer)
        dummy.destroy();

        if (selected) {
            if (ReloadGameCachesFromDisk()) {
                result = "OFFLINE";
                //Data.GameStatus = GameStatus.OFFLINE;
            } else {
                result = "REPLAY";
                //Data.GameStatus = GameStatus.REPLAY;
            }
        } else {
            result = "ONLINE";
            //Data.GameStatus = GameStatus.ONLINE;
        }

        return result
    }
}