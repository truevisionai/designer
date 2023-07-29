/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component } from '@angular/core';
import { PlayerService } from '../../../core/player.service';
import { ScenarioViewerService } from 'app/modules/scenario/services/scenario-viewer.service';
import { TvElectronService } from 'app/services/tv-electron.service';

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
		private electronService: TvElectronService
	) {
	}


	playSimulation () {

		// ./bin/odrviewer --window 60 60 800 400 --odr ~/Documents/Truevision/Roads/t-intersection.xodr
		this.electronService.runEsmini();

		if ( this.isPlaying ) return;

		this.playerService.play();

		this.hasStarted = true;
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
