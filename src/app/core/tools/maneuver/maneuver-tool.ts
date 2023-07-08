/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { ISelectable } from 'app/modules/three-js/objects/i-selectable';
import { JunctionEntryObject } from 'app/modules/three-js/objects/junction-entry.object';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { OdLaneDirectionBuilder } from 'app/modules/tv-map/builders/od-lane-direction-builder';
import { TvLaneSide } from 'app/modules/tv-map/models/tv-common';
import { LanePathObject } from 'app/modules/tv-map/models/tv-junction-lane-link';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { CommandHistory } from 'app/services/command-history';
import { SnackBar } from 'app/services/snack-bar.service';
import { IToolWithPoint, SelectPointCommand } from '../../commands/select-point-command';
import { JunctionFactory } from '../../factories/junction.factory';
import { LanePathFactory } from '../../factories/lane-path-factory.service';
import { BoxSelectionToolHelper } from '../../helpers/box-selection-tool-helper';
import { KeyboardInput } from '../../input';
import { ToolType } from '../../models/tool-types.enum';
import { SceneService } from '../../services/scene.service';
import { TvConsole } from '../../utils/console';
import { BaseTool } from '../base-tool';
import { CreateJunctionConnection } from './create-junction-connection';
import { SelectionBox } from 'three/examples/jsm/interactive/SelectionBox';
import { SelectionHelper } from 'three/examples/jsm/interactive/SelectionHelper';
import { AppService } from 'app/core/services/app.service';

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

	// private selectionHelper = new BoxSelectionToolHelper();
	private selectionHelper: SelectionHelper;
	private selectionBox: SelectionBox;


	init () {

		// this.selectionHelper = new SelectionHelper( AppService.three.renderer, 'selectBox' );
		// this.selectionBox = new SelectionBox( AppService.three.camera, SceneService.scene );


	}

	enable () {

		super.enable();

		this.junctionEntryObject = null;
		this.lanePathObject = null;
		this.connectingRoad = null;
		this.roadControlPoint = null;

		this.junctionEntryObjects = JunctionFactory.getAllJunctionEntries();
		this.junctionEntryObjects.forEach( obj => SceneService.add( obj ) );

		this.showLanePathObjects();
	}

	disable () {

		super.disable();

		// this.selectionHelper.dispose();

		this.junctionEntryObject = null;
		this.lanePathObject = null;
		this.connectingRoad = null;
		this.roadControlPoint = null;

		this.junctionEntryObjects.forEach( obj => SceneService.remove( obj ) );
		this.junctionEntryObjects.splice( 0, this.junctionEntryObjects.length );

		this.hideLanePathObjects();

		this.laneDirectionHelper.clear();
	}

	setPoint ( value: ISelectable ): void {
		this.junctionEntryObject = value as JunctionEntryObject;
	}

	getPoint (): ISelectable {
		return this.junctionEntryObject;
	}


	onPointerClicked ( e: PointerEventData ) {

		if ( e.button != MouseButton.LEFT ) return;

		const shiftKeyDown = KeyboardInput.isShiftKeyDown;

		// if ( shiftKeyDown ) {

		// 	this.selectionHelper.start( e );

		// }


		if ( !shiftKeyDown ) return;

		if ( !shiftKeyDown && this.hasClickedJunctionObject( e ) ) return;

		CommandHistory.execute( new SelectPointCommand( this, null ) );

		this.setHint( 'Select two junction points to create a new junction connection' );
	}

	onPointerUp ( e: PointerEventData ) {

		// if ( this.selectionHelper.isSelecting ) {

		// 	this.selectionHelper.end( e )

		// }

	}

	onPointerMoved ( e: PointerEventData ) {

		// if ( this.selectionHelper.isSelecting ) {

		// 	this.selectionHelper.update( e );

		// }

		// if ( BoxSelectionToolHelper.selectionHelper.isDown ) {
		//
		// 	BoxSelectionToolHelper.selectionBox.collection
		// 		.filter( i => i[ 'tag' ] = JunctionEntryObject.tag )
		// 		.forEach( ( object: any ) => {
		// 			if ( object instanceof JunctionEntryObject ) {
		// 				object.unselect();
		// 			}
		// 		} );
		//
		// 	BoxSelectionToolHelper.selectionBox.endPoint.set( e.mouse.x, e.mouse.y, 0.5 );
		//
		// 	const allSelected = BoxSelectionToolHelper.selectionBox.select();
		//
		// 	allSelected
		// 		.filter( i => i[ 'tag' ] == JunctionEntryObject.tag )
		// 		.forEach( ( object: any ) => {
		// 			if ( object instanceof JunctionEntryObject ) {
		// 				object.select();
		// 			}
		// 		} );
		// }

	}

	hasClickedJunctionObject ( event: PointerEventData ): boolean {

		const junctionObject = this.findIntersection<JunctionEntryObject>( JunctionEntryObject.tag, event.intersections );

		if ( !junctionObject ) return false;

		if ( !this.junctionEntryObject ) {

			CommandHistory.execute( new SelectPointCommand( this, junctionObject ) );

			this.setHint( 'Select another junction entry to connect to' );

		} else if ( this.junctionEntryObject.uuid !== junctionObject.uuid ) {

			this.setHint( 'connect junction objects' );

			const entryExitSide = this.isValidEntryExit( this.junctionEntryObject, junctionObject );

			if ( !entryExitSide ) return;

			this.createJunctionConnection( entryExitSide.entry, entryExitSide.exit );

		} else {

			CommandHistory.execute( new SelectPointCommand( this, null ) );

			this.setHint( 'cannot connect' );

		}

		return true;
	}

	createJunctionConnection ( entry: JunctionEntryObject, exit: JunctionEntryObject ): void {

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


	isValidEntryExit ( a: JunctionEntryObject, b: JunctionEntryObject ) {

		// Error Handling: Check if a and b are defined
		if ( !a || !b ) TvConsole.error( 'Both a and b must be defined.' );
		if ( !a || !b ) return;

		// Assuming a and b are instances of JunctionEntryObject, they should have the properties 'lane' and 'contact'
		// If these properties are not defined, throw an error
		if ( !a.lane || !a.contact || !b.lane || !b.contact ) TvConsole.error( 'a and b must have the properties \'lane\' and \'contact\'.' );
		if ( !a.lane || !a.contact || !b.lane || !b.contact ) return;

		if ( a.isEntry && b.isEntry || a.isExit && b.isExit ) SnackBar.warn( 'Cannot connect two entries or two exits.' );
		if ( a.isEntry && b.isEntry || a.isExit && b.isExit ) return;

		return {
			entry: a.isEntry ? a : b,
			exit: b.isExit ? b : a,
			side: TvLaneSide.RIGHT
		};

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
