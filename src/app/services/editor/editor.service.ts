/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvSceneFileService } from 'app/services/tv-scene-file.service';
import { KeyboardEvents } from '../../events/keyboard-events';
import { MapService } from "../map/map.service";
import { ScenarioService } from "../../scenario/services/scenario.service";
import { EditorSettings } from './editor.settings';

@Injectable( {
	providedIn: 'root'
} )
export class EditorService {

	get map () {
		return this.mapService.map;
	}

	get scenario () {
		return this.scenarioService.getScenario();
	}

	constructor (
		private mainFileService: TvSceneFileService,
		private mapService: MapService,
		private scenarioService: ScenarioService,
		public settings: EditorSettings,
	) {
	}

	newFile () {

		this.mainFileService.newScene();

	}

	save () {

		this.mainFileService.save();

	}

	saveAs () {

		this.mainFileService.saveAs();

	}

	onKeyDown ( e: KeyboardEvent ) {

		// fire the event for the whole application
		KeyboardEvents.OnKeyDown( e );

	}

	onKeyUp ( e: KeyboardEvent ) {

		// fire the event for the whole application
		KeyboardEvents.OnKeyUp( e );

	}

}



