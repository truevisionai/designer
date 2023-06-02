/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BufferGeometry, Group, LineBasicMaterial, LineSegments } from 'three';
import { COLOR } from '../../../shared/utils/colors.service';
import { TvLaneWidth } from '../../tv-map/models/tv-lane-width';
import { TvMapQueries } from '../../tv-map/queries/tv-map-queries';
import { AnyControlPoint} from './control-point';
import { ISelectable } from './i-selectable';

export class LaneWidthNode extends Group implements ISelectable {

	public static readonly tag = 'width-node';
	public static readonly pointTag = 'width-point';
	public static readonly lineTag = 'width-line';

	public line: LineSegments;
	public point: AnyControlPoint;
	public isSelected: boolean = false;

	constructor ( public laneWidth: TvLaneWidth ) {

		super();

		this.createMesh();
	}

	get road () {
		return this.laneWidth.road;
	}

	get lane () {
		return this.laneWidth.lane;
	}

	get roadId () {
		return this.road.id;
	}

	get laneId () {
		return this.lane.id;
	}

	updateLaneWidthValues () {

		this.road.getLaneSectionAt( this.laneWidth.s ).updateLaneWidthValues( this.lane );

	}

	private createMesh () {

		const road = this.road;
		const lane = this.lane;

		const offset = this.laneWidth.getValue( this.laneWidth.s ) * 0.5;
		const start = TvMapQueries.getLanePosition( road.id, lane.id, this.laneWidth.s, -offset );
		const end = TvMapQueries.getLanePosition( road.id, lane.id, this.laneWidth.s, offset );

		this.point = AnyControlPoint.create( 'point', end );
		this.point.tag = LaneWidthNode.pointTag;
		this.add( this.point );

		const lineGeometry = new BufferGeometry().setFromPoints( [ start, end ] );
		this.line = new LineSegments( lineGeometry, new LineBasicMaterial( { color: COLOR.DARKBLUE, opacity: 0.35 } ) );
		this.line[ 'tag' ] = LaneWidthNode.lineTag;
		this.line.renderOrder = 3;
		this.add( this.line );
	}

	select () {
		this.isSelected = true;
		this.point?.select();
	}

	unselect () {
		this.isSelected = false;
		this.point?.unselect();
	}
}
