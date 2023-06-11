/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { ToolType } from '../../models/tool-types.enum';
import { BaseTool } from '../base-tool';
import { OscEntityObject } from 'app/modules/open-scenario/models/osc-entities';
import { BoxGeometry, MeshBasicMaterial, Mesh } from 'three';
import { SnackBar } from 'app/services/snack-bar.service';
import { SceneService } from 'app/core/services/scene.service';
import { GameObject } from 'app/core/game-object';
import { OscSourceFile } from 'app/modules/open-scenario/services/osc-source-file';
import { CommandHistory } from 'app/services/command-history';
import { AddVehicleCommand } from './add-vehicle-command';

export class VehicleTool extends BaseTool {

	public name: string = 'VehicleTool';
	public toolType = ToolType.Vehicle;

	constructor () {

		super();

	}

	get selectedVehicle () {

		var geometry = new BoxGeometry( 2.0, 4.2, 1.6 );
		var material = new MeshBasicMaterial( { color: 0x00ff00 } );

		const oscObject = new OscEntityObject( 'Vehicle' );

		oscObject.gameObject = new GameObject( 'Cube', geometry, material );

		return oscObject;

	}

	onPointerDown ( event: PointerEventData ): void {

		console.log( 'VehicleTool onPointerDown', event );

		const oscObject = this.selectedVehicle;

		if ( oscObject ) {

			console.log( 'VehicleTool onPointerDown', event );

			CommandHistory.execute( new AddVehicleCommand( oscObject, event.point ) );

			console.log( 'VehicleTool onPointerDown', OscSourceFile.scenario);

		} else {

			SnackBar.warn( 'Please select a vehicle' );

		}

	}

}
