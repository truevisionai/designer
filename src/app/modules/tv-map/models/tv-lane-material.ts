/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class TvLaneMaterial {

    constructor ( sOffset: number, surface: string, friction: number, roughness: number ) {
        this._sOffset = sOffset;
        this._surface = surface;
        this._friction = friction;
        this._roughness = roughness;
    }

    private _sOffset: number;

    get sOffset () {
        return this._sOffset;
    }

    set sOffset ( value ) {
        this._sOffset = value;
    }

    private _surface: string;

    get surface () {
        return this._surface;
    }

    set surface ( value ) {
        this._surface = value;
    }

    private _friction: number;

    get friction () {
        return this._friction;
    }

    set friction ( value ) {
        this._friction = value;
    }

    private _roughness: number;

    get roughness () {
        return this._roughness;
    }

    set roughness ( value ) {
        this._roughness = value;
    }

    get s () {
        return this.sOffset;
    }

}
