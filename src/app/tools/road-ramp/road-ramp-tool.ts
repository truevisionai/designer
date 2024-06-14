/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { Vector3 } from 'three';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { RoadRampService } from 'app/services/road/road-ramp.service';
import { LaneCoordStrategy } from 'app/core/strategies/select-strategies/on-lane-strategy';
import { SceneService } from 'app/services/scene.service';
import { AddObjectCommand } from 'app/commands/add-object-command';
import { CommandHistory } from 'app/services/command-history';
import { TvVirtualJunction } from 'app/map/models/junctions/tv-virtual-junction';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Debug } from 'app/core/utils/debug';
import { TvContactPoint } from "../../map/models/tv-common";
import { TvJunction } from "../../map/models/junctions/tv-junction";

export class RoadRampTool extends BaseTool<any> {

	name: string = 'RoadRampTool';

	toolType: ToolType = ToolType.RoadRampTool;

	private startCoord: TvLaneCoord | Vector3;

	private endCoord: TvLaneCoord | Vector3;

	private startLine: Line2;

	private referenceLine: Line2;

	constructor (
		private tool: RoadRampService,
	) {
		super();
	}

	init (): void {

		this.tool.base.reset();

		this.tool.base.addCreationStrategy( new LaneCoordStrategy() );

		this.tool.base.addSelectionStrategy( new LaneCoordStrategy() );

	}

	enable (): void {

		super.enable();

	}

	disable (): void {

		super.disable();

		this.tool.base.reset();

		if ( this.startLine ) {

			SceneService.removeFromTool( this.startLine );

			this.startLine = null;

		}

		if ( this.referenceLine ) {

			SceneService.removeFromTool( this.referenceLine );

			this.referenceLine = null;

		}
	}

	onPointerDownCreate ( e: PointerEventData ): void {

		this.tool.base.handleCreation( e, ( position ) => {

			this.handleCreation( position );

		}, ( position: Vector3 ) => {

			this.handleCreation( position );

		} );

	}

	handleCreation ( position: TvLaneCoord | Vector3 ) {

		if ( position instanceof TvLaneCoord ) {

			//

		} else if ( position instanceof Vector3 ) {

			//

		}

		if ( this.startCoord ) {

			this.endCoord = position;

			this.createRampRoad( this.startCoord, this.endCoord );

			this.startCoord = this.endCoord = null;

		} else {

			this.startCoord = position;

			this.endCoord = position;

		}
	}

	createRampRoad ( startCoord: TvLaneCoord | Vector3, endCoord: TvLaneCoord | Vector3 ) {

		if ( startCoord instanceof TvLaneCoord ) {

			const sStart = startCoord.s;

			const sEnd = sStart + 20;

			const coordA = startCoord.road.getRoadCoordAt( sStart );

			const coordB = startCoord.road.getRoadCoordAt( sEnd );

			const junction = this.tool.junctionService.createFromCoords( [ coordA, coordB ] );

			const addJunctionCommand = new AddObjectCommand( junction );

			const rampRoad = this.tool.createRampRoad( junction, startCoord, endCoord );

			const addRoadCommand = new AddObjectCommand( rampRoad );

			CommandHistory.executeMany( addRoadCommand, addJunctionCommand );

		}

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvJunction ) {

			this.tool.junctionService.addJunction( object );

		} else if ( object instanceof TvRoad ) {

			this.tool.roadService.add( object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvVirtualJunction ) {

			this.tool.mapService.map.removeJunction( object );

		} else if ( object instanceof TvRoad ) {

			this.tool.roadService.remove( object );

		}

	}

	onPointerMoved ( e: PointerEventData ) {

		// if ( this.startLine ) this.startLine.visible = false;

		// if ( this.referenceLine ) this.referenceLine.visible = false;

		this.tool.base.handleCreation( e, position => {

			this.handleMovement( position );

		}, ( position: Vector3 ) => {

			this.handleMovement( position );

		} );

	}

	handleMovement ( position: TvLaneCoord | Vector3 ) {

		if ( this.startCoord ) {

			this.showRampLine( position );

		} else {

			this.showStartLine( position );

		}

		this.endCoord = position;
	}

	showRampLine ( position: TvLaneCoord | Vector3 ) {

		const distance = this.getDistance( this.startCoord, position );

		if ( distance < 5 ) return;

		Debug.log( distance, this.startCoord, position );

		if ( !this.referenceLine ) {

			this.referenceLine = this.tool.createRampReferenceLine( this.startCoord, position );

			SceneService.addToolObject( this.referenceLine );

		}

		this.referenceLine.visible = true;

		this.referenceLine = this.tool.updateRampReferenceLine( this.referenceLine, this.startCoord, position );

	}

	getDistance ( start: TvLaneCoord | Vector3, end: TvLaneCoord | Vector3 ) {

		const v1 = start instanceof TvLaneCoord ? start.position : start;

		const v2 = end instanceof TvLaneCoord ? end.position : end;

		const distance = v1.distanceTo( v2 );

		// Debug.log( 'distance', distance, v1, v2 );

		return distance;
	}

	showStartLine ( position: TvLaneCoord | Vector3 ) {

		Debug.log( 'show start line', position );

		if ( position instanceof TvLaneCoord ) {

			if ( !this.startLine ) {

				this.startLine = this.tool.debug.createLaneWidthLine( null, position );

				SceneService.addToolObject( this.startLine );

			}

			this.startLine.visible = true;

			this.startLine = this.tool.debug.updateLaneWidthLine( this.startLine, position );

		}

	}

	updateRampRoad ( end: Vector3 | TvLaneCoord ) {

		// if ( !this.debugLine ) {

		// 	this.debugLine = this.tool.debug.createLaneWidthLine( end );

		// 	SceneService.addToolObject( this.debugLine );

		// }

		// // if ( !this.referenceLine ) {

		// // 	this.referenceLine = this.tool.debug.createLaneReferenceLine( laneCoord.lane, 'center' );

		// // 	SceneService.addToolObject( this.referenceLine );

		// // }

		// this.debugLine.visible = true;

		// // this.referenceLine.visible = true;

		// this.debugLine = this.tool.debug.updateLaneWidthLine( this.debugLine, laneCoord );

		// this.referenceLine = this.tool.debug.updateLaneReferenceLine( this.referenceLine, laneCoord, 'center' );

		// this.endCoord = e.point;

		// // if ( this.rampRoadSpline ) {
		// // 	this.roadRampService.updateRampSpline( this.rampRoadSpline, this.startCoord.position, this.endCoord, this.startCoord.posTheta.toDirectionVector() );
		// // }

		// Debug.log( 'moved', this.startCoord.position.distanceTo( e.point ), this.startCoord, this.endCoord );

	}

	// onPointerUp ( e: PointerEventData ) {

	// 	// const laneCoord = this.laneStrategy?.onPointerUp( e );

	// 	// if ( this.startCoord && this.endCoord ) {

	// 	// 	this.endCoord = laneCoord || e.point;

	// 	// 	Debug.log( 'create ramp', this.startCoord, this.endCoord );

	// 	// 	const virtualJunction = JunctionFactory.createVirtualJunction( this.startCoord.road, this.startCoord.s, this.startCoord.s + 20, TvOrientation.PLUS );

	// 	// 	const rampRoad = JunctionFactory.createRampRoad( virtualJunction, this.startCoord, this.endCoord );

	// 	// 	CommandHistory.executeMany( new AddRoadCommand( [ rampRoad ], false ), new AddJunctionCommand( virtualJunction ) );

	// 	// 	this.startCoord = null;
	// 	// 	this.endCoord = null;

	// 	// }

	// 	// if ( e.button != MouseButton.LEFT ) return;

	// 	// // Debug.log( 'is down', this.isPointerDown, this.pointerDownAt, 'up at', e.point );

	// 	// if ( this.lane && this.start ) {

	// 	// 	// Debug.log( 'create ramp', this.lane, this.start, this.end );

	// 	// 	// SceneService.add( AnyControlPoint.create( '', this.start ) );
	// 	// 	// SceneService.add( AnyControlPoint.create( '', this.end ) );

	// 	// 	const start = TvMapQueries.getLaneStartPosition( this.lane.roadId, this.lane.id, this.posTheta.s, 0 );

	// 	// 	this.makeRampRoad( start, this.end, this.posTheta );

	// 	// 	this.start = null;
	// 	// 	this.lane = null;
	// 	// 	this.end = null;

	// 	// }

	// }

	// isLaneSelected ( e: PointerEventData ): boolean {

	// 	const interactedLane = PickingHelper.checkLaneObjectInteraction( e );

	// 	if ( !interactedLane ) return false;

	// 	const posTheta = new TvPosTheta();

	// 	// getting position on track in s/t coordinates
	// 	const result = TvMapQueries.getRoadByCoords( e.point.x, e.point.y, posTheta );

	// 	// TvMapQueries.getRoadPosition( result.road.id, posTheta.s, posTheta.t );

	// 	this.start = e.point.clone();
	// 	this.posTheta = posTheta;
	// 	this.lane = interactedLane;

	// 	// this.makeSpline( this.start, this.lane, posTheta );

	// 	// get the exisiting lane road mark at s and clone it
	// 	// const roadMark = interactedLane.getRoadMarkAt( posTheta.s ).clone( posTheta.s );
	// }

	// makeRampRoad(A: Vector3, B: Vector3, posTheta: TvPosTheta) {
	//     const direction = posTheta.toDirectionVector();
	//     const normalizedDirection = direction.clone().normalize();

	//     const upVector = new Vector3(0, 0, 1);
	//     const perpendicular = normalizedDirection.clone().cross(upVector);

	//     const midPoint = A.clone().add(B).multiplyScalar(0.5);

	//     const distanceAB = A.distanceTo(B);
	//     const offsetFactor = 0.25 * distanceAB;

	//     const v2 = A.clone().add(normalizedDirection.clone().multiplyScalar(offsetFactor));
	//     const v3 = midPoint.clone().add(perpendicular.clone().multiplyScalar(offsetFactor));

	//     const road = this.models.addDefaultRoad();

	//     road.addControlPointAt(A);
	//     road.addControlPointAt(v2);
	//     road.addControlPointAt(v3);
	//     road.addControlPointAt(B);

	//     Debug.log("road", [A, v2, v3, B]);

	//     road.updateGeometryFromSpline();
	// }

	// makeRampRoad ( A: Vector3, B: Vector3, posTheta: TvPosTheta ) {

	// 	let v2, v3;

	// 	[ A, v2, v3, B ] = this.makeRampRoadPoints( A, B, posTheta.toDirectionVector() );

	// 	const newLane = this.lane.cloneAtS( -1, posTheta.s );

	// 	const road = this.models.addRampRoad( newLane );

	// 	road.addControlPointAt( A );
	// 	road.addControlPointAt( v2 );
	// 	road.addControlPointAt( v3 );
	// 	road.addControlPointAt( B );

	// 	road.updateGeometryFromSpline();

	// 	TvMapBuilder.rebuildRoad( road );
	// }

	// makeRampRoad ( A: Vector3, B: Vector3, posTheta: TvPosTheta ) {

	// 	const direction = posTheta.toDirectionVector();
	// 	const normalizedDirection = direction.clone().normalize();

	// 	const upVector = new Vector3( 0, 0, 1 );
	// 	const perpendicular = normalizedDirection.clone().cross( upVector );

	// 	const distanceAB = A.distanceTo( B );

	// 	function calculateBezier ( t, p0, p1, p2, p3 ) {
	// 		const oneMinusT = 1 - t;
	// 		return p0.clone().multiplyScalar( Math.pow( oneMinusT, 3 ) )
	// 			.add( p1.clone().multiplyScalar( 3 * t * Math.pow( oneMinusT, 2 ) ) )
	// 			.add( p2.clone().multiplyScalar( 3 * Math.pow( t, 2 ) * oneMinusT ) )
	// 			.add( p3.clone().multiplyScalar( Math.pow( t, 3 ) ) );
	// 	}

	// 	const road = this.models.addDefaultRoad();

	// 	const controlPoint1 = A.clone().add( normalizedDirection.clone().multiplyScalar( distanceAB / 3 ) );
	// 	const controlPoint2 = B.clone().add( perpendicular.clone().multiplyScalar( -distanceAB / 3 ) );

	// 	const v2 = calculateBezier( 1 / 3, A, controlPoint1, controlPoint2, B );
	// 	const v3 = calculateBezier( 2 / 3, A, controlPoint1, controlPoint2, B );

	// 	road.addControlPointAt( A );
	// 	road.addControlPointAt( v2 );
	// 	road.addControlPointAt( v3 );
	// 	road.addControlPointAt( B );

	// 	Debug.log( "road", [ A, v2, v3, B ] );

	// 	road.updateGeometryFromSpline();
	// }

}
