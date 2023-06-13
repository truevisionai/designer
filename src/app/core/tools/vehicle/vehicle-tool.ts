/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/core/game-object';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';

import { TvScenarioInstance } from 'app/modules/open-scenario/services/tv-scenario-instance';
import { CommandHistory } from 'app/services/command-history';
import { SnackBar } from 'app/services/snack-bar.service';
import { BoxGeometry, MeshBasicMaterial } from 'three';
import { KeyboardInput } from '../../input';
import { ToolType } from '../../models/tool-types.enum';
import { BaseTool } from '../base-tool';
import { AddVehicleCommand } from './add-vehicle-command';
import { EntityObject } from 'app/modules/open-scenario/models/tv-entities';

export class VehicleTool extends BaseTool {

	public name: string = 'VehicleTool';
	public toolType = ToolType.Vehicle;

	private selectedVehicle: EntityObject;

	constructor () {

		super();

		this.selectedVehicle = this.makeVehicle();
	}

	private makeVehicle () {

		var geometry = new BoxGeometry( 2.0, 4.2, 1.6 );
		var material = new MeshBasicMaterial( { color: 0x00ff00 } );
		const oscObject = new EntityObject( 'Vehicle' );
		oscObject.gameObject = new GameObject( 'Cube', geometry, material );
		return oscObject;
	}

	onPointerDown ( event: PointerEventData ): void {

		if ( event.button != MouseButton.LEFT ) return;

		console.log( 'VehicleTool onPointerDown', event );

		if ( KeyboardInput.isShiftKeyDown ) {

			if ( this.selectedVehicle ) {

				const vehicleObject = this.makeVehicle();

				CommandHistory.execute( new AddVehicleCommand( vehicleObject, event.point ) );


			} else {

				SnackBar.warn( 'Please select a vehicle' );

			}

		} else {


		}

		console.log( 'Scenario', TvScenarioInstance.scenario );

	}

}
