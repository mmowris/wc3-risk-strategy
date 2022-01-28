import { UID } from "resources/unitID";
import { UTYPE } from "resources/unitTypes";
import { MapPlayer } from "w3ts";
import { Players } from "w3ts/globals";

const CityRegionSize: number = 185;

export class City {
    private _barrack: unit;
    private cop: unit;
    private guard: unit;
    private region: region;
    private x: number;
    private y: number;
    private defaultGuardType: number;
    private defaultBarrackType: number;

    public static fromBarrack = new Map<unit, City>();
    public static fromGuard = new Map<unit, City>();
    public static fromRegion = new Map<region, City>();

    constructor(x: number, y: number, country: string, barrackType: number, name?: string, guardType: number = UID.RIFLEMEN) {
        this.setBarrack(x, y, name);
        this.defaultBarrackType = barrackType;

        //Create region
        const offSetX: number = x - 125;
        const offSetY: number = y - 255;

        let rect = Rect(offSetX - CityRegionSize / 2, offSetY - CityRegionSize / 2, offSetX + CityRegionSize / 2, offSetY + CityRegionSize / 2);
        this.x = GetRectCenterX(rect);
        this.y = GetRectCenterY(rect);

        this.region = CreateRegion();
        RegionAddRect(this.region, rect);
        RemoveRect(rect);
        City.fromRegion.set(this.region, this);

        //Create cop
        this.cop = CreateUnit(Players[24].handle, UID.CONTROL_POINT, offSetX, offSetY, 270);

        this.setGuard(guardType);
        this.defaultGuardType = guardType;
    }

    public onCast() {

    }

    public onGuardChange() {

    }

    public setOwner(newOwner: MapPlayer) {

    }

    public reset() {
        const x: number = GetUnitX(this.barrack);
        const y: number = GetUnitY(this.barrack);
        const name: string = GetUnitName(this.barrack);

        City.fromBarrack.delete(this.barrack);
        RemoveUnit(this.barrack)
        this._barrack = null;
        this.setBarrack(x, y, name);
        this.removeGuard(true);
        this.setGuard(this.defaultGuardType);

    }

    onOwnerChange() {

    }

    private setBarrack(x: number, y: number, name?: string) {
        this._barrack = CreateUnit(Players[24].handle, this.defaultBarrackType, x, y, 270);
        City.fromBarrack.set(this.barrack, this);

        if (name && name != GetUnitName(this.barrack)) BlzSetUnitName(this.barrack, name);
    }

    private setGuard(guard: unit | number) {
        //TODO add null checking
        typeof guard === "number" ? CreateUnit(Players[24].handle, guard, this.x, this.y, 270) : this.guard = guard;
        UnitAddType(this.guard, UTYPE.GUARD);
        City.fromGuard.set(this.guard, this);
    }

    private removeGuard(destroy: boolean) {
        City.fromGuard.delete(this.guard);

        if (!destroy) {
            UnitRemoveType(this.guard, UTYPE.GUARD);
        } else {
            RemoveUnit(this.guard);
        }

        this.guard = null;
    }

    public get barrack(): unit {
        return this._barrack;
    }
}