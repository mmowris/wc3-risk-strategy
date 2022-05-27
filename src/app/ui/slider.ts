export class Slider {
	public title: framehandle
	public slider: framehandle
	public text: framehandle

	private sliderEvent: trigger = CreateTrigger();
	private mouseEvent: trigger = CreateTrigger();

	constructor(name: string, parent: framehandle = BlzGetFrameByName("EscMenuBackdrop", 0), xPoint: number, yPoint: number, choices: string[]) {
		this.title = BlzCreateFrameByType("TEXT", `${name}title`, parent, "EscMenuLabelTextTemplate", 0);
		this.slider = BlzCreateFrameByType("SLIDER", name, this.title, "EscMenuSliderTemplate", 0);
		this.text = BlzCreateFrameByType("TEXT", `${name}text`, this.title, "EscMenuLabelTextTemplate", 0);

		BlzFrameSetPoint(this.title, FRAMEPOINT_CENTER, parent, FRAMEPOINT_TOPLEFT, xPoint, yPoint)
		BlzFrameSetText(this.title, name);
		BlzFrameSetTextColor(this.title, BlzConvertColor(255, 255, 255, 255));

		BlzFrameSetPoint(this.slider, FRAMEPOINT_CENTER, this.title, FRAMEPOINT_BOTTOM, 0.04, -0.01);
		BlzFrameSetMinMaxValue(this.slider, 0, choices.length - 1);
		BlzFrameSetValue(this.slider, 0)
		BlzFrameSetStepSize(this.slider, 1);

		if (GetLocalPlayer() == Player(0)) {
			BlzFrameSetVisible(this.title, true);
		}
	}
}