import { GamePlayer } from "app/player/player-type";
import { PLAYER_COLOR_CODES } from "resources/colordata";
import { HexColors } from "resources/hexColors";
import { NEUTRAL_HOSTILE } from "resources/constants";
import { RoundSettings } from "app/game/settings-data";
import { Alliances } from "app/game/round-allies";

export class Scoreboard {
	private static instance: Scoreboard;
	private mb: multiboard;
	public playersOnBoard: GamePlayer[] = [];
	public size: number;
	public allyBoard: boolean;

	constructor() { }

	//Public API
	public init() {
		this.allyBoard = RoundSettings.diplomancy == 1 || RoundSettings.diplomancy == 2 ? true : false;

		let counter: number = 0;
		GamePlayer.fromPlayer.forEach(gPlayer => {
			if (gPlayer.isObserving()) return;
			if (gPlayer.isLeft()) return;
			if (gPlayer.isNeutral()) return;

			counter++;
		})

		if (counter == 2) {
			this.allyBoard = false;
		}

		this.mb = CreateMultiboard();

		GamePlayer.fromPlayer.forEach(gPlayer => {
			if (gPlayer.isAlive() && gPlayer.player != NEUTRAL_HOSTILE) {
				this.playersOnBoard.push(gPlayer);
			}
		});

		MultiboardSetColumnCount(this.mb, 6);
		this.size = 3 + this.playersOnBoard.length;
		//TODO get num of teams and add to size

		for (let i = 1; i <= this.size; i++) {
			MultiboardSetRowCount(this.mb, MultiboardGetRowCount(this.mb) + 1);
			Scoreboard.setItemWidth(this.mb, 8.00, i, 1);
			Scoreboard.setItemWidth(this.mb, 2.50, i, 2);
			Scoreboard.setItemWidth(this.mb, 2.50, i, 3);
			Scoreboard.setItemWidth(this.mb, 4.00, i, 4);
			Scoreboard.setItemWidth(this.mb, 4.00, i, 5);
			Scoreboard.setItemWidth(this.mb, 4.50, i, 6);
		}

		MultiboardSetItemsStyle(this.mb, true, false);

		Scoreboard.setItemValue(this.mb, `${HexColors.TANGERINE}Player|r`, 1, 1);
		Scoreboard.setItemValue(this.mb, `${HexColors.TANGERINE}Inc|r`, 1, 2);
		Scoreboard.setItemValue(this.mb, `${HexColors.TANGERINE}C|r`, 1, 3);
		Scoreboard.setItemValue(this.mb, `${HexColors.TANGERINE}K|r`, 1, 4);
		Scoreboard.setItemValue(this.mb, `${HexColors.TANGERINE}D|r`, 1, 5);
		Scoreboard.setItemValue(this.mb, `${HexColors.TANGERINE}Status|r`, 1, 6);

		Scoreboard.setItemWidth(this.mb, 20.00, this.size, 1);
		Scoreboard.setItemWidth(this.mb, 0.00, this.size, 2);
		Scoreboard.setItemWidth(this.mb, 0.00, this.size, 3);
		Scoreboard.setItemWidth(this.mb, 0.00, this.size, 4);
		Scoreboard.setItemWidth(this.mb, 0.00, this.size, 5);
		Scoreboard.setItemWidth(this.mb, 0.00, this.size, 6);

		let count = 2;
		this.playersOnBoard.forEach(gPlayer => {
			this.updateBoard(gPlayer, count, true);

			count++;
		})

		MultiboardMinimize(this.mb, true);
		MultiboardMinimize(this.mb, false);
		MultiboardDisplay(this.mb, false);
	}

	public toggleVis(toggle: boolean) {
		MultiboardDisplay(this.mb, toggle);
	}

	public updateBoard(gPlayer: GamePlayer, row: number, turnUpdate: boolean = false) {
		//let sColor: string = (GetLocalPlayer() == gPlayer.player) ? HexColors.TANGERINE : HexColors.WHITE;
		let sColor: string = HexColors.WHITE;

		if (this.allyBoard && Alliances.getInstance().isAllied(GetLocalPlayer(), gPlayer.player)) {
			sColor = HexColors.GREEN;
		}

		if (GetLocalPlayer() == gPlayer.player) {
			sColor = HexColors.TANGERINE;
		}

		if (turnUpdate) {
			if (gPlayer.isAlive() || gPlayer.isNomad()) {
				Scoreboard.setItemValue(this.mb, `${sColor}${gPlayer.income}|r`, row, 2);
			} else {
				Scoreboard.setItemValue(this.mb, `${sColor}${0}|r`, row, 2);
			}
		}

		if (this.allyBoard && Alliances.getInstance().getNumOfAllies(gPlayer.player) >= 1) {
			Scoreboard.setItemValue(this.mb, `${HexColors.TANGERINE}[${Alliances.getInstance().getPlayerTeam(gPlayer.player)}]|r${gPlayer.coloredName()}`, row, 1);
		} else {
			Scoreboard.setItemValue(this.mb, `${gPlayer.coloredName()}`, row, 1);
		}
		
		Scoreboard.setItemValue(this.mb, `${sColor}${gPlayer.cities.length}`, row, 3);
		Scoreboard.setItemValue(this.mb, `${sColor}${gPlayer.kd.get(gPlayer).killValue}`, row, 4);
		Scoreboard.setItemValue(this.mb, `${sColor}${gPlayer.kd.get(gPlayer).deathValue}`, row, 5);
		Scoreboard.setItemValue(this.mb, gPlayer.status, row, 6);
	}

	public updateTitle(str: string) {
		MultiboardSetTitleText(this.mb, str);
	}

	public victoryUpdate(winPlayer: GamePlayer, gPlayer: GamePlayer, row: number) {
		Scoreboard.setItemValue(this.mb, `${PLAYER_COLOR_CODES[gPlayer.names.colorIndex]}${gPlayer.names.btag}`, row, 1);

		if (winPlayer == gPlayer) {
			Scoreboard.setItemValue(this.mb, `${HexColors.GREEN}Winner|r`, row, 6);
		} else {
			let str: string;

			if (!gPlayer.isLeft() && !gPlayer.isObserving()) {
				str = `${HexColors.RED}Loser|r`
			} else {
				str = gPlayer.status
			}

			Scoreboard.setItemValue(this.mb, str, row, 6);
		}

		this.updateTitle(`${PLAYER_COLOR_CODES[winPlayer.names.colorIndex]}${winPlayer.names.btag}|r won with ${PLAYER_COLOR_CODES[winPlayer.names.colorIndex]}${winPlayer.cities.length}|r cities! `);
		
		MultiboardMinimize(this.mb, true);
		MultiboardMinimize(this.mb, false);
	}

	public countryClaimed(pName: GamePlayer, cName: string) {
		if (this.allyBoard) {
			Scoreboard.setItemValue(this.mb, `${HexColors.TANGERINE}[${Alliances.getInstance().getPlayerTeam(pName.player)}]|r${pName.coloredName()} claimed ${HexColors.TANGERINE}${cName}|r`, this.size, 1);
		} else {
			Scoreboard.setItemValue(this.mb, `${pName.coloredName()} claimed ${HexColors.TANGERINE}${cName}|r`, this.size, 1);
		}

		
	}

	public destory() {
		this.playersOnBoard.length = 0;
		DestroyMultiboard(this.mb);
		this.mb = null;	
	}

	//Static API
	public static getInstance() {
		if (this.instance == null) {
			this.instance = new Scoreboard();
		}
		return this.instance;
	}

	public static setItemWidth(mb: multiboard, width: number, row: number, col: number) {
		let mbI: multiboarditem = MultiboardGetItem(mb, row - 1, col - 1);
		MultiboardSetItemWidth(mbI, width / 100);
		MultiboardReleaseItem(mbI);
		mbI = null;
	}

	public static setItemValue(mb: multiboard, value: string, row: number, col: number) {
		let mbI: multiboarditem = MultiboardGetItem(mb, row - 1, col - 1);
		MultiboardSetItemValue(mbI, value);
		MultiboardReleaseItem(mbI);
		mbI = null;
	}

}