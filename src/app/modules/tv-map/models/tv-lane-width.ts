/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ThirdOrderPolynom } from './third-order-polynom';
import { Math, Object3D } from 'three';

export class TvLaneWidth extends ThirdOrderPolynom {

    public mesh?: Object3D;

    private _laneId: number;
    private _roadId: number;

    constructor ( s: number, a: number, b: number, c: number, d: number, laneId?: number, roadId?: number ) {

        super( s, a, b, c, d );

        this._laneId = laneId;
        this._roadId = roadId;

    }

    get laneId () {
        return this._laneId;
    }

    set laneId ( value ) {
        this._laneId = value;
    }

    get roadId () {
        return this._roadId;
    }

    set roadId ( value ) {
        this._roadId = value;
    }

    clone ( s?: number ) {

        return new TvLaneWidth( s || this.s, this.a, this.b, this.c, this.d, this._laneId, this._roadId );

    }
}
