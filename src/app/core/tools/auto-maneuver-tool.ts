/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { JunctionEntryObject } from 'app/modules/three-js/objects/junction-entry.object';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { OdTextures } from 'app/modules/tv-map/builders/od.textures';
import { TvDirection, TvLaneType, TvSide } from 'app/modules/tv-map/models/tv-common';
import { TvJunctionConnection } from 'app/modules/tv-map/models/tv-junction-connection';
import { LanePathObject, TvJunctionLaneLink } from 'app/modules/tv-map/models/tv-junction-lane-link';
import { TvRoadCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { CommandHistory } from 'app/services/command-history';
import { Maths } from 'app/utils/maths';
import { LaneLinkInspector } from 'app/views/inspectors/lane-link-inspector/lane-link-inspector.component';
import * as THREE from 'three';
import { Mesh, PointsMaterial, Vector3 } from 'three';
import { MultiCmdsCommand } from '../commands/multi-cmds-command';
import { SetInspectorCommand } from '../commands/set-inspector-command';
import { UpdateRoadPointCommand } from '../commands/update-road-point-command';
import { AbstractShapeEditor } from '../editors/abstract-shape-editor';
import { PointEditor } from '../editors/point-editor';
import { LanePathFactory } from '../factories/lane-path-factory.service';
import { KeyboardInput } from '../input';
import { ToolType } from '../models/tool-types.enum';
import { PickingHelper } from '../services/picking-helper.service';
import { SceneService } from '../services/scene.service';
// import { JunctionDot } from "app/modules/three-js/objects/junction-dot";
import { AbstractSpline } from '../shapes/abstract-spline';
import { AutoSpline } from '../shapes/auto-spline';
import { CatmullRomPath, HermiteSplineCurve } from '../shapes/cubic-spline-curve';
import { BaseTool } from './base-tool';

export interface JunctionDot {
	id: number,
	s: number,
	roadId: number,
	laneId: number,
	type: 'start' | 'end',
	direction: 'forward' | 'backward',
	position: Vector3,
	hdg: number,
	sDirection?: 'same' | 'opposite',
	color: number
}

export interface IJunctionConnection {
	type?: 'straight' | 'left-turn' | 'right-turn',
	incomingRoad?: number,
	outgoingRoad?: number,
	fromLane?: number,
	toLane?: number,
	point?: 'start' | 'end',
	entry?: JunctionDot,
	exit?: JunctionDot,
	spline?: AbstractSpline,
	mesh?: Mesh
}

export interface TempIntersection {
	x: number,
	y: number,
	s1: number,
	s2: number,
	road1: number,
	road2: number,
	coordA?: TvRoadCoord,
	coordB?: TvRoadCoord,
}

/**
 * Tool to show,edit junction maneuvers
 *
 * 1. Shows all junction areas on enable/init
 *  a. highlight junction area on hover
 *  b. select junction area on click
 * P
 * 2. When Junction Clicked
 *  a. show dots, maneuvers
 *  b. show rebuild maneuver button in inspector
 *
 * 3. Dots can be highlighted and clicked
 *  a. when clicked, dots show nothing
 *
 * 4. Maneuvers can be clicked
 *  a. when clicked show, inspector with turn type etc info
 *  b. when clicked show 4 control points that move in +- s direction
 *  c. maneuevers have distance node for start and end which affects maneuver path
 */
export class AutoManeuverTool extends BaseTool {

	public static DOTCOUNT = 0;

	name: string = 'ManeuverTool';
	toolType = ToolType.Maneuver;

	pointEditor: AbstractShapeEditor;

	private connections: IJunctionConnection[] = [];

	private roadChanged = false;

	private connectingRoad: TvRoad;

	public roadControlPoint: RoadControlPoint;

	private lanePathObject: LanePathObject;
	private curve: THREE.Mesh;

	static createDots ( road: TvRoad, point: Vector3, sCoord?: number, startSCoord?: number, endSCoord?: number ) {

		const dots: JunctionDot[] = [];

		const laneSection = road.getLaneSectionAt( sCoord );

		laneSection.getLeftLanes().filter( l => l.type == TvLaneType.driving ).forEach( lane => {

			const startRef = new TvPosTheta();
			const startPosition = TvMapQueries.getLanePosition( road.id, lane.id, startSCoord, 0, startRef );

			// start dot
			dots.push( {
				id: this.DOTCOUNT++,
				color: 0x69F0AE,
				s: startSCoord,
				roadId: road.id,
				laneId: lane.id,
				type: 'start',
				direction: 'forward',
				position: startPosition,
				hdg: startRef.hdg
			} );

			const endRef = new TvPosTheta();
			const endPosition = TvMapQueries.getLanePosition( road.id, lane.id, endSCoord, 0, endRef );

			// end dot
			dots.push( {
				id: this.DOTCOUNT++,
				color: 0xFF5252,
				s: endSCoord,
				roadId: road.id,
				laneId: lane.id,
				type: 'end',
				direction: 'forward',
				position: endPosition,
				hdg: endRef.hdg,
			} );

		} );

		laneSection.getRightLanes().filter( l => l.type == TvLaneType.driving ).forEach( lane => {

			const startRef = new TvPosTheta();
			const startPosition = TvMapQueries.getLanePosition( road.id, lane.id, endSCoord, 0, startRef );

			// start dot
			dots.push( {
				id: this.DOTCOUNT++,
				color: 0x69F0AE,
				s: endSCoord,
				roadId: road.id,
				laneId: lane.id,
				type: 'start',
				direction: 'backward',
				position: startPosition,
				hdg: startRef.hdg + Math.PI,    // add 180 degree
			} );

			const endRef = new TvPosTheta();
			const endPosition = TvMapQueries.getLanePosition( road.id, lane.id, startSCoord, 0, endRef );

			// end dot
			dots.push( {
				id: this.DOTCOUNT++,
				color: 0xFF5252,
				s: startSCoord,
				roadId: road.id,
				laneId: lane.id,
				type: 'end',
				direction: 'backward',
				position: endPosition,
				hdg: endRef.hdg + Math.PI,      // add 180 degree
			} );

		} );

		return dots;
	}

	static createTurnConnectionPaths ( entry: JunctionDot, exit: JunctionDot ): AbstractSpline {

		const autoSpline = new AutoSpline();

		autoSpline.addControlPointAt( entry.position );

		if ( entry.direction == 'forward' && exit.direction == 'forward' ) {

			const entry2 = TvMapQueries.getLanePosition( entry.roadId, entry.laneId, entry.s + 2.5, 0 );
			autoSpline.addControlPointAt( entry2 );

			const entry3 = TvMapQueries.getLanePosition( exit.roadId, exit.laneId, exit.s - 2.5, 0 );
			autoSpline.addControlPointAt( entry3 );

		} else if ( entry.direction == 'backward' && exit.direction == 'backward' ) {

			const entry2 = TvMapQueries.getLanePosition( entry.roadId, entry.laneId, entry.s - 2.5, 0 );
			autoSpline.addControlPointAt( entry2 );

			const entry3 = TvMapQueries.getLanePosition( exit.roadId, exit.laneId, exit.s + 2.5, 0 );
			autoSpline.addControlPointAt( entry3 );

		} else if ( entry.direction == 'forward' && exit.direction == 'backward' ) {

			const entry2 = TvMapQueries.getLanePosition( entry.roadId, entry.laneId, entry.s + 2.5, 0 );
			autoSpline.addControlPointAt( entry2 );

			const entry3 = TvMapQueries.getLanePosition( exit.roadId, exit.laneId, exit.s + 2.5, 0 );
			autoSpline.addControlPointAt( entry3 );

		} else if ( entry.direction == 'backward' && exit.direction == 'forward' ) {

			const entry2 = TvMapQueries.getLanePosition( entry.roadId, entry.laneId, entry.s - 2.5, 0 );
			autoSpline.addControlPointAt( entry2 );

			const entry3 = TvMapQueries.getLanePosition( exit.roadId, exit.laneId, exit.s - 2.5, 0 );
			autoSpline.addControlPointAt( entry3 );

		}

		autoSpline.addControlPointAt( exit.position );

		autoSpline.update();

		// console.log( entry, exit, autoSpline.exportGeometries() );

		return autoSpline;
	}

	static createStraightConnections ( road: TvRoad, dots: JunctionDot[] = [] ) {

		const connections: IJunctionConnection[] = [];

		const entries = dots.filter( d => d.roadId == road.id ).filter( d => d.type == 'start' );

		entries.forEach( entry => {

			const exits = dots.filter( d => d.roadId == road.id ).filter( d => d.laneId == entry.laneId ).filter( d => d.type == 'end' );

			if ( exits.length > 0 ) {

				const exit = exits[ 0 ];

				const spline = this.createStraightConnectionPath( entry, exit );

				connections.push( {
					type: 'straight',
					incomingRoad: entry.roadId,
					outgoingRoad: exit.roadId,
					fromLane: entry.laneId,
					toLane: exit.laneId,
					point: 'start',
					entry: entry,
					exit: exit,
					spline: spline
				} );
			}

		} );

		return connections;
	}

	static createLeftTurnConnections ( road: TvRoad, dots: JunctionDot[] = [] ) {

		const connections: IJunctionConnection[] = [];

		const directions = [ 'forward', 'backward' ];

		directions.forEach( direction => {

			let entry: JunctionDot = null;

			let entries = dots.filter( d => d.roadId == road.id )
				.filter( d => d.direction == direction )
				.filter( d => d.type == 'start' );

			if ( entries.length > 0 && direction == 'forward' ) {

				// find left most lane
				entry = entries.reduce( ( x, y ) => {
					return x.laneId > y.laneId ? x : y;
				} );

			} else if ( entries.length > 0 && direction == 'backward' ) {

				// find left most lane
				entry = entries.reduce( ( x, y ) => {
					return x.laneId < y.laneId ? x : y;
				} );

			}

			if ( entry ) {

				const exits = dots.filter( d => d.roadId != road.id )
					.filter( d => d.type == 'end' )
					.filter( d => Maths.findSide( d.position, entry.position, entry.hdg ) == TvSide.LEFT );

				if ( exits.length > 0 ) {

					const exit = exits.reduce( ( a, b ) => {
						return a.position.distanceTo( entry.position ) < b.position.distanceTo( entry.position ) ? a : b;
					} );

					const spline = this.createTurnConnectionPaths( entry, exit );

					connections.push( {
						type: 'left-turn',
						incomingRoad: entry.roadId,
						outgoingRoad: exit.roadId,
						fromLane: entry.laneId,
						toLane: exit.laneId,
						point: 'start',
						entry: entry,
						exit: exit,
						spline: spline
					} );
				}
			}

		} );

		return connections;
	}

	static createConnections ( roads: TvRoad[], dots: JunctionDot[] ): IJunctionConnection[] {

		const connections: IJunctionConnection[] = [];

		roads.forEach( road => {

			this.createStraightConnections( road, dots )
				.forEach( connection => connections.push( connection ) );

			this.createLeftTurnConnections( road, dots )
				.forEach( connection => connections.push( connection ) );

			this.createRightTurnConnections( road, dots )
				.forEach( connection => connections.push( connection ) );

		} );

		return connections;
	}

	static createRightTurnConnections ( road: TvRoad, dots: JunctionDot[] = [] ) {

		const connections: IJunctionConnection[] = [];

		const directions = [ 'forward', 'backward', ];

		directions.forEach( direction => {

			let entry = null;

			let entries = dots.filter( d => d.roadId == road.id )
				.filter( d => d.direction == direction )
				.filter( d => d.type == 'start' );

			if ( entries.length > 0 && direction == 'forward' ) {

				// find right most lane
				entry = entries.reduce( ( x, y ) => {
					return x.laneId < y.laneId ? x : y;
				} );

			} else if ( entries.length > 0 && direction == 'backward' ) {

				// find right most lane
				entry = entries.reduce( ( x, y ) => {
					return x.laneId > y.laneId ? x : y;
				} );

			}

			if ( entry ) {

				const exits = dots
					.filter( d => d.roadId != road.id )
					.filter( d => d.type == 'end' )
					.filter( d => Maths.findSide( d.position, entry.position, entry.hdg ) == TvSide.RIGHT );

				if ( exits.length > 0 ) {

					// get the nearest exit by lowest distance from entry
					const exit = exits.reduce( ( a, b ) => {
						return a.position.distanceTo( entry.position ) < b.position.distanceTo( entry.position ) ? a : b;
					} );

					const spline = this.createTurnConnectionPaths( entry, exit );

					connections.push( {
						type: 'right-turn',
						incomingRoad: entry.roadId,
						outgoingRoad: exit.roadId,
						fromLane: entry.laneId,
						toLane: exit.laneId,
						point: 'start',
						entry: entry,
						exit: exit,
						spline: spline
					} );
				}
			}

		} );

		return connections;
	}

	static createStraightConnectionPath ( entry: JunctionDot, exit: JunctionDot ): AbstractSpline {

		const spline = new AutoSpline();

		spline.addControlPointAt( entry.position );
		spline.addControlPointAt( exit.position );

		spline.update();

		return spline;
	}

	init () {

		this.pointEditor = new PointEditor();

	}

	enable () {

		this.loadJunctions();

		const intersections = this.findIntersectionsSlow( [ ...this.map.roads.values() ] );

		intersections.forEach( intersection => {

			const results = this.calculateJunctionDistances( intersection.coordA, intersection.coordB );

			results.forEach( result => {

				this.divideRoad( result );

			} );

		} );

		// const junctions = this.createJunctionAreas( intersections );

		// this.connections = this.prepareJunctionConnections( junctions );

		// this.connections.forEach( connection => {
		//     this.makePath( connection );
		// } )
	}

	divideRoad ( result ) {

		// const startSCoord = result.start.s;
		// const startRoad = this.openDrive.getRoadById( result.start.roadId );
		// const startPosition = startRoad.getRoadPosition( result.start.s );
		// const p1 = new RoadControlPoint( startRoad, startPosition.toVector3() );

		// // start position become the limit/length for the road
		// startRoad.length = startSCoord;

		// const geometry = startRoad.getGeometryAt( startSCoord );

		// geometry.length = startSCoord - geometry.s;


		// const endRoad = this.openDrive.getRoadById( result.end.roadId );
		// const endPosition = endRoad.getRoadPosition( result.end.s );
		// const p2 = new RoadControlPoint( endRoad, endPosition.toVector3() );


		// SceneService.add( p1 );
		// SceneService.add( p2 );
	}

	disable () {

		this.pointEditor.removeAllControlPoints();

		this.connections.forEach( connection => {

			if ( connection.spline ) {

				connection.spline.hide();

			}

			if ( connection.mesh ) {

				connection.mesh.visible = false;
			}

		} );

		this.hideLinks();
	}

	onPointerDown ( e: PointerEventData ) {

		if ( e.button === MouseButton.RIGHT || e.button === MouseButton.MIDDLE ) return;

		const shiftKeyDown = KeyboardInput.isShiftKeyDown;

		let hasInteracted = false;

		if ( !shiftKeyDown && !hasInteracted ) hasInteracted = this.checkRoadControlPointInteraction( e );

		if ( !shiftKeyDown && !hasInteracted ) hasInteracted = this.checkJunctionEntryInteraction( e );

		if ( !shiftKeyDown && !hasInteracted ) hasInteracted = this.checkPathInteraction( e );

		if ( !hasInteracted ) {

			const commands = [];

			commands.push( new SetInspectorCommand( null, null ) );

			CommandHistory.execute( new MultiCmdsCommand( commands ) );
		}
	}

	onPointerUp ( e: PointerEventData ) {

		if ( this.connectingRoad && this.roadControlPoint && this.roadChanged ) {

			const updateRoadPointCommand = new UpdateRoadPointCommand(
				this.connectingRoad,
				this.roadControlPoint,
				this.roadControlPoint.position,
				this.pointerDownAt
			);

			CommandHistory.execute( updateRoadPointCommand );

			LanePathFactory.update( this.lanePathObject );
		}

		this.roadChanged = false;
	}

	onPointerMoved ( e: PointerEventData ) {

		if ( this.isPointerDown && this.roadControlPoint && this.connectingRoad ) {

			this.roadControlPoint.copyPosition( e.point );

			this.connectingRoad.spline.update();

			this.roadChanged = true;

		}

	}

	checkPathInteraction ( event: PointerEventData ): boolean {

		if ( event.button !== MouseButton.LEFT ) return;

		let hasInteracted = false;

		for ( let i = 0; i < event.intersections.length; i++ ) {

			const intersection = event.intersections[ i ];

			if ( intersection.object[ 'tag' ] === LanePathObject.tag ) {

				hasInteracted = true;

				this.lanePathObject = intersection.object.parent as LanePathObject;

				const commands = [];

				this.connectingRoad = this.lanePathObject.connectingRoad;

				commands.push( new SetInspectorCommand( LaneLinkInspector, {
					link: this.lanePathObject.link,
					connection: this.lanePathObject.connection
				} ) );

				CommandHistory.execute( new MultiCmdsCommand( commands ) );

				break;
			}
		}

		return hasInteracted;
	}

	checkRoadControlPointInteraction ( e: PointerEventData ): boolean {

		if ( !this.connectingRoad || !this.connectingRoad.spline ) return;

		if ( !e.point ) return;

		// const maxDistance = Math.max( 0.5, e.approxCameraDistance * 0.01 );
		const maxDistance = Math.max( 0.5, Math.exp( 0.001 * e.approxCameraDistance ) );

		const roadControlPoints = [];

		this.connectingRoad.spline.controlPoints.forEach( ( cp: RoadControlPoint ) => {

			roadControlPoints.push( cp );

			if ( cp.frontTangent ) roadControlPoints.push( cp.frontTangent );

			if ( cp.backTangent ) roadControlPoints.push( cp.backTangent );

		} );

		const roadControlPoint = PickingHelper.findNearestViaDistance( e.point, roadControlPoints, maxDistance );

		if ( roadControlPoint ) {

			const commands = [];

			// commands.push( new SetInspectorCommand( RoadInspector, {
			//     road: this.connectingRoad,
			//     controlPoint: roadControlPoint
			// } ) );

			commands.push( new SetValueCommand( this, 'roadControlPoint', roadControlPoint ) );

			// if ( this.node ) commands.push( new SetValueCommand( this, 'node', null ) );

			CommandHistory.execute( new MultiCmdsCommand( commands ) );

		} else if ( !this.roadControlPoint && this.roadControlPoint ) {

			this.roadControlPoint.unselect();

			this.roadControlPoint = null;

		}

		return roadControlPoint != null;
	}

	hideLinks () {

		this.map.junctions.forEach( junction => {

			junction.connections.forEach( connection => {

				const incomingRoad = this.map.getRoadById( connection.incomingRoad );
				const connectingRoad = this.map.getRoadById( connection.connectingRoad );

				connection.laneLink.forEach( link => {

					link.hide();

				} );

			} );

		} );
	}

	loadJunctions (): void {

		this.map.junctions.forEach( junction => {

			junction.connections.forEach( connection => {

				const incomingRoad = this.map.getRoadById( connection.incomingRoad );
				const connectingRoad = this.map.getRoadById( connection.connectingRoad );

				connection.laneLink.forEach( link => {

					this.makeJunctionConnectionPath( incomingRoad, connectingRoad, connection, link );

				} );

			} );

		} );

	}

	makePath ( connection: IJunctionConnection ) {

		const spline = connection.spline;

		const shape = new THREE.Shape();
		shape.moveTo( 0, -0.25 );
		shape.lineTo( 0, 0.25 );

		// const arcLine = new LineArcSplineCurve( spline.controlPoints );

		const path = new CatmullRomPath( spline.controlPointPositions );

		// const randomPoints = [];
		// for ( let i = 0; i < 10; i++ ) {
		//     randomPoints.push( new THREE.Vector3( ( i - 4.5 ) * 50, THREE.MathUtils.randFloat( - 50, 50 ), 0 ) );
		// }
		// const path = new THREE.CatmullRomSpline( randomPoints );

		const extrudeSettings = {
			steps: path.getLength() * 2,
			bevelEnabled: false,
			extrudePath: path
		};

		const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
		const material = new THREE.MeshBasicMaterial( {
			color: 0x00ff00,
			wireframe: false,
			opacity: 0.5,
			transparent: true,
			depthTest: false,
			map: OdTextures.asphalt
		} );

		connection.mesh = new THREE.Mesh( geometry, material );

		connection.mesh.renderOrder = 3;

		SceneService.add( connection.mesh );

	}

	updateCurve () {

		const shape = new THREE.Shape();
		shape.moveTo( 0, 0 );
		shape.lineTo( 0, 12 );

		const p0 = this.pointEditor.controlPointPositions[ 0 ];
		const p1 = this.pointEditor.controlPointPositions[ 1 ];
		const p2 = this.pointEditor.controlPointPositions[ 2 ];
		const p3 = this.pointEditor.controlPointPositions[ 3 ];

		const a = 0;
		const b = 0;
		const c = 0;
		const d = 0;


		const bezier = new THREE.CubicBezierCurve3( p0, p1, p2, p3 );
		const hermite = new HermiteSplineCurve( p0, p1, p2, p3 );

		const extrudeSettings = {
			steps: 200,
			bevelEnabled: false,
			extrudePath: hermite
		};

		this.curve.geometry.dispose();

		this.curve.geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
	}

	makeSampleCurve () {

		const shape = new THREE.Shape();
		shape.moveTo( 0, 0 );
		shape.lineTo( 0, 12 );

		const p0 = new Vector3( 0, 0, 0 );
		const p1 = new Vector3( 100, 0, 0 );
		const p2 = new Vector3( 150, 50, 0 );
		const p3 = new Vector3( 150, 100, 0 );

		this.pointEditor.addControlPoint( p0 );
		this.pointEditor.addControlPoint( p1 );
		this.pointEditor.addControlPoint( p2 );
		this.pointEditor.addControlPoint( p3 );

		// const m = new Matrix4().set(
		//     0, 0, -3, 3,
		//     -3, 3, 0, 0,
		//     0, 0, 0, 1,
		//     1, 0, 0, 0
		// );

		// const m = new Matrix4().set(
		//     1, 0, 0, 0,
		//     0, 0, 0, 1,
		//     -3, 3, 0, 0,
		//     0, 0, -3, 3,
		// );

		// // console.log( 'm', m );

		// const m_inv = new Matrix4().getInverse( m );

		// console.log( 'm-inv', m_inv );

		// const g = new Matrix4().set(
		//     0, 0, 0, 0,
		//     100, 0, 0, 0,
		//     150, 0, 0, 0,
		//     150, 0, 0, 0
		// );

		const bezier = new THREE.CubicBezierCurve3( p0, p1, p2, p3 );
		const hermite = new HermiteSplineCurve( p0, p1, p2, p3 );

		// console.log( m_inv.multiply( g ), bezier.getLength() );

		const extrudeSettings = {
			steps: 200,
			bevelEnabled: false,
			extrudePath: hermite
		};

		const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
		const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
		const mesh = this.curve = new THREE.Mesh( geometry, material );

		SceneService.add( mesh );

	}

	findIntersectionsSlow ( roads: TvRoad[] ): TempIntersection[] {

		const step = 1;

		const pointCache: any[] = [];

		// const t1 = performance.now();

		for ( let i = 0; i < roads.length; i++ ) {

			const road = roads[ i ];

			const positions: any[] = [];

			const geom = {
				road: road.id,
				positions: positions,
			};

			const geometries = road.geometries;

			for ( let g = 0; g < geometries.length; g++ ) {

				const geometry = geometries[ g ];

				const posTheta = new TvPosTheta();

				for ( let s = geometry.s; s <= geometry.s2; s += step ) {

					geometry.getCoords( s, posTheta );

					positions.push( { x: posTheta.x, y: posTheta.y, z: 0, s: s } );

				}
			}

			pointCache.push( geom );
		}

		// const t2 = performance.now();

		// const timeToMakeGeometries = t2 - t1; console.log( "step-1", timeToMakeGeometries );

		const intersections: TempIntersection[] = [];

		for ( let i = 0; i < pointCache.length; i++ ) {

			const points = pointCache[ i ].positions;

			for ( let j = i + 1; j < pointCache.length; j++ ) {

				const otherPoints = pointCache[ j ].positions;

				for ( let k = 0; k < otherPoints.length; k++ ) {

					const otherPoint = otherPoints[ k ];

					for ( let l = 0; l < points.length; l++ ) {

						const point = points[ l ];

						// const distance = position.distanceTo( otherPosition );

						const distance = Math.sqrt(
							( point.x - otherPoint.x ) * ( point.x - otherPoint.x ) +
							( point.y - otherPoint.y ) * ( point.y - otherPoint.y )
						);

						if ( distance < ( step * 0.9 ) ) {

							intersections.push( {
								x: point.x,
								y: point.y,
								s1: point.s,
								s2: otherPoint.s,
								road1: pointCache[ i ].road,
								road2: pointCache[ j ].road,
								coordA: new TvRoadCoord( pointCache[ i ].road, point.s ),
								coordB: new TvRoadCoord( pointCache[ j ].road, otherPoint.s ),
							} );

							// skip a few steps
							l += step * 2;
							k += step * 2;
						}
					}
				}
			}
		}

		// const t3 = performance.now();

		// const timeToFindIntersections = t3 - t2; console.log( "step2", timeToFindIntersections );

		return intersections;
	}

	calculateDistance ( roadAHdg: number, roadBHdg: number ) {

		// const roadA = this.openDrive.getRoadById( coordA.roadId );
		// const roadB = this.openDrive.getRoadById( coordB.roadId );

		// const roadAHdg = roadA.getRoadPosition( coordA.s ).hdg;
		// const roadBHdg = roadB.getRoadPosition( coordB.s ).hdg;

		let hdgDifference: number;

		if ( roadAHdg > roadBHdg ) {
			hdgDifference = roadAHdg - roadBHdg;
		} else {
			hdgDifference = roadBHdg - roadAHdg;
		}

		const absDifference = Math.abs( hdgDifference );

		// const absDifference = Maths.clamp( Math.abs( hdgDifference ), 0, Maths.M_PI_2 );

		// const sDirection = this.calculateSDirection( roadAHdg, roadBHdg );

		const distanceFromJunction = Math.abs( Maths.M_PI - absDifference ) * 1.5;

		return distanceFromJunction;
	}

	calculateSDirection ( hdgA, hdgB ): TvDirection {

		let difference;

		if ( hdgA > hdgB ) {

			difference = hdgB - hdgA;

		} else {

			difference = hdgA - hdgB;

		}

		return Math.abs( difference ) > Maths.M_PI_2 ?
			TvDirection.OPPOSITE :
			TvDirection.SAME;
	}

	toPositiveAngle ( angle: number ) {

		angle = angle % ( Math.PI * 2 );

		while ( angle < 0 ) {

			angle += Math.PI * 2;

		}

		return angle;
	}

	prepareJunctionConnections ( junctions: any[] ): IJunctionConnection[] {

		const connections: IJunctionConnection[] = [];

		for ( let i = 0; i < junctions.length; i++ ) {

			const junction = junctions[ i ];

			// point of intersection
			this.pointEditor.addControlPoint( junction.position );

			const dots = this.createDotsForJunction( junction );

			// ManeuverTool.createConnections( [ junction.road1, junction.road2 ], dots ).forEach( connection => {

			//     connections.push( connection );

			// } );

		}

		return connections;
	}

	createDotsForJunction ( junction ) {

		const dots: JunctionDot[] = [];

		const road1_dots = AutoManeuverTool.createDots(
			junction.road1,
			junction.position,
			junction.road1_s,
			junction.road1_StartS,
			junction.road1_EndS
		);

		const road2_dots = AutoManeuverTool.createDots(
			junction.road2,
			junction.position,
			junction.road2_s,
			junction.road2_StartS,
			junction.road2_EndS
		);

		road1_dots.forEach( dot => dots.push( dot ) );

		road2_dots.forEach( dot => dots.push( dot ) );

		dots.forEach( dot => {

			dot.sDirection = junction.sDirection;

			const cp = this.pointEditor.addControlPoint( dot.position, null, 20 );

			( cp.material as PointsMaterial ).color.set( dot.color );

		} );

		return dots;
	}

	calculateJunctionDistances ( coordA: TvRoadCoord, coordB: TvRoadCoord ) {

		const result: { start: TvRoadCoord, end: TvRoadCoord }[] = [];

		const coords: TvRoadCoord[] = [];

		const roadA = this.map.getRoadById( coordA.roadId );
		const roadB = this.map.getRoadById( coordB.roadId );

		const roadALeftWidth = roadA.getLeftSideWidth( coordA.s );
		const roadARightWidth = roadA.getRightsideWidth( coordA.s );

		const roadBLeftWidth = roadB.getLeftSideWidth( coordB.s );
		const roadBRightWidth = roadB.getRightsideWidth( coordB.s );

		const roadAHdg = roadA.getRoadPosition( coordA.s ).hdg;
		const roadBHdg = roadB.getRoadPosition( coordB.s ).hdg;

		let roadAStart, roadAEnd, roadBStart, roadBEnd;

		const distanceFromJunction = this.calculateDistance( roadAHdg, roadBHdg );

		const sDirection = this.calculateSDirection( roadAHdg, roadBHdg );

		if ( sDirection === TvDirection.SAME ) {

			roadAStart = coordA.s - roadBLeftWidth - distanceFromJunction;
			roadAEnd = coordA.s + roadBRightWidth + distanceFromJunction;

			roadBStart = coordB.s - roadALeftWidth - distanceFromJunction;
			roadBEnd = coordB.s + roadARightWidth + distanceFromJunction;

		} else {

			roadAStart = coordA.s - roadBLeftWidth - distanceFromJunction;
			roadAEnd = coordA.s + roadBRightWidth + distanceFromJunction;

			roadBStart = coordB.s - roadALeftWidth - distanceFromJunction;
			roadBEnd = coordB.s + roadARightWidth + distanceFromJunction;

		}

		result.push( {
			start: new TvRoadCoord( coordA.roadId, roadAStart ),
			end: new TvRoadCoord( coordA.roadId, roadAEnd ),
		} );

		coords.push( new TvRoadCoord( coordA.roadId, roadAStart ) );
		coords.push( new TvRoadCoord( coordA.roadId, roadAEnd ) );

		result.push( {
			start: new TvRoadCoord( coordB.roadId, roadBStart ),
			end: new TvRoadCoord( coordB.roadId, roadBEnd ),
		} );

		coords.push( new TvRoadCoord( coordB.roadId, roadBStart ) );
		coords.push( new TvRoadCoord( coordB.roadId, roadBEnd ) );

		return result;
	}

	checkJunctionEntryInteraction ( event: PointerEventData ): boolean {

		if ( event.button !== MouseButton.LEFT ) return;

		let hasInteracted = false;

		for ( let i = 0; i < event.intersections.length; i++ ) {

			const intersection = event.intersections[ i ];

			if ( intersection.object[ 'tag' ] === JunctionEntryObject.tag ) {

				hasInteracted = true;

				console.log( 'junction-entry' );

				break;
			}
		}

		return hasInteracted;
	}

	createJunctionAreas ( intersections: any[] ) {

		const junctions: {
			position,
			sDirection,
			road1,
			road1_s,
			road1_hdg,
			road1_StartS,
			road1_EndS,
			road2,
			road2_s,
			road2_hdg,
			road2_StartS,
			road2_EndS
		}[] = [];

		for ( let i = 0; i < intersections.length; i++ ) {

			const intersection = intersections[ i ];

			const position = new Vector3( intersection.x, intersection.y, 0 );

			const road_1 = TvMapInstance.map.getRoadById( intersection.road1 );
			const road_2 = TvMapInstance.map.getRoadById( intersection.road2 );

			const road1_s = intersection.s1;
			const road2_s = intersection.s2;

			let road1_LeftWidth = 0;
			let road1_RightWidth = 0;

			road_1.getLaneSectionAt( road1_s ).getLeftLanes().forEach( lane => {
				road1_LeftWidth += lane.getWidthValue( road1_s );
			} );
			road_1.getLaneSectionAt( road1_s ).getRightLanes().forEach( lane => {
				road1_RightWidth += lane.getWidthValue( road1_s );
			} );

			let road2_LeftWidth = 0;
			let road2_RightWidth = 0;

			road_2.getLaneSectionAt( road2_s ).getLeftLanes().forEach( lane => {
				road2_LeftWidth += lane.getWidthValue( road2_s );
			} );
			road_2.getLaneSectionAt( road2_s ).getRightLanes().forEach( lane => {
				road2_RightWidth += lane.getWidthValue( road2_s );
			} );

			let hdg1 = road_1.getPositionAt( road1_s, 0 ).hdg * Maths.Rad2Deg;
			let hdg2 = road_2.getPositionAt( road2_s, 0 ).hdg * Maths.Rad2Deg;

			let difference = ( hdg2 - hdg1 ) % 360;

			let road1_StartS, road1_EndS, road2_StartS, road2_EndS;

			let sDirection;

			// same
			if ( difference > 0 && difference < 180 ) {

				sDirection = 'same';

				let distanceFromJunction = Math.abs( 90 - difference ) * 0.2 + 2.5;

				road1_StartS = road1_s - road2_LeftWidth - distanceFromJunction;
				road1_EndS = road1_s + road2_RightWidth + distanceFromJunction;

				road2_StartS = road2_s - road1_LeftWidth - distanceFromJunction;
				road2_EndS = road2_s + road1_RightWidth + distanceFromJunction;

			} else {

				sDirection = 'opposite';

				let distanceFromJunction = Math.abs( 90 - Math.abs( difference ) ) * 0.2 + 2.5;

				road1_StartS = road1_s - road2_LeftWidth - distanceFromJunction;
				road1_EndS = road1_s + road2_RightWidth + distanceFromJunction;

				road2_StartS = road2_s - road1_LeftWidth - distanceFromJunction;
				road2_EndS = road2_s + road1_RightWidth + distanceFromJunction;

			}

			junctions.push( {
				position,
				sDirection,
				road1: road_1,
				road1_s,
				road1_hdg: hdg1,
				road1_StartS,
				road1_EndS,
				road2: road_2,
				road2_s,
				road2_hdg: hdg2,
				road2_StartS,
				road2_EndS
			} );
		}

		return junctions;
	}

	makeJunctionConnectionPath (
		incomingRoad: TvRoad,
		connectingRoad: TvRoad,
		connection: TvJunctionConnection,
		link: TvJunctionLaneLink
	) {

		// 1. find connection positions which are basically dots
		// 2. find whether this connection is straight,left,right based on start->end position relation

		let start: Vector3, end: Vector3;

		if ( connection.contactPoint === 'start' ) {

			start = TvMapQueries.getLanePosition(
				connectingRoad.id,
				link.to,
				0,
			);

			end = TvMapQueries.getLanePosition(
				connectingRoad.id,
				link.to,
				connectingRoad.length,
			);


		} else {

			start = TvMapQueries.getLanePosition(
				connectingRoad.id,
				link.to,
				connectingRoad.length,
			);

			end = TvMapQueries.getLanePosition(
				connectingRoad.id,
				link.to,
				0,
			);

		}

		// SceneService.add( new JunctionEntryObject( "start-dot", start, OdContactPoints.START, incomingRoad, link.from ) );
		// SceneService.add( new JunctionEntryObject( "start-dot", end, OdContactPoints.END, incomingRoad, link.from ) );

		if ( !link.lanePath ) {

			link.lanePath = LanePathFactory.create( incomingRoad, connectingRoad, connection, link );

			SceneService.add( link.lanePath );

		} else {

			link.lanePath.visible = true;

		}


		// //////////////////////////////////////////////////////////////

		// const spline = connectingRoad.spline;

		// const shape = new THREE.Shape(); shape.moveTo( 0, -0.3 ); shape.lineTo( 0, 0.3 );

		// if ( spline.controlPointPositions.length < 2 ) return;

		// let offset = targetLaneWidth;

		// if ( targetLane.id < 0 ) offset *= -1;

		// const path = new ExplicitSplinePath( spline as ExplicitSpline, offset );

		// // const extrudeSettings = {
		// //     steps: path.getLength() * 2,
		// //     bevelEnabled: false,
		// //     extrudePath: path
		// // };

		// // const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
		// // const material = new THREE.MeshBasicMaterial( {
		// //     color: 0x00ff00,
		// //     wireframe: false,
		// //     opacity: 0.5,
		// //     transparent: true,
		// //     map: OdTextures.asphalt
		// // } );

		// // link.mesh = new THREE.Mesh( geometry, material );

		// // link.mesh.renderOrder = 3;

		// // SceneService.add( link.mesh );

		// const lineMaterial = new LineBasicMaterial( {
		//     color: 0x00ff00,
		//     linewidth: 100,
		//     opacity: 0.5,
		//     transparent: true,
		// } );

		// const lineGeometry = new BufferGeometry().setFromPoints( path.getSpacedPoints( 50 ) );

		// link.mesh = new Line( lineGeometry, lineMaterial );

		// link.mesh.castShadow = true;

		// link.mesh.renderOrder = 3;

		// link.mesh.frustumCulled = false;

		// SceneService.add( link.mesh );
	}

	// create multiple roads
	createStraightIntersectionRoad ( incomingRoad: TvRoad, sStart, sIntersection, sEnd, spline: AbstractSpline ) {


	}

	/**
	 *
	 * @param junctionId
	 * @param connection
	 * @deprecated not working
	 */
	createStraightJunctionRoad ( junctionId: number, connection: IJunctionConnection ) {

		const incomingRoad = this.map.getRoadById( connection.entry.roadId );
		const incomingLane = connection.entry.laneId;

		const originalLenth = incomingRoad.length;

		// change geometry of road 1
		const startPos = new TvPosTheta();
		const endPos = new TvPosTheta();

		incomingRoad.getGeometryCoordsAt( connection.entry.s, 0, startPos );
		incomingRoad.getGeometryCoordsAt( connection.exit.s, 0, endPos );

		const laneSection = incomingRoad.getLaneSectionAt( connection.entry.s );
		const geometry = incomingRoad.getGeometryAt( connection.entry.s );

		// split
		incomingRoad.split( connection.exit.s );

		// connecting road

		const connectingRoadLength = connection.exit.s - connection.entry.s;

		const connectingRoad = new TvRoad( 'Connecting', connectingRoadLength, this.map.roads.size, -1 );

		connection.spline.exportGeometries().forEach( g => connectingRoad.addGeometry( g ) );


		// outgoing road

		const outgoingRoadLength = originalLenth - connection.exit.s;

		const outgoingRoad = new TvRoad( 'Outgoing', outgoingRoadLength, this.map.roads.size, -1 );


		// update incoming finally

		incomingRoad.length = connection.entry.s;

		geometry.length = geometry.length - outgoingRoadLength - connectingRoadLength;

		return {
			incoming: incomingRoad,
			connecting: connectingRoad,
			outgoing: outgoingRoad
		};

	}
}
