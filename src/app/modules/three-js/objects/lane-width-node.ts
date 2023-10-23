/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BufferGeometry, Group, LineBasicMaterial, LineSegments } from 'three';
import { COLOR } from '../../../shared/utils/colors.service';
import { TvLaneWidth } from '../../tv-map/models/tv-lane-width';
import { TvMapQueries } from '../../tv-map/queries/tv-map-queries';
import { AnyControlPoint } from './control-point';
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

		this.layers.enable( 31 );
	}

	get road () {
		return this.laneWidth.lane.laneSection.road;
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

	select () {
		this.isSelected = true;
		this.point?.select();
	}

	unselect () {
		this.isSelected = false;
		this.point?.unselect();
	}

	private createMesh () {

		const road = this.road;
		const lane = this.lane;

		const s = this.lane.laneSection.s + this.laneWidth.s;

		const offset = this.laneWidth.getValue( this.laneWidth.s ) * 0.5;
		const start = TvMapQueries.getLaneCenterPosition( road.id, lane.id, s, -offset );
		const end = TvMapQueries.getLaneCenterPosition( road.id, lane.id, s, offset );

		this.point = AnyControlPoint.create( 'point', end );
		this.point.tag = LaneWidthNode.pointTag;
		this.add( this.point );

		const lineGeometry = new BufferGeometry().setFromPoints( [ start, end ] );
		this.line = new LineSegments( lineGeometry, new LineBasicMaterial( { color: COLOR.CYAN, opacity: 0.35 } ) );
		this.line.name = 'lane-width-node';
		this.line[ 'tag' ] = LaneWidthNode.lineTag;
		this.line.renderOrder = 3;
		this.add( this.line );
	}
}
