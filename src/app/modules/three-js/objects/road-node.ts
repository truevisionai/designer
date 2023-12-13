/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvContactPoint } from 'app/modules/tv-map/models/tv-common';
import { TvLaneSection } from 'app/modules/tv-map/models/tv-lane-section';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { Maths } from 'app/utils/maths';
import { Color, Group, Vector2 } from 'three';

import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { ISelectable } from './i-selectable';
import { AbstractControlPoint } from "./abstract-control-point";

export class RoadNode extends Group implements ISelectable {

	public static readonly tag = 'road-node';
	public static readonly lineTag = 'road-node-line';

	public static defaultColor = COLOR.MAGENTA;
	public static defaultWidth = 8;

	public line: Line2;
	public isSelected = false;

	constructor ( public road: TvRoad, public contact: TvContactPoint ) {

		super();

		this.createLineSegment( road, contact );

		this.layers.enable( 31 );

	}

	get material () {
		return this.line.material as LineMaterial;
	}

	set material ( value: LineMaterial ) {
		this.line.material = value;
	}

	get roadId (): number {
		return this.road.id;
	}

	get sCoordinate (): number {
		return this.contact == TvContactPoint.START ? 0 : this.road.length - Maths.Epsilon;
	}

	getRoadId (): number {
		return this.road.id;
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

	onMouseOver () {

		this.material.color = new Color( COLOR.YELLOW );
		this.material.needsUpdate = true;

	}

	onMouseOut () {

		this.material.color = new Color( RoadNode.defaultColor );
		this.material.needsUpdate = true;

	}

	update () {

		const sCoord = this.sCoordinate;

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

	get isConnected () {

		if ( this.contact == TvContactPoint.START ) {

			return this.road.hasPredecessor();

		}

		return this.road.hasSuccessor();

	}

	getPosition (): TvPosTheta {

		return this.contact == TvContactPoint.START ? this.road.getStartCoord() : this.road.getEndCoord();

	}

	moveAway ( distance: number ): TvPosTheta {

		if ( this.contact === TvContactPoint.START ) {

			return this.getPosition().clone().rotateDegree( 180 ).moveForward( distance );

		} else {

			return this.getPosition().clone().moveForward( distance );

		}

	}

	getLaneSection (): TvLaneSection {

		return this.contact === TvContactPoint.START ?
			this.road.getFirstLaneSection() :
			this.road.getLastLaneSection();

	}

	getControlPoint (): AbstractControlPoint {

		return this.contact === TvContactPoint.START ?
			this.road.spline.getFirstPoint() :
			this.road.spline.getLastPoint();

	}

	private createLineSegment ( road: TvRoad, contact: TvContactPoint ) {

		const sCoord = this.sCoordinate;

		const result = road.getRoadWidthAt( sCoord );

		const start = road.getPositionAt( sCoord, result.leftSideWidth );
		const end = road.getPositionAt( sCoord, -result.rightSideWidth );

		const lineGeometry = new LineGeometry();
		lineGeometry.setPositions( [
			start.x, start.y, start.z,
			end.x, end.y, end.z
		] );

		const lineMaterial = new LineMaterial( {
			color: RoadNode.defaultColor,
			linewidth: RoadNode.defaultWidth,
			resolution: new Vector2( window.innerWidth, window.innerHeight ), // Add this line
			depthTest: false,
			depthWrite: false,
		} );

		this.line = new Line2( lineGeometry, lineMaterial );

		this.line.name = RoadNode.lineTag;

		this.line[ 'tag' ] = RoadNode.lineTag;

		this.line.renderOrder = 3;

		this.add( this.line );

		this[ 'tag' ] = RoadNode.tag;
	}
}
