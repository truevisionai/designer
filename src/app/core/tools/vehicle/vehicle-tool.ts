/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { EntityObject } from 'app/modules/scenario/models/tv-entities';

import { ScenarioInstance } from 'app/modules/scenario/services/scenario-instance';
import { CommandHistory } from 'app/services/command-history';
import { SnackBar } from 'app/services/snack-bar.service';
import { KeyboardInput } from '../../input';
import { ToolType } from '../../models/tool-types.enum';
import { BaseTool } from '../base-tool';
import { AddVehicleCommand } from './add-vehicle-command';
import { PickingHelper } from 'app/core/services/picking-helper.service';
import { SetInspectorCommand } from 'app/core/commands/set-inspector-command';
import { EntityInspector } from 'app/modules/scenario/inspectors/tv-entity-inspector/tv-entity-inspector.component';

export class VehicleTool extends BaseTool {

	public name: string = 'VehicleTool';
	public toolType = ToolType.Vehicle;

	private selectedVehicle: EntityObject;

	constructor () {

		super();

	}


	onPointerDown ( event: PointerEventData ): void {

		if ( event.button != MouseButton.LEFT ) return;

		console.log( 'VehicleTool onPointerDown', event );

		if ( KeyboardInput.isShiftKeyDown ) {

			if ( true || this.selectedVehicle ) {

				const name = EntityObject.getNewName( 'Vehicle' );

				const vehicleObject = new EntityObject( name );

				CommandHistory.execute( new AddVehicleCommand( vehicleObject, event.point ) );


			} else {

				SnackBar.warn( 'Please select a vehicle' );

			}

		} else {

			if ( this.isVehicleSelected( event ) ) return;

			// deselect
			CommandHistory.execute( new SetInspectorCommand( null, null ) );

		}

		console.log( 'Scenario', ScenarioInstance.scenario );

	}

	isVehicleSelected ( event: PointerEventData ): boolean {

		const vehicles = [ ...this.scenario.objects.values() ].map( ( object ) => object.gameObject );

		const vehicle = PickingHelper.findNearestViaDistance( event.point, vehicles, 2 );

		if ( !vehicle || !vehicle.userData.entity ) return false;

		this.selectVehicle( vehicle.userData.entity );

		return true;
	}

	selectVehicle ( entity: EntityObject ) {

		CommandHistory.execute( new SetInspectorCommand( EntityInspector, entity ) );

	}

}
