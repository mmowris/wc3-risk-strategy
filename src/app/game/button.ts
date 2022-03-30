export class Button {
	public static frame: Map<string, framehandle> = new Map<string, framehandle>();
	public static frameFunc: Map<string, Function> = new Map<string, Function>();

	public static CreateButton(name: string, framePoint: framepointtype, parent: framehandle, parentPoint: framepointtype, x: number, y: number, width: number, height: number) {
		let bFrame: framehandle = BlzCreateFrameByType("GLUETEXTBUTTON", "name", parent, "ScriptDialogButton", 0);
		BlzFrameSetPoint(bFrame, framePoint, parent, parentPoint, x, y);
		BlzFrameSetText(bFrame, name);
		BlzFrameSetSize(bFrame, width, height);

		Button.frame.set(name, bFrame);

		let frameTrig: trigger = CreateTrigger();
		BlzTriggerRegisterFrameEvent(frameTrig, bFrame, FRAMEEVENT_CONTROL_CLICK);
		TriggerAddAction(frameTrig, () => {
			Button.frameFunc.get(name);
			BlzFrameSetEnable(bFrame, false);
			BlzFrameSetEnable(bFrame, true);
		})

		BlzFrameSetVisible(bFrame, false);

		frameTrig = null;
		bFrame = null;
	}

	public static toggleForPlayer(fName: string, p: player, bool: boolean) {
		if (GetLocalPlayer() == p) {
			BlzFrameSetVisible(Button.frame.get(fName), bool);
		}
	}
}