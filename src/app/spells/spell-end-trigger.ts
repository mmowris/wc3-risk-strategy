import { Transports } from "app/transports-type";
import { AID } from "resources/abilityID";

export const unitEndCastTrig: trigger = CreateTrigger();

export function unitEndCast() {
	for (let i = 0; i < bj_MAX_PLAYERS; i++) {
		TriggerRegisterPlayerUnitEvent(unitEndCastTrig, Player(i), EVENT_PLAYER_UNIT_SPELL_ENDCAST, null);
	}

	TriggerAddCondition(unitEndCastTrig, Condition(() => {
		switch (GetSpellAbilityId()) {
			case AID.UNLOAD:
				Transports.onUnloadEndCast();
				break;
			default:
				break;
		}

		return false;
	}));
}