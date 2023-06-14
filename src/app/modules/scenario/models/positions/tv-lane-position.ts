/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { TvMapQueries } from '../../../tv-map/queries/tv-map-queries';
import { AbstractPosition } from '../abstract-position';
import { PositionType } from '../tv-enums';
import { Orientation } from '../tv-orientation';

export class LanePosition extends AbstractPosition {

	public readonly type = PositionType.Lane;
	public roadId: number;
	public laneId: number;
	public offset: number;
	public sCoordinate: number;
	public orientation: Orientation;

	constructor ( roadId = 0, laneId = 0, offset = 0, s = 0, orientation: Orientation = null ) {

		super();

		this.roadId = roadId;
		this.laneId = laneId;
		this.offset = offset;
		this.sCoordinate = s;
		this.orientation = orientation;

	}

	toVector3 (): Vector3 {

		if ( this.roadId != 0 && this.roadId != null && this.laneId != null && this.sCoordinate != null ) {

			return TvMapQueries.getLanePosition( this.roadId, this.laneId, this.sCoordinate, this.offset );

		} else {

			console.error( 'invalid parameters' );

			return new Vector3();
		}

	}
}
