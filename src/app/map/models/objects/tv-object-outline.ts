/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvCornerRoad } from "./tv-corner-road";
import { TvCornerLocal } from "./tv-corner-local";
import { ObjectFillType, TvLaneType } from "../tv-common";

export class TvObjectOutline {

	public readonly id: number;

	private _cornerRoad: TvCornerRoad[] = [];

	private _cornerLocal: TvCornerLocal[] = [];

	private _fillType: ObjectFillType = ObjectFillType.none;

	private _outer: boolean;

	private _closed: boolean;

	private _laneType: TvLaneType;

	constructor (
		id: number,
		fillType: ObjectFillType = ObjectFillType.none,
		outer: boolean = false,
		closed: boolean = false,
		laneType: TvLaneType = TvLaneType.none,
	) {
		this.id = id;
		this._fillType = fillType;
		this._outer = outer;
		this._closed = closed;
		this._laneType = laneType;
	}

	get cornerRoads (): TvCornerRoad[] {
		return this._cornerRoad;
	}

	set cornerRoads ( value: TvCornerRoad[] ) {
		this._cornerRoad = value;
	}

	get cornerLocals (): TvCornerLocal[] {
		return this._cornerLocal;
	}

	set cornerLocals ( value: TvCornerLocal[] ) {
		this._cornerLocal = value;
	}

	get fillType (): ObjectFillType {
		return this._fillType;
	}

	set fillType ( value: ObjectFillType ) {
		this._fillType = value;
	}

	get outer (): boolean {
		return this._outer;
	}

	set outer ( value: boolean ) {
		this._outer = value;
	}

	get closed (): boolean {
		return this._closed;
	}

	set closed ( value: boolean ) {
		this._closed = value;
	}

	get laneType (): TvLaneType {
		return this._laneType;
	}

	set laneType ( value: TvLaneType ) {
		this._laneType = value;
	}

	getCornerLocal ( i: number ): TvCornerLocal {
		return this.cornerLocals[ i ];
	}

	getCornerLocalCount (): number {
		return this.cornerLocals.length;
	}

	getCornerRoad ( i: number ): TvCornerRoad {
		return this.cornerRoads[ i ];
	}

	getCornerRoadCount (): number {
		return this.cornerRoads.length;
	}

	removeCornerRoad ( tvCornerRoad: TvCornerRoad ) {

		const index = this.cornerRoads.indexOf( tvCornerRoad );

		if ( index > -1 ) {
			this.cornerRoads.splice( index, 1 );
		}
	}

	clone (): TvObjectOutline {

		const clone = new TvObjectOutline( this.id, this.fillType, this.outer, this.closed, this.laneType );

		this.cornerRoads.forEach( cornerRoad => {

			clone.cornerRoads.push( cornerRoad.clone() );

		} );

		this.cornerLocals.forEach( cornerLocal => {

			clone.cornerLocals.push( cornerLocal.clone() );

		} );

		return clone;

	}

}
