/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PlayerService } from '../../../core/player.service';
import { ScenarioDirectorService } from './scenario-director.service';
import { SimulationTimeCondition } from '../models/conditions/tv-simulation-time-condition';
import { ScenarioInstance } from './scenario-instance';
import { TvScenario } from '../models/tv-scenario';


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

		ScenarioInstance.scenario = new TvScenario();

		ScenarioInstance.scenario.storyboard.addEndCondition( new SimulationTimeCondition( 10 ) );


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
