/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvLane } from 'app/map/models/tv-lane';
import { Vector2, Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry';

@Injectable( {
	providedIn: 'root'
} )
export class LineFactoryService {

	static createLine ( positions: Vector3[], color = 0xffffff ): Line2 {

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
		} );

		const line = new Line2( geometry, material );

		return line;
	}

	static createLineSegment ( start: Vector3, end: Vector3 ): LineSegments2 {

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

	static createLaneLine ( lane: TvLane, location: 'start' | 'center' | 'end', color = 0xffffff ): Line2 {

		const points = lane.getReferenceLinePoints( location ).map( ( point ) => point.toVector3() );

		return this.createLine( points, color );
	}

	static createLaneLineGeometry ( lane: TvLane, location: 'start' | 'center' | 'end' ): LineGeometry {

		const positions = lane.getReferenceLinePoints( location ).map( ( point ) => point.toVector3() );

		const geometry = new LineGeometry();

		const positionsArray = [];

		positions.forEach( ( position ) => {
			positionsArray.push( position.x, position.y, position.z );
		} );

		geometry.setPositions( positionsArray );

		return geometry;
	}


}
