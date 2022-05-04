import { Transports } from "app/transports-type";

export const unitTargetOrderTrig: trigger = CreateTrigger();

export function unitTargetOrder() {
	for (let i = 0; i < bj_MAX_PLAYERS; i++) {
		TriggerRegisterPlayerUnitEvent(unitTargetOrderTrig, Player(i), EVENT_PLAYER_UNIT_ISSUED_TARGET_ORDER, null);
	}

	TriggerAddCondition(unitTargetOrderTrig, Condition(() => {
		switch (GetIssuedOrderId()) {
			case 852047://"unload"
				Transports.orderUnload();
				break;

			default:
				break;
		}

		return false;
	}));
}