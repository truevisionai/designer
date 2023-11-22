/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from '@angular/core/testing';
import { PlayerService } from '../../../core/player.service';
import { SimulationTimeCondition } from '../models/conditions/tv-simulation-time-condition';
import { TvScenario } from '../models/tv-scenario';
import { ScenarioDirectorService } from './scenario-director.service';
import { ScenarioService } from './scenario.service';


describe( 'ScenarioPlayerService', () => {

	let scenarioPlayer: ScenarioDirectorService;
	let playerService: PlayerService;


	beforeEach( () => {
		TestBed.configureTestingModule( {
			providers: [ ScenarioDirectorService, PlayerService ],
		} );

		scenarioPlayer = TestBed.inject( ScenarioDirectorService );
		playerService = TestBed.inject( PlayerService );
	} );

	beforeEach( () => {

		ScenarioService.scenario = new TvScenario();

		ScenarioService.scenario.storyboard.addEndCondition( new SimulationTimeCondition( 10 ) );


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
