/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Time } from '../../../../core/time';
import { TvScenarioInstance } from '../../services/tv-scenario-instance';
import { EntityObject } from '../tv-entities';
import { OpenScenario } from '../tv-scenario';
import { StandStillCondition } from './tv-stand-still-condition';


describe( 'StandStillCondition', () => {

	let condition: StandStillCondition;

	beforeEach( () => {

		Time.reset();

		TvScenarioInstance.scenario = new OpenScenario();

		const entityObject = new EntityObject( 'ego' );

		TvScenarioInstance.scenario.addObject( entityObject );

		condition = new StandStillCondition( 1 );

		condition.addEntity( entityObject.name );

	} );


	it( 'should condition to pass if delta time is equal or greater than duration', ( () => {

		expect( condition.hasPassed() ).toBe( false );

		Time.fixedDeltaTime = 1000;

		expect( condition.hasPassed() ).toBe( true );

	} ) );


} );
