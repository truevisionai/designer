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
import { TextObject3d } from 'app/modules/three-js/objects/text-object';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Maths } from 'app/utils/maths';
import { TravelDirection, TvContactPoint } from 'app/modules/tv-map/models/tv-common';
import { SplineControlPoint } from "../../modules/three-js/objects/spline-control-point";
import { Injectable } from '@angular/core';
import { RoadDebugService } from '../../services/debug/road-debug.service';
import { RoadFactory } from 'app/factories/road-factory.service';
import { DebugTextService } from 'app/services/debug/debug-text.service';
import { ViewControllerService } from 'app/modules/three-js/view-controller.service';
import { RoadService } from 'app/services/road/road.service';

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
		private roadService: RoadService,
		private roadDebug: RoadDebugService,
		private roadFactory: RoadFactory,
		private debugTextService: DebugTextService,
		public viewController: ViewControllerService,
	) {
	}

	onToolDisabled () {

		this.roadDebug.clear();

		SceneService.removeFromTool( this.line );

		SceneService.removeFromTool( this.text3d );

	}

	addRoad ( road: TvRoad ) {

		this.showRoadNodes( road );

		this.roadService.addRoad( road );

	}

	removeRoad ( road: TvRoad ) {

		this.hideRoadNodes( road );

		this.roadService.removeRoad( road );

	}

	showRoadNodes ( road: TvRoad ) {

		this.roadDebug.showRoadNodes( road );

	}

	hideRoadNodes ( road: TvRoad ) {

		this.roadDebug.removeRoadNodes( road );

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

		let hdg = new Vector2().subVectors( p2, p1 ).angle() + Maths.M_PI_2;

		const circumference = 2 * Math.PI * radius;

		const arcLength = circumference * 0.25;

		const curvature = 1 / radius;

		const points = []

		const roads: TvRoad[] = [];

		for ( let i = 0; i < 4; i++ ) {

			const road = roads[ i ] = this.roadFactory.createDefaultRoad();

			for ( let i = 0; i < road.laneSections.length; i++ ) {

				const laneSection = road.laneSections[ i ];

				for ( const lane of laneSection.getLeftLanes() ) {

					// TODO: check if we need to change the lane id also
					lane.direction = TravelDirection.forward;

				}

			}

			const arc = road.addGeometryArc( 0, start.x, start.y, hdg, arcLength, curvature );

			const startPosTheta = arc.getRoadCoord( 0 );
			const endPosTheta = arc.getRoadCoord( arcLength );

			const distance = start.distanceTo( arc.endV3 ) * 0.3;

			let a2 = startPosTheta.moveForward( +distance );
			let b2 = endPosTheta.moveForward( -distance );

			points.push( new SplineControlPoint( road.spline, start ) );
			points.push( new SplineControlPoint( road.spline, a2.toVector3() ) );
			points.push( new SplineControlPoint( road.spline, b2.toVector3() ) );
			points.push( new SplineControlPoint( road.spline, arc.endV3.clone() ) );

			start = arc.endV3;

			hdg += Maths.M_PI_2;

		}

		if ( roads.length != 4 ) throw new Error( 'Road count for circular road is incorrect' );

		if ( points.length != 16 ) throw new Error( 'Point count for circular road is incorrect' );

		for ( let j = 0; j < 4; j++ ) {

			const road = roads[ j ];

			// const spline = new AutoSpline( road );
			const spline = road.spline;

			spline.addControlPoint( points[ j * 4 + 0 ] );
			spline.addControlPoint( points[ j * 4 + 1 ] );
			spline.addControlPoint( points[ j * 4 + 2 ] );
			spline.addControlPoint( points[ j * 4 + 3 ] );

			road.spline = spline;

			road.spline.hide();

			road.updateGeometryFromSpline();

			if ( ( j + 1 ) < roads.length ) {

				const nextRoad = roads[ j + 1 ];

				road.setSuccessorRoad( nextRoad, TvContactPoint.START );
				nextRoad.setPredecessorRoad( road, TvContactPoint.END );

				// this.roadLinkService.linkSuccessor( road, road.successor );
				// this.roadLinkService.linkPredecessor( nextRoad, road.predecessor );

			} else {

				// its last road, so make connection with the first one
				const firstRoad = roads[ 0 ];

				road.setSuccessorRoad( firstRoad, TvContactPoint.START );
				firstRoad.setPredecessorRoad( road, TvContactPoint.END );

				// this.roadLinkService.linkSuccessor( road, road.successor );
				// this.roadLinkService.linkPredecessor( firstRoad, road.predecessor );

			}

		}

		return roads;
	}
}
