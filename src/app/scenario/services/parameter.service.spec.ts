import { TestBed } from '@angular/core/testing';

import { ParameterService } from './parameter.service';
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { HttpClientModule } from "@angular/common/http";

describe( 'ParameterService', () => {
	let service: ParameterService;

	beforeEach( () => {
		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );
		service = TestBed.inject( ParameterService );
	} );

	it( 'should be created', () => {
		expect( service ).toBeTruthy();
	} );

} );
