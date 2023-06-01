/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */
import { Group, LineSegments, Vector3 } from 'three';
import { SnackBar } from '../../../services/snack-bar.service';
import { Maths } from '../../../utils/maths';
import { TvLane } from '../../tv-map/models/tv-lane';
import { TvLaneRoadMark } from '../../tv-map/models/tv-lane-road-mark';
import { TvPosTheta } from '../../tv-map/models/tv-pos-theta';
import { TvMapQueries } from '../../tv-map/queries/tv-map-queries';
import { AnyControlPoint } from './control-point';

export class LaneRoadMarkNode extends Group {

	public static readonly tag = 'roadmark-node';
	public static readonly pointTag = 'roadmark-point';
	public static readonly lineTag = 'roadmark-line';

	public line: LineSegments;
	public point: AnyControlPoint;

	constructor ( public lane: TvLane, public roadmark: TvLaneRoadMark ) {

		super();

		this.createPoint();

	}

	private createPoint () {

		const offset = this.lane.getWidthValue( this.roadmark.s ) * 0.5;

		const position = TvMapQueries.getLanePosition( this.lane.roadId, this.lane.id, this.roadmark.s, offset );

		this.point = AnyControlPoint.create( 'point', position );

		this.point.tag = LaneRoadMarkNode.pointTag;

		this.add( this.point );

	}

	get isSelected () {

		return this.point.isSelected;

	}

	select () {

		this.point?.select();

	}

	unselect () {

		this.point?.unselect();

	}


	updateByPosition ( point: Vector3 ): void {

		const index = this.lane.getRoadMarks().findIndex( roadmark => roadmark.uuid === this.roadmark.uuid );

		if ( index === -1 ) SnackBar.error( 'Unexpected error. Not able to find this node' );
		if ( index === -1 ) return;

		if ( index === 0 ) SnackBar.error( 'First node cannot be edited. Please add a new node.' );
		if ( index === 0 ) return;

		const minS = this.lane.roadMark[ index - 1 ].s + 0.1;

		// TODO: mke this the max s value as per lane section
		let maxS = Number.MAX_SAFE_INTEGER;

		if ( index + 1 < this.lane.roadMark.length ) {

			maxS = this.lane.roadMark[ index + 1 ].s - 0.1;

		}

		const newPosition = new TvPosTheta();

		const road = TvMapQueries.getRoadByCoords( point.x, point.y, newPosition );

		// we are getting another road s value to ignore
		if ( this.lane.roadId !== road.id ) return;

		// our desired s value should lie between the previous node and the next node
		const adjustedS = Maths.clamp( newPosition.s, minS, maxS );

		// update s offset as per the new position on road
		this.roadmark.sOffset = adjustedS;

		const offset = this.lane.getWidthValue( adjustedS ) * 0.5;

		const finalPosition = TvMapQueries.getLanePosition( this.lane.roadId, this.lane.id, adjustedS, offset );

		this.point.copyPosition( finalPosition );
	}

}
