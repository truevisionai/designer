/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { SnackBar } from '../../../services/snack-bar.service';
import { Maths } from '../../../utils/maths';
import { TvLane } from '../../tv-map/models/tv-lane';
import { TvLaneRoadMark } from '../../tv-map/models/tv-lane-road-mark';
import { ISelectable } from './i-selectable';
import { SerializedField } from 'app/core/components/serialization';
import { TvRoadMarkTypes, TvRoadMarkWeights } from 'app/modules/tv-map/models/tv-common';
import { DynamicControlPoint } from './dynamic-control-point';
import { Vector3 } from 'three';

export class LaneMarkingNode extends DynamicControlPoint<any> implements ISelectable {

	public static readonly tag = 'roadmark-node';

	@SerializedField( { type: 'int' } )
	get s (): number {
		return this.roadmark.sOffset;
	}

	set s ( value: number ) {
		this.roadmark.sOffset = value;
	}

	@SerializedField( { type: 'float' } )
	get width (): number {
		return this.roadmark.width;
	}

	set width ( value: number ) {
		this.roadmark.width = value;
	}

	@SerializedField( { type: 'float' } )
	get length (): number {
		return this.roadmark.length;
	}

	set length ( value: number ) {
		this.roadmark.length = value;
	}

	@SerializedField( { type: 'float' } )
	get space (): number {
		return this.roadmark.space;
	}

	set space ( value: number ) {
		this.roadmark.space = value;
	}

	@SerializedField( { type: 'enum', enum: TvRoadMarkTypes } )
	get markingType (): TvRoadMarkTypes {
		return this.roadmark.type;
	}

	set markingType ( value: TvRoadMarkTypes ) {
		this.roadmark.type = value;
	}

	@SerializedField( { type: 'enum', enum: TvRoadMarkWeights } )
	get weight (): TvRoadMarkWeights {
		return this.roadmark.weight;
	}

	set weight ( value: TvRoadMarkWeights ) {
		this.roadmark.weight = value;
	}

	constructor ( public lane: TvLane, public roadmark: TvLaneRoadMark, position?: Vector3 ) {

		super( roadmark, position );

		this.layers.enable( 31 );

		this.tag = LaneMarkingNode.tag;

		if ( position ) {

			this.position.copy( position );

		} else {

			const lanePosition = lane.laneSection.road.getLaneEndPosition( lane, roadmark.sOffset );

			this.position.copy( lanePosition.toVector3() );

		}

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

		// this.point.copyPosition( finalPosition );
	}

}

// export class LaneRoadMarkNodeV2 extends Group implements ISelectable {

// 	public static readonly tag = 'roadmark-point';

// 	public point: AnyControlPoint;

// 	private strategy: MovingStrategy;

// 	constructor ( public lane: TvLane, public roadmark: TvLaneRoadMark ) {

// 		super();

// 		this.strategy = new LaneEndMoveStrategy( lane, this.lane.roadMark );

// 		const s = this.lane.laneSection.s + this.roadmark.s;

// 		this.point = AnyControlPoint.create( 'point', this.strategy.getVector3( s ) );

// 		this.point.tag = LaneMarkingNode.tag;

// 		this.add( this.point );


// 	}

// 	get isSelected () {

// 		return this.point.isSelected;

// 	}

// 	select () {

// 		this.point?.select();

// 	}

// 	unselect () {

// 		this.point?.unselect();

// 	}


// 	updateByPosition ( point: Vector3 ): void {

// 		const posTheta = this.strategy.getPosTheta( point );

// 		this.point.copyPosition( posTheta.toVector3() );

// 		this.roadmark.sOffset = posTheta.s;

// 	}

// }
