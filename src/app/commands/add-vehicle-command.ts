/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/commands/base-command';
import { SelectPointCommand } from 'app/commands/select-point-command';
import { SceneService } from 'app/services/scene.service';
import { EntityInspector } from 'app/scenario/inspectors/tv-entity-inspector/tv-entity-inspector.component';
import { ScenarioEntity } from 'app/scenario/models/entities/scenario-entity';
import { ScenarioService } from 'app/scenario/services/scenario.service';
import { DynamicControlPoint } from 'app/objects/dynamic-control-point';
import { VehicleEntity } from '../scenario/models/entities/vehicle-entity';
import { VehicleTool } from '../tools/vehicle/vehicle-tool';


export class AddVehicleCommand extends BaseCommand {

	private setInspector: SelectPointCommand;

	constructor ( tool: VehicleTool, public entity: VehicleEntity, point: DynamicControlPoint<ScenarioEntity> ) {

		super();

		this.setInspector = new SelectPointCommand( tool, point, EntityInspector, point.mainObject );
	}

	execute (): void {

		SceneService.addToMain( this.entity );

		ScenarioService.scenario.addObject( this.entity );

		this.setInspector.execute();

	}

	undo (): void {

		SceneService.removeFromMain( this.entity );

		ScenarioService.scenario.removeObject( this.entity );

		this.setInspector.undo();

	}

	redo (): void {

		this.execute();

	}
}
