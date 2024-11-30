/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import {
	BufferAttribute,
	BufferGeometry,
	CircleGeometry,
	Float32BufferAttribute,
	LineBasicMaterial,
	LineLoop,
	Vector2,
	Vector3
} from 'three';
import { SceneService } from '../../services/scene.service';
import { TextObject3d } from 'app/objects/text-object';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Maths } from 'app/utils/maths';
import { TvContactPoint } from 'app/map/models/tv-common';
import { Injectable } from '@angular/core';
import { RoadFactory } from 'app/factories/road-factory.service';
import { DebugTextService } from 'app/services/debug/debug-text.service';
import { ViewControllerService } from 'app/views/editor/viewport/view-controller.service';
import { RoadService } from 'app/services/road/road.service';
import { SplineService } from "../../services/spline/spline.service";
import { ControlPointFactory } from "../../factories/control-point.factory";
import { SplineGeometryGenerator } from "../../services/spline/spline-geometry-generator";
import { TvArcGeometry } from 'app/map/models/geometries/tv-arc-geometry';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';

@Injectable( {
	providedIn: 'root'
} )
export class RoadCircleToolService {

	private line: LineLoop;

	private text3d: TextObject3d;

	private start: Vector3;

	private end: Vector3;

	private radius: number;

	constructor (
		public splineBuilder: SplineGeometryGenerator,
		public splineService: SplineService,
		public roadService: RoadService,
		public roadFactory: RoadFactory,
		public debugTextService: DebugTextService,
		public viewController: ViewControllerService,
	) {
	}

	onToolDisabled () {

		SceneService.removeFromTool( this.line );

		SceneService.removeFromTool( this.text3d );

	}

	addRoad ( road: TvRoad ) {

		this.roadService.add( road );

	}

	removeRoad ( road: TvRoad ) {

		this.roadService.remove( road );

	}

	init ( centre: Vector3, end: Vector3, radius: number ) {

		this.start = centre;

		this.end = end;

		this.radius = radius;

		let circleGeometry = new CircleGeometry( radius, radius * 4 );

		this.line = new LineLoop( circleGeometry, new LineBasicMaterial( { color: COLOR.CYAN, linewidth: 4 } ) );

		this.line.name = 'circle';

		this.line.position.copy( centre );

		this.text3d = this.debugTextService.createTextObject( 'Radius: ' + radius.toFixed( 2 ), 10 );

		this.text3d.position.copy( centre );

		SceneService.addToolObject( this.line );

		SceneService.addToolObject( this.text3d );
	}

	reset () {

		this.start = null;

		this.end = null;

		this.radius = null;

		SceneService.removeFromTool( this.line );

		SceneService.removeFromTool( this.text3d );

	}

	update ( radius: number, end: Vector3 ) {

		this.radius = radius;

		this.end = end;

		const circleGeometry = new CircleGeometry( radius, radius * 4 );

		const positions = circleGeometry.attributes.position as BufferAttribute;

		const circleBufferGeometry = new BufferGeometry()
			.setAttribute( 'position', new Float32BufferAttribute( positions.array, 3 ) );

		// Dispose of the old geometry and replace with the new one
		this.line.geometry.dispose();

		this.line.geometry = circleBufferGeometry;

		this.debugTextService.updateText( this.text3d, 'Radius: ' + radius.toFixed( 2 ) );
	}

	createRoads () {

		const roads = this.createCircularRoads( this.start, this.end, this.radius );

		this.reset();

		return roads;

	}

	createCircularRoads ( centre: Vector3, end: Vector3, radius: number ): TvRoad[] {

		const p1 = new Vector2( centre.x, centre.y );
		const p2 = new Vector2( end.x, end.y );

		let start = end;

		let hdg = new Vector2().subVectors( p2, p1 ).angle() + Maths.PI2;

		const circumference = 2 * Math.PI * radius;

		const arcLength = circumference * 0.25;

		const curvature = 1 / radius;

		const points = []

		const roads: TvRoad[] = [];

		for ( let i = 0; i < 4; i++ ) {

			const road = roads[ i ] = this.roadFactory.createDefaultRoad();

			const arc = road.getPlanView().addGeometryArc( 0, start.x, start.y, hdg, arcLength, curvature );

			const startPosTheta = arc.getRoadCoord( 0 );
			const endPosTheta = arc.getRoadCoord( arcLength );

			const distance = start.distanceTo( arc.endV3 ) * 0.3;

			const a2 = startPosTheta.moveForward( +distance );
			const b2 = endPosTheta.moveForward( -distance );

			points.push( ControlPointFactory.createControl( road.spline, start ) );
			points.push( ControlPointFactory.createControl( road.spline, a2.toVector3() ) );
			points.push( ControlPointFactory.createControl( road.spline, b2.toVector3() ) );
			points.push( ControlPointFactory.createControl( road.spline, arc.endV3.clone() ) );

			start = arc.endV3;

			hdg += Maths.PI2;

		}

		this.addPointToRoads( roads, points );

		return roads;
	}


	addPointToRoads ( roads: TvRoad[], points: AbstractControlPoint[] ): void {

		if ( roads.length != 4 ) {
			console.error( 'Road count for circular road is incorrect' );
			return;
		}

		if ( points.length != 16 ) {
			console.error( 'Point count for circular road is incorrect' );
			return;
		}

		for ( let j = 0; j < 4; j++ ) {

			const road = roads[ j ];

			road.spline.addControlPoint( points[ j * 4 + 0 ] );
			road.spline.addControlPoint( points[ j * 4 + 1 ] );
			road.spline.addControlPoint( points[ j * 4 + 2 ] );
			road.spline.addControlPoint( points[ j * 4 + 3 ] );

			this.splineBuilder.buildGeometry( road.spline );

			if ( ( j + 1 ) < roads.length ) {

				const nextRoad = roads[ j + 1 ];

				road.linkSuccessorRoad( nextRoad, TvContactPoint.START );

			} else {

				// its last road, so make connection with the first one
				const firstRoad = roads[ 0 ];

				road.linkSuccessorRoad( firstRoad, TvContactPoint.START );

			}

		}

	}

	createCirclePoints ( centre: Vector3, end: Vector3, radius: number ): Vector3[] {

		const p1 = new Vector2( centre.x, centre.y );
		const p2 = new Vector2( end.x, end.y );

		let start = end.clone();
		let hdg = new Vector2().subVectors( p2, p1 ).angle() + Math.PI / 2;

		const circumference = 2 * Math.PI * radius;
		const arcLength = circumference * 0.25;
		const curvature = 1 / radius;

		const points: Vector3[] = [];

		for ( let i = 0; i < 4; i++ ) {

			const arc = new TvArcGeometry( 0, start.x, start.y, hdg, arcLength, curvature );

			const startPosTheta = arc.getRoadCoord( 0 );
			const endPosTheta = arc.getRoadCoord( arcLength );

			const distance = start.distanceTo( arc.endV3 ) * 0.3;

			let a2 = startPosTheta.moveForward( +distance );
			let b2 = endPosTheta.moveForward( -distance );

			points.push( start.clone() );
			points.push( a2.toVector3() );
			points.push( b2.toVector3() );
			points.push( arc.endV3.clone() );

			start = arc.endV3.clone();
			hdg += Math.PI / 2;
		}

		return points;
	}
}
