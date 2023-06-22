import { EventEmitter } from '@angular/core';
import { StoryEvent } from './scenario-director.service';

export class ScenarioEvents {

	public static events = new EventEmitter<StoryEvent>();

	static fire ( event: StoryEvent ) {

		this.events.emit( event );

	}
}
