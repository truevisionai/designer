/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { OdTextures } from 'app/modules/tv-map/builders/od.textures';
import { TvLaneRoadMark } from 'app/modules/tv-map/models/tv-lane-road-mark';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvRoadLaneOffset } from 'app/modules/tv-map/models/tv-road-lane-offset';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { SnackBar } from 'app/services/snack-bar.service';
import { COLOR } from 'app/shared/utils/colors.service';
import { Maths } from 'app/utils/maths';
import { BufferAttribute, BufferGeometry, Color, Group, LineSegments, Material, Points, PointsMaterial, Vector3 } from 'three';
import { TvLane } from '../../tv-map/models/tv-lane';

export abstract class BaseControlPoint extends Points {

	public mainObject: any;

	public tag: string;
	public tagindex: number;

	public updated = new EventEmitter<BaseControlPoint>();
	public isSelected: boolean;
	protected DEFAULT_CONTROL_POINT_COLOR = COLOR.BLUE;
	protected HOVERED_CONTROL_POINT_COLOR = COLOR.YELLOW;
	protected SELECTED_CONTROL_POINT_COLOR = COLOR.RED;

	constructor ( geometry?: BufferGeometry, material?: Material | Material[] ) {

		super( geometry, material );

	}

	setPosition ( position: Vector3 ) {

		this.position.copy( position );

		this.updated.emit( this );
	}

	copyPosition ( position: Vector3 ) {

		this.setPosition( position.clone() );

	}

	show (): void {

		this.visible = true;

	}

	hide (): void {

		this.visible = false;

	}

	onMouseOver () {

		( this.material as PointsMaterial ).color = new Color( this.HOVERED_CONTROL_POINT_COLOR );
		( this.material as PointsMaterial ).needsUpdate = true;

	}

	onMouseOut () {

		( this.material as PointsMaterial ).color = new Color( this.DEFAULT_CONTROL_POINT_COLOR );
		( this.material as PointsMaterial ).needsUpdate = true;

	}

	select () {

		this.isSelected = true;

		( this.material as PointsMaterial ).color = new Color( this.SELECTED_CONTROL_POINT_COLOR );
		( this.material as PointsMaterial ).needsUpdate = true;

	}

	unselect () {

		this.isSelected = false;

		( this.material as PointsMaterial ).color = new Color( this.DEFAULT_CONTROL_POINT_COLOR );
		( this.material as PointsMaterial ).needsUpdate = true;

	}

}

export class DistanceNode extends BaseControlPoint {

	constructor ( public s: number, geometry?: BufferGeometry, material?: Material ) {
		super( geometry, material );
	}

}

export class NewDistanceNode extends BaseControlPoint {

	constructor ( public roadId, public laneId, public s: number, public t: number, geometry?: BufferGeometry, material?: Material ) {
		super( geometry, material );
	}

}

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


/**
 * @deprecated avoid using this use BaseControlPoint or use an exact implementation
 */
export class AnyControlPoint extends BaseControlPoint {

	static roadTag = 'road';

	static create ( name = '', position?: Vector3 ) {

		const dotGeometry = new BufferGeometry();

		dotGeometry.setAttribute( 'position', new BufferAttribute( new Float32Array( 3 ), 3 ) );

		const texture = OdTextures.point;

		const dotMaterial = new PointsMaterial( {
			size: 10,
			sizeAttenuation: false,
			map: texture,
			alphaTest: 0.5,
			transparent: true,
			color: COLOR.BLUE,
			depthTest: false
		} );

		const cp = new AnyControlPoint( dotGeometry, dotMaterial );

		if ( position ) cp.copyPosition( position );

		cp.userData.is_button = true;
		cp.userData.is_control_point = true;
		cp.userData.is_selectable = true;

		cp.tag = this.roadTag;

		cp.renderOrder = 3;

		return cp;
	}

}

