/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { CommandHistory } from 'app/services/command-history';
import { BufferGeometry, CircleGeometry, Float32BufferAttribute, LineBasicMaterial, LineLoop, RingGeometry, Vector3 } from 'three';
import { AddRoadCircleCommand } from '../commands/add-road-circle-command';
import { BaseTool } from './base-tool';
import { TextObject } from 'app/modules/three-js/objects/text-object';
import { ToolType } from '../models/tool-types.enum';

export class RoadCircleTool extends BaseTool {

	public name: string = 'RoadCircleTool';
	public toolType = ToolType.RoadCircle;

	private pointerLastAt: Vector3;
	private currentRadius: number;

	private circleRoad: CircleRoad;

	constructor () {

		super();

	}

	get radius () {
		return Math.max( 7.5, this.currentRadius );
	}

	init () {

		super.init();

	}

	enable () {

		super.enable();

	}

	disable () {

		super.disable();

	}

	onPointerDown ( e: PointerEventData ) {

		if ( e.button != MouseButton.LEFT ) return;

		this.initCircle( this.pointerDownAt, e.point, this.radius );
	}

	onPointerUp ( e: PointerEventData ) {

		if ( e.button != MouseButton.LEFT ) return;

		this.createRoads();

		this.circleRoad = null;
		this.currentRadius = 0;
	}

	createRoads () {

		if ( this.circleRoad ) this.circleRoad.createRoads();

	}

	onPointerMoved ( e: PointerEventData ) {

		if ( e.button != MouseButton.LEFT ) return;

		if ( !this.isPointerDown ) return;
		if ( !this.pointerDownAt ) return;

		this.pointerLastAt = e.point;

		this.currentRadius = this.pointerDownAt.distanceTo( this.pointerLastAt );

		if ( this.circleRoad ) this.updateCircle( this.pointerLastAt, this.radius );
	}

	initCircle ( centre: Vector3, end: Vector3, radius: number ) {

		this.circleRoad = new CircleRoad( centre, end, radius );

		TvMapInstance.map.gameObject.add( this.circleRoad.line );
	}

	updateCircle ( end: Vector3, radius: number ) {

		if ( !this.circleRoad ) return;

		this.circleRoad.update( radius, end );

	}

}

class CircleRoad {

	public line: LineLoop;

	private text: TextObject;

	constructor ( private centre: Vector3, private end: Vector3, private radius: number ) {

		let circleGeometry = new CircleGeometry( radius, radius * 4 );

		this.line = new LineLoop( circleGeometry, new LineBasicMaterial( { color: 'blue' } ) );

		this.line.position.copy( centre );

		this.text = new TextObject( 'Radius: ' + radius.toFixed( 2 ), centre );

	}

	update ( radius: number, end: Vector3 ) {

		this.radius = radius;
		this.end = end;

		const circleGeometry = new CircleGeometry( radius, radius * 4 );

		const circleBufferGeometry = new BufferGeometry()
			.setAttribute( 'position', new Float32BufferAttribute( circleGeometry.attributes.position.array, 3 ) );

		// Dispose of the old geometry and replace with the new one
		this.line.geometry.dispose();

		this.line.geometry = circleBufferGeometry;

		this.text.updateText( 'Radius: ' + radius.toFixed( 2 ) );
	}

	/**
	 * create 4 arc roads to form a circular road with correct
	 * successor/predecessor relation
	 */
	createRoads () {

		this.text.remove();

		CommandHistory.execute( new AddRoadCircleCommand( this.centre, this.end, this.radius ) );

	}


	// /**
	//  * creates 1 road with 10 control points with auto spline
	//  * @deprecated not in use only for reference
	//  */
	// createRoads_1_Road_10_Points () {

	// 	const p1 = new Vector2( this.centre.x, this.centre.y );
	// 	const p2 = new Vector2( this.end.x, this.end.y );

	// 	let start = this.end;


	// 	let hdg = new Vector2().subVectors( p2, p1 ).angle() + Maths.M_PI_2;

	// 	let road: TvRoad = TvMapInstance.map.addDefaultRoad();

	// 	let arc = null;

	// 	const circumference = 2 * Math.PI * this.radius;

	// 	const arcLength = circumference * 0.25;

	// 	const curvature = 1 / this.radius;

	// 	const points: Vector3[] = [];

	// 	for ( let i = 0; i < 4; i++ ) {

	// 		arc = road.addGeometryArc( 0, start.x, start.y, hdg, arcLength, curvature );

	// 		const startPosTheta = new TvPosTheta();
	// 		const endPosTheta = new TvPosTheta();

	// 		arc.getCoords( 0, startPosTheta );
	// 		arc.getCoords( arcLength, endPosTheta );

	// 		const distance = start.distanceTo( arc.endV3 ) * 0.3;

	// 		let a2 = startPosTheta.moveForward( +distance );
	// 		let b2 = endPosTheta.moveForward( -distance );

	// 		if ( i == 0 ) points.push( start );
	// 		points.push( a2.toVector3() );
	// 		points.push( b2.toVector3() );
	// 		if ( i == 3 ) points.push( arc.endV3 );

	// 		start = arc.endV3;

	// 		hdg += Maths.M_PI_2;


	// 	}

	// 	road.clearGeometries();

	// 	const spline = new AutoSpline();

	// 	points.forEach( p => SceneService.add( spline.addControlPointAt( p ) ) );

	// 	road.spline = spline;

	// 	road.spline.hide();

	// 	road.updateGeometryFromSpline();

	// 	TvMapBuilder.buildMap( TvMapInstance.map );
	// }

	// /**
	//  * create 4 road which are not connected each with its own auto spline
	//  * @deprecated not in use only for reference
	//  */
	// createRoads_4_Roads () {

	// 	const p1 = new Vector2( this.centre.x, this.centre.y );
	// 	const p2 = new Vector2( this.end.x, this.end.y );

	// 	let start = this.end;


	// 	let hdg = new Vector2().subVectors( p2, p1 ).angle() + Maths.M_PI_2;

	// 	let road: TvRoad = null;
	// 	let arc = null;

	// 	const circumference = 2 * Math.PI * this.radius;

	// 	const arcLength = circumference * 0.25;

	// 	const curvature = 1 / this.radius;

	// 	for ( let i = 0; i < 4; i++ ) {

	// 		road = TvMapInstance.map.addDefaultRoad();

	// 		arc = road.addGeometryArc( 0, start.x, start.y, hdg, arcLength, curvature );

	// 		const startPosTheta = new TvPosTheta();
	// 		const endPosTheta = new TvPosTheta();

	// 		arc.getCoords( 0, startPosTheta );
	// 		arc.getCoords( arcLength, endPosTheta );

	// 		const distance = start.distanceTo( arc.endV3 ) * 0.3;

	// 		let a2 = startPosTheta.moveForward( +distance );
	// 		let b2 = endPosTheta.moveForward( -distance );

	// 		const spline = new AutoSpline();

	// 		SceneService.add( spline.addControlPointAt( start ) );
	// 		SceneService.add( spline.addControlPointAt( a2.toVector3() ) );
	// 		SceneService.add( spline.addControlPointAt( b2.toVector3() ) );
	// 		SceneService.add( spline.addControlPointAt( arc.endV3 ) );

	// 		road.spline = spline;

	// 		road.updateGeometryFromSpline();

	// 		road.spline.hide();

	// 		start = arc.endV3;

	// 		hdg += Maths.M_PI_2;


	// 	}


	// 	TvMapBuilder.buildMap( TvMapInstance.map );
	// }

	// /**
	//  * @deprecated not in use only for reference
	//  */
	// createRoads_1_Arc () {

	// 	const p1 = new Vector2( this.centre.x, this.centre.y );
	// 	const p2 = new Vector2( this.end.x, this.end.y );

	// 	let start = this.end;

	// 	let s = 0;

	// 	let hdg = new Vector2().subVectors( p2, p1 ).angle() + Maths.M_PI_2;

	// 	let road = TvMapInstance.map.addDefaultRoad();

	// 	const circumference = 2 * Math.PI * this.radius;

	// 	const arcLength = circumference * 0.25;

	// 	const curvature = 1 / this.radius;

	// 	let arc = new TvArcGeometry( s, start.x, start.y, hdg, arcLength, curvature );

	// 	const startPosTheta = new TvPosTheta();
	// 	const endPosTheta = new TvPosTheta();

	// 	arc.getCoords( 0, startPosTheta );
	// 	arc.getCoords( arcLength, endPosTheta );

	// 	const distance = this.end.distanceTo( arc.endV3 ) * 0.3;

	// 	let a2 = startPosTheta.moveForward( +distance );
	// 	let b2 = endPosTheta.moveForward( -distance );

	// 	const spline = new AutoSpline();

	// 	SceneService.add( spline.addControlPointAt( start ) );
	// 	SceneService.add( spline.addControlPointAt( a2.toVector3() ) );
	// 	SceneService.add( spline.addControlPointAt( b2.toVector3() ) );
	// 	SceneService.add( spline.addControlPointAt( arc.endV3 ) );

	// 	road.spline = spline;

	// 	road.updateGeometryFromSpline();

	// 	road.spline.hide();

	// 	// s += arcLength;

	// 	// for ( let i = 0; i < 3; i++ ) {

	// 	//     // let road = TvMapInstance.map.addDefaultRoad();

	// 	//     start = arc.endV3;

	// 	//     hdg += Maths.M_PI_2;

	// 	//     arc = road.addGeometryArc( 0, start.x, start.y, hdg, arcLength, curvature );

	// 	//     s += arcLength;

	// 	// }


	// 	TvMapBuilder.buildMap( TvMapInstance.map );
	// }
}
