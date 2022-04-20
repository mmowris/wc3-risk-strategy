import { GameTracking } from "app/game/game-tracking";
import { GamePlayer } from "app/player/player-type";
import { HexColors } from "resources/hexColors";

export class Scoreboard {
	private static instance: Scoreboard;
	private mb: multiboard;
	public playersOnBoard: GamePlayer[] = [];
	public size: number;

	constructor() {}

	//Public API
	public init() {
		this.mb = CreateMultiboard();

		GamePlayer.fromID.forEach(gPlayer => {
			if (gPlayer.isAlive() && gPlayer.player != Player(24)) {
				this.playersOnBoard.push(gPlayer);
			}
		});

		MultiboardSetColumnCount(this.mb, 6);
		this.size = 3 + this.playersOnBoard.length;

		for (let i = 1; i <= this.size; i++) {
			MultiboardSetRowCount(this.mb, MultiboardGetRowCount(this.mb) + 1);
			Scoreboard.setItemWidth(this.mb, 8.00, i, 1);
			Scoreboard.setItemWidth(this.mb, 2.50, i, 2);
			Scoreboard.setItemWidth(this.mb, 2.50, i, 3);
			Scoreboard.setItemWidth(this.mb, 3.50, i, 4);
			Scoreboard.setItemWidth(this.mb, 3.50, i, 5);
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
			this.updateBoard(gPlayer, count, 60, true);

			count++;
		})

		MultiboardMinimize(this.mb, true);
		MultiboardMinimize(this.mb, false);
		MultiboardDisplay(this.mb, true);
	}

	public updateBoard(gPlayer: GamePlayer, row: number, time: number, turnUpdate: boolean = false) {
		
		const sColor: string = (GetLocalPlayer() == gPlayer.player) ? HexColors.TANGERINE : HexColors.WHITE;
		const tColor: string = time <= 3 ? HexColors.RED : HexColors.WHITE;

		if (turnUpdate) {
			// Scoreboard.getInstance().playersOnBoard.sort((p1, p2) => {
			// 	if (p1.income < p2.income) return 1;
			// 	if (p1.income > p2.income) return -1;
			// 	return 0;
			// })
			//TODO: Sort players in this.playeronsb

			Scoreboard.setItemValue(this.mb, `${sColor}${gPlayer.income}|r`, row, 2);
		}

		Scoreboard.setItemValue(this.mb, gPlayer.coloredName(), row, 1);
		Scoreboard.setItemValue(this.mb, `${sColor}${gPlayer.cities.length}`, row, 3);
		Scoreboard.setItemValue(this.mb, `${sColor}${gPlayer.kd.get(gPlayer).kills}`, row, 4);
		Scoreboard.setItemValue(this.mb, `${sColor}${gPlayer.kd.get(gPlayer).deaths}`, row, 5);
		Scoreboard.setItemValue(this.mb, gPlayer.status, row, 6);

		MultiboardSetTitleText(this.mb, `${GameTracking.getInstance().leader.coloredName()} ${GameTracking.getInstance().leader.cities.length} / ${GameTracking.getInstance().citiesToWin} ${HexColors.RED}-|r Turn Time: ${tColor}${/*TODO turn timer*/0}|r`)
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