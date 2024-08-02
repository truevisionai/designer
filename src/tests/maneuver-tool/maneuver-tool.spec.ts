import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { EventServiceProvider } from "../../app/listeners/event-service-provider";
import { HttpClientModule } from "@angular/common/http";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { ManeuverTool } from "../../app/tools/maneuver/maneuver-tool";
import { ManeuverToolHelper } from "../../app/tools/maneuver/maneuver-tool-helper.service";
import { SplineTestHelper } from "../../app/services/spline/spline-test-helper.service";
import { JunctionUtils } from "../../app/utils/junction.utils";
import { disableMeshBuilding } from "app/map/builders/od-builder-config";

describe( 'ManeuverTool', () => {

	let tool: ManeuverTool;
	let eventServiceProvider: EventServiceProvider;
	let splineTestHelper: SplineTestHelper;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
			providers: []
		} );

		tool = new ManeuverTool( TestBed.inject( ManeuverToolHelper ) )
		splineTestHelper = TestBed.inject( SplineTestHelper );
		eventServiceProvider = TestBed.inject( EventServiceProvider );

		disableMeshBuilding();

	} );

	it( 'should create maneuver tool correctly', () => {

		expect( tool ).toBeTruthy();

	} )

	it( 'should remove and add connection correctly', fakeAsync( () => {

		// NOTE: this test works but intermittently fails

		eventServiceProvider.init();

		tool.init();

		tool.enable();

		splineTestHelper.addDefaultJunction();

		tick( 1000 );

		const leftRoad = tool.helper.junctionService.mapService.findRoad( 1 );
		const rightRoad = tool.helper.junctionService.mapService.findRoad( 4 );
		const junction = tool.helper.junctionService.mapService.findJunction( 1 );
		const leftToRightLinks = JunctionUtils.findLinksFrom( junction, leftRoad, rightRoad );
		const leftToRightConnection = JunctionUtils.findConnectionFromLink( junction, leftToRightLinks[ 0 ] );

		// we want to remove
		// left road -1 lane connection with right road 1 lane
		expect( leftRoad.spline ).toBe( rightRoad.spline );
		expect( JunctionUtils.getLaneLinks( junction ).length ).toBe( 20 );
		expect( JunctionUtils.findLinksBetween( junction, leftRoad, rightRoad ).length ).toBe( 2 );
		expect( JunctionUtils.findLinksFrom( junction, leftRoad, rightRoad ).length ).toBe( 1 );
		expect( JunctionUtils.findLinksFrom( junction, rightRoad, leftRoad ).length ).toBe( 1 );
		expect( leftToRightConnection ).toBeDefined();

		tool.removeManeuver( junction, leftToRightConnection, leftToRightLinks[ 0 ] );

		expect( JunctionUtils.getLaneLinks( junction ).length ).toBe( 19 );
		expect( JunctionUtils.findLinksBetween( junction, leftRoad, rightRoad ).length ).toBe( 1 );
		expect( JunctionUtils.findLinksFrom( junction, leftRoad, rightRoad ).length ).toBe( 0 );
		expect( JunctionUtils.findLinksFrom( junction, rightRoad, leftRoad ).length ).toBe( 1 );
		expect( tool.helper.junctionService.mapService.findRoad( leftToRightConnection.connectingRoad.id ) ).toBeUndefined();

		tool.addManeuver( junction, leftToRightConnection, leftToRightLinks[ 0 ] );

		expect( JunctionUtils.getLaneLinks( junction ).length ).toBe( 20 );
		expect( JunctionUtils.findLinksBetween( junction, leftRoad, rightRoad ).length ).toBe( 2 );
		expect( JunctionUtils.findLinksFrom( junction, leftRoad, rightRoad ).length ).toBe( 1 );
		expect( JunctionUtils.findLinksFrom( junction, rightRoad, leftRoad ).length ).toBe( 1 );
		expect( tool.helper.junctionService.mapService.findRoad( leftToRightConnection.connectingRoad.id ) ).toBeDefined();

	} ) );


} );
