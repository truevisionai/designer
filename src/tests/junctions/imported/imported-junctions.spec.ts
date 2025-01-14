import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SplineTestHelper, STRAIGHT_XODR } from "../../../app/services/spline/spline-test-helper.service";
import { JunctionToolHelper } from "../../../app/modules/junction/junction-tool.helper";
import { OpenDriveParserService } from 'app/importers/open-drive/open-drive-parser.service';
import { Vector3 } from 'app/core/maths';

describe( 'Imported XJunction: Tests', () => {

	let eventServiceProvider: EventServiceProvider;
	let testHelper: SplineTestHelper;
	let juctionToolHelper: JunctionToolHelper;
	let httpClient: HttpClient;
	let parserService: OpenDriveParserService;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
		} );

		eventServiceProvider = TestBed.inject( EventServiceProvider );
		testHelper = TestBed.inject( SplineTestHelper );
		juctionToolHelper = TestBed.inject( JunctionToolHelper );
		httpClient = TestBed.inject( HttpClient );
		parserService = TestBed.inject( OpenDriveParserService );

		eventServiceProvider.init();

	} );

	it( 'should parse road correctly', async () => {

		const contents = await testHelper.loadXodr( STRAIGHT_XODR ).toPromise();

		const map = testHelper.openDriveParser.parse( contents );

		const road = map.getRoad( 1 );

		expect( road ).toBeDefined();

		expect( road.length ).toBe( 100 );
		expect( road.spline.getLength() ).toBe( 100 );
		expect( road.id ).toBe( 1 );
		expect( road.isJunction ).toBe( false );
		expect( road.spline.getControlPointCount() ).toBe( 2 );

		expect( road.spline.getPositions()[ 0 ] ).toEqual( new Vector3( 0, 0, 0 ) );

		expect( road.spline.getControlPoints()[ 1 ].position.x ).toBeCloseTo( 0 );
		expect( road.spline.getControlPoints()[ 1 ].position.y ).toBe( 100 );
		expect( road.spline.getControlPoints()[ 1 ].position.z ).toBe( 0 );

	} );

} );
