/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component } from '@angular/core';
import { PlayerService } from '../../../core/player.service';
import { ScenarioViewerService } from 'app/modules/scenario/services/scenario-viewer.service';
import { TvElectronService } from 'app/services/tv-electron.service';
import { EditorService } from 'app/core/services/editor.service';
import { EsminiPlayerService } from 'app/core/esmini-player.service';
import { Environment } from 'app/core/utils/environment';

@Component( {
	selector: 'app-player-bar',
	templateUrl: './player-bar.component.html',
	styleUrls: [ './player-bar.component.css' ]
} )
export class PlayerBarComponent {

	public hasStarted: boolean;

	private handle: NodeJS.Timeout;

	public get isPlaying (): boolean {
		return this.playerService.playing;
	}

	constructor (
		private playerService: PlayerService,
		private scenarioViewerService: ScenarioViewerService,
		private electronService: TvElectronService,
		private editor: EditorService,
		private esminiPlayerService: EsminiPlayerService,
	) {
	}

	get isEsminiEnabled () {
		return this.esminiPlayerService.isEnabled && Environment.oscEnabled;
	}

	playSimulation () {

		if ( this.esminiPlayerService.isEnabled ) {
			this.esminiPlayerService.playSimulation();
			return;
		}

		// if ( this.isPlaying ) return;

		// this.playerService.play();

		// this.hasStarted = true;
	}

	pauseSimulation () {

		if ( !this.isPlaying ) return;

		this.playerService.pause();

	}

	stopSimulation () {

		if ( !this.hasStarted ) return;

		this.playerService.stop();

		this.hasStarted = false;
	}

	playSingleSimulationStep () {

		this.playSimulation();

		this.pauseSimulation();

	}

	onMouseDown () {

		this.handle = setInterval( () => this.playSingleSimulationStep(), 20 );

	}

	onMouseUp () {

		clearInterval( this.handle );

	}
}
