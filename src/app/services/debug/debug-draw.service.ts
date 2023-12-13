import { Injectable } from '@angular/core';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvLaneCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { Mesh, MeshBasicMaterial, Object3D, SphereGeometry, Vector2, Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry';
import { Object3DMap } from 'app/tools/lane-width/object-3d-map';
import { SimpleArrowObject, SharpArrowObject } from 'app/modules/three-js/objects/lane-arrow-object';
import { DebugLine } from './debug-line';
import { TvLaneSide } from 'app/modules/tv-map/models/tv-common';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';

@Injectable( {
	providedIn: 'root'
} )
export class DebugDrawService {

	private debugObjects = new Object3DMap<this, Object3D>();

	drawSphere ( start: Vector3 ) {

		const geometry = new SphereGeometry( 0.1, 32, 32 );

		const material = new MeshBasicMaterial( { color: 0xffff00 } );

		const sphere = new Mesh( geometry, material );

		sphere.position.copy( start );

		this.debugObjects.add( this, sphere );

	}

	clear () {

		this.debugObjects.clear();

	}

	private static _instance: DebugDrawService;

	static get instance (): DebugDrawService {
		return this._instance;
	}

	constructor () {
		DebugDrawService._instance = this;
	}

	createRoadWidthLine ( roadCoord: TvRoadCoord ): Line2 {

		return this.createRoadWidthLinev2( roadCoord.road, roadCoord.s );

	}

	createRoadWidthLinev2 ( road: TvRoad, s: number ): Line2 {

		const result = road.getRoadWidthAt( s );

		const start = road.getPositionAt( s, result.leftSideWidth );

		const end = road.getPositionAt( s, -result.rightSideWidth );

		const lineGeometry = new LineGeometry();

		lineGeometry.setPositions( [
			start.x, start.y, start.z + 0.1,
			end.x, end.y, end.z + 0.1
		] );

		const lineMaterial = new LineMaterial( {
			color: COLOR.RED,
			opacity: RoadNode.defaultOpacity,
			linewidth: RoadNode.defaultWidth,
			resolution: new Vector2( window.innerWidth, window.innerHeight ), // Add this line
		} );

		const line = new Line2( lineGeometry, lineMaterial );

		line.name = 'DebugDrawService.createRoadWidthLine';

		line.renderOrder = 3;

		return line;
	}

	updateRoadWidthLine ( line: Line2, roadCoord: TvRoadCoord ): Line2 {

		const result = roadCoord.road.getRoadWidthAt( roadCoord.s );

		const start = roadCoord.road.getPositionAt( roadCoord.s, result.leftSideWidth );

		const end = roadCoord.road.getPositionAt( roadCoord.s, -result.rightSideWidth );

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

		const start = road.getPositionAt( s, result.leftSideWidth );

		const end = road.getPositionAt( s, -result.rightSideWidth );

		const lineGeometry = new LineGeometry();

		lineGeometry.setPositions( [
			start.x, start.y, start.z,
			end.x, end.y, end.z
		] );

		line.geometry.dispose();

		line.geometry = lineGeometry;

		return line;
	}

	createLaneWidthLine ( laneCoord: TvLaneCoord ): Line2 {

		const width = laneCoord.lane.getWidthValue( laneCoord.s );

		const start = laneCoord.position;

		const direction = laneCoord.direction.normalize();

		const perpendicular = direction.clone().cross( new Vector3( 0, 0, 1 ) );

		const end = start.clone().add( perpendicular.clone().multiplyScalar( width ) );

		const lineGeometry = new LineGeometry();

		lineGeometry.setPositions( [
			start.x, start.y, start.z + 0.1,
			end.x, end.y, end.z + 0.1
		] );

		const lineMaterial = new LineMaterial( {
			color: COLOR.RED,
			opacity: RoadNode.defaultOpacity,
			linewidth: RoadNode.defaultWidth,
			resolution: new Vector2( window.innerWidth, window.innerHeight ), // Add this line
		} );

		const line = new Line2( lineGeometry, lineMaterial );

		line.name = 'DebugDrawService.createRoadWidthLine';

		line.renderOrder = 3;

		return line;

	}

	updateLaneWidthLine ( line: Line2, laneCoord: TvLaneCoord ): Line2 {

		const width = laneCoord.lane.getWidthValue( laneCoord.s );

		const start = laneCoord.position;

		const direction = laneCoord.direction.normalize();

		const perpendicular = direction.clone().cross( new Vector3( 0, 0, 1 ) );

		const end = start.clone().add( perpendicular.clone().multiplyScalar( width ) );

		const lineGeometry = new LineGeometry();

		lineGeometry.setPositions( [
			start.x, start.y, start.z + 0.1,
			end.x, end.y, end.z + 0.1
		] );

		line.geometry.dispose();

		line.geometry = lineGeometry;

		return line;

	}

	createLine ( positions: Vector3[], color = 0xffffff ): Line2 {

		const geometry = new LineGeometry();

		const positionsArray = [];

		positions.forEach( ( position ) => {
			positionsArray.push( position.x, position.y, position.z );
		} );

		geometry.setPositions( positionsArray );

		const material = new LineMaterial( {
			color: color,
			linewidth: 2, // in world units with size attenuation, pixels otherwise
			resolution: new Vector2( window.innerWidth, window.innerHeight ),
			depthTest: false,
			depthWrite: false,
			transparent: true,
		} );

		return new Line2( geometry, material );
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

	createArrow ( position: Vector3, hdg: number, color = 0xffffff, size = 1.0 ): Mesh {

		// Create a 2D arrow at the current position and direction.
		return new SimpleArrowObject( position, hdg, size );

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

	getLanePoints ( lane: TvLane, sStart: number, sEnd: number, stepSize = 1.0 ): TvPosTheta[] {

		const points: TvPosTheta[] = [];

		for ( let s = sStart; s < sEnd; s += stepSize ) {

			points.push( this.getLanePoint( lane, s ) )

		}

		points.push( this.getLanePoint( lane, sEnd - Number.EPSILON ) );

		return points;
	}

	private getLanePoint ( lane: TvLane, s: number, side: TvLaneSide = TvLaneSide.RIGHT ): TvPosTheta {

		let posTheta = lane.laneSection.road.getRoadCoordAt( s );

		let width: number;

		if ( side === TvLaneSide.LEFT ) {

			width = lane.laneSection.getWidthUptoStart( lane, s - lane.laneSection.s );

		} else if ( side === TvLaneSide.CENTER ) {

			width = lane.laneSection.getWidthUptoCenter( lane, s - lane.laneSection.s );

		} else {

			width = lane.laneSection.getWidthUptoEnd( lane, s - lane.laneSection.s );

		}

		// If right side lane then make the offset negative
		if ( lane.side === TvLaneSide.RIGHT ) {

			width *= -1;

			posTheta.addLateralOffset( width );

		} else {

			posTheta.addLateralOffset( width );

			posTheta.hdg += Math.PI;

		}

		return posTheta;

	}

}
