export class UserInterface {
	private static forTheReplays: location[] = [];

	public static onLoad() {
		UserInterface.setResourceFrames();
		UserInterface.hidePMOptions();
		UserInterface.hideUI(true);
	}

	public static hideUI(hidden: boolean) {
		BlzHideOriginFrames(hidden)
		BlzFrameSetVisible(BlzGetFrameByName("ConsoleUIBackdrop", 0), !hidden);
		BlzFrameSetVisible(BlzGetFrameByName("UpperButtonBarFrame", 0), !hidden);

		BlzEnableSelections(!hidden, !hidden);
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