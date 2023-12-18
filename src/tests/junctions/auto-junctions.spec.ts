import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RoadTool } from 'app/tools/road/road-tool';
import { RoadToolService } from 'app/tools/road/road-tool.service';

describe( 't-intersection auto maneuver logic tests', () => {

	let tool: RoadTool;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule ],
			providers: [ RoadToolService ]
		} );

		tool = new RoadTool( TestBed.inject( RoadToolService ) )

	} );

	it( 'should create tool', () => {

		expect( tool ).toBeDefined();

	} );


} );
