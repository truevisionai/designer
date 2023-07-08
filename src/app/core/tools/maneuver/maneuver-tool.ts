/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { ISelectable } from 'app/modules/three-js/objects/i-selectable';
import { JunctionEntryObject } from 'app/modules/three-js/objects/junction-entry.object';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { OdLaneDirectionBuilder } from 'app/modules/tv-map/builders/od-lane-direction-builder';
import { TvContactPoint, TvElementType, TvLaneSide, TvLaneType } from 'app/modules/tv-map/models/tv-common';
import { LanePathObject } from 'app/modules/tv-map/models/tv-junction-lane-link';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { CommandHistory } from 'app/services/command-history';
import { SnackBar } from 'app/services/snack-bar.service';
import { LaneLinkInspector } from 'app/views/inspectors/lane-link-inspector/lane-link-inspector.component';
import { MultiCmdsCommand } from '../../commands/multi-cmds-command';
import { IToolWithPoint, SelectPointCommand } from '../../commands/select-point-command';
import { SetInspectorCommand } from '../../commands/set-inspector-command';
import { UpdateRoadPointCommand } from '../../commands/update-road-point-command';
import { LanePathFactory } from '../../factories/lane-path-factory.service';
import { KeyboardInput } from '../../input';
import { ToolType } from '../../models/tool-types.enum';
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

	private junctionEntryObjects: JunctionEntryObject[] = [];
	private lanePathObjects = [];

	private laneDirectionHelper = new OdLaneDirectionBuilder( null );

	public junctionEntryObject: JunctionEntryObject;

	setPoint ( value: ISelectable ): void {
		this.junctionEntryObject = value as JunctionEntryObject;
	}

	getPoint (): ISelectable {
		return this.junctionEntryObject;
	}

	finalList = new Map<number, JunctionEntryObject>();

	addEntries ( road: TvRoad, contact: TvContactPoint ) {

		this.junctionEntryObjects
			.filter( entry => entry.road.id == road.id )
			.filter( entry => entry.contact == contact )
			.forEach( entry => {
				if ( !this.finalList.has( entry.id ) ) {
					this.finalList.set( entry.id, entry );
				}
			} );

	}

	init () {


		// find all nodes
		setTimeout( () => {

			// console.log( this.junctionEntryObjects )

			const roads = this.map.getRoads();

			for ( let i = 0; i < roads.length; i++ ) {

				const road = roads[ i ];
				const start = road.getStartCoord().toVector3();
				const end = road.getEndCoord().toVector3();

				for ( let j = i + 1; j < roads.length; j++ ) {

					const otherRoad = roads[ j ];
					const otherStart = otherRoad.getStartCoord().toVector3();
					const otherEnd = otherRoad.getEndCoord().toVector3();

					if ( start.distanceTo( otherStart ) <= 60 ) {

						this.addEntries( road, TvContactPoint.START );
						this.addEntries( otherRoad, TvContactPoint.START );

					}

					if ( start.distanceTo( otherEnd ) <= 60 ) {

						this.addEntries( road, TvContactPoint.START );
						this.addEntries( otherRoad, TvContactPoint.END );


					}

					if ( end.distanceTo( otherEnd ) <= 60 ) {

						this.addEntries( road, TvContactPoint.END );
						this.addEntries( otherRoad, TvContactPoint.END );

					}

				}

			}

			// console.log( this.finalList )

			this.finalList.forEach( entry => {
				entry.select();
			} );

			this.mergeEntries( Array.from( this.finalList.values() ) );

		}, 2000 );

	}

	mergeEntries ( entries: JunctionEntryObject[] ) {

		for ( let i = 0; i < entries.length; i++ ) {

			const left = entries[ i ];

			for ( let j = i + 1; j < entries.length; j++ ) {

				const right = entries[ j ];

				// dont merge same road
				if ( left.road.id == right.road.id ) continue;

				// we only want to merge
				// 1 with 1 or
				// -1 with 1 or
				// 1 with -1
				// -1 with -1
				// to ensure we have straight connections first
				if ( Math.abs( left.lane.id ) != Math.abs( right.lane.id ) ) continue;

				// dont merge if both are entries
				if ( left.isEntry && right.isEntry ) continue;

				// dont merge if both are exits
				if ( left.isExit && right.isExit ) continue;

				// console.log( 'connecting', left, right );

				const entry = left.isEntry ? left : right;

				const exit = left.isExit ? left : right;

				this.connectJunctionObject( entry, exit );

			}

		}

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
	}

	connectJunctionObject ( entry: JunctionEntryObject, exit: JunctionEntryObject ): void {

		try {

			const junction = this.map.findJunction( entry.road, exit.road );

			if ( !junction ) {

				CommandHistory.execute( new CreateJunctionConnection( this, entry, exit, junction, null, null ) );

			} else {

				const connection = junction.findConnection( entry.road, exit.road );

				const laneLink = connection?.laneLink.find( i => i.from === entry.lane.id );

				if ( connection && laneLink ) {

					SnackBar.warn( 'Connection already exists' );

				} else {

					CommandHistory.execute( new CreateJunctionConnection( this, entry, exit, junction, connection, laneLink ) );

				}

			}

		} catch ( error ) {

			console.log( error );

			return;
		}

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

	showLanePathObjects () {

		this.map.junctions.forEach( junction => {

			junction.connections.forEach( connection => {

				connection.laneLink.forEach( link => {

					// BUG: sometimes the connecting lane is not found
					// https://instaveritas-m9.sentry.io/share/issue/750cf87d0f56414fb83c1f9908fd33c7/
					const connectingLane = connection.connectingRoad.getFirstLaneSection().getLaneById( link.to );

					link.lanePath = LanePathFactory.createPathForLane( connection.incomingRoad, connection.connectingRoad, connectingLane, connection, link );

					SceneService.add( link.lanePath );

				} );

			} );

		} );

	}

	showStartEntries ( road: TvRoad ) {

		road.getFirstLaneSection()
			.getLaneArray()
			.filter( lane => lane.id !== 0 && lane.type === TvLaneType.driving )
			.forEach( lane => {

				this.laneDirectionHelper.drawSingleLane( road, lane );

				const position = TvMapQueries.getLanePosition( road.id, lane.id, 0 );

				const name = `road-${ road.id }-lane-${ lane.id }-${ TvContactPoint.START }`;

				const obj = new JunctionEntryObject( name, position, TvContactPoint.START, road, lane );

				this.junctionEntryObjects.push( obj );

				SceneService.add( obj );

			} );
	}

	showEndEntries ( road: TvRoad ) {

		road.getLastLaneSection()
			.getLaneArray()
			.filter( lane => lane.id !== 0 && lane.type === TvLaneType.driving )
			.forEach( lane => {

				this.laneDirectionHelper.drawSingleLane( road, lane );

				const position = TvMapQueries.getLanePosition( road.id, lane.id, road.length );

				const name = `road-${ road.id }-lane-${ lane.id }-${ TvContactPoint.END }`;

				const obj = new JunctionEntryObject( name, position, TvContactPoint.END, road, lane );

				this.junctionEntryObjects.push( obj );

				SceneService.add( obj );

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
