import { HexColors } from "resources/hexColors";

export class Slider {
	public title: framehandle
	public slider: framehandle
	public text: framehandle
	private event: Function

	private onDrag: trigger = CreateTrigger();
	private onWheel: trigger = CreateTrigger();

	private static sliders: Map<framehandle, Slider> = new Map<framehandle, Slider>();

	constructor(name: string, parent: framehandle = BlzGetFrameByName("EscMenuBackdrop", 0), x: number, y: number, sOffSet: number, choices: string[], event: Function) {
		this.title = BlzCreateFrameByType("TEXT", name, parent, "EscMenuLabelTextTemplate", 0);
		this.slider = BlzCreateFrameByType("SLIDER", `${name} slider`, this.title, "EscMenuSliderTemplate", 0);
		this.text = BlzCreateFrameByType("TEXT", `${name} text`, this.title, "EscMenuLabelTextTemplate", 0);

		BlzFrameSetPoint(this.title, FRAMEPOINT_CENTER, parent, FRAMEPOINT_TOPLEFT, x, y)
		BlzFrameSetText(this.title, `${HexColors.TANGERINE}${name}: |r`);
		BlzFrameSetTextColor(this.title, BlzConvertColor(255, 255, 255, 255));
		BlzFrameSetTextAlignment(this.title, TEXT_JUSTIFY_LEFT, TEXT_JUSTIFY_CENTER)

		BlzFrameSetPoint(this.text, FRAMEPOINT_LEFT, this.title, FRAMEPOINT_RIGHT, 0, 0)
		BlzFrameSetText(this.text, `${HexColors.WHITE}${choices[0]}|r`)

		BlzFrameSetPoint(this.slider, FRAMEPOINT_CENTER, this.title, FRAMEPOINT_BOTTOM, 0.04 + sOffSet, -0.01);
		BlzFrameSetMinMaxValue(this.slider, 0, choices.length - 1);
		BlzFrameSetValue(this.slider, 0);
		BlzFrameSetStepSize(this.slider, 1);

		BlzTriggerRegisterFrameEvent(this.onDrag, this.slider, FRAMEEVENT_SLIDER_VALUE_CHANGED);
		BlzTriggerRegisterFrameEvent(this.onWheel, this.slider, FRAMEEVENT_MOUSE_WHEEL);

		this.event = event;

		TriggerAddAction(this.onDrag, () => {
			BlzFrameSetText(this.text, `${choices[BlzFrameGetValue(this.slider)]}`)
			this.event();
		})

		TriggerAddAction(this.onWheel, () => {
			let amount: number = 0;

			if (BlzGetTriggerFrameValue() > 0) {
				amount++;
			} else {
				amount--;
			}

			BlzFrameSetValue(this.slider, BlzFrameGetValue(this.slider) + amount);
		})

		BlzFrameSetVisible(this.slider, false);

		if (GetLocalPlayer() == Player(0)) BlzFrameSetVisible(this.slider, true);

		Slider.sliders.set(this.title, this);
	}
	
	public static fromName(name: string): Slider {
		return Slider.sliders.get(BlzGetFrameByName(name, 0))
	}

	public static offSetFrame(name: string, x: number, y: number) {
		let slider: Slider = Slider.sliders.get(BlzGetFrameByName(name, 0))

		BlzFrameSetPoint(slider.slider, FRAMEPOINT_CENTER, slider.title, FRAMEPOINT_BOTTOM, x, y);
	}
}