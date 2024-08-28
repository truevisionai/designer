import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { EventServiceProvider } from "../../app/listeners/event-service-provider";
import { HttpClientModule } from "@angular/common/http";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { ManeuverTool } from "../../app/tools/maneuver/maneuver-tool";
import { ManeuverToolHelper } from "../../app/tools/maneuver/maneuver-tool-helper.service";
import { SplineTestHelper } from "../../app/services/spline/spline-test-helper.service";
import { JunctionUtils } from "../../app/utils/junction.utils";
import { disableMeshBuilding } from "app/map/builders/od-builder-config";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { TvLaneCoord } from "app/map/models/tv-lane-coord";
import { LaneUtils } from "app/utils/lane.utils";

describe( 'ManeuverTool', () => {

	let tool: ManeuverTool;
	let eventServiceProvider: EventServiceProvider;
	let helper: SplineTestHelper;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
			providers: []
		} );

		tool = new ManeuverTool( TestBed.inject( ManeuverToolHelper ) )
		helper = TestBed.inject( SplineTestHelper );
		eventServiceProvider = TestBed.inject( EventServiceProvider );

		disableMeshBuilding();

		eventServiceProvider.init();

	} );

	it( 'should create maneuver tool correctly', () => {

		expect( tool ).toBeTruthy();

	} )

	it( 'should remove and add connection correctly', fakeAsync( () => {

		// NOTE: this test works but intermittently fails

		tool.init();

		tool.enable();

		helper.addDefaultJunction();

		tick( 1000 );

		const leftRoad = helper.mapService.findRoad( 1 );
		const rightRoad = helper.mapService.findRoad( 4 );
		const junction = helper.mapService.findJunction( 1 );
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
		expect( helper.mapService.hasRoad( leftToRightConnection.connectingRoad.id ) ).toBeFalse();

		tool.addManeuver( junction, leftToRightConnection, leftToRightLinks[ 0 ] );

		expect( JunctionUtils.getLaneLinks( junction ).length ).toBe( 20 );
		expect( JunctionUtils.findLinksBetween( junction, leftRoad, rightRoad ).length ).toBe( 2 );
		expect( JunctionUtils.findLinksFrom( junction, leftRoad, rightRoad ).length ).toBe( 1 );
		expect( JunctionUtils.findLinksFrom( junction, rightRoad, leftRoad ).length ).toBe( 1 );
		expect( helper.mapService.findRoad( leftToRightConnection.connectingRoad.id ) ).toBeDefined();

	} ) );

	it( 'should return true if links can connect', fakeAsync( () => {

		AbstractSpline.reset();

		helper.addDefaultJunction();

		tick( 1000 );

		const leftRoad = helper.mapService.findRoad( 1 );
		const rightRoad = helper.mapService.findRoad( 4 );

		const entryR1 = new TvLaneCoord( leftRoad, leftRoad.laneSections[ 0 ], leftRoad.laneSections[ 0 ].getLaneById( -1 ), leftRoad.length, 0 );
		expect( LaneUtils.canConnect( entryR1, entryR1 ) ).toBe( false );

		const exitR1 = new TvLaneCoord( rightRoad, rightRoad.laneSections[ 0 ], rightRoad.laneSections[ 0 ].getLaneById( -1 ), 0, 0 );
		expect( LaneUtils.canConnect( exitR1, exitR1 ) ).toBe( false );

		const exitL1 = new TvLaneCoord( rightRoad, rightRoad.laneSections[ 0 ], rightRoad.laneSections[ 0 ].getLaneById( 1 ), 0, 0 );
		expect( LaneUtils.canConnect( entryR1, exitL1 ) ).toBe( false );
		expect( LaneUtils.canConnect( exitL1, entryR1 ) ).toBe( false );

		const exitR2 = new TvLaneCoord( rightRoad, rightRoad.laneSections[ 0 ], rightRoad.laneSections[ 0 ].getLaneById( -2 ), 0, 0 );
		expect( LaneUtils.canConnect( exitR2, entryR1 ) ).toBe( false );
		expect( LaneUtils.canConnect( entryR1, exitR2 ) ).toBe( false );

		expect( LaneUtils.canConnect( exitR1, entryR1 ) ).toBe( true );
		expect( LaneUtils.canConnect( entryR1, exitR1 ) ).toBe( true );

	} ) );


} );
