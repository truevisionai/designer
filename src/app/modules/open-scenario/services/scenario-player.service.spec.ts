/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PlayerService } from '../../../core/player.service';
import { ScenarioPlayerService } from './scenario-player.service';
import { SimulationTimeCondition } from '../models/conditions/tv-simulation-time-condition';
import { TvScenarioInstance } from './tv-scenario-instance';
import { OpenScenario } from '../models/tv-scenario';


describe( 'ScenarioPlayerService', () => {

	let scenarioPlayer: ScenarioPlayerService;
	let playerService: PlayerService;


	beforeEach( () => {
		TestBed.configureTestingModule( {
			providers: [ ScenarioPlayerService, PlayerService ],
		} );

		scenarioPlayer = TestBed.inject( ScenarioPlayerService );
		playerService = TestBed.inject( PlayerService );
	} );

	beforeEach( () => {

		TvScenarioInstance.openScenario = new OpenScenario();

		TvScenarioInstance.openScenario.storyboard.addEndCondition( new SimulationTimeCondition( 10 ) );


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
