import CameraControls, { PlayerCamData } from "app/camera-controls-type";
//TODO: Commands
export const CommandProcessor = () => {
    const t: trigger = CreateTrigger(); 

    for (let i = 0; i < bj_MAX_PLAYERS; i++) {
        TriggerRegisterPlayerChatEvent(t, Player(i), "-", false);
    }

    TriggerAddCondition(t, Condition(() => {
        const command: string = GetEventPlayerChatString().split(' ')[0];
        const tPlayer: player = GetTriggerPlayer();

        switch (command) {
            case "-cam":
                let camData: string[] = [];

                let distance: string = GetEventPlayerChatString().split(' ')[1];
                let angle: string = GetEventPlayerChatString().split(' ')[2];
                let rotation: string = GetEventPlayerChatString().split(' ')[3];

                if (distance && S2R(distance)) camData.push(distance);
                if (angle && S2R(angle)) camData.push(angle);
                if (rotation && S2R(rotation)) camData.push(rotation);

                CameraControls.getInstance().checkCamData(PlayerCamData.get(tPlayer), camData);
                break;
            // case "-def":
            //     gPlayer.defaultCam();

            //     break;
            // case "-forfeit":
            // case "-ff":
            //     Forfeit(gPlayer);

            //     break;
            // case "-restart":
            // case "-ng":
            //     Restart();

            //     break;
            // case "-names":
            // case "-players":
            //     LobbyList(gPlayer);

            //     break;
            // case "-sb":
            //     Scoreboard(gPlayer);

            //     break;
            // case "-stfu":
            //     STFU();

            //     break;

            // case "-g":
            //     SendGold(gPlayer);

            //     break;
            default:
                break;
        }

        return true;
    }))
}