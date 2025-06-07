import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { SplineTestHelper, STRAIGHT_XODR } from "../../../app/services/spline/spline-test-helper.service";
import { JunctionToolHelper } from "../../../app/modules/junction/junction-tool.helper";
import { OpenDriveParserService } from 'app/importers/open-drive/open-drive-parser.service';
import { setupTest } from 'tests/setup-tests';

describe( 'Imported XJunction: Tests', () => {

	let testHelper: SplineTestHelper;
	let juctionToolHelper: JunctionToolHelper;
	let httpClient: HttpClient;
	let parserService: OpenDriveParserService;

	beforeEach( () => {

		setupTest();

		testHelper = TestBed.inject( SplineTestHelper );
		juctionToolHelper = TestBed.inject( JunctionToolHelper );
		httpClient = TestBed.inject( HttpClient );
		parserService = TestBed.inject( OpenDriveParserService );

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

		expect( road.spline.getPositions()[ 0 ].x ).toBe( 0 );
		expect( road.spline.getPositions()[ 0 ].y ).toBe( 0 );
		expect( road.spline.getPositions()[ 0 ].z ).toBe( 0 );

		expect( road.spline.getControlPoints()[ 1 ].position.x ).toBeCloseTo( 0 );
		expect( road.spline.getControlPoints()[ 1 ].position.y ).toBe( 100 );
		expect( road.spline.getControlPoints()[ 1 ].position.z ).toBe( 0 );

	} );

} );
