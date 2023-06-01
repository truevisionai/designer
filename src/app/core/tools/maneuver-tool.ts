/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { JunctionEntryObject } from 'app/modules/three-js/objects/junction-entry.object';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { OdLaneDirectionBuilder } from 'app/modules/tv-map/builders/od-lane-direction-builder';
import { TvContactPoint, TvElementType, TvLaneSide, TvLaneType } from 'app/modules/tv-map/models/tv-common';
import { TvJunction } from 'app/modules/tv-map/models/tv-junction';
import { TvJunctionConnection } from 'app/modules/tv-map/models/tv-junction-connection';
import { LanePathObject, TvJunctionLaneLink } from 'app/modules/tv-map/models/tv-junction-lane-link';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { CommandHistory } from 'app/services/command-history';
import { SnackBar } from 'app/services/snack-bar.service';
import { JunctionEntryInspector } from 'app/views/inspectors/junction-entry-inspector/junction-entry-inspector.component';
import { LaneLinkInspector } from 'app/views/inspectors/lane-link-inspector/lane-link-inspector.component';
import { RoadControlPointInspector } from 'app/views/inspectors/road-control-point-inspector/road-control-point-inspector.component';
import { Vector3 } from 'three';
import { AddConnectionCommand } from '../commands/add-connection-command';
import { MultiCmdsCommand } from '../commands/multi-cmds-command';
import { SetInspectorCommand } from '../commands/set-inspector-command';
import { UpdateRoadPointCommand } from '../commands/update-road-point-command';
import { LanePathFactory } from '../factories/lane-path-factory.service';
import { RoadFactory } from '../factories/road-factory.service';
import { KeyboardInput } from '../input';
import { PickingHelper } from '../services/picking-helper.service';
import { SceneService } from '../services/scene.service';
import { AutoSpline } from '../shapes/auto-spline';
import { BaseTool } from './base-tool';
import { ToolType } from '../models/tool-types.enum';

const DEFAULT_SIDE = TvLaneSide.RIGHT;

export class ManeuverTool extends BaseTool {

	name: string = 'ManeuverTool';
	toolType = ToolType.Maneuver;

	public connectingRoad: TvRoad;

	public roadControlPoint: RoadControlPoint;

	public lanePathObject: LanePathObject;

	private pointerDown = false;

	private pointerDownAt: Vector3;

	private roadChanged = false;

	private junctionEntryObjects = [];
	private lanePathObjects = [];

	private laneDirectionHelper = new OdLaneDirectionBuilder( null );

	public junctionEntryObject: JunctionEntryObject;

	init () {


	}

	enable () {

		super.enable();

		this.junctionEntryObject = null;
		this.lanePathObject = null;
		this.connectingRoad = null;
		this.roadControlPoint = null;

		this.showJunctionEntries();

		this.showLanePathObjects();
	}

	disable () {

		super.disable();

		this.junctionEntryObject = null;
		this.lanePathObject = null;
		this.connectingRoad = null;
		this.roadControlPoint = null;

		this.hideJunctionEntries();

		this.hideLanePathObjects();

		this.laneDirectionHelper.clear();
	}

	onPointerDown ( e: PointerEventData ) {

		if ( e.button === MouseButton.RIGHT || e.button === MouseButton.MIDDLE ) return;

		this.pointerDown = true;

		this.pointerDownAt = e.point.clone();

		const shiftKeyDown = KeyboardInput.isShiftKeyDown;

		let hasInteracted = false;

		if ( !shiftKeyDown && !hasInteracted ) hasInteracted = this.checkRoadControlPointInteraction( e );

		if ( !shiftKeyDown && !hasInteracted ) hasInteracted = this.checkJunctionEntryInteraction( e );

		if ( !shiftKeyDown && !hasInteracted ) hasInteracted = this.checkPathInteraction( e );

		if ( !hasInteracted ) {

			const commands = [];

			commands.push( new SetInspectorCommand( null, null ) );

			CommandHistory.execute( new MultiCmdsCommand( commands ) );

			if ( this.connectingRoad ) {

				this.connectingRoad.hideNodes();
				this.connectingRoad.spline.hide();
			}

			// if ( this.lanePathObject ) this.lanePathObject.visible = false;
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

		this.pointerDown = false;

		this.roadChanged = false;

		this.pointerDownAt = null;
	}

	onPointerMoved ( e: PointerEventData ) {

		if ( this.pointerDown && this.roadControlPoint && this.connectingRoad ) {

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

			// tslint:disable-next-line: no-string-literal
			if ( intersection.object[ 'tag' ] === LanePathObject.tag ) {

				hasInteracted = true;

				this.lanePathObject = intersection.object.parent as LanePathObject;

				const commands = [];

				this.connectingRoad = this.lanePathObject.connectingRoad;

				commands.push( new SetInspectorCommand( LaneLinkInspector, this.lanePathObject ) );

				CommandHistory.execute( new MultiCmdsCommand( commands ) );

				break;
			}
		}

		return hasInteracted;
	}

	checkJunctionEntryInteraction ( event: PointerEventData ): boolean {

		if ( event.button !== MouseButton.LEFT ) return;

		let hasInteracted = false;

		for ( let i = 0; i < event.intersections.length; i++ ) {

			const intersection = event.intersections[ i ];

			// tslint:disable-next-line: no-string-literal
			if ( intersection.object[ 'tag' ] === JunctionEntryObject.tag ) {

				hasInteracted = true;

				const junctionObject = intersection.object as JunctionEntryObject;

				const tryToConnect = this.junctionEntryObject && junctionObject;

				if ( tryToConnect ) {

					this.connectJunctionObject( this.junctionEntryObject, junctionObject );

					// const junctionEntryObject = created ? null : junctionObject;

					// CommandHistory.executeAll( [

					//     new SetValueCommand( this, 'junctionEntryObject', junctionEntryObject ),

					//     new SetInspectorCommand( JunctionEntryInspector, junctionObject ),

					// ] );

				} else {

					CommandHistory.executeAll( [

						new SetValueCommand( this, 'junctionEntryObject', junctionObject ),

						new SetInspectorCommand( JunctionEntryInspector, junctionObject ),

					] );

				}

				break;
			}
		}

		if ( !hasInteracted ) {

			CommandHistory.executeAll( [

				new SetValueCommand( this, 'junctionEntryObject', null ),

				new SetInspectorCommand( null, null )

			] );

		}

		return hasInteracted;
	}

	checkRoadControlPointInteraction ( e: PointerEventData ): boolean {

		// return if no connectingRoad is selected
		if ( !this.connectingRoad || !this.connectingRoad.spline ) return false;

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

			CommandHistory.executeAll( [

				new SetValueCommand( this, 'roadControlPoint', roadControlPoint ),

				new SetInspectorCommand( RoadControlPointInspector, roadControlPoint ),

			] );

		} else {

			CommandHistory.executeAll( [

				new SetValueCommand( this, 'roadControlPoint', null ),

				new SetInspectorCommand( null, null ),

			] );

		}

		return roadControlPoint != null;
	}

	connectJunctionObject ( a: JunctionEntryObject, b: JunctionEntryObject ): void {

		if ( a == null || b == null ) return;

		if ( a.id === b.id ) {

			CommandHistory.execute( new SetValueCommand( this, 'junctionEntryObject', null ) );

			SnackBar.error( 'Select a different entry/exit' );

			return;
		}

		const entryExitSide = this.findEntryExitSide( a, b );

		if ( !entryExitSide ) {

			CommandHistory.execute( new SetValueCommand( this, 'junctionEntryObject', null ) );

			SnackBar.error( 'Cannot connect' );

			return;
		}

		const entry = entryExitSide.entry;
		const exit = entryExitSide.exit;

		// if ( this.connectingRoad ) {

		//     this.connectingRoad.hideNodes();
		//     this.connectingRoad.spline.hide();
		// }

		try {

			const junction = this.findJunction( a, b );

			const result = this.hasConnection( junction, entry, exit );

			if ( result.connectionFound && result.laneLinkFound ) {

				CommandHistory.execute( new SetValueCommand( this, 'junctionEntryObject', null ) );

				SnackBar.error( 'Connection already exists' );

			} else if ( result.connectionFound && !result.laneLinkFound ) {

				CommandHistory.execute( new SetValueCommand( this, 'junctionEntryObject', null ) );

				// this.createLink( result.connection, entry, exit, side, laneWidth, junction );

				// SnackBar.success( "Connection created" );

			} else if ( !result.connectionFound && !result.laneLinkFound ) {

				this.createNewConnection( entry, exit, junction );

				SnackBar.success( 'Connection created' );
			}

		} catch ( error ) {

			console.log( error );

			return;
		}

	}

	createNewConnection ( entry: JunctionEntryObject, exit: JunctionEntryObject, junction: TvJunction ) {

		// for connection
		// create road
		// create connection and link
		// set neighbours
		// set lane sucessor/predessor
		// create lane path

		// const laneWidth = entry.lane.getWidthValue( 0 );

		// const connectingRoad = this.createConnectingRoad( entry, exit, DEFAULT_SIDE, laneWidth, junction );

		// const result = this.createConnections( junction, entry, connectingRoad, exit );

		// if ( result == null ) return;

		// const connection = result.connection;

		// const link = result.link;

		// // TODO: find the connecting lane
		// const lane = connectingRoad.getFirstLaneSection().getLaneById( -1 );

		// const lanePathObject = result.link.mesh = LanePathFactory.createPathForLane(
		//     entry.road, connectingRoad, lane, result.connection, result.link
		// );

		// this.lanePathObjects.push( this.lanePathObject );

		// SceneService.add( lanePathObject );

		// RoadFactory.rebuildRoad( connectingRoad );

		// this.connectingRoad = connectingRoad;


		// set value command - connectingRoad
		// set value command - lanePathObject
		// set


		CommandHistory.executeAll( [

			// new SetValueCommand( this, 'lanePathObject', lanePathObject ),

			// new SetValueCommand( this, 'connectingRoad', connectingRoad ),

			new SetValueCommand( this, 'junctionEntryObject', null ),

			new SetInspectorCommand( null, null ),

			new AddConnectionCommand( entry, exit, junction, this ),

		] );


	}

	/**
	 *
	 * @deprecated currently not being used
	 * @param connection
	 * @param entry
	 * @param exit
	 * @param side
	 * @param laneWidth
	 * @param junction
	 */
	createLink (
		connection: TvJunctionConnection,
		entry: JunctionEntryObject,
		exit: JunctionEntryObject,
		side: TvLaneSide,
		laneWidth: number,
		junction: TvJunction
	) {

		const connectionRoad = this.map.getRoadById( connection.connectingRoad );

		const laneSection = connectionRoad.getFirstLaneSection();

		// -ve because its always for right side
		const newLaneId = -1 * ( laneSection.getRightLaneCount() + 1 );

		const nodes = this.getSplinePositions( entry, exit, side );

		const connectingLane = laneSection.addLane( nodes.side, newLaneId, entry.lane.type, entry.lane.level, true );

		connectingLane.addWidthRecord( 0, laneWidth, 0, 0, 0 );

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		connectionRoad.setPredecessor( 'road', entry.road.id, entry.contact );

		connectionRoad.setSuccessor( 'road', exit.road.id, exit.contact );

		connectingLane.setPredecessor( entry.lane.id );

		connectingLane.setSuccessor( exit.lane.id );

		const link = connection.addNewLink( entry.lane.id, connectingLane.id );

		if ( entry.contact === TvContactPoint.START ) {

			entry.road.setPredecessor( 'junction', junction.id );

		} else if ( entry.contact === TvContactPoint.END ) {

			entry.road.setSuccessor( 'junction', junction.id );

		}

		if ( exit.contact === TvContactPoint.START ) {

			exit.road.setPredecessor( 'junction', junction.id );

		} else if ( exit.contact === TvContactPoint.END ) {

			exit.road.setSuccessor( 'junction', junction.id );

		}

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		this.lanePathObject = LanePathFactory.createPathForLane( entry.road, this.connectingRoad, connectingLane, connection, link );

		this.lanePathObjects.push( this.lanePathObject );

		SceneService.add( this.lanePathObject );

		RoadFactory.rebuildRoad( this.connectingRoad );

	}

	createConnectingRoad ( entry, exit, side, laneWidth, junction ) {

		const spline = this.createSpline( entry, exit, side );

		const connectingRoad = this.map.addConnectingRoad( DEFAULT_SIDE, laneWidth, junction.id );

		connectingRoad.spline = spline;

		connectingRoad.updateGeometryFromSpline();

		connectingRoad.spline.hide();

		return connectingRoad;
	}

	createSpline ( entry, exit, side ) {

		const nodes = this.getSplinePositions( entry, exit, side );

		const spline = new AutoSpline();

		SceneService.add( spline.addControlPointAt( nodes.start ) );
		SceneService.add( spline.addControlPointAt( nodes.a2.toVector3() ) );
		SceneService.add( spline.addControlPointAt( nodes.b2.toVector3() ) );
		SceneService.add( spline.addControlPointAt( nodes.end ) );

		spline.controlPoints.forEach( ( cp: RoadControlPoint ) => cp.allowChange = false );

		return spline;
	}

	findEntryExitSide ( a: JunctionEntryObject, b: JunctionEntryObject ) {

		const isAEntry =
			( a.lane.direction === 'forward' && a.contact === TvContactPoint.END ) ||
			( a.lane.direction === 'backward' && a.contact === TvContactPoint.START );

		const isBEntry =
			( b.lane.direction === 'forward' && b.contact === TvContactPoint.END ) ||
			( b.lane.direction === 'backward' && b.contact === TvContactPoint.START );

		const isAExit =
			( a.lane.direction === 'forward' && a.contact === TvContactPoint.START ) ||
			( a.lane.direction === 'backward' && a.contact === TvContactPoint.END );

		const isBExit =
			( b.lane.direction === 'forward' && b.contact === TvContactPoint.START ) ||
			( b.lane.direction === 'backward' && b.contact === TvContactPoint.END );


		if ( isAEntry && isBExit ) {

			return {
				entry: a,
				exit: b,
				side: TvLaneSide.RIGHT
			};

			// return [ a, b, LaneSide.LEFT ];

		} else if ( isAExit && isBEntry ) {

			return {
				entry: b,
				exit: a,
				side: TvLaneSide.RIGHT
			};

			// return [ b, a, LaneSide.RIGHT ];

		} else {

			a.unselect();

			b.unselect();

			return;
		}
	}

	// hasConnection ( junction: OdJunction, a: JunctionEntryObject, b: JunctionEntryObject, result?: any ) {

	//     let connectionFound = false;
	//     let connection: OdJunctionConnection = null;
	//     let laneLinkFound = false;
	//     let laneLink: OdJunctionLaneLink = null;

	//     this.openDrive.roads.forEach( road => {

	//         if ( road.isJunction ) {

	//             const connectionFound =
	//                 road.predecessor.elementId === a.road.id &&
	//                 road.successor.elementId === b.road.id;

	//             const connectingLane = road.getFirstLaneSection().getLaneVector()
	//                 .find( lane => lane.predecessor === a.lane.id && lane.succcessor === b.lane.id );

	//             // const connection = [ ...junction.connections.values() ]
	//             //     .find( i => i.incomingRoad === a.road.id && i.connectingRoad === road.id );

	//             // const linkSide = link.from > 0 ? LaneSide.LEFT : LaneSide.RIGHT;
	//             // const aSide = a.lane.id > 0 ? LaneSide.LEFT : LaneSide.RIGHT;
	//             // const laneSideMatches = linkSide === aSide;

	//             if ( connectionFound && connectingLane != null ) {

	//                 // connection and lane both found


	//             } else if ( connectionFound && connectingLane == null ) {

	//                 // create lane-link

	//             } else if ( !connectionFound && connectingLane == null ) {

	//                 // create connection and lane-link

	//             }

	//         }

	//     } );

	//     return { connectionFound, connection, laneLinkFound, laneLink };
	// }

	// hasConnection ( junction: OdJunction, a: JunctionEntryObject, b: JunctionEntryObject, result?: any ) {

	//     let connectionFound = false;
	//     let connection: OdJunctionConnection = null;
	//     let laneLinkFound = false;
	//     let laneLink: OdJunctionLaneLink = null;

	//     for ( const item of junction.connections ) {

	//         if ( item[ 1 ].incomingRoad === a.road.id ) {

	//             const incomingRoad = a.road;

	//             const connectingRoad = this.openDrive.getRoadById( item[ 1 ].connectingRoad );

	//             const outgoingRoad = b.road;

	//             const outgoingRoadMatches =
	//                 connectingRoad.successor.elementId === outgoingRoad.id ||
	//                 connectingRoad.predecessor.elementId === outgoingRoad.id;

	//             if ( outgoingRoadMatches ) {

	//                 for ( const link of item[ 1 ].laneLink ) {

	//                     const linkSide = link.from > 0 ? LaneSide.LEFT : LaneSide.RIGHT;

	//                     const aSide = a.lane.id > 0 ? LaneSide.LEFT : LaneSide.RIGHT;

	//                     const laneSideMatches = linkSide === aSide;

	//                     if ( laneSideMatches ) {

	//                         connectionFound = true;

	//                         connection = result = item[ 1 ];

	//                         const sameLaneId = Math.abs( a.lane.id ) === Math.abs( b.lane.id );

	//                         // const connectingLane = connectingRoad.getFirstLaneSection().getLaneById( link.to );

	//                         const connectingLane = connectingRoad
	//                             .getFirstLaneSection()
	//                             .getLaneVector()
	//                             .find( i => i.predecessor === a.lane.id && i.succcessor === b.lane.id );

	//                         laneLinkFound = link.from === a.lane.id && connectingLane != null;

	//                         laneLink = link;

	//                         // we dont want to break the loop unless we have found the right link
	//                         if ( laneLinkFound ) break;
	//                     }
	//                 }
	//             }

	//             if ( connectionFound ) break;
	//         }
	//     }

	//     return { connectionFound, connection, laneLinkFound, laneLink };
	// }

	hasConnection ( junction: TvJunction, a: JunctionEntryObject, b: JunctionEntryObject, result?: any ) {

		let connectionFound = false;
		let connection: TvJunctionConnection = null;
		let laneLinkFound = false;
		let laneLink: TvJunctionLaneLink = null;

		for ( const item of junction.connections ) {

			if ( item[ 1 ].incomingRoad === a.road.id ) {

				const incomingRoad = a.road;

				const connectingRoad = this.map.getRoadById( item[ 1 ].connectingRoad );

				const outgoingRoad = b.road;

				const outgoingRoadMatches =
					connectingRoad.successor.elementId === outgoingRoad.id ||
					connectingRoad.predecessor.elementId === outgoingRoad.id;

				if ( outgoingRoadMatches ) {

					for ( const link of item[ 1 ].laneLink ) {

						connection = result = item[ 1 ];

						const connectingLane = connectingRoad
							.getFirstLaneSection()
							.getLaneVector()
							.find( i => i.predecessor === a.lane.id && i.succcessor === b.lane.id );

						// basically if the same lane link is found only then it will
						// return as connection found
						// for now we will create a new connection for every lane
						// TODO: fix this to combine lane links in 1 connection
						connectionFound = laneLinkFound = link.from === a.lane.id && connectingLane != null;

						laneLink = link;

						// we dont want to break the loop unless we have found the right link
						if ( laneLinkFound ) break;
					}
				}

				if ( connectionFound ) break;
			}
		}

		return { connectionFound, connection, laneLinkFound, laneLink };
	}

	// start position is always at the entry
	// end position is always at the exit
	getSplinePositions ( entry: JunctionEntryObject, exit: JunctionEntryObject, laneSide: TvLaneSide ) {

		const as = entry.contact === TvContactPoint.START ? 0 : entry.road.length;
		const aPosTheta = new TvPosTheta();
		const aPosition = TvMapQueries.getLaneStartPosition( entry.road.id, entry.lane.id, as, 0, aPosTheta );

		const bs = exit.contact === TvContactPoint.START ? 0 : exit.road.length;
		const bPosTheta = new TvPosTheta();
		const bPosition = TvMapQueries.getLaneStartPosition( exit.road.id, exit.lane.id, bs, 0, bPosTheta );

		let a2: TvPosTheta;
		let b2: TvPosTheta;

		const distance = aPosition.distanceTo( bPosition ) * 0.3;

		if ( entry.contact === TvContactPoint.START && exit.contact === TvContactPoint.START ) {

			a2 = aPosTheta.moveForward( -distance );
			b2 = bPosTheta.moveForward( -distance );

		} else if ( entry.contact === TvContactPoint.START && exit.contact === TvContactPoint.END ) {

			a2 = aPosTheta.moveForward( -distance );
			b2 = bPosTheta.moveForward( +distance );

		} else if ( entry.contact === TvContactPoint.END && exit.contact === TvContactPoint.END ) {

			a2 = aPosTheta.moveForward( +distance );
			b2 = bPosTheta.moveForward( +distance );

		} else if ( entry.contact === TvContactPoint.END && exit.contact === TvContactPoint.START ) {

			a2 = aPosTheta.moveForward( +distance );
			b2 = bPosTheta.moveForward( -distance );

		}

		return {
			side: laneSide,
			start: aPosition,
			startPos: aPosTheta,
			end: bPosition,
			endPos: bPosTheta,
			a2: a2,
			b2: b2,
		};
	}

	findJunction ( a: JunctionEntryObject, b: JunctionEntryObject ) {

		// the nearest junction
		let nearestJunction: TvJunction = null;
		let nearestDistance = Number.MAX_VALUE;

		this.map.junctions.forEach( junction => {

			if ( !junction.position && junction.connections.size > 0 ) {

				const firstconnection = [ ...junction.connections.values() ][ 0 ];

				const connectionRoad = this.map.getRoadById( firstconnection.connectingRoad );

				if ( firstconnection.contactPoint === TvContactPoint.START ) {

					junction.position = connectionRoad.startPosition().toVector3();

				} else {

					junction.position = connectionRoad.endPosition().toVector3();

				}

			}

			if ( junction.position ) {

				const aDistance = junction.position.distanceTo( a.position );
				const bDistance = junction.position.distanceTo( b.position );

				if ( aDistance < nearestDistance ) {

					nearestDistance = aDistance;

					nearestJunction = junction;

				}

				if ( bDistance < nearestDistance ) {

					nearestDistance = bDistance;

					nearestJunction = junction;
				}

			}

		} );

		if ( !nearestJunction ) nearestJunction = this.map.addNewJunction();

		// todo make it the mid point between a and b
		nearestJunction.position = a.position;

		return nearestJunction;
	}

	createConnections (
		junction: TvJunction, incoming: JunctionEntryObject, connectingRoad: TvRoad, outgoing: JunctionEntryObject
	) {

		this.updateNeighbors( junction, incoming, connectingRoad, outgoing );

		let connection = [ ...junction.connections.values() ]
			.find( i => i.connectingRoad === connectingRoad.id && i.incomingRoad === incoming.road.id );

		if ( !connection ) {
			connection = junction.addNewConnection( incoming.road.id, connectingRoad.id, TvContactPoint.START, outgoing.road.id );
		}

		let connectingLane = connectingRoad.getFirstLaneSection().getLaneById( -Math.abs( incoming.lane.id ) );

		if ( !connectingLane ) connectingLane = connectingRoad.getFirstLaneSection().getLaneById( -1 );

		if ( !connectingLane ) throw new Error( 'connection lane not found' );

		if ( !connectingLane ) return;

		const link = connection.addNewLink( incoming.lane.id, connectingLane.id );

		connectingLane.setPredecessor( incoming.lane.id );

		connectingLane.setSuccessor( outgoing.lane.id );

		return { connection, link };
	}

	updateNeighbors (
		junction: TvJunction,
		incoming: JunctionEntryObject,
		connectingRoad: TvRoad,
		outgoing: JunctionEntryObject
	): void {

		connectingRoad.setPredecessor( 'road', incoming.road.id, incoming.contact );

		connectingRoad.setSuccessor( 'road', outgoing.road.id, outgoing.contact );

		if ( incoming.contact === TvContactPoint.START ) {

			incoming.road.setPredecessor( 'junction', junction.id );

		} else if ( incoming.contact === TvContactPoint.END ) {

			incoming.road.setSuccessor( 'junction', junction.id );

		}

		if ( outgoing.contact === TvContactPoint.START ) {

			outgoing.road.setPredecessor( 'junction', junction.id );

		} else if ( outgoing.contact === TvContactPoint.END ) {

			outgoing.road.setSuccessor( 'junction', junction.id );

		}
	}

	showJunctionEntries () {

		this.map.roads.forEach( road => {

			if ( !road.isJunction ) {

				if ( !road.predecessor || road.predecessor.elementType === TvElementType.junction ) {

					this.showStartEntries( road );

				}

				if ( !road.successor || road.successor.elementType === TvElementType.junction ) {

					this.showEndEntries( road );

				}
			}

		} );

	}

	// showLanePathObjects () {

	//     this.openDrive.roads.forEach( road => {

	//         if ( road.isJunction ) {

	//             road.laneSections.forEach( section => {

	//                 section.getLaneVector().forEach( lane => {

	//                     if ( lane.id !== 0 && lane.type === OdLaneType.driving ) {

	//                         // TODO: pass connection and lane link as well
	//                         const lanePathObject = LanePathFactory.createPathForLane( null, road, lane, null, null );

	//                         this.lanePathObjects.push( lanePathObject );

	//                         SceneService.add( lanePathObject );

	//                     }

	//                 } )

	//             } );

	//         }

	//     } );

	// }

	showLanePathObjects () {

		this.map.junctions.forEach( junction => {

			junction.connections.forEach( connection => {

				const incomingRoad = this.map.getRoadById( connection.incomingRoad );
				const connectingRoad = this.map.getRoadById( connection.connectingRoad );

				connection.laneLink.forEach( link => {

					const connectingLane = connectingRoad.getFirstLaneSection().getLaneById( link.to );

					link.lanePath = LanePathFactory.createPathForLane( incomingRoad, connectingRoad, connectingLane, connection, link );

					SceneService.add( link.lanePath );

				} );

			} );

		} );

	}

	showStartEntries ( road: TvRoad ) {

		road.getFirstLaneSection().getLaneVector().forEach( lane => {

			if ( lane.id !== 0 && lane.type === TvLaneType.driving ) {

				this.laneDirectionHelper.drawSingleLane( road, lane );

				const position = TvMapQueries.getLanePosition( road.id, lane.id, 0 );

				const name = `road-${ road.id }-lane-${ lane.id }-${ TvContactPoint.START }`;

				const obj = new JunctionEntryObject( name, position, TvContactPoint.START, road, lane );

				this.junctionEntryObjects.push( obj );

				SceneService.add( obj );

			}

		} );
	}

	showEndEntries ( road: TvRoad ) {

		road.getLastLaneSection().getLaneVector().forEach( lane => {

			if ( lane.id !== 0 && lane.type === TvLaneType.driving ) {

				this.laneDirectionHelper.drawSingleLane( road, lane );

				const position = TvMapQueries.getLanePosition( road.id, lane.id, road.length );

				const name = `road-${ road.id }-lane-${ lane.id }-${ TvContactPoint.END }`;

				const obj = new JunctionEntryObject( name, position, TvContactPoint.END, road, lane );

				this.junctionEntryObjects.push( obj );

				SceneService.add( obj );

			}

		} );
	}

	hideJunctionEntries () {

		this.junctionEntryObjects.forEach( obj => SceneService.remove( obj ) );

		this.junctionEntryObjects.splice( 0, this.junctionEntryObjects.length );

	}

	hideLanePathObjects () {

		this.lanePathObjects.forEach( obj => SceneService.remove( obj ) );

		this.lanePathObjects.splice( 0, this.lanePathObjects.length );

		this.map.junctions.forEach( junction => {

			junction.connections.forEach( connection => {

				connection.laneLink.forEach( link => {

					if ( link.lanePath ) SceneService.remove( link.lanePath );

				} );

			} );

		} );
	}
}
