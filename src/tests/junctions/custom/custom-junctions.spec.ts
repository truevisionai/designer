import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SplineTestHelper } from "../../../app/services/spline/spline-test-helper.service";
import { JunctionToolHelper } from "../../../app/modules/junction/junction-tool.helper";
import { LinkFactory } from 'app/map/models/link-factory';
import { TvContactPoint } from "../../../app/map/models/tv-common";
import { expectValidMap } from "../../base-test.spec";
import { EXPECT_CONNECTION } from "../../expect-junction.spec";

describe( 'CustomJunction: Tests', () => {

	let eventServiceProvider: EventServiceProvider;
	let testHelper: SplineTestHelper;
	let juctionToolHelper: JunctionToolHelper;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
		} );

		eventServiceProvider = TestBed.inject( EventServiceProvider );
		testHelper = TestBed.inject( SplineTestHelper );
		juctionToolHelper = TestBed.inject( JunctionToolHelper );

		eventServiceProvider.init();

	} );

	function addTwoRoadCustomJunction () {

		testHelper.create2RoadsForCustomJunction();

		const leftRoad = testHelper.mapService.findRoad( 1 );
		const rightRoad = testHelper.mapService.findRoad( 2 );

		const links = [
			LinkFactory.createRoadLink( leftRoad, TvContactPoint.END ),
			LinkFactory.createRoadLink( rightRoad, TvContactPoint.START )
		]

		const junction = juctionToolHelper.createCustomJunction( links );

		testHelper.junctionService.fireCreatedEvent( junction );

	}

	function addThreeRoadCustomJunction () {

		testHelper.create3RoadsForCustomJunction();

		const leftRoad = testHelper.mapService.findRoad( 1 );
		const rightRoad = testHelper.mapService.findRoad( 2 );
		const bottomRoad = testHelper.mapService.findRoad( 3 );

		const links = [
			LinkFactory.createRoadLink( leftRoad, TvContactPoint.END ),
			LinkFactory.createRoadLink( rightRoad, TvContactPoint.START ),
			LinkFactory.createRoadLink( bottomRoad, TvContactPoint.END ),
		]

		const junction = juctionToolHelper.createCustomJunction( links );

		testHelper.junctionService.fireCreatedEvent( junction );

	}

	it( 'should create 2-road-junction', () => {

		addTwoRoadCustomJunction();

		const junction = testHelper.mapService.findJunction( 1 );

		expect( junction ).toBeDefined();
		expect( junction.getLaneLinkCount() ).toBe( 6 );

		expectValidMap( testHelper.mapService );

		const leftRoad = testHelper.mapService.findRoad( 1 );
		const rightRoad = testHelper.mapService.findRoad( 2 );

		expect( leftRoad.successor.element ).toBe( junction );
		expect( rightRoad.predecessor.element ).toBe( junction );

		expect( testHelper.mapService.findJunction( 1 ) ).toBe( junction );
		expect( testHelper.mapService.getJunctionCount() ).toBe( 1 );
		expect( testHelper.mapService.getRoadCount() ).toBe( 4 );
		expect( testHelper.mapService.getSplineCount() ).toBe( 4 );

	} );

	it( 'should unlink road when 2-road-junction is removed', () => {

		addTwoRoadCustomJunction();

		const junction = testHelper.mapService.findJunction( 1 );

		testHelper.junctionService.fireRemovedEvent( junction );

		expectValidMap( testHelper.mapService );

		const leftRoad = testHelper.mapService.findRoad( 1 );
		const rightRoad = testHelper.mapService.findRoad( 2 );

		expect( leftRoad.hasSuccessor() ).toBeFalse();
		expect( rightRoad.hasPredecessor() ).toBeFalse();

		expect( testHelper.mapService.hasJunction( 1 ) ).toBeFalse();
		expect( testHelper.mapService.getJunctionCount() ).toBe( 0 );
		expect( testHelper.mapService.getRoadCount() ).toBe( 2 );
		expect( testHelper.mapService.getSplineCount() ).toBe( 2 );

		// now lets undo
		// junction model itself should not lose any data
		expect( junction.getConnectionCount() ).toBe( 2 );

		testHelper.junctionService.fireCreatedEvent( junction );

		expect( leftRoad.successor.isEqualTo( junction ) ).toBeTrue();
		expect( rightRoad.predecessor.isEqualTo( junction ) ).toBeTrue();

		expect( testHelper.mapService.findJunction( 1 ) ).toBe( junction );
		expect( testHelper.mapService.getJunctionCount() ).toBe( 1 );
		expect( testHelper.mapService.getRoadCount() ).toBe( 4 );
		expect( testHelper.mapService.getSplineCount() ).toBe( 4 );

		expectValidMap( testHelper.mapService );

	} );

	it( 'should create 3-road-junction', () => {

		addThreeRoadCustomJunction();

		const junction = testHelper.mapService.findJunction( 1 );

		expect( junction ).toBeDefined();
		expect( junction.getLaneLinkCount() ).toBe( 12 );

		expectValidMap( testHelper.mapService );

		const leftRoad = testHelper.mapService.findRoad( 1 );
		const rightRoad = testHelper.mapService.findRoad( 2 );
		const bottomRoad = testHelper.mapService.findRoad( 3 );

		expect( leftRoad.successor.element ).toBe( junction );
		expect( rightRoad.predecessor.element ).toBe( junction );
		expect( bottomRoad.successor.element ).toBe( junction );

		expect( testHelper.mapService.findJunction( 1 ) ).toBe( junction );
		expect( testHelper.mapService.getJunctionCount() ).toBe( 1 );
		expect( testHelper.mapService.getRoadCount() ).toBe( 3 + EXPECT_CONNECTION.T_JUNCTION );
		expect( testHelper.mapService.getSplineCount() ).toBe( 3 + EXPECT_CONNECTION.T_JUNCTION );

	} );

	it( 'should unlink road from 3-road-junction', () => {

		addThreeRoadCustomJunction();

		const junction = testHelper.mapService.findJunction( 1 );
		const bottomRoad = testHelper.mapService.findRoad( 3 );

		testHelper.splineService.remove( bottomRoad.spline );

		expectValidMap( testHelper.mapService );

		const leftRoad = testHelper.mapService.findRoad( 1 );
		const rightRoad = testHelper.mapService.findRoad( 2 );

		expect( leftRoad.successor.element ).toBe( junction );
		expect( rightRoad.predecessor.element ).toBe( junction );

		expect( junction.getLaneLinkCount() ).toBe( 6 );

		expect( testHelper.mapService.findRoad( 2 ) ).toBeDefined();
		expect( testHelper.mapService.findJunction( 1 ) ).toBeDefined();
		expect( testHelper.mapService.getJunctionCount() ).toBe( 1 );
		expect( testHelper.mapService.getRoadCount() ).toBe( 4 );
		expect( testHelper.mapService.getSplineCount() ).toBe( 4 );

	} );

	it( 'should unlink roads when 3-road-junction is removed', () => {

		addThreeRoadCustomJunction();

		const junction = testHelper.mapService.findJunction( 1 );

		testHelper.junctionService.fireRemovedEvent( junction );

		expectValidMap( testHelper.mapService );

		const leftRoad = testHelper.mapService.findRoad( 1 );
		const rightRoad = testHelper.mapService.findRoad( 2 );
		const bottomRoad = testHelper.mapService.findRoad( 3 );

		expect( leftRoad.successor ).toBeNull();
		expect( rightRoad.predecessor ).toBeNull();
		expect( bottomRoad.successor ).toBeNull();

		expect( testHelper.mapService.findRoad( 1 ) ).toBeDefined();
		expect( testHelper.mapService.findRoad( 2 ) ).toBeDefined();
		expect( testHelper.mapService.findRoad( 3 ) ).toBeDefined();

		expect( testHelper.mapService.hasJunction( 1 ) ).toBeFalse();
		expect( testHelper.mapService.getJunctionCount() ).toBe( 0 );
		expect( testHelper.mapService.getRoadCount() ).toBe( 3 );
		expect( testHelper.mapService.getSplineCount() ).toBe( 3 );

	} );

} );
