import { Frame, MapPlayer, Trigger } from "w3ts";
import { Players } from "w3ts/globals";

export class easySlider {
    public sliderFrame: Frame;
    public sliderTitle: Frame;
    public sliderText: Frame;
    private sliderFrameEvent: Trigger = new Trigger();
    private sliderMouseEvent: Trigger = new Trigger();
    public minValue: number = 0;
    public maxValue: number = 0;
    public sliderValue: number = 0;
    public sliderEventFunc: Function;

    constructor(name: string, parent: Frame = Frame.fromName("EscMenuBackdrop", 0), xPoint: number, yPoint: number, choices: string[]) {
        this.sliderFrame = new Frame(name, parent, 0, 0, "SLIDER", "EscMenuSliderTemplate");
        this.sliderTitle = new Frame(`${name}Title`, this.sliderFrame, 0, 0, "TEXT", "EscMenuLabelTextTemplate");
        this.sliderText = new Frame(`${name}Text`, this.sliderFrame, 0, 0, "TEXT", "EscMenuLabelTextTemplate");

        this.maxValue = (choices.length - 1);
        this.sliderFrame.setPoint(FRAMEPOINT_CENTER, parent, FRAMEPOINT_TOPLEFT, xPoint, yPoint);
        this.sliderFrame.setMinMaxValue(this.minValue, this.maxValue);
        this.sliderFrame.setValue(this.sliderValue);
        this.sliderFrame.setStepSize(1);

        this.sliderTitle.setPoint(FRAMEPOINT_CENTER, this.sliderFrame, FRAMEPOINT_TOP, 0, 0.01);
        this.sliderTitle.setText(name);
        this.sliderTitle.setTextColor(BlzConvertColor(255, 255, 255, 255));

        this.sliderText.setPoint(FRAMEPOINT_LEFT, this.sliderFrame, FRAMEPOINT_RIGHT, 0, 0);
        this.sliderText.setText(`${choices[0]}`);

        this.sliderFrameEvent.triggerRegisterFrameEvent(this.sliderFrame, FRAMEEVENT_SLIDER_VALUE_CHANGED);
        this.sliderMouseEvent.triggerRegisterFrameEvent(this.sliderFrame, FRAMEEVENT_MOUSE_WHEEL);

        this.sliderFrameEvent.addAction(() => {
            this.sliderText.setText(`${choices[this.sliderFrame.value]}`);
            this.sliderEventFunc();
        })

        this.sliderMouseEvent.addAction(() => {
            let amount: number = 0;
            let player: MapPlayer = MapPlayer.fromHandle(GetTriggerPlayer());

            if (Frame.getEventValue() > 0) {
                amount++;
            } else {
                amount--;
            }

            //if (player.isLocal()) {
                this.sliderFrame.setValue(this.sliderFrame.value + amount);
            //}
        })

        this.sliderFrame.setVisible(false);

        if (Players[0].isLocal()) {
            this.sliderFrame.setVisible(true);
        }
    }

    /**
     * setMinValue
     */
    public setMinValue(value: number) {
        this.minValue = value;
        this.sliderFrame.setMinMaxValue(value, this.maxValue);
    }

    /**
     * setMaxValue
     */
    public setMaxValue(value: number) {
        this.maxValue = value;
        this.sliderFrame.setMinMaxValue(this.minValue, value);
    }
}