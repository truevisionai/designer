/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { ISelectable } from 'app/modules/three-js/objects/i-selectable';
import { JunctionEntryObject } from 'app/modules/three-js/objects/junction-entry.object';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { OdLaneDirectionBuilder } from 'app/modules/tv-map/builders/od-lane-direction-builder';
import { TvContactPoint, TvElementType, TvLaneSide, TvLaneType } from 'app/modules/tv-map/models/tv-common';
import { TvJunction } from 'app/modules/tv-map/models/tv-junction';
import { TvJunctionConnection } from 'app/modules/tv-map/models/tv-junction-connection';
import { LanePathObject, TvJunctionLaneLink } from 'app/modules/tv-map/models/tv-junction-lane-link';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { CommandHistory } from 'app/services/command-history';
import { SnackBar } from 'app/services/snack-bar.service';
import { LaneLinkInspector } from 'app/views/inspectors/lane-link-inspector/lane-link-inspector.component';
import { RoadControlPointInspector } from 'app/views/inspectors/road-control-point-inspector/road-control-point-inspector.component';
import { MultiCmdsCommand } from '../../commands/multi-cmds-command';
import { IToolWithPoint, SelectPointCommand } from '../../commands/select-point-command';
import { SetInspectorCommand } from '../../commands/set-inspector-command';
import { UpdateRoadPointCommand } from '../../commands/update-road-point-command';
import { LanePathFactory } from '../../factories/lane-path-factory.service';
import { RoadFactory } from '../../factories/road-factory.service';
import { KeyboardInput } from '../../input';
import { ToolType } from '../../models/tool-types.enum';
import { PickingHelper } from '../../services/picking-helper.service';
import { SceneService } from '../../services/scene.service';
import { BaseTool } from '../base-tool';
import { CreateJunctionConnection } from './create-junction-connection';

const DEFAULT_SIDE = TvLaneSide.RIGHT;

export class ManeuverTool extends BaseTool implements IToolWithPoint {

	name: string = 'ManeuverTool';
	toolType = ToolType.Maneuver;

	public connectingRoad: TvRoad;

	public roadControlPoint: RoadControlPoint;

	public lanePathObject: LanePathObject;

	private roadChanged = false;

	private junctionEntryObjects = [];
	private lanePathObjects = [];

	private laneDirectionHelper = new OdLaneDirectionBuilder( null );

	public junctionEntryObject: JunctionEntryObject;

	setPoint ( value: ISelectable ): void {
		this.junctionEntryObject = value as JunctionEntryObject;
	}

	getPoint (): ISelectable {
		return this.junctionEntryObject;
	}

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

		if ( e.button != MouseButton.LEFT ) return;

		const shiftKeyDown = KeyboardInput.isShiftKeyDown;

		// if ( !shiftKeyDown && this.checkRoadControlPointInteraction( e ) ) return;

		if ( !shiftKeyDown && this.hasClickedJunctionObject( e ) ) return;

		// if ( !shiftKeyDown && this.checkPathInteraction( e ) ) return;

		// const commands = [];
		//
		// commands.push( new SetInspectorCommand( null, null ) );
		//
		// CommandHistory.execute( new MultiCmdsCommand( commands ) );
		//
		// if ( this.connectingRoad ) {
		//
		// 	this.connectingRoad.hideNodes();
		// 	this.connectingRoad.spline.hide();
		// }

		CommandHistory.execute( new SelectPointCommand( this, null ) );

		this.setHint( 'Select two junction points to create a new junction connection' );

		// if ( this.lanePathObject ) this.lanePathObject.visible = false;
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

	hasClickedJunctionObject ( event: PointerEventData ): boolean {

		const junctionObject = this.findIntersection<JunctionEntryObject>( JunctionEntryObject.tag, event.intersections );

		if ( !junctionObject ) return false;

		if ( !this.junctionEntryObject ) {

			CommandHistory.execute( new SelectPointCommand( this, junctionObject ) );

			this.setHint( 'Select another junction entry to connect to' );

		} else if ( this.junctionEntryObject.uuid !== junctionObject.uuid ) {

			this.setHint( 'connect junction objects' );

			const entryExitSide = this.validateEntryExitCombination( this.junctionEntryObject, junctionObject );

			if ( !entryExitSide ) return;

			this.connectJunctionObject( this.junctionEntryObject, junctionObject );

		} else {

			CommandHistory.execute( new SelectPointCommand( this, null ) );

			this.setHint( 'cannot connect' );

		}

		return true;

		// return;
		// for ( let i = 0; i < event.intersections.length; i++ ) {
		//
		// 	const intersection = event.intersections[ i ];
		//
		// 	// tslint:disable-next-line: no-string-literal
		// 	if ( intersection.object[ 'tag' ] === JunctionEntryObject.tag ) {
		//
		// 		hasInteracted = true;
		//
		// 		const junctionObject = intersection.object as JunctionEntryObject;
		//
		// 		const tryToConnect = this.junctionEntryObject && junctionObject;
		//
		// 		if ( tryToConnect ) {
		//
		// 			this.connectJunctionObject( this.junctionEntryObject, junctionObject );
		//
		// 			// const junctionEntryObject = created ? null : junctionObject;
		//
		// 			// CommandHistory.executeAll( [
		//
		// 			//     new SetValueCommand( this, 'junctionEntryObject', junctionEntryObject ),
		//
		// 			//     new SetInspectorCommand( JunctionEntryInspector, junctionObject ),
		//
		// 			// ] );
		//
		// 		} else {
		//
		// 			CommandHistory.executeAll( [
		//
		// 				new SetValueCommand( this, 'junctionEntryObject', junctionObject ),
		//
		// 				new SetInspectorCommand( JunctionEntryInspector, junctionObject ),
		//
		// 			] );
		//
		// 		}
		//
		// 		break;
		// 	}
		// }

		// if ( !hasInteracted ) {
		//
		// 	CommandHistory.executeAll( [
		//
		// 		new SetValueCommand( this, 'junctionEntryObject', null ),
		//
		// 		new SetInspectorCommand( null, null )
		//
		// 	] );
		//
		// }

		// return hasInteracted;
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

	connectJunctionObject ( entry: JunctionEntryObject, exit: JunctionEntryObject ): void {

		try {

			let junction = this.hasJunction( entry, exit );

			if ( !junction ) {

				CommandHistory.execute( new CreateJunctionConnection( this, entry, exit, junction, null, null ) );

			} else {

				const result = this.hasConnection( junction, entry, exit );

				if ( result.connectionFound && result.laneLinkFound ) {

					SnackBar.warn( 'Connection already exists' );

				} else {

					CommandHistory.execute( new CreateJunctionConnection( this, entry, exit, junction, result.connection, result.laneLink ) );

				}


				// if ( result.connectionFound && result.laneLinkFound ) {
				//
				// 	CommandHistory.execute( new SetValueCommand( this, 'junctionEntryObject', null ) );
				//
				// 	SnackBar.warn( 'Connection already exists' );
				//
				// } else if ( result.connectionFound && !result.laneLinkFound ) {
				//
				// 	CommandHistory.execute( new SetValueCommand( this, 'junctionEntryObject', null ) );
				//
				// } else if ( !result.connectionFound && !result.laneLinkFound ) {
				//
				// 	CommandHistory.executeAll( [
				//
				// 		new SetValueCommand( this, 'junctionEntryObject', null ),
				//
				// 		new SetInspectorCommand( null, null ),
				//
				// 		new AddConnectionCommand( entry, exit, junction, this ),
				//
				// 	] );
				//
				// 	SnackBar.success( 'Connection created' );
				// }
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


	}

	// /**
	//  *
	//  * @deprecated currently not being used
	//  * @param connection
	//  * @param entry
	//  * @param exit
	//  * @param side
	//  * @param laneWidth
	//  * @param junction
	//  */
	// createLink (
	// 	connection: TvJunctionConnection,
	// 	entry: JunctionEntryObject,
	// 	exit: JunctionEntryObject,
	// 	side: TvLaneSide,
	// 	laneWidth: number,
	// 	junction: TvJunction
	// ) {
	//
	// 	const connectionRoad = this.map.getRoadById( connection.connectingRoad );
	//
	// 	const laneSection = connectionRoad.getFirstLaneSection();
	//
	// 	// -ve because its always for right side
	// 	const newLaneId = -1 * ( laneSection.getRightLaneCount() + 1 );
	//
	// 	const nodes = this.getSplinePositions( entry, exit, side );
	//
	// 	const connectingLane = laneSection.addLane( nodes.side, newLaneId, entry.lane.type, entry.lane.level, true );
	//
	// 	connectingLane.addWidthRecord( 0, laneWidth, 0, 0, 0 );
	//
	// 	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// 	connectionRoad.setPredecessor( 'road', entry.road.id, entry.contact );
	//
	// 	connectionRoad.setSuccessor( 'road', exit.road.id, exit.contact );
	//
	// 	connectingLane.setPredecessor( entry.lane.id );
	//
	// 	connectingLane.setSuccessor( exit.lane.id );
	//
	// 	const link = connection.addNewLink( entry.lane.id, connectingLane.id );
	//
	// 	if ( entry.contact === TvContactPoint.START ) {
	//
	// 		entry.road.setPredecessor( 'junction', junction.id );
	//
	// 	} else if ( entry.contact === TvContactPoint.END ) {
	//
	// 		entry.road.setSuccessor( 'junction', junction.id );
	//
	// 	}
	//
	// 	if ( exit.contact === TvContactPoint.START ) {
	//
	// 		exit.road.setPredecessor( 'junction', junction.id );
	//
	// 	} else if ( exit.contact === TvContactPoint.END ) {
	//
	// 		exit.road.setSuccessor( 'junction', junction.id );
	//
	// 	}
	//
	// 	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// 	this.lanePathObject = LanePathFactory.createPathForLane( entry.road, this.connectingRoad, connectingLane, connection, link );
	//
	// 	this.lanePathObjects.push( this.lanePathObject );
	//
	// 	SceneService.add( this.lanePathObject );
	//
	// 	RoadFactory.rebuildRoad( this.connectingRoad );
	//
	// }

	createConnectingRoad ( entry, exit, side, junction ) {

		return RoadFactory.createConnectingRoad( entry, exit, side, junction );

	}


	validateEntryExitCombination ( a: JunctionEntryObject, b: JunctionEntryObject ) {

		// Error Handling: Check if a and b are defined
		if ( !a || !b ) throw new Error( 'Both a and b must be defined.' );

		// Assuming a and b are instances of JunctionEntryObject, they should have the properties 'lane' and 'contact'
		// If these properties are not defined, throw an error
		if ( !a.lane || !a.contact || !b.lane || !b.contact ) throw new Error( 'a and b must have the properties \'lane\' and \'contact\'.' );

		if ( a.isEntry && b.isEntry || a.isExit && b.isExit ) SnackBar.warn( 'Cannot connect two entries or two exits.' );
		if ( a.isEntry && b.isEntry || a.isExit && b.isExit ) return;

		return {
			entry: a.isEntry ? a : b,
			exit: b.isExit ? b : a,
			side: TvLaneSide.RIGHT
		};

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
							.getLaneArray()
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


	hasJunction ( a: JunctionEntryObject, b: JunctionEntryObject ) {

		// the nearest junction
		let nearestJunction: TvJunction = null;
		let nearestDistance = Number.MAX_VALUE;

		this.map.junctions.forEach( junction => {

			if ( !junction.position && junction.connections.size > 0 ) {

				const connection = [ ...junction.connections.values() ][ 0 ];

				const connectionRoad = this.map.getRoadById( connection.connectingRoad );

				if ( connection.contactPoint === TvContactPoint.START ) {

					junction.position = connectionRoad.getStartCoord().toVector3();

				} else {

					junction.position = connectionRoad.getEndCoord().toVector3();

				}

			} else if ( junction.position ) {

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

		// if ( !nearestJunction ) nearestJunction = this.map.addNewJunction();

		// todo make it the mid point between a and b
		// nearestJunction.position = a.position;

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

		this.map.getRoads().filter( road => !road.isJunction ).forEach( road => {

			if ( !road.predecessor || road.predecessor.elementType === TvElementType.junction ) {

				this.showStartEntries( road );

			}

			if ( !road.successor || road.successor.elementType === TvElementType.junction ) {

				this.showEndEntries( road );

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

					// BUG: sometimes the connecting lane is not found
					// https://instaveritas-m9.sentry.io/share/issue/750cf87d0f56414fb83c1f9908fd33c7/
					const connectingLane = connectingRoad.getFirstLaneSection().getLaneById( link.to );

					link.lanePath = LanePathFactory.createPathForLane( incomingRoad, connectingRoad, connectingLane, connection, link );

					SceneService.add( link.lanePath );

				} );

			} );

		} );

	}

	showStartEntries ( road: TvRoad ) {

		road.getFirstLaneSection().getLaneArray().forEach( lane => {

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

		road.getLastLaneSection().getLaneArray().forEach( lane => {

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
