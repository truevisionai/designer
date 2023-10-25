/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { Group, LineSegments, Vector3 } from 'three';
import { LaneEndMoveStrategy } from '../../../core/snapping/move-strategies/lane-end-move.strategy';
import { SnackBar } from '../../../services/snack-bar.service';
import { Maths } from '../../../utils/maths';
import { TvLane } from '../../tv-map/models/tv-lane';
import { TvLaneRoadMark } from '../../tv-map/models/tv-lane-road-mark';
import { AnyControlPoint } from './control-point';
import { ISelectable } from './i-selectable';
import { MovingStrategy } from 'app/core/snapping/move-strategies/move-strategy';

export class LaneRoadMarkNode extends Group implements ISelectable {

	public static readonly tag = 'roadmark-node';
	public static readonly pointTag = 'roadmark-point';
	public static readonly lineTag = 'roadmark-line';

	public line: LineSegments;
	public point: AnyControlPoint;

	constructor ( public lane: TvLane, public roadmark: TvLaneRoadMark ) {

		super();

		this.createPoint();

		this.layers.enable( 31 );
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

		if ( index === 0 ) SnackBar.warn( 'First node cannot be edited. Please add a new node.' );
		if ( index === 0 ) return;

		const minS = this.lane.roadMark[ index - 1 ].s + 0.1;

		// TODO: mke this the max s value as per lane section
		let maxS = Number.MAX_SAFE_INTEGER;

		if ( index + 1 < this.lane.roadMark.length ) {

			maxS = this.lane.roadMark[ index + 1 ].s - 0.1;

		}

		const road = this.lane.laneSection.road;
		const roadCoord = road.getCoordAt( point );
		const s = roadCoord.s - this.lane.laneSection.s;

		// our desired s value should lie between the previous node and the next node
		const adjustedS = Maths.clamp( s, minS, maxS );

		// update s offset as per the new position on road
		this.roadmark.sOffset = adjustedS;

		const offset = this.lane.getWidthValue( adjustedS ) * 0.5;

		const finalPosition = TvMapQueries.getLaneCenterPosition( this.lane.roadId, this.lane.id, roadCoord.s, offset );

		this.point.copyPosition( finalPosition );
	}

	private createPoint () {

		const s = this.lane.laneSection.s + this.roadmark.s;

		const offset = this.lane.getWidthValue( s ) * 0.5;

		const position = TvMapQueries.getLaneCenterPosition( this.lane.roadId, this.lane.id, s, offset );

		this.point = AnyControlPoint.create( 'point', position );

		this.point.tag = LaneRoadMarkNode.pointTag;

		this.add( this.point );

	}

}

export class LaneRoadMarkNodeV2 extends Group implements ISelectable {

	public static readonly tag = 'roadmark-point';

	public point: AnyControlPoint;

	private strategy: MovingStrategy;

	constructor ( public lane: TvLane, public roadmark: TvLaneRoadMark ) {

		super();

		this.strategy = new LaneEndMoveStrategy( lane, this.lane.roadMark );

		const s = this.lane.laneSection.s + this.roadmark.s;

		this.point = AnyControlPoint.create( 'point', this.strategy.getVector3( s ) );

		this.point.tag = LaneRoadMarkNode.tag;

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

		const posTheta = this.strategy.getPosTheta( point );

		this.point.copyPosition( posTheta.toVector3() );

		this.roadmark.sOffset = posTheta.s;

	}

}
