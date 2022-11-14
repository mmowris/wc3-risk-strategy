import { City } from "app/country/city-type";
import { Spawner } from "app/country/spawner-type";
import { GamePlayer } from "app/player/player-type";
import { Transports } from "app/transports-type";
import { AID } from "resources/abilityID";
import { pingBluePercent, pingGreenPercent, pingRedPercent } from "resources/colordata";
import { UID } from "resources/unitID";

export const unitSpellEffectTrig = CreateTrigger();

export function unitSpellEffect() {
	for (let i = 0; i < bj_MAX_PLAYERS; i++) {
		TriggerRegisterPlayerUnitEvent(unitSpellEffectTrig, Player(i), EVENT_PLAYER_UNIT_SPELL_EFFECT, null);
	}

	TriggerAddCondition(unitSpellEffectTrig, Condition(() => {
		if (GetUnitTypeId(GetTriggerUnit()) == UID.MEDIC) return false;
		const gplayer: GamePlayer = GamePlayer.fromPlayer.get(GetOwningPlayer(GetTriggerUnit()));

		switch (GetSpellAbilityId()) {
			case AID.SWAP:
				City.onCast();

				break;
			case AID.LOAD:
				if (GetTerrainType(GetUnitX(GetTriggerUnit()), GetUnitY(GetTriggerUnit())) != FourCC("Vcbp")) {
					Transports.onLoadCast();
				}

				break;
			case AID.UNLOAD:
				if (GetTerrainType(GetUnitX(GetTriggerUnit()), GetUnitY(GetTriggerUnit())) != FourCC("Vcbp")) {
					Transports.onUnloadCast();
				}

				break;
			case AID.LOW_HEALTH_DEFENDER:
				gplayer.health = false;
				swapAbilities(GetTriggerUnit(), AID.LOW_HEALTH_DEFENDER, AID.HIGH_HEALTH_DEFENDER);

				break;
			case AID.HIGH_HEALTH_DEFENDER:
				gplayer.health = true;
				swapAbilities(GetTriggerUnit(), AID.HIGH_HEALTH_DEFENDER, AID.LOW_HEALTH_DEFENDER);

				break;
			case AID.LOW_VALUE_DEFENDER:
				gplayer.value = false;
				swapAbilities(GetTriggerUnit(), AID.LOW_VALUE_DEFENDER, AID.HIGH_VALUE_DEFENDER);

				break;
			case AID.HIGH_VALUE_DEFENDER:
				gplayer.value = true;
				swapAbilities(GetTriggerUnit(), AID.HIGH_VALUE_DEFENDER, AID.LOW_VALUE_DEFENDER);

				break;

			case AID.ALLOW_PINGS:
				swapAbilities(GetTriggerUnit(), AID.ALLOW_PINGS, AID.BLOCK_PINGS);
				gplayer.ping = true;

				break;

			case AID.BLOCK_PINGS:
				swapAbilities(GetTriggerUnit(), AID.BLOCK_PINGS, AID.ALLOW_PINGS);
				gplayer.ping = false;

				break;

			case AID.PING:
				let pingX: number = GetSpellTargetX();
				let pingY: number = GetSpellTargetY();
				let pingIndex: number = gplayer.names.colorIndex

				let pingForce: force = CreateForce()

				GamePlayer.fromPlayer.forEach(gPlayer => {
					if (!gPlayer.isLeft() && gPlayer.ping) {
						ForceAddPlayer(pingForce, gPlayer.player);
					}
				})

				PingMinimapForForceEx(pingForce, pingX, pingY, 4.00, bj_MINIMAPPINGSTYLE_FLASHY, pingRedPercent[pingIndex], pingGreenPercent[pingIndex], pingBluePercent[pingIndex])
				DestroyForce(pingForce);
				pingForce = null;

				break;
				
			case AID.SPWN_3000:
			case AID.SPWN_6000:
			case AID.SPWN_ALL:
			case AID.SPWN_RESET:
				Spawner.onCast();

				break;
			default:
				break;
		}

		return false;
	}));
}

function swapAbilities(castingUnit: unit, castedAbility: number, swapAbility: number) {
	UnitRemoveAbility(castingUnit, castedAbility);
	UnitAddAbility(castingUnit, swapAbility);
	BlzStartUnitAbilityCooldown(castingUnit, castedAbility, 1)
}