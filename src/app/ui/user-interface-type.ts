export class UserInterface {
	public static onLoad() {
		UserInterface.setResourceFrames();
		UserInterface.initAlliesBoard();
		UserInterface.hideUI(true);
		//BlzFrameSetEnable(BlzGetFrameByName("UpperButtonBarChatButton", 0), false);

		if (GetHandleId(BlzGetFrameByName("ChatPlayerLabel", 0)) == 0) {
			Location(0, 0)
			//print("add handle for plabel")
		} else {
			BlzFrameSetVisible(BlzGetFrameByName("ChatPlayerLabel", 0), false)
			//print("hide label")
		}

		if (GetHandleId(BlzGetFrameByName("ChatPlayerRadioButton", 0)) == 0) {
			Location(0, 0)
			//print("add handle for radio")
		} else {
			BlzFrameSetVisible(BlzGetFrameByName("ChatPlayerRadioButton", 0), false)
			//print("hide radio")
		}

		if (GetHandleId(BlzGetFrameByName("ChatPlayerMenu", 0)) == 0) {
			Location(0, 0)
			//print("add handle for menu")
		} else {
			BlzFrameSetVisible(BlzGetFrameByName("ChatPlayerMenu", 0), false)
			//print("hide menu")
		}
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
		BlzFrameSetVisible(BlzFrameGetChild(resourceFrame, 1), false); //lumber tooltip
		BlzFrameSetVisible(BlzFrameGetChild(resourceFrame, 2), false); //upkeep tooltip
		BlzFrameSetVisible(BlzFrameGetChild(resourceFrame, 3), false); //supply tooltip

		//Reposition Resource Frames
		const upkeepFrame: framehandle = BlzGetFrameByName("ResourceBarUpkeepText", 0);
		BlzFrameSetAbsPoint(upkeepFrame, FRAMEPOINT_TOPRIGHT, 0.6485, 0.5972);
		BlzFrameSetText(upkeepFrame, "");

		const lumberFrame: framehandle = BlzGetFrameByName("ResourceBarLumberText", 0);
		BlzFrameSetText(lumberFrame, "");
		BlzFrameSetSize(lumberFrame, 0.0000001, 0.0000001);
	}

	private static initAlliesBoard() {
		let newTitle: string = "discord.me/risk";
		let newResourceHeader: string = "Xace#5821 @ discord";

		BlzFrameSetText(BlzGetFrameByName("AllianceTitle", 0), newTitle);
		BlzFrameSetText(BlzGetFrameByName("ResourceTradingTitle", 0), newResourceHeader);

		BlzFrameSetVisible(BlzGetFrameByName("VisionHeader", 0), false);
		BlzFrameSetVisible(BlzGetFrameByName("LumberHeader", 0), false);
		BlzFrameSetVisible(BlzGetFrameByName("AlliedVictoryLabel", 0), false);
		BlzFrameSetVisible(BlzGetFrameByName("AlliedVictoryCheckBox", 0), false);

		for (let i = 0; i < 23; i++) {
			BlzFrameSetVisible(BlzGetFrameByName("LumberBackdrop", i), false);
			BlzFrameSetVisible(BlzGetFrameByName("LumberText", i), false);
			BlzFrameSetVisible(BlzGetFrameByName("VisionCheckBox", i), false);
		}
	}

	public static ffaSetup() {
		let AllyMenuTitle: framehandle = BlzGetFrameByName("AllianceTitle", 0)
		let tempText: string = "discord.me/risk"
		tempText += "|n|n|cffffcc00Commands:|r"
		tempText += "|n|cffffffff-cam #### (1000 min, 8500 max)"
		tempText += "|n|cffffffff-def (resets cam to default)"
		tempText += "|n|cffffffff-sb 1 OR -sb 2 (changes scoreboard)"
		tempText += "|n|cffffffff-forfeit OR -ff (forfeits the game without leaving it)"
		tempText += "|n|cffffffff-restart OR -ng (restarts the game if its over)"
		tempText += "|n|cffffffff-stfu <player name> (mutes a player for 300 seconds)"
		tempText += "|n|n|cffffcc00Hotkeys:|r"
		tempText += "|n|cffffffff F1 (selects player tools)"
		tempText += "|n|cffffffff F2 (cycles scoreboard)"
		tempText += "|n|cffffffff F8 (cycles owned spawners)"

		BlzFrameSetText(AllyMenuTitle, tempText)

		BlzFrameSetVisible(BlzGetFrameByName("UnitsHeader", 0), false)
		BlzFrameSetVisible(BlzGetFrameByName("AllyHeader", 0), false)
		BlzFrameSetVisible(BlzGetFrameByName("GoldHeader", 0), false)
		BlzFrameSetVisible(BlzGetFrameByName("AllianceDialogScrollBar", 0), false)
		BlzFrameSetVisible(BlzGetFrameByName("AllianceAcceptButton", 0), false)
		BlzFrameSetVisible(BlzGetFrameByName("AllianceAcceptButtonText", 0), false)
		BlzFrameSetVisible(BlzGetFrameByName("PlayersHeader", 0), false)

		for (let i = 0; i < 23; i++) {
			BlzFrameSetVisible(BlzGetFrameByName("AllianceSlot", i), false)
			BlzFrameSetVisible(BlzGetFrameByName("PlayerNameLabel", i), false)
			BlzFrameSetVisible(BlzGetFrameByName("ColorBackdrop", i), false)
			BlzFrameSetVisible(BlzGetFrameByName("ColorBorder", i), false)
			BlzFrameSetVisible(BlzGetFrameByName("AllyCheckBox", i), false)
			BlzFrameSetVisible(BlzGetFrameByName("GoldBackdrop", i), false)
			BlzFrameSetVisible(BlzGetFrameByName("GoldText", i), false)
			BlzFrameSetVisible(BlzGetFrameByName("UnitsCheckBox", i), false)
		}
	}

	// private static hidePMOptions() {
	// 	if (BlzFrameGetEnable(BlzGetFrameByName("ChatPlayerRadioButton", 0)) == false) {
	// 		UserInterface.forTheReplays.push(Location(0, 0));

	// 		print(`PM frame did not exsist, adding handles`);
	// 	} else {
	// 		BlzFrameSetVisible(BlzGetFrameByName("ChatPlayerLabel", 0), false)
	// 		BlzFrameSetVisible(BlzGetFrameByName("ChatPlayerRadioButton", 0), false)
	// 		BlzFrameSetVisible(BlzGetFrameByName("ChatPlayerMenu", 0), false)
	// 		print(`PM frame already exsist, hiding it`);
	// 	}
	// }

	//Replays == Message Log
	//In Game == Messaging
	public static changeUI() {
		//BlzFrameSetEnable(BlzGetFrameByName("UpperButtonBarAlliesButton", 0), false);
		BlzFrameSetEnable(BlzGetFrameByName("UpperButtonBarChatButton", 0), false);

		// let AllyMenuTitle: framehandle = BlzGetFrameByName("AllianceTitle", 0)
		// let tempText: string = "discord.me/risk"
		// tempText += "|n|n|cffffcc00Commands:|r"
		// tempText += "|n|cffffffff-cam #### (1000 min, 8500 max)"
		// tempText += "|n|cffffffff-def (resets cam to default)"
		// tempText += "|n|cffffffff-sb 1 OR -sb 2 (changes scoreboard)"
		// tempText += "|n|cffffffff-forfeit OR -ff (forfeits the game without leaving it)"
		// tempText += "|n|cffffffff-restart OR -ng (restarts the game if its over)"
		// tempText += "|n|cffffffff-stfu <player name> (mutes a player for 90 seconds)"
		// tempText += "|n|n|cffffcc00Hotkeys:|r"
		// tempText += "|n|cffffffff F1 (selects player tools)"
		// tempText += "|n|cffffffff F2 (cycles scoreboard)"
		// tempText += "|n|cffffffff F8 (cycles owned spawners)"

		// BlzFrameSetText(AllyMenuTitle, tempText)

		// BlzFrameSetVisible(BlzGetFrameByName("UnitsHeader", 0), false)
		// BlzFrameSetVisible(BlzGetFrameByName("AllyHeader", 0), false)
		// BlzFrameSetVisible(BlzGetFrameByName("GoldHeader", 0), false)
		// BlzFrameSetVisible(BlzGetFrameByName("AllianceDialogScrollBar", 0), false)
		// BlzFrameSetVisible(BlzGetFrameByName("AllianceAcceptButton", 0), false)
		// BlzFrameSetVisible(BlzGetFrameByName("AllianceAcceptButtonText", 0), false)
		// BlzFrameSetVisible(BlzGetFrameByName("PlayersHeader", 0), false)

		// for (let i = 0; i < bj_MAX_PLAYERS; i++) {
		// 	BlzFrameSetVisible(BlzGetFrameByName("AllianceSlot", i), false)
		// 	BlzFrameSetVisible(BlzGetFrameByName("PlayerNameLabel", i), false)
		// 	BlzFrameSetVisible(BlzGetFrameByName("ColorBackdrop", i), false)
		// 	BlzFrameSetVisible(BlzGetFrameByName("ColorBorder", i), false)
		// 	BlzFrameSetVisible(BlzGetFrameByName("AllyCheckBox", i), false)
		// 	BlzFrameSetVisible(BlzGetFrameByName("GoldBackdrop", i), false)
		// 	BlzFrameSetVisible(BlzGetFrameByName("GoldText", i), false)
		// 	BlzFrameSetVisible(BlzGetFrameByName("UnitsCheckBox", i), false)
		// }
	}
}