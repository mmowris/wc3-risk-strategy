import { Hooks } from "libs/Hooks";
import { UTYPE } from "objects/unitIDs";
import { Timer, Trigger, Unit } from "w3ts";
import { Players } from "w3ts/globals";
import { Data } from "./Data";
import { Messages } from "./Messages";

/** 
 * For use with TriggerRegisterPlayerUnitEvent
 * EVENT_PLAYER_UNIT_LOADED =
 * GetTransportUnit = The transport being loaded
 * GetLoadedUnit = The unit being loaded
 * GetTriggerUnit = The unit being loaded
 * 
 * IsUnitInTransport = Check if given unit is loaded into given transport
 * IsUnitLoaded = Check if given unit is loaded into any transport
*/

export class Transports {
    private static instance: Transports;
    public static autoLoadTimer = new Map<Unit, Timer>();
    public static loadedUnits = new Map<Unit, Unit[]>();
    public static onLoadTrig = new Trigger();

    //create a trigger
    public static getInstance() {
        if (this.instance == null) {
            this.instance = new Transports();
            Hooks.set(this.name, this.instance);
        }
        return this.instance;
    }

    constructor() {
        Transports.onLoad();
    }

    private static onLoad() {
        for (let i = 0; i < Data.Loop23; i++) {
            Transports.onLoadTrig.registerPlayerUnitEvent(Players[i], EVENT_PLAYER_UNIT_LOADED, null);
        }

        Transports.onLoadTrig.addCondition(Condition(() => {
            if (Data.TransportAnywhere) return false;

            let trans: Unit = Unit.fromHandle(GetTransportUnit());
            let loadedUnit: Unit = Unit.fromHandle(GetLoadedUnit());

            Transports.loadedUnits.get(trans).push(loadedUnit)

            //print(`there is ${Transports.loadedUnits.get(trans).length} units loaded`)
            //print(`-----------------------------------`)

            trans = null;
            loadedUnit = null
            return true
        }));
    }

    public static orderUnload() {
        if (Data.TransportAnywhere) return false;
        if (!IsUnitType(GetTriggerUnit(), UTYPE.TRANSPORT_TYPE)) return false;

        let trans = Unit.fromHandle(GetTriggerUnit()); //Trigger unit = transport unloading

        //print(`target x:${GetOrderPointX}, y:${GetOrderPointY}`);
        //print(`trans x:${trans.x}, y:${trans.y}`);

        if (GetTerrainType(trans.x, trans.y) != FourCC("Vcbp")) {
            trans.pauseEx(true);
            trans.pauseEx(false);
            trans.issueImmediateOrder("stop");

            Messages.errorMessage("You may only unload on pebble terrain!", trans.owner, true);
        } else {
            let unloadedUnit: Unit = Unit.fromHandle(GetOrderTargetUnit());

            Transports.loadedUnits.set(trans, Transports.loadedUnits.get(trans).filter(unit => unit !== unloadedUnit))

            //print(`there is ${Transports.loadedUnits.get(trans).length} units loaded`)
            //print(`-----------------------------------`)

            unloadedUnit = null;
        }

        trans = null
    }

    public static onLoadCast() {
        if (Data.TransportAnywhere) return false;

        let trans = Unit.fromHandle(GetTriggerUnit());

        trans.issueImmediateOrder("stop");
        trans.pauseEx(true);
        trans.pauseEx(false);

        Messages.errorMessage("You may only load on pebble terrain!", trans.owner, true);

        trans = null;
    }

    public static onUnloadCast() {
        if (Data.TransportAnywhere) return false;

        let trans = Unit.fromHandle(GetTriggerUnit());

        trans.issueImmediateOrder("stop");

        Messages.errorMessage("You may only unload on pebble terrain!", trans.owner, true);

        trans = null;
    }

    public static onAutoloadCast() {
        if (Data.TransportAnywhere) return false;

        let trans = Unit.fromHandle(GetTriggerUnit());

        trans.issueImmediateOrder("stop");

        Messages.errorMessage("You may only load on pebble terrain!", trans.owner, true);

        trans = null;
    }

    public static onUnloadEndCast() {
        if (Data.TransportAnywhere) return false;

        let trans = Unit.fromHandle(GetTriggerUnit());

        Transports.loadedUnits.set(trans, Transports.loadedUnits.get(trans).filter(unit => unit.inTransport(trans)))

        //print(`there is ${Transports.loadedUnits.get(trans).length} units loaded`)
        //print(`-----------------------------------`)

        trans = null;

        return false
    }

    public static onCreate(transport: Unit) {
        if (Data.TransportAnywhere) return false;
        
        Transports.loadedUnits.set(transport, [] = []);
    }

    public static onDeath(transport: Unit, killer: Unit) {
        if (!transport.isUnitType(UTYPE.TRANSPORT_TYPE)) return false;
        if (Data.TransportAnywhere) return false;

        if (GetTerrainType(transport.x, transport.y) != FourCC("Vcbp")) {
            Transports.loadedUnits.get(transport).forEach(unit => {
                unit.life = 1;
                killer.damageTarget(unit.handle, 100, true, false, ATTACK_TYPE_CHAOS, DAMAGE_TYPE_NORMAL, WEAPON_TYPE_WHOKNOWS)
            });
        }

        Transports.loadedUnits.delete(transport);
    }
}