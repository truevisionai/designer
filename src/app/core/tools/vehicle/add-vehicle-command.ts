import { BaseCommand } from 'app/core/commands/base-command';
import { SetInspectorCommand } from 'app/core/commands/set-inspector-command';
import { SceneService } from 'app/core/services/scene.service';
import { EntityInspector } from 'app/modules/open-scenario/inspectors/osc-entity-inspector/osc-entity-inspector.component';
import { OscEntityObject } from 'app/modules/open-scenario/models/osc-entities';
import { OscSourceFile } from 'app/modules/open-scenario/services/osc-source-file';
import { Vector3 } from 'three';

export class AddVehicleCommand extends BaseCommand {

	private setInspector: SetInspectorCommand;

	constructor ( public entity: OscEntityObject, position: Vector3 ) {

		super();

		entity.gameObject.position.copy( position.clone() );

		entity.name = `Vehicle${ OscSourceFile.openScenario.objects.size + 1 }`;

		this.setInspector = new SetInspectorCommand( EntityInspector, entity );
	}

	execute (): void {

		SceneService.add( this.entity.gameObject );

		OscSourceFile.openScenario.addObject( this.entity );

		this.setInspector.execute();

	}

	undo (): void {

		SceneService.remove( this.entity.gameObject );

		OscSourceFile.openScenario.removeObject( this.entity );

		this.setInspector.undo();

	}

	redo (): void {

		this.execute();

	}
}
