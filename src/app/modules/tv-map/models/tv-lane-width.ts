/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Object3D } from 'three';
import { ThirdOrderPolynom } from './third-order-polynom';

export class TvLaneWidth extends ThirdOrderPolynom {

	public mesh?: Object3D;

	constructor ( s: number, a: number, b: number, c: number, d: number, laneId?: number, roadId?: number ) {

		super( s, a, b, c, d );

		this._laneId = laneId;
		this._roadId = roadId;

	}

	private _laneId: number;

	get laneId () {
		return this._laneId;
	}

	set laneId ( value ) {
		this._laneId = value;
	}

	private _roadId: number;

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
