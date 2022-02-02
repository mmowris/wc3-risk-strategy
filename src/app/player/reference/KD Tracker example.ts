// interface KD {
//     kills: number;
//     deaths: number;
// }

// export class GamePlayer {
//     public kd: Map<string | GamePlayer, KD>;

//     public static fromString = new Map<string, GamePlayer>();
//     public static fromID = new Map<number, GamePlayer>();

//     constructor() {
//     }

//     setKills(who: GamePlayer, uID: number) {
//         // if (!this.kd.has(this.getKey(who, uID))) {

//         //     this.kd.set(this.getKey(who, uID), {
//         //         kills: 0,
//         //         deaths: 0
//         //     })
//         // }

//         this.kd.get(this.getKey(who, uID)).kills++;
//         this.kd.get(this).kills++
//         this.kd.get(who).kills++
//     }

//     getKey(who: GamePlayer, uID: number) {
//         return `${who}:${uID}`;
//     }
// }