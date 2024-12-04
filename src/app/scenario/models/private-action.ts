/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvAction } from './tv-action';
import { ActionCategory } from './tv-enums';

export abstract class PrivateAction extends TvAction {

	public category = ActionCategory.private;

	protected actionCompleted (): void {

		this.isCompleted = true;

		// this.completed.emit( {
		// 	type: StoryboardElementType.action,
		// 	name: this.name,
		// 	state: StoryboardElementState.endTransition
		// } );
		//
		// ScenarioEvents.events.emit( {
		// 	type: StoryboardElementType.action,
		// 	name: this.name,
		// 	state: StoryboardElementState.endTransition
		// } );

	}

}
