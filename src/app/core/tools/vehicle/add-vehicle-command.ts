import { BaseCommand } from 'app/core/commands/base-command';
import { SetInspectorCommand } from 'app/core/commands/set-inspector-command';
import { SceneService } from 'app/core/services/scene.service';
import { EntityInspector } from 'app/modules/open-scenario/inspectors/osc-entity-inspector/osc-entity-inspector.component';
import { OscEntityObject } from 'app/modules/open-scenario/models/osc-entities';
import { TvScenarioInstance } from 'app/modules/open-scenario/services/tv-scenario-instance';
import { Vector3 } from 'three';
import { OscAbsoluteTarget } from '../../../modules/open-scenario/models/actions/osc-absolute-target';
import { OscLaneChangeAction } from '../../../modules/open-scenario/models/actions/osc-lane-change-action';
import { OscPositionAction } from '../../../modules/open-scenario/models/actions/osc-position-action';
import { OscLaneChangeDynamics, OscSpeedDynamics } from '../../../modules/open-scenario/models/actions/osc-private-action';
import { OscSpeedAction } from '../../../modules/open-scenario/models/actions/osc-speed-action';
import { OscSimulationTimeCondition } from '../../../modules/open-scenario/models/conditions/osc-simulation-time-condition';
import { OscDynamicsShape, OscRule } from '../../../modules/open-scenario/models/osc-enums';
import { OscWorldPosition } from '../../../modules/open-scenario/models/positions/osc-world-position';

export class AddVehicleCommand extends BaseCommand {

	private setInspector: SetInspectorCommand;

	constructor ( public entity: OscEntityObject, position: Vector3 ) {

		super();

		entity.gameObject.position.copy( position.clone() );

		entity.name = `Vehicle${ TvScenarioInstance.openScenario.objects.size + 1 }`;

		entity.addInitAction( new OscPositionAction( new OscWorldPosition( position.x, position.y, position.z ) ) );
		entity.addInitAction( new OscSpeedAction( new OscSpeedDynamics( OscDynamicsShape.step ), new OscAbsoluteTarget( 40 ) ) );

		this.addStoryActions();

		this.setInspector = new SetInspectorCommand( EntityInspector, entity );
	}

	execute (): void {

		SceneService.add( this.entity.gameObject );

		TvScenarioInstance.openScenario.addObject( this.entity );

		this.setInspector.execute();

	}

	undo (): void {

		SceneService.remove( this.entity.gameObject );

		TvScenarioInstance.openScenario.removeObject( this.entity );

		this.setInspector.undo();

	}

	redo (): void {

		this.execute();

	}

	private addStoryActions () {

		const story = this.scenario.createStory( this.entity );

		this.scenario.storyboard.addEndCondition( new OscSimulationTimeCondition( 15, OscRule.greater_than ) );

		const act = story.addNewAct( 'Act' );

		const sequence = act.addNewSequence( 'ActSequence', 1, this.entity.name );

		act.addStartCondition( new OscSimulationTimeCondition( 5, OscRule.greater_than ) );

		const maneuver = sequence.addNewManeuver( 'Maneuevr' );

		const event = maneuver.addNewEvent( 'MyLaneChangeLeftEvent', 'overwrite' );

		event.addNewAction( 'MyLaneChangeLeftAction', new OscLaneChangeAction(
			new OscLaneChangeDynamics( 5, null, OscDynamicsShape.linear ),
			new OscAbsoluteTarget( -3 ),
		) );

		event.addStartCondition( new OscSimulationTimeCondition( 5, OscRule.greater_than ) );

	}
}
