/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from '@angular/core/testing';
import { PlayerService } from '../../core/player.service';
import { SimulationTimeCondition } from '../models/conditions/tv-simulation-time-condition';
import { TvScenario } from '../models/tv-scenario';
import { ScenarioDirectorService } from './scenario-director.service';
import { ScenarioService } from './scenario.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';


describe( 'ScenarioPlayerService', () => {

	let scenarioPlayer: ScenarioDirectorService;
	let playerService: PlayerService;
	let scenario: TvScenario;


	beforeEach( () => {
		TestBed.configureTestingModule( {
			imports: [ MatSnackBarModule, HttpClientModule ],
			providers: [ ScenarioDirectorService, PlayerService ],
		} );

		scenarioPlayer = TestBed.inject( ScenarioDirectorService );
		playerService = TestBed.inject( PlayerService );
	} );

	beforeEach( () => {

		scenario = new TvScenario();

		scenario.storyboard.addEndCondition( new SimulationTimeCondition( 10 ) );

	} );


	afterEach( () => {

		playerService.stop();

	} );

	it( 'should emit the event', ( () => {

		let playerStartedEmitted = false;
		let playerResumedEmitted = false;

		playerService.playerStarted.subscribe( () => {
			playerStartedEmitted = true;
		} );

		playerService.playerResumed.subscribe( () => {
			playerResumedEmitted = true;
		} );

		expect( playerService.playing ).toBe( false );

		playerService.play();

		expect( playerStartedEmitted ).toBe( true );
		expect( playerResumedEmitted ).toBe( false );
		expect( playerService.playing ).toBe( true );
	} ) );


} );
