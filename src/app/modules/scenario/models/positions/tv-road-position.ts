/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Euler, Vector3 } from 'three';
import { TvMapQueries } from '../../../tv-map/queries/tv-map-queries';
import { Position } from '../position';
import { PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';

export class RoadPosition extends Position {

	public readonly label: string = 'Road Position';
	public readonly type = PositionType.Road;

	constructor (
		public roadId = 0,
		public sValue = 0,
		public tValue = 0,
		public orientation: Orientation = null
	) {

		super();

		this.orientation = orientation || new Orientation();

	}

	exportXml () {
		throw new Error( 'Method not implemented.' );
	}

	toVector3 (): Vector3 {
		return TvMapQueries.getRoadPosition( this.roadId, this.sValue, this.tValue ).toVector3();
	}

	toOrientation (): Orientation {
		return this.orientation;
	}

	toEuler (): Euler {
		return this.orientation.toEuler();
	}

	getRoad () {
		return TvMapQueries.findRoadById( this.roadId );
	}

}
