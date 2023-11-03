/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { ISelectable } from 'app/modules/three-js/objects/i-selectable';
import { JunctionEntryObject } from 'app/modules/three-js/objects/junction-entry.object';
import { TvLaneSide } from 'app/modules/tv-map/models/tv-common';
import { CommandHistory } from 'app/services/command-history';
import { SnackBar } from 'app/services/snack-bar.service';
import { JunctionEntryInspector } from '../../views/inspectors/junction-entry-inspector/junction-entry-inspector.component';
import { IToolWithSelection, SelectPointsCommand } from '../../commands/select-point-command';
import { KeyboardInput } from '../../core/input';
import { ToolType } from '../tool-types.enum';
import { SelectionTool } from '../../core/snapping/selection-tool';
import { TvConsole } from '../../core/utils/console';
import { BaseTool } from '../base-tool';
import { CreateSingleManeuver } from './create-single-maneuver';
// import { ManeuverService } from 'app/services/junction/maneuver.service';

export class ManeuverTool extends BaseTool implements IToolWithSelection {

	name: string = 'ManeuverTool';

	toolType = ToolType.Maneuver;
	public selectionTool: SelectionTool<JunctionEntryObject>;

	// private entries: JunctionEntryObject[] = [];

	// private lanePathObjects = [];

	private selected: JunctionEntryObject[] = [];

	// private laneDirectionHelper = new OdLaneDirectionBuilder( null );

	private maneuverService: any;

	constructor () {

		super();

		this.selectionTool = new SelectionTool( JunctionEntryObject.tag );

		// this.maneuverService = new ManeuverService();
	}

	init () {


	}

	enable () {

		super.enable();

		this.maneuverService.showAllManeuvers();
		this.maneuverService.showAllEntryExitPoints();
	}

	disable () {

		super.disable();

		this.selectionTool?.dispose();

		this.maneuverService.hideAllManeuvers();
		this.maneuverService.hideAllEntryExitPoints();
	}

	setPoint ( value: ISelectable[] ): void {

		this.selected = value as JunctionEntryObject[];

	}

	getPoint (): ISelectable[] {

		return this.selected as ISelectable[];

	}

	onPointerClicked ( e: PointerEventData ) {

		if ( e.button != MouseButton.LEFT ) return;

		const shiftKeyDown = KeyboardInput.isShiftKeyDown;

		if ( shiftKeyDown ) {

			this.selectionTool?.start( e );

		} else if ( this.selectionTool?.isSelecting ) {

			const newValue = this.selected.concat( this.selectionTool?.end( e ) );

			CommandHistory.execute( new SelectPointsCommand( this, newValue, JunctionEntryInspector, newValue ) );

			this.setHint( 'Use LEFT CLICK to select junctions points' );

		} else {

			if ( !shiftKeyDown && this.isJunctionObjectSelected( e ) ) return;

			if ( this.selected.length > 0 ) {

				CommandHistory.execute( new SelectPointsCommand( this, [], null, null ), );

				this.setHint( 'Use LEFT CLICK to select junctions points' );

			}
		}
	}

	onPointerUp ( e: PointerEventData ) {


	}

	onPointerMoved ( e: PointerEventData ) {

		if ( this.selectionTool?.isSelecting ) {

			this.selectionTool?.update( e ).forEach( object => {
				object.select();
			} );

		}

	}

	isJunctionObjectSelected ( event: PointerEventData ): boolean {

		const junctionObject = this.findIntersection<JunctionEntryObject>( JunctionEntryObject.tag, event.intersections );

		if ( !junctionObject ) return false;

		const newValue = this.selected.concat( junctionObject );

		CommandHistory.execute( new SelectPointsCommand( this, newValue, JunctionEntryInspector, newValue ) );

		this.setHint( 'Select another junction entry to connect to' );

		return true;
	}

	createJunctionConnection ( entry: JunctionEntryObject, exit: JunctionEntryObject ): void {

		try {

			const junction = this.map.findJunction( entry.road, exit.road );

			if ( !junction ) {

				CommandHistory.execute( new CreateSingleManeuver( this, entry, exit, junction, null, null ) );

			} else {

				const connection = junction.findRoadConnection( entry.road, exit.road );

				const laneLink = connection?.laneLink.find( i => i.from === entry.lane.id );

				if ( connection && laneLink ) {

					SnackBar.warn( 'Connection already exists' );

				} else {

					CommandHistory.execute( new CreateSingleManeuver( this, entry, exit, junction, connection, laneLink ) );

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

	// showLanePathObjects () {

	// 	this.map.junctions.forEach( junction => {

	// 		junction.connections.forEach( connection => {

	// 			connection.laneLink.forEach( link => {

	// 				link.update();

	// 				link.show();

	// 				SceneService.addToMain( link.mesh );

	// 			} );

	// 		} );

	// 	} );

	// }

	// hideLanePathObjects () {

	// 	this.lanePathObjects.forEach( obj => SceneService.removeFromMain( obj ) );

	// 	this.lanePathObjects.splice( 0, this.lanePathObjects.length );

	// 	this.map.junctions.forEach( junction => {

	// 		junction.connections.forEach( connection => {

	// 			connection.laneLink.forEach( link => {

	// 				link.hide();

	// 				SceneService.removeFromMain( link.mesh );

	// 			} );

	// 		} );

	// 	} );
	// }
}
