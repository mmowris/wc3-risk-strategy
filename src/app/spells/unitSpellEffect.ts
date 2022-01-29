import { City } from "app/country/city-type";
import { AID } from "resources/abilityID";
import { UID } from "resources/unitID";

export const unitSpellEffectTrig = CreateTrigger();

export function unitSpellEffect() {
    for (let i = 0; i < bj_MAX_PLAYERS; i++) {
        TriggerRegisterPlayerUnitEvent(unitSpellEffectTrig, Player(i), EVENT_PLAYER_UNIT_SPELL_EFFECT, null);
    }

    TriggerAddCondition(unitSpellEffectTrig, Condition(() => {
        if (GetUnitTypeId(GetTriggerUnit()) == UID.MEDIC) return false;

        switch (GetSpellAbilityId()) {
            case AID.SWAP:
                City.onCast();
            default:
                break;
        }

        return false;
    }));

    // unitSpellEffectTrig.addCondition(() => {
    //     if (GetSpellAbilityId() == ATYPE.HEAL) return false;
    //     const gplayer: GamePlayer = GamePlayer.fromUnitEvent();

    //     switch (GetSpellAbilityId()) {
    //         case ATYPE.SWAP:
    //             swapGuard();
    //             break;

    //         case ATYPE.LOAD:
    //             if (GetTerrainType(GetUnitX(GetTriggerUnit()), GetUnitY(GetTriggerUnit())) != FourCC("Vcbp")) {
    //                 Transports.onLoadCast();
    //             }

    //             break;
    //         case ATYPE.UNLOAD:
    //             if (GetTerrainType(GetUnitX(GetTriggerUnit()), GetUnitY(GetTriggerUnit())) != FourCC("Vcbp")) {
    //                 Transports.onUnloadCast();
    //             }

    //             break;
    //         case ATYPE.AUTOLOAD:
    //             if (GetTerrainType(GetUnitX(GetTriggerUnit()), GetUnitY(GetTriggerUnit())) != FourCC("Vcbp")) {
    //                 Transports.onAutoloadCast();
    //             }

    //             break;

    //         case ATYPE.LOW_HEALTH_DEFENDER:
    //             gplayer.healthyGuard = false;
    //             swapAbilities(Unit.fromEvent(), ATYPE.LOW_HEALTH_DEFENDER, ATYPE.HIGH_HEALTH_DEFENDER);

    //             break;
    //         case ATYPE.HIGH_HEALTH_DEFENDER:
    //             gplayer.healthyGuard = true;
    //             swapAbilities(Unit.fromEvent(), ATYPE.HIGH_HEALTH_DEFENDER, ATYPE.LOW_HEALTH_DEFENDER);

    //             break;
    //         case ATYPE.LOW_VALUE_DEFENDER:
    //             gplayer.valuableGuard = false;
    //             swapAbilities(Unit.fromEvent(), ATYPE.LOW_VALUE_DEFENDER, ATYPE.HIGH_VALUE_DEFENDER);

    //             break;
    //         case ATYPE.HIGH_VALUE_DEFENDER:
    //             gplayer.valuableGuard = true;
    //             swapAbilities(Unit.fromEvent(), ATYPE.HIGH_VALUE_DEFENDER, ATYPE.LOW_VALUE_DEFENDER);

    //             break;

    //         case ATYPE.ALLOW_PINGS:
    //             Data.PingForce.addPlayer(Unit.fromEvent().owner);
    //             swapAbilities(Unit.fromEvent(), ATYPE.ALLOW_PINGS, ATYPE.BLOCK_PINGS);

    //             break;

    //         case ATYPE.BLOCK_PINGS:
    //             Data.PingForce.removePlayer(Unit.fromEvent().owner);
    //             swapAbilities(Unit.fromEvent(), ATYPE.BLOCK_PINGS, ATYPE.ALLOW_PINGS);

    //             break;

    //         case ATYPE.PING:
    //             let pingX: number = GetSpellTargetX();
    //             let pingY: number = GetSpellTargetY();
    //             let pingIndex: number = GamePlayer.fromEvent().colorIndex;
    //             PingMinimapForForceEx(Data.PingForce.handle, pingX, pingY, 4.00, bj_MINIMAPPINGSTYLE_FLASHY, pingRedPercent[pingIndex], pingGreenPercent[pingIndex], pingBluePercent[pingIndex])

    //             break;
    //         default:
    //             break;
    //     }

    //     return false;
    // });
}