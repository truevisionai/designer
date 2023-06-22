import { ScenarioEvents } from '../services/scenario-events';
import { TvAction } from './tv-action';
import { ActionCategory, StoryElementState, StoryElementType } from './tv-enums';

export abstract class PrivateAction extends TvAction {

	public category = ActionCategory.private;

	protected actionCompleted () {

		this.isCompleted = true;

		this.completed.emit( {
			type: StoryElementType.action,
			name: this.name,
			state: StoryElementState.completed
		} );

		ScenarioEvents.events.emit( {
			type: StoryElementType.action,
			name: this.name,
			state: StoryElementState.completed
		} );

	}

}
