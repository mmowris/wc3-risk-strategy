import { Util } from "libs/translators";
import { HexColors } from "resources/hexColors";

export class UserInterface {
	private static forTheReplays: location[] = [];

	public static frame: Map<string, framehandle> = new Map<string, framehandle>();
	public static frameFunc: Map<string, Function> = new Map<string, Function>();

	public static onLoad() {
		UserInterface.hideUI(true);
		print(`${Util.RandomEnumKey(HexColors)}Adjusting UI Resource Frames`);
		UserInterface.setResourceFrames();
		print(`${Util.RandomEnumKey(HexColors)}Hiding Private Message Options`);
		UserInterface.hidePMOptions();
	}

	public static hideUI(hidden: boolean) {
		BlzHideOriginFrames(hidden)
		BlzFrameSetVisible(BlzGetFrameByName("ConsoleUIBackdrop", 0), !hidden);
		BlzFrameSetVisible(BlzGetFrameByName("UpperButtonBarFrame", 0), !hidden);

		//Eye Candy
		print(`${Util.RandomEnumKey(HexColors)}Hiding User Interface`);
	}

	public static CreateButton(name: string, framePoint: framepointtype, parent: framehandle, parentPoint: framepointtype, x: number, y: number, width: number, height: number) {
		let bFrame: framehandle = BlzCreateFrameByType("GLUETEXTBUTTON", "name", parent, "ScriptDialogButton", 0);
		BlzFrameSetPoint(bFrame, framePoint, parent, parentPoint, x, y);
		BlzFrameSetText(bFrame, name);
		BlzFrameSetSize(bFrame, width, height);

		UserInterface.frame.set(name, bFrame);

		let frameTrig: trigger = CreateTrigger();
		BlzTriggerRegisterFrameEvent(frameTrig, bFrame, FRAMEEVENT_CONTROL_CLICK);
		TriggerAddAction(frameTrig, () => {
			UserInterface.frameFunc.get(name)();
			BlzFrameSetEnable(bFrame, false);
			BlzFrameSetEnable(bFrame, true);
		})

		BlzFrameSetVisible(bFrame, false);

		frameTrig = null;
		bFrame = null;
	}

	public static toggleForPlayer(fName: string, p: player, bool: boolean) {
		if (GetLocalPlayer() == p) {
			BlzFrameSetVisible(UserInterface.frame.get(fName), bool);
		}
	}

	private static setResourceFrames() {
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

	private static hidePMOptions() {
		if (BlzFrameGetEnable(BlzGetFrameByName("ChatPlayerRadioButton", 0)) == false) {
			UserInterface.forTheReplays.push(Location(0, 0));

			print(`PM frame did not exsist, adding handles`);
		} else {
			BlzFrameSetVisible(BlzGetFrameByName("ChatPlayerLabel", 0), false)
			BlzFrameSetVisible(BlzGetFrameByName("ChatPlayerRadioButton", 0), false)
			BlzFrameSetVisible(BlzGetFrameByName("ChatPlayerMenu", 0), false)
			print(`PM frame already exsist, hiding it`);
		}
	}
}