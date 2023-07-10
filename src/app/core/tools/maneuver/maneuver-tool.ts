/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { ISelectable } from 'app/modules/three-js/objects/i-selectable';
import { JunctionEntryObject } from 'app/modules/three-js/objects/junction-entry.object';
import { OdLaneDirectionBuilder } from 'app/modules/tv-map/builders/od-lane-direction-builder';
import { TvLaneSide } from 'app/modules/tv-map/models/tv-common';
import { CommandHistory } from 'app/services/command-history';
import { SnackBar } from 'app/services/snack-bar.service';
import { JunctionEntryInspector } from '../../../views/inspectors/junction-entry-inspector/junction-entry-inspector.component';
import { IToolWithSelection, SelectPointsCommand } from '../../commands/select-point-command';
import { JunctionFactory } from '../../factories/junction.factory';
import { LanePathFactory } from '../../factories/lane-path-factory.service';
import { SelectionTool } from '../../helpers/selection-tool';
import { KeyboardInput } from '../../input';
import { ToolType } from '../../models/tool-types.enum';
import { SceneService } from '../../services/scene.service';
import { TvConsole } from '../../utils/console';
import { BaseTool } from '../base-tool';
import { CreateJunctionConnection } from './create-junction-connection';

export class ManeuverTool extends BaseTool implements IToolWithSelection {

	name: string = 'ManeuverTool';

	toolType = ToolType.Maneuver;

	private entries: JunctionEntryObject[] = [];

	private lanePathObjects = [];

	private selected: JunctionEntryObject[] = [];

	private laneDirectionHelper = new OdLaneDirectionBuilder( null );

	public selectionTool: SelectionTool<JunctionEntryObject>;

	init () {


	}

	enable () {

		super.enable();

		this.selectionTool = new SelectionTool( JunctionEntryObject.tag );

		this.entries = JunctionFactory.createJunctionEntries();
		this.entries.forEach( obj => SceneService.add( obj ) );

		this.showLanePathObjects();
	}

	disable () {

		super.disable();

		this.selectionTool?.dispose();

		this.entries.forEach( obj => SceneService.remove( obj ) );
		this.entries.splice( 0, this.entries.length );

		this.hideLanePathObjects();
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

			this.selectionTool.start( e );

		} else if ( this.selectionTool.isSelecting ) {

			const newValue = this.selected.concat( this.selectionTool.end( e ) );

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

		if ( this.selectionTool.isSelecting ) {

			this.selectionTool.update( e ).forEach( object => {
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
