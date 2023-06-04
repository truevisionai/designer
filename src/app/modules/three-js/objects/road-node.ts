/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLaneSection } from 'app/modules/tv-map/models/tv-lane-section';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { COLOR } from 'app/shared/utils/colors.service';
import { Maths } from 'app/utils/maths';
import { Color, Group, Vector2 } from 'three';

import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { BaseControlPoint} from './control-point';
import { ISelectable } from './i-selectable';

export class RoadNode extends Group implements ISelectable {

	public static readonly tag = 'road-node';
	public static readonly lineTag = 'road-node-line';

	public static defaultColor = COLOR.MAGENTA;
	public static defaultOpacity = 0.35;
	public static defaultWidth = 8;

	public line: Line2;
	public isSelected = false;

	constructor ( public road: TvRoad, public distance: 'start' | 'end', public s?: number ) {

		super();

		const sCoord = s || this.calculateS();

		const result = road.getRoadWidthAt( sCoord );

		const start = road.getPositionAt( sCoord, result.leftSideWidth );
		const end = road.getPositionAt( sCoord, -result.rightSideWidth );

		const lineGeometry = new LineGeometry();
		lineGeometry.setPositions(
			[].concat( ...[ start.toVector3(), end.toVector3() ].map( ( v ) => [ v.x, v.y, v.z ] ) )
		);

		const lineMaterial = new LineMaterial( {
			color: RoadNode.defaultColor,
			opacity: RoadNode.defaultOpacity,
			linewidth: RoadNode.defaultWidth,
			resolution: new Vector2( window.innerWidth, window.innerHeight ), // Add this line
		} );

		this.line = new Line2( lineGeometry, lineMaterial );

		this.line[ 'tag' ] = RoadNode.lineTag;

		this.line.renderOrder = 3;

		this.add( this.line );

	}

	private createLineSegment () {

		// const lineGeometry = new BufferGeometry().setFromPoints( [ start.toVector3(), end.toVector3() ] );

		// this.line = new LineSegments( lineGeometry, new LineBasicMaterial( {
		// 	color: RoadNode.defaultColor,
		// 	opacity: RoadNode.defaultOpacity,
		// 	linewidth: RoadNode.defaultWidth,
		// } ) );

		// this.line[ 'tag' ] = RoadNode.lineTag;

		// this.line.renderOrder = 3;

		// this.add( this.line );

	}

	get material () {
		return this.line.material as LineMaterial;
	}

	get roadId (): number {
		return this.road.id;
	}

	get sCoordinate (): number {
		return this.s || this.calculateS();
	}

	getRoadId (): number {
		return this.road.id;
	}

	calculateS (): number {

		return this.distance == 'start' ? 0 : this.road.length - Maths.Epsilon;

	}

	select () {

		this.isSelected = true;

		this.material.color = new Color( COLOR.RED );

		this.renderOrder = 5;
	}

	unselect () {

		this.isSelected = false;

		this.material.color = new Color( RoadNode.defaultColor );

		this.renderOrder = 3;
	}

	update () {

		const sCoord = this.calculateS();

		const result = this.road.getRoadWidthAt( sCoord );

		const start = this.road.getPositionAt( sCoord, result.leftSideWidth );
		const end = this.road.getPositionAt( sCoord, -result.rightSideWidth );

		// TODO: can be improved
		this.line.geometry.dispose();

		// for old version of three.js
		// this.line.geometry = new BufferGeometry().setFromPoints( [
		// 	start.toVector3(),
		// 	end.toVector3()
		// ] );

		this.line.geometry.setPositions(
			[].concat( ...[ start.toVector3(), end.toVector3() ].map( ( v ) => [ v.x, v.y, v.z ] ) )
		);
	}

	getPosition (): TvPosTheta {

		return this.distance == 'start' ? this.road.startPosition() : this.road.endPosition();

	}

	moveAway ( distance: number ): TvPosTheta {

		if ( this.distance === 'start' ) {

			return this.road.startPosition().clone().rotateDegree( 180 ).moveForward( distance );

		} else {

			return this.road.endPosition().clone().moveForward( distance );

		}

	}

	getLaneSection (): TvLaneSection {

		const s = this.distance === 'start' ? 0 : this.road.length - Maths.Epsilon;

		return this.road.getLaneSectionAt( s ).cloneAtS( 0, s );

	}

	getControlPoint (): BaseControlPoint {

		return this.distance === 'start' ? this.road.spline.getFirstPoint() : this.road.spline.getLastPoint();

	}
}
