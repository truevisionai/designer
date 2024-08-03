import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { JunctionManager } from "../../app/managers/junction-manager";
import { SplineTestHelper } from "../../app/services/spline/spline-test-helper.service";
import { JunctionToolHelper } from "../../app/tools/junction/junction-tool.helper";
import { TvRoadLink, TvRoadLinkType } from "../../app/map/models/tv-road-link";
import { TvContactPoint } from "../../app/map/models/tv-common";
import { expectValidMap } from "../base-test.spec";

describe( 'CustomJunction: Tests', () => {

	let eventServiceProvider: EventServiceProvider;
	let junctionManager: JunctionManager;
	let testHelper: SplineTestHelper;
	let juctionToolHelper: JunctionToolHelper;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
		} );

		eventServiceProvider = TestBed.inject( EventServiceProvider );
		junctionManager = TestBed.inject( JunctionManager );
		testHelper = TestBed.inject( SplineTestHelper );
		juctionToolHelper = TestBed.inject( JunctionToolHelper );

		eventServiceProvider.init();

	} );

	it( 'should create correctly', () => {

		expect( junctionManager ).toBeTruthy();

	} );

	function addTwoRoadCustomJunction () {

		testHelper.create2RoadsForCustomJunction();

		const leftRoad = testHelper.mapService.findRoad( 1 );
		const rightRoad = testHelper.mapService.findRoad( 2 );

		const links = [
			new TvRoadLink( TvRoadLinkType.ROAD, leftRoad, TvContactPoint.END ),
			new TvRoadLink( TvRoadLinkType.ROAD, rightRoad, TvContactPoint.START )
		]

		const junction = juctionToolHelper.createCustomJunction( links );

		junctionManager.addJunction( junction );

	}

	function addThreeRoadCustomJunction () {

		testHelper.create3RoadsForCustomJunction();

		const leftRoad = testHelper.mapService.findRoad( 1 );
		const rightRoad = testHelper.mapService.findRoad( 2 );
		const bottomRoad = testHelper.mapService.findRoad( 3 );

		const links = [
			new TvRoadLink( TvRoadLinkType.ROAD, leftRoad, TvContactPoint.END ),
			new TvRoadLink( TvRoadLinkType.ROAD, rightRoad, TvContactPoint.START ),
			new TvRoadLink( TvRoadLinkType.ROAD, bottomRoad, TvContactPoint.END ),
		]

		const junction = juctionToolHelper.createCustomJunction( links );

		junctionManager.addJunction( junction );

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
		expect( testHelper.mapService.getRoadCount() ).toBe( 8 );
		expect( testHelper.mapService.getSplineCount() ).toBe( 8 );

	} );

	it( 'should unlink road when 2-road-junction is removed', () => {

		addTwoRoadCustomJunction();

		const junction = testHelper.mapService.findJunction( 1 );

		junctionManager.removeJunction( junction );

		const leftRoad = testHelper.mapService.findRoad( 1 );
		const rightRoad = testHelper.mapService.findRoad( 2 );

		expect( leftRoad.successor ).toBeNull();
		expect( rightRoad.predecessor ).toBeNull();

		expect( testHelper.mapService.findJunction( 1 ) ).toBeUndefined();
		expect( testHelper.mapService.getJunctionCount() ).toBe( 0 );
		expect( testHelper.mapService.getRoadCount() ).toBe( 2 );
		expect( testHelper.mapService.getSplineCount() ).toBe( 2 );

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
		expect( testHelper.mapService.getRoadCount() ).toBe( 3 + 12 );
		expect( testHelper.mapService.getSplineCount() ).toBe( 3 + 12 );

	} );

	it( 'should unlink road from 3-road-junction', () => {

		addThreeRoadCustomJunction();

		const junction = testHelper.mapService.findJunction( 1 );
		const bottomRoad = testHelper.mapService.findRoad( 3 );

		testHelper.splineService.remove( bottomRoad.spline );

		const leftRoad = testHelper.mapService.findRoad( 1 );
		const rightRoad = testHelper.mapService.findRoad( 2 );

		expect( leftRoad.successor.element ).toBe( junction );
		expect( rightRoad.predecessor.element ).toBe( junction );

		expect( junction.getLaneLinkCount() ).toBe( 6 );

		expect( testHelper.mapService.findRoad( 2 ) ).toBeDefined();
		expect( testHelper.mapService.findJunction( 1 ) ).toBeDefined();
		expect( testHelper.mapService.getJunctionCount() ).toBe( 1 );
		expect( testHelper.mapService.getRoadCount() ).toBe( 2 + 6 );
		expect( testHelper.mapService.getSplineCount() ).toBe( 2 + 6 );

	} );

} );
