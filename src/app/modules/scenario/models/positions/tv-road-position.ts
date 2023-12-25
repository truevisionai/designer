/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SerializedField } from 'app/core/components/serialization';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { Vector3 } from 'three';
import { TvMapQueries } from '../../../tv-map/queries/tv-map-queries';
import { Position } from '../position';
import { PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';

export class RoadPosition extends Position {

	public readonly label: string = 'Road Position';
	public readonly type = PositionType.Road;
	public readonly isDependent: boolean = false;

	private _road: TvRoad;
	private _roadId: number;

	constructor (
		road: number | TvRoad,
		public sValue: number,
		public tValue: number,
		orientation: Orientation = null
	) {
		super( null, orientation );

		if ( typeof road === 'number' ) {
			this._roadId = road;
		} else if ( road instanceof TvRoad ) {
			this._road = road;
		}

		this.orientation = orientation;
	}

	@SerializedField( { type: 'road' } )
	get roadId (): number {
		return this._roadId;
	}

	set roadId ( value: number ) {
		this._roadId = value;
		this.updated.emit();
	}

	get road (): TvRoad {
		return this._road;
	}

	set road ( value: TvRoad ) {
		this._road = value;
		this._roadId = value.id;
	}

	@SerializedField( { type: 'float' } )
	get s (): number {
		return this.sValue;
	}

	set s ( value: number ) {
		this.sValue = value;
		this.updated.emit();
	}

	@SerializedField( { type: 'float' } )
	get t (): number {
		return this.tValue;
	}

	set t ( value: number ) {
		this.tValue = value;
		this.updated.emit();
	}

	exportXml () {
		throw new Error( 'Method not implemented.' );
	}

	getVectorPosition (): Vector3 {
		return this.getRoad()?.getPosThetaAt( this.sValue, this.tValue ).toVector3();
	}

	getRoad () {
		if ( this._road ) {
			return this._road;
		}
		return this._road = TvMapQueries.findRoadById( this._roadId );
	}

	updateFromWorldPosition ( position: Vector3, orientation: Orientation ): void {

		const posTheta = new TvPosTheta();

		const road = TvMapQueries.getRoadByCoords( position.x, position.y, posTheta );

		this._roadId = road.id;

		this.sValue = posTheta.s;

		this.tValue = posTheta.t;

		this.setPosition( position );

		this.updated.emit();
	}

}
