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
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { TvRoadCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { OnRoadStrategy } from 'app/core/snapping/select-strategies/on-road-strategy';

export class VehicleTool extends BaseTool {

	public name: string = 'VehicleTool';
	public toolType = ToolType.Vehicle;

	private selectedVehicle: VehicleEntity;
	private strategy: SelectStrategy<TvRoadCoord>;

	constructor () {

		super();

		this.strategy = new OnRoadStrategy();
	}


	onPointerDown ( event: PointerEventData ): void {

		if ( event.button != MouseButton.LEFT ) return;

		const roadCoord = this.strategy.onPointerDown( event );

		if ( KeyboardInput.isShiftKeyDown ) {

			if ( true || this.selectedVehicle ) {

				if ( !roadCoord ) this.setHint( 'Click on road geometry to create vehicle' );
				if ( !roadCoord ) return;

				const vehicleEntity = VehicleFactory.createDefaultCar();

				CommandHistory.execute( new AddVehicleCommand( vehicleEntity, roadCoord ) );


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
