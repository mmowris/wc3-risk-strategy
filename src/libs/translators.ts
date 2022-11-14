export function DecodeFourCC(fourcc: number): string {
    // tslint:disable-next-line:no-bitwise
    return string.char((fourcc >>> 24) & 255, (fourcc >>> 16) & 255, (fourcc >>> 8) & 255, (fourcc) & 255);
}

export class Util {

    public static ShuffleArray(arr: any[]): void {
        for (let i: number = arr.length - 1; i > 0; i--) {
            const j: number = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
            // [arr[i], arr[j]] = [arr[j], arr[i]]; // swap elements

            const temp: any = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }

    public static RandomHash(length: number): string {
        let result: string = '';
        const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength: number = characters.length;
        for (let i: number = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    public static GetRandomKey(collection: Map<any, any>): any {
        const index: number = Math.floor(Math.random() * collection.size);
        let cntr: number = 0;
        for (const key of collection.keys()) {
            if (cntr++ === index) {
                return key;
            }
        }
    }

    public static GetAllKeys(collection: Map<any, any>): any[] {
        const keys: any[] = [];
        for (const key of collection.keys()) {
            keys.push(key);
        }
        return keys;
    }

    public static ArraysToString(arr: any[]): string {
        let output: string = '[';
        for (let i: number = 0; i < arr.length; i++) {
            if (i === arr.length - 1) {
                output += `"${arr[i]}"`;
                continue;
            }
            output += `"${arr[i]}", `;
        }
        output += ']';
        return output;
    }

    public static ParseInt(str: string): number {
        return +str;
    }

    public static ParsePositiveInt(str: string): number {
        const int: number = Number(str);
        if (int < 0) {
            return 0;
        }
        return int;
    }

    public static Round(x: number): number {
        return Math.floor(x + 0.5 - (x + 0.5) % 1);
    }

    public static RandomEnumKey(enumeration: { [x: string]: any; }) {
        const values = Object.keys(enumeration)
            .map(key => enumeration[key])
            .filter(value => typeof enumeration[value] !== "number");
        const randValue = values[Math.floor(Math.random() * values.length)];
        return randValue;
    };
}