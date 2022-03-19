/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class TvLaneMaterial {

    private _sOffset: number;
    private _surface: string;
    private _friction: number;
    private _roughness: number;

    constructor ( sOffset: number, surface: string, friction: number, roughness: number ) {
        this._sOffset = sOffset;
        this._surface = surface;
        this._friction = friction;
        this._roughness = roughness;
    }

    get s () {
        return this.sOffset;
    }

    get sOffset () {
        return this._sOffset;
    }

    set sOffset ( value ) {
        this._sOffset = value;
    }

    get surface () {
        return this._surface;
    }

    set surface ( value ) {
        this._surface = value;
    }

    get friction () {
        return this._friction;
    }

    set friction ( value ) {
        this._friction = value;
    }

    get roughness () {
        return this._roughness;
    }

    set roughness ( value ) {
        this._roughness = value;
    }

}
