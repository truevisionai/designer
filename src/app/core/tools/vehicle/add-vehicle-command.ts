import { BaseCommand } from 'app/core/commands/base-command';
import { SetInspectorCommand } from 'app/core/commands/set-inspector-command';
import { SceneService } from 'app/core/services/scene.service';
import { EntityInspector } from 'app/modules/open-scenario/inspectors/osc-entity-inspector/osc-entity-inspector.component';
import { EntityObject } from 'app/modules/open-scenario/models/osc-entities';
import { TvScenarioInstance } from 'app/modules/open-scenario/services/tv-scenario-instance';
import { MathUtils, Vector3 } from 'three';
import { AbsoluteTarget } from '../../../modules/open-scenario/models/actions/osc-absolute-target';
import { PositionAction } from '../../../modules/open-scenario/models/actions/osc-position-action';
import { SpeedDynamics } from '../../../modules/open-scenario/models/actions/osc-private-action';
import { SpeedAction } from '../../../modules/open-scenario/models/actions/osc-speed-action';
import { SimulationTimeCondition } from '../../../modules/open-scenario/models/conditions/osc-simulation-time-condition';
import { DynamicsShape, Rule } from '../../../modules/open-scenario/models/osc-enums';
import { WorldPosition } from '../../../modules/open-scenario/models/positions/osc-world-position';

export class AddVehicleCommand extends BaseCommand {

	private setInspector: SetInspectorCommand;

	constructor ( public entity: EntityObject, position: Vector3 ) {

		super();

		entity.gameObject.position.copy( position.clone() );

		entity.name = `Vehicle${ TvScenarioInstance.openScenario.objects.size + 1 }`;

		entity.addInitAction( new PositionAction( new WorldPosition( position.x, position.y, position.z ) ) );
		entity.addInitAction( new SpeedAction( new SpeedDynamics( DynamicsShape.step ), new AbsoluteTarget( 40 ) ) );

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

		this.scenario.storyboard.addEndCondition( new SimulationTimeCondition( 10, Rule.greater_than ) );

		const act = story.addNewAct( `Story-${ MathUtils.generateUUID() }` );

		const sequence = act.addNewSequence( `Sequence-${ MathUtils.generateUUID() }` + act.name, 1, this.entity.name );

		act.addStartCondition( new SimulationTimeCondition( 2, Rule.greater_than ) );

		const maneuver = sequence.addNewManeuver( `Maneuver-${ MathUtils.generateUUID() }` );

		// const event = maneuver.addNewEvent( 'MyLaneChangeLeftEvent', 'overwrite' );

		// event.addNewAction( 'MyLaneChangeLeftAction', new LaneChangeAction(
		// 	new LaneChangeDynamics( 5, null, DynamicsShape.linear ),
		// 	new AbsoluteTarget( -3 ),
		// ) );

		// event.addNewAction( 'MyLaneChangeLeftAction', new LaneChangeAction(
		// 	new LaneChangeDynamics( 5, null, DynamicsShape.cubic ),
		// 	new RelativeTarget( this.entity.name, 1 ),
		// ) );


		// event.addStartCondition( new SimulationTimeCondition( 2, Rule.greater_than ) );

	}
}
