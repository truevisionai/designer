/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ScenarioEvents } from '../services/scenario-events';
import { TvAction } from './tv-action';
import { ActionCategory, StoryboardElementState, StoryboardElementType } from './tv-enums';

export abstract class PrivateAction extends TvAction {

	public category = ActionCategory.private;

	protected actionCompleted () {

		this.isCompleted = true;

		this.completed.emit( {
			type: StoryboardElementType.action,
			name: this.name,
			state: StoryboardElementState.endTransition
		} );

		ScenarioEvents.events.emit( {
			type: StoryboardElementType.action,
			name: this.name,
			state: StoryboardElementState.endTransition
		} );

	}

}
