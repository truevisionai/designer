/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { HttpClientModule } from "@angular/common/http";
import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { disableMeshBuilding } from "app/map/builders/od-builder-config";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { AutoSignalizationType, AutoSignalizeJunctionService } from "./auto-signalize-junction.service";
import { JunctionRoadService } from "app/services/junction/junction-road.service";
import { OpenDriveSignals, SignalDatabase } from "app/map/road-signal/road-signal.database";

describe( 'TrafficLightTool', () => {

	let eventServiceProvider: EventServiceProvider;
	let testHelper: SplineTestHelper;
	let signalizationService: AutoSignalizeJunctionService;
	let junctionRoadService: JunctionRoadService;

	beforeEach( () => {

		disableMeshBuilding();

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
			providers: []
		} );

		testHelper = TestBed.inject( SplineTestHelper );
		eventServiceProvider = TestBed.inject( EventServiceProvider );
		signalizationService = TestBed.inject( AutoSignalizeJunctionService );
		junctionRoadService = TestBed.inject( JunctionRoadService );
		eventServiceProvider.init();

	} );

	it( 'should signalize split-phase for default junction', fakeAsync( () => {

		testHelper.addDefaultJunction();

		tick( 1000 );

		const J1 = testHelper.mapService.findJunction( 1 );
		const R1 = testHelper.mapService.findRoad( 1 );
		const R2 = testHelper.mapService.findRoad( 2 );
		const R3 = testHelper.mapService.findRoad( 3 );
		const R4 = testHelper.mapService.findRoad( 4 );

		signalizationService.addSignalization( J1, AutoSignalizationType.SPIT_PHASE );

		expect( J1.getJunctionControllerCount() ).toBe( 4 );

		junctionRoadService.getIncomingRoads( J1 ).forEach( road => {
			expect( road.getSignalCount() ).toBe( 2 );
		} );

		expect( R1.getRoadSignals()[ 1 ].type ).toBe( OpenDriveSignals.STOP_LINE );
		expect( R1.getRoadSignals()[ 1 ].validities.length ).toBe( 1 );
		expect( R1.getRoadSignals()[ 1 ].validities[ 0 ].fromLane ).toBe( -1 );
		expect( R1.getRoadSignals()[ 1 ].validities[ 0 ].toLane ).toBe( -1 );

		expect( R2.getRoadSignals()[ 1 ].type ).toBe( OpenDriveSignals.STOP_LINE );
		expect( R2.getRoadSignals()[ 1 ].validities.length ).toBe( 1 );
		expect( R2.getRoadSignals()[ 1 ].validities[ 0 ].fromLane ).toBe( -1 );
		expect( R2.getRoadSignals()[ 1 ].validities[ 0 ].toLane ).toBe( -1 );

		expect( R3.getRoadSignals()[ 1 ].type ).toBe( OpenDriveSignals.STOP_LINE );
		expect( R3.getRoadSignals()[ 1 ].validities.length ).toBe( 1 );
		expect( R3.getRoadSignals()[ 1 ].validities[ 0 ].fromLane ).toBe( 1 );
		expect( R3.getRoadSignals()[ 1 ].validities[ 0 ].toLane ).toBe( 1 );

		expect( R4.getRoadSignals()[ 1 ].type ).toBe( OpenDriveSignals.STOP_LINE );
		expect( R4.getRoadSignals()[ 1 ].validities.length ).toBe( 1 );
		expect( R4.getRoadSignals()[ 1 ].validities[ 0 ].fromLane ).toBe( 1 );
		expect( R4.getRoadSignals()[ 1 ].validities[ 0 ].toLane ).toBe( 1 );


	} ) );

	it( 'should signalize all-go for default junction', fakeAsync( () => {

		testHelper.addDefaultJunction();

		tick( 1000 );

		const J1 = testHelper.mapService.findJunction( 1 );

		signalizationService.addSignalization( J1, AutoSignalizationType.ALL_GO );

		expect( J1.getJunctionControllerCount() ).toBe( 0 );

		junctionRoadService.getIncomingRoads( J1 ).forEach( road => {
			expect( road.getSignalCount() ).toBe( 0 );
		} );


	} ) );

	it( 'should signalize all-stop for default junction', fakeAsync( () => {

		testHelper.addDefaultJunction();

		tick( 1000 );

		const J1 = testHelper.mapService.findJunction( 1 );
		const R1 = testHelper.mapService.findRoad( 1 );
		const R2 = testHelper.mapService.findRoad( 2 );
		const R3 = testHelper.mapService.findRoad( 3 );
		const R4 = testHelper.mapService.findRoad( 4 );

		signalizationService.addSignalization( J1, AutoSignalizationType.ALL_STOP );

		expect( J1.getJunctionControllerCount() ).toBe( 0 );

		junctionRoadService.getIncomingRoads( J1 ).forEach( road => {
			expect( road.getSignalCount() ).toBe( 2 );
		} );

		expect( R1.getRoadSignals()[ 1 ].type ).toBe( OpenDriveSignals.STOP_LINE );
		expect( R1.getRoadSignals()[ 1 ].validities.length ).toBe( 1 );
		expect( R1.getRoadSignals()[ 1 ].validities[ 0 ].fromLane ).toBe( -1 );
		expect( R1.getRoadSignals()[ 1 ].validities[ 0 ].toLane ).toBe( -1 );

		expect( R2.getRoadSignals()[ 1 ].type ).toBe( OpenDriveSignals.STOP_LINE );
		expect( R2.getRoadSignals()[ 1 ].validities.length ).toBe( 1 );
		expect( R2.getRoadSignals()[ 1 ].validities[ 0 ].fromLane ).toBe( -1 );
		expect( R2.getRoadSignals()[ 1 ].validities[ 0 ].toLane ).toBe( -1 );

		expect( R3.getRoadSignals()[ 1 ].type ).toBe( OpenDriveSignals.STOP_LINE );
		expect( R3.getRoadSignals()[ 1 ].validities.length ).toBe( 1 );
		expect( R3.getRoadSignals()[ 1 ].validities[ 0 ].fromLane ).toBe( 1 );
		expect( R3.getRoadSignals()[ 1 ].validities[ 0 ].toLane ).toBe( 1 );

		expect( R4.getRoadSignals()[ 1 ].type ).toBe( OpenDriveSignals.STOP_LINE );
		expect( R4.getRoadSignals()[ 1 ].validities.length ).toBe( 1 );
		expect( R4.getRoadSignals()[ 1 ].validities[ 0 ].fromLane ).toBe( 1 );
		expect( R4.getRoadSignals()[ 1 ].validities[ 0 ].toLane ).toBe( 1 );

	} ) );

	it( 'should signalize one-way junction', fakeAsync( () => {

		// expect( true ).toBe( false )

	} ) );


	it( 'should signalize junction with sidewalk', fakeAsync( () => {

		// expect( true ).toBe( false )

	} ) );

	it( 'should signalize junction with shoulder', fakeAsync( () => {

		// expect( true ).toBe( false )

	} ) );

	it( 'should signalize junction without shoulder & sidewalk', fakeAsync( () => {

		// expect( true ).toBe( false )

	} ) );

} );
