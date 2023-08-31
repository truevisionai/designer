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

export class RoadPosition extends Position {

	public readonly label: string = 'Road Position';
	public readonly type = PositionType.Road;
	public readonly isDependent: boolean = false;

	constructor (
		public roadId = 0,
		public sValue = 0,
		public tValue = 0,
		orientation: Orientation = null
	) {

		super( null, orientation );

		this.orientation = orientation;

	}

	@SerializedField( { type: 'road' } )
	get road (): number {
		return this.roadId;
	}

	set road ( value: number ) {
		this.roadId = value;
		this.updated.emit();
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
		return this.getRoad()?.getPositionAt( this.sValue, this.tValue ).toVector3();
	}

	getRoad () {
		return TvMapQueries.findRoadById( this.roadId );
	}

	updateFromWorldPosition ( position: Vector3, orientation: Orientation ): void {

		const posTheta = new TvPosTheta();

		const road = TvMapQueries.getRoadByCoords( position.x, position.y, posTheta );

		this.roadId = road.id;

		this.sValue = posTheta.s;

		this.tValue = posTheta.t;

		this.setPosition( position );

		this.updated.emit();
	}

}
