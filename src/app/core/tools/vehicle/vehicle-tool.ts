/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SetInspectorCommand } from 'app/core/commands/set-inspector-command';
import { PickingHelper } from 'app/core/services/picking-helper.service';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { EntityInspector } from 'app/modules/scenario/inspectors/tv-entity-inspector/tv-entity-inspector.component';

import { ScenarioInstance } from 'app/modules/scenario/services/scenario-instance';
import { CommandHistory } from 'app/services/command-history';
import { SnackBar } from 'app/services/snack-bar.service';
import { DefaultVehicleController } from '../../../modules/scenario/controllers/default-vehicle-controller';
import { VehicleEntity } from '../../../modules/scenario/models/entities/vehicle-entity';
import { KeyboardInput } from '../../input';
import { ToolType } from '../../models/tool-types.enum';
import { BaseTool } from '../base-tool';
import { AddVehicleCommand } from './add-vehicle-command';
import { VehicleFactory } from 'app/core/factories/vehicle.factory';

export class VehicleTool extends BaseTool {

	public name: string = 'VehicleTool';
	public toolType = ToolType.Vehicle;

	private selectedVehicle: VehicleEntity;

	constructor () {

		super();

	}


	onPointerDown ( event: PointerEventData ): void {

		if ( event.button != MouseButton.LEFT ) return;

		console.log( 'VehicleTool onPointerDown', event );

		if ( KeyboardInput.isShiftKeyDown ) {

			if ( true || this.selectedVehicle ) {

				const name = VehicleEntity.getNewName( 'Vehicle' );

				const vehicleEntity = VehicleFactory.createDefaultCar( name );

				vehicleEntity.setController( new DefaultVehicleController( 'DefaultVehicleController', vehicleEntity ) );

				CommandHistory.execute( new AddVehicleCommand( vehicleEntity, event.point ) );


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

		const vehicles = [ ...this.scenario.objects.values() ].map( ( object ) => object );

		const vehicle = PickingHelper.findNearestViaDistance( event.point, vehicles, 2 );

		if ( !vehicle || !vehicle.userData.entity ) return false;

		this.selectVehicle( vehicle.userData.entity );

		return true;
	}

	selectVehicle ( entity: VehicleEntity ) {

		CommandHistory.execute( new SetInspectorCommand( EntityInspector, entity ) );

	}

}
