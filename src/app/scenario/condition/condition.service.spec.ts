import { TestBed } from '@angular/core/testing';

import { ConditionService } from './condition.service';

describe( 'ConditionService', () => {
	let service: ConditionService;

	beforeEach( () => {
		TestBed.configureTestingModule( {} );
		service = TestBed.inject( ConditionService );
	} );

	it( 'should be created', () => {
		expect( service ).toBeTruthy();
	} );
} );
