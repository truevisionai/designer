/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { RoadNode } from 'app/objects/road-node';
import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { TvRoad } from 'app/map/models/tv-road.model';
import { COLOR } from 'app/views/shared/utils/colors.service';
import {
	Box2,
	Box3,
	Box3Helper,
	BoxGeometry,
	Color,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	PlaneGeometry,
	PointsMaterial,
	SphereGeometry,
	Vector2,
	Vector3
} from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry';
import { SharpArrowObject, SimpleArrowObject } from 'app/objects/lane-arrow-object';
import { DebugLine } from '../../objects/debug-line';
import { TravelDirection, TvLaneSide } from 'app/map/models/tv-common';
import { TvPosTheta } from 'app/map/models/tv-pos-theta';
import { TvLaneHeight } from 'app/map/lane-height/lane-height.model';
import { Maths } from 'app/utils/maths';
import { HasDistanceValue } from 'app/core/interfaces/has-distance-value';
import { LanePointNode, LaneSpanNode } from "../../objects/lane-node";
import { SceneService } from '../scene.service';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { OdTextures } from 'app/deprecated/od.textures';
import { TextObjectService } from '../text-object.service';
import { MapQueryService } from 'app/map/queries/map-query.service';

@Injectable( {
	providedIn: 'root'
} )
export class DebugDrawService {

	private group = SceneService.getToolLayer();

	private static _instance: DebugDrawService;

	static get instance (): DebugDrawService {
		return this._instance;
	}

	constructor ( private queryService: MapQueryService, private textService: TextObjectService ) {

		DebugDrawService._instance = this;

	}

	drawText ( text: string, position: Vector3, size = 1, color = COLOR.WHITE ) {

		const textObject = this.textService.createFromText( text, size, color );

		textObject.position.copy( position );

		this.group.add( textObject );

	}

	drawBox ( boundingBox: Box3 ) {

		const box = new Box3Helper( boundingBox );

		this.group.add( box );

	}

	drawBox2D ( box: Box2, color = COLOR.WHITE, opacity = 1 ) {

		const mesh = this.createBox2D( box, color, opacity );

		this.group.add( mesh );

	}

	createBox2D ( box: Box2, color = COLOR.WHITE, opacity = 1 ) {

		const geometry = new PlaneGeometry( box.getSize( new Vector2() ).x, box.getSize( new Vector2() ).y );

		const material = new MeshBasicMaterial( { color: color, side: 2, transparent: true, opacity: opacity } );

		const mesh = new Mesh( geometry, material );

		mesh.position.set( box.getCenter( new Vector2() ).x, box.getCenter( new Vector2() ).y, 0 );

		return mesh;

	}

	drawPoint ( position: Vector3, size = 10, color = COLOR.RED ) {

		const point = this.createPoint( position, size, color );

		this.group.add( point );

	}

	drawSphere ( position: Vector3, size = 0.1, color = COLOR.RED ) {

		const sphere = this.createSphere( position, size, color );

		sphere.position.copy( position );

		this.group.add( sphere );

	}

	drawLine ( positions: Vector3[], color = 0xffffff, lineWidth = 2 ) {

		if ( positions.length < 2 ) return;

		const line = this.createLine( positions, color, lineWidth );

		this.group.add( line );

	}

	createSphere ( position: Vector3, size = 0.1, color = COLOR.RED ) {

		const geometry = new SphereGeometry( size, 32, 32 );

		const material = new MeshBasicMaterial( { color: color } );

		const sphere = new Mesh( geometry, material );

		sphere.position.copy( position );

		return sphere;

	}

	createPoint ( position: Vector3, size = 10, color = COLOR.RED ) {

		const point = new SimpleControlPoint( null, position );

		( point.material as PointsMaterial ).color = new Color( color );
		( point.material as PointsMaterial ).size = size;
		( point.material as PointsMaterial ).needsUpdate = true;


		return point;
	}

	clear () {

		this.group.clear();

	}

	createRoadWidthLine ( roadCoord: TvRoadCoord ): Line2 {

		return this.createRoadWidthLinev2( roadCoord.road, roadCoord.s );

	}

	createRoadWidthLinev2<T> ( road: TvRoad, s: number, target?: T, width = 2 ): DebugLine<T> {

		const result = road.getRoadWidthAt( s );

		const start = road.getPosThetaAt( s, result.leftSideWidth );

		const end = road.getPosThetaAt( s, -result.rightSideWidth );

		return this.createDebugLine( target, [ start.position, end.position ], width );

	}

	updateRoadWidthLine ( line: Line2, roadCoord: TvRoadCoord ): Line2 {

		const result = roadCoord.road.getRoadWidthAt( roadCoord.s );

		const start = roadCoord.road.getPosThetaAt( roadCoord.s, result.leftSideWidth );

		const end = roadCoord.road.getPosThetaAt( roadCoord.s, -result.rightSideWidth );

		const lineGeometry = new LineGeometry();

		lineGeometry.setPositions( [
			start.x, start.y, start.z,
			end.x, end.y, end.z
		] );

		line.geometry.dispose();

		line.geometry = lineGeometry;

		return line;
	}

	updateRoadWidthLinev2 ( line: Line2, road: TvRoad, s: number ): Line2 {

		const result = road.getRoadWidthAt( s );

		const start = road.getPosThetaAt( s, result.leftSideWidth );

		const end = road.getPosThetaAt( s, -result.rightSideWidth );

		const lineGeometry = new LineGeometry();

		lineGeometry.setPositions( [
			start.x, start.y, start.z,
			end.x, end.y, end.z
		] );

		line.geometry.dispose();

		line.geometry = lineGeometry;

		return line;
	}

	createLaneHeightNode ( road: TvRoad, lane: TvLane, height: TvLaneHeight ): Line2 {

		const lineGeometry = this.createLaneWidthLineGeometry( height.sOffset, road, lane );

		const material = new LineMaterial( {
			color: COLOR.CYAN,
			linewidth: 4,
			resolution: new Vector2( window.innerWidth, window.innerHeight ),
			depthTest: false,
			depthWrite: false,
			transparent: true,
		} );

		return new DebugLine( height, lineGeometry, material );
	}

	createLaneNode<T extends HasDistanceValue> ( road: TvRoad, lane: TvLane, target: T, side: 'start' | 'center' | 'end' = 'center' ) {

		const s = lane.laneSection.s + target.s;

		let posTheta: TvPosTheta;

		if ( side === 'center' ) {

			posTheta = road.getLaneCenterPosition( lane, s );

		} else if ( side == 'start' ) {

			posTheta = road.getLaneStartPosition( lane, s );

		} else if ( side == 'end' ) {

			posTheta = road.getLaneEndPosition( lane, s );

		}

		return new LanePointNode( road, lane, target, posTheta.position );

	}

	createLaneWidthLine ( target: HasDistanceValue, laneCoord: TvLaneCoord, color = COLOR.CYAN, width = 4 ): LaneSpanNode<HasDistanceValue> {

		const lineGeometry = this.createLaneWidthLineGeometry( laneCoord.s, laneCoord.road, laneCoord.lane );

		const material = new LineMaterial( {
			color: color,
			linewidth: width,
			resolution: new Vector2( window.innerWidth, window.innerHeight ),
			depthTest: false,
			depthWrite: false,
			transparent: true,
		} );

		return new LaneSpanNode( laneCoord.road, laneCoord.lane, target, lineGeometry, material );
	}

	updateLaneWidthLine ( line: Line2, laneCoord: TvLaneCoord ): Line2 {

		const lineGeometry = this.createLaneWidthLineGeometry( laneCoord.s, laneCoord.road, laneCoord.lane );

		line.geometry.dispose();

		line.geometry = lineGeometry;

		return line;

	}

	createLaneWidthLineGeometry ( laneS: number, road: TvRoad, lane: TvLane ) {

		const s = lane.laneSection.s + laneS;

		const laneWidth = lane.getWidthValue( s );

		const innerHeight = lane.getHeightValue( s )?.inner;

		const outerHeight = lane.getHeightValue( s )?.outer;

		const offset = laneWidth * 0.5;

		const start = road.getLaneCenterPosition( lane, s, -offset );

		if ( innerHeight ) start.z = innerHeight;

		const end = road.getLaneCenterPosition( lane, s, offset );

		if ( outerHeight ) end.z = outerHeight;

		return new LineGeometry().setPositions( [ start, end ].flatMap( p => [ p.x, p.y, p.z ] ) );

	}

	createLine ( positions: Vector3[], color = 0xffffff, lineWidth = 2 ): Line2 {

		const geometry = this.createLineGeometry( positions );

		const material = new LineMaterial( {
			color: color,
			linewidth: lineWidth, // in world units with size attenuation, pixels otherwise
			resolution: new Vector2( window.innerWidth, window.innerHeight ),
			depthTest: false,
			depthWrite: false,
			transparent: true,
		} );

		return new Line2( geometry, material );
	}

	createLineGeometry ( positions: Vector3[] ): LineGeometry {

		const geometry = new LineGeometry();

		const positionsArray = [];

		positions.forEach( ( position ) => {
			positionsArray.push( position.x, position.y, position.z );
		} );

		geometry.setPositions( positionsArray );

		return geometry;

	}

	createDebugLine<T> ( target: T, points: Vector3[], lineWidth = 2, color = COLOR.CYAN ): DebugLine<T> {

		const geometry = new LineGeometry().setPositions( points.flatMap( p => [ p.x, p.y, p.z ] ) );

		const material = new LineMaterial( {
			color: color,
			linewidth: lineWidth,
			resolution: new Vector2( window.innerWidth, window.innerHeight ),
			depthTest: false,
			depthWrite: false,
			transparent: true,
		} );

		const line = new DebugLine( target, geometry, material );

		line.renderOrder = 999;

		return line;

	}

	updateDebugLine<T> ( line: DebugLine<T>, points: Vector3[] ): DebugLine<T> {

		const geometry = new LineGeometry().setPositions( points.flatMap( p => [ p.x, p.y, p.z ] ) );

		line.geometry.dispose();

		line.geometry = geometry;

		return line;

	}

	createDashedLine<T> ( target: T, points: Vector3[], lineWidth = 2, color = COLOR.CYAN ): DebugLine<T> {

		const geometry = new LineGeometry().setPositions( points.flatMap( p => [ p.x, p.y, p.z ] ) );

		const material = new LineMaterial( {
			gapSize: 0.1,
			dashed: true,
			dashSize: 0.2,
			color: color,
			linewidth: lineWidth,
			resolution: new Vector2( window.innerWidth, window.innerHeight ),
			depthTest: false,
			depthWrite: false,
			transparent: true,
		} );

		const line = new DebugLine( target, geometry, material );

		line.computeLineDistances();

		line.renderOrder = 999;

		return line;

	}

	createArrow ( position: Vector3, hdg: number, color = 0xffffff, size = 1.0 ): Mesh {

		// Create a 2D arrow at the current position and direction.
		return new SimpleArrowObject( position, hdg, size );

	}

	drawArrow ( position: Vector3, hdg: number, color = 0xffffff, size = 1.0 ): Mesh {

		const arrow = this.createArrow( position, hdg, color, size );

		arrow.position.copy( position );

		this.group.add( arrow );

		return arrow;

	}

	createSharpArrow ( position: Vector3, hdg: number, color = 0xffffff, size = 1.0 ): Mesh {

		return new SharpArrowObject( position, hdg, color, size );

	}

	private createLineSegment ( start: Vector3, end: Vector3 ): LineSegments2 {

		const geometry = new LineSegmentsGeometry().setPositions( [
			start.x, start.y, start.z, end.x, end.y, end.z
		] );

		const material = new LineMaterial( {
			color: 0xffffff,
			linewidth: 1, // in world units with size attenuation, pixels otherwise
			resolution: new Vector2( window.innerWidth, window.innerHeight ),
		} );

		const line = new LineSegments2( geometry, material );

		line.computeLineDistances();

		return line;
	}

	createLaneReferenceLine ( lane: TvLane, location: 'start' | 'center' | 'end', color = 0xffffff ): Line2 {

		const positions = lane.getReferenceLinePoints( location ).map( ( point ) => point.toVector3() );

		return this.createLine( positions, color );
	}

	updateLaneReferenceLine ( line: Line2, laneCoord: TvLaneCoord, location: 'start' | 'center' | 'end' ): Line2 {

		const positions = laneCoord.lane.getReferenceLinePoints( location ).map( ( point ) => point.toVector3() );

		const geometry = new LineGeometry();

		const positionsArray = [];

		positions.forEach( ( position ) => {
			positionsArray.push( position.x, position.y, position.z );
		} );

		geometry.setPositions( positionsArray );

		line.geometry.dispose();

		line.geometry = geometry;

		return line;
	}

	getDirectedPoints ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, side: TvLaneSide, stepSize = 1.0 ): TvPosTheta[] {

		const points: TvPosTheta[] = [];

		const nextLaneSection = road.laneSections.find( i => i.s > laneSection.s );

		const sEnd = nextLaneSection?.s || laneSection.length;

		for ( let sOffset = laneSection.s; sOffset < sEnd; sOffset += stepSize ) {

			const point = this.getDirectedPoint( road, laneSection, lane, sOffset, side );

			points.push( point );

		}

		return points;
	}

	/**
	 *
	 * @param road
	 * @param laneSection
	 * @param lane
	 * @param sOffset with respect to road
	 * @param side
	 * @private
	 */
	private getDirectedPoint ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, sOffset: number, side: TvLaneSide = TvLaneSide.RIGHT ): TvPosTheta {

		let t: number;

		if ( side === TvLaneSide.LEFT ) {

			t = laneSection.getWidthUptoStart( lane, sOffset - laneSection.s );

		} else if ( side === TvLaneSide.CENTER ) {

			t = laneSection.getWidthUptoCenter( lane, sOffset - laneSection.s );

		} else {

			t = laneSection.getWidthUptoEnd( lane, sOffset - laneSection.s );

		}

		// If right side lane then make the offset negative
		if ( lane.side === TvLaneSide.RIGHT ) {
			t *= -1;
		}

		const point = this.queryService.findRoadPosition( road, sOffset, t );

		// NOTE: this can be used if we want hdg to be adjusted with travel direction
		if ( lane.direction == TravelDirection.backward ) {
			point.hdg += Math.PI;
		}

		return point;

	}

	/**
	 *
	 * @param lane
	 * @param sStart s with respect to road
	 * @param sEnd  s with respect to road
	 * @param stepSize
	 * @returns
	 */
	getPoints ( lane: TvLane, sStart: number, sEnd: number, stepSize = 1.0 ) {

		const points: Vector3[] = [];

		for ( let s = sStart; s < sEnd; s += stepSize ) {

			points.push( this.getPoint( lane, s ) )

		}

		points.push( this.getPoint( lane, sEnd - Maths.Epsilon ) );

		return points;
	}

	/**
	 *
	 * @param road
	 * @param laneSection
	 * @param lane
	 * @param sStart with respect to laneSection
	 * @param sEnd with respect to laneSection
	 * @param stepSize
	 * @returns
	 */
	getPositions ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, sStart: number, sEnd: number, stepSize = 1.0 ) {

		const positions: TvPosTheta[] = [];

		for ( let s = sStart; s < sEnd; s += stepSize ) {

			positions.push( this.queryService.findLaneEndPosition( road, laneSection, lane, s ) )

		}

		positions.push( this.queryService.findLaneEndPosition( road, laneSection, lane, sEnd - Maths.Epsilon ) );

		return positions;
	}

	getRoadPositions ( road: TvRoad, sStart: number, sEnd: number, stepSize = 0.1 ) {

		const positions: TvPosTheta[] = [];

		for ( let s = sStart; s < sEnd; s += stepSize ) {

			positions.push( this.queryService.findRoadPosition( road, Maths.clamp( s, 0, road.length ), 0 ) )

		}

		return positions;

	}

	/**
	 *
	 * @param lane
	 * @param s s with respect to road
	 * @returns
	 */
	private getPoint ( lane: TvLane, s: number ) {

		let width = lane.laneSection.getWidthUptoEnd( lane, s - lane.laneSection.s );

		// If right side lane then make the offset negative
		if ( lane.side === TvLaneSide.RIGHT ) {
			width *= -1;
		}

		const posTheta = lane.laneSection.road.getPosThetaAt( s, width );

		return posTheta.toVector3();

	}

	createEntryExitBoxMesh ( position: Vector3, hdg = 0, width = 3.6 ) {

		const texture = OdTextures.arrowCircle();

		const material = new MeshStandardMaterial( {
			map: texture,
			alphaTest: 0.9,
			transparent: true,
			color: COLOR.SKYBLUE,
			depthTest: false,
			depthWrite: false
		} );

		const geometry = new PlaneGeometry( 1, 1 );

		const mesh = new Mesh( geometry, material );

		mesh.name = 'entry-exit-point';

		mesh.position.copy( position );

		// Compute the direction vector from the heading
		const direction = new Vector3( Math.cos( hdg ), Math.sin( hdg ), 0 ).normalize();

		// Apply the rotation to the mesh based on the computed direction
		mesh.quaternion.setFromUnitVectors( new Vector3( 0, 1, 0 ), direction );

		const boxLine = new BoxGeometry( width, 0.5, 0.01 );
		const meshLine = new Mesh( boxLine, new MeshBasicMaterial( { color: COLOR.GREEN } ) );

		mesh.add( meshLine );

		return mesh;
	}
}
