/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { StoryboardEvent } from './scenario-director.service';

export class ScenarioEvents {

	public static events = new EventEmitter<StoryboardEvent>();

	static fire ( event: StoryboardEvent ): void {

		this.events.emit( event );

	}
}
