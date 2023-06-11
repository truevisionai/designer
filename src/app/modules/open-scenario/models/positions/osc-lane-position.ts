/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { TvMapQueries } from '../../../tv-map/queries/tv-map-queries';
import { OscPositionType } from '../osc-enums';
import { AbstractPosition } from '../osc-interfaces';
import { OscOrientation } from '../osc-orientation';

export class OscLanePosition extends AbstractPosition {

	public readonly type = OscPositionType.Lane;
	public roadId: number;
	public laneId: number;
	public offset: number;
	public sCoordinate: number;
	public orientation: OscOrientation;

	constructor ( roadId = 0, laneId = 0, offset = 0, s = 0, orientation: OscOrientation = null ) {

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
