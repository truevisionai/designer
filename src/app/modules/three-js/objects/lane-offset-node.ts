/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */
import { Group, LineSegments, Vector3 } from 'three';
import { Maths } from '../../../utils/maths';
import { TvRoadLaneOffset } from '../../tv-map/models/tv-road-lane-offset';
import { TvRoad } from '../../tv-map/models/tv-road.model';
import { AnyControlPoint } from './control-point';

export class LaneOffsetNode extends Group {

	public static readonly tag = 'offset-node';
	public static readonly pointTag = 'offset-point';
	public static readonly lineTag = 'offset-line';

	public line: LineSegments;
	public point: AnyControlPoint;

	constructor ( public road: TvRoad, public laneOffset: TvRoadLaneOffset ) {

		super();

		if ( !road ) return;

		let position: Vector3;

		if ( Maths.approxEquals( laneOffset.s, 0 ) || Maths.approxEquals( laneOffset.road.length, 0 ) ) {

			this.point = AnyControlPoint.create( 'point', new Vector3( 0, 0, 0 ) );

			this.point.tag = LaneOffsetNode.pointTag;

			this.add( this.point );

		} else {

			position = laneOffset.road.getPositionAt( laneOffset.s, 0 ).toVector3();

			this.point = AnyControlPoint.create( 'point', position );

			this.point.tag = LaneOffsetNode.pointTag;

			this.add( this.point );

		}


	}

	get roadId () {
		return this.road.id;
	}

	select () {
		this.point?.select();
	}

	unselect () {
		this.point?.unselect();
	}

	updateScoordinate ( sCoord: number ) {

		// const offset = this.laneOffset.getValue( newS );

		this.laneOffset.s = sCoord;

		this.updatePosition();

	}

	updatePosition () {

		if ( !this.road ) return;

		const position = this.road.getPositionAt( this.laneOffset.s, 0 );

		this.point.copyPosition( position.toVector3() );
	}


}
