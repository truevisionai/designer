/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/core/commands/base-command';
import { SceneService } from 'app/core/services/scene.service';
import { EntityInspector } from 'app/modules/scenario/inspectors/tv-entity-inspector/tv-entity-inspector.component';
import { ScenarioInstance } from 'app/modules/scenario/services/scenario-instance';
import { VehicleEntity } from '../../../modules/scenario/models/entities/vehicle-entity';
import { VehicleTool } from './vehicle-tool';
import { SelectPointCommand } from 'app/core/commands/select-point-command';
import { DynamicControlPoint } from 'app/modules/three-js/objects/dynamic-control-point';
import { ScenarioEntity } from 'app/modules/scenario/models/entities/scenario-entity';


export class AddVehicleCommand extends BaseCommand {

	private setInspector: SelectPointCommand;

	constructor ( tool: VehicleTool, public entity: VehicleEntity, point: DynamicControlPoint<ScenarioEntity> ) {

		super();

		this.setInspector = new SelectPointCommand( tool, point, EntityInspector, point.mainObject );
	}

	execute (): void {

		SceneService.add( this.entity );

		ScenarioInstance.scenario.addObject( this.entity );

		this.setInspector.execute();

	}

	undo (): void {

		SceneService.remove( this.entity );

		ScenarioInstance.scenario.removeObject( this.entity );

		this.setInspector.undo();

	}

	redo (): void {

		this.execute();

	}
}
