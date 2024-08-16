import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EventServiceProvider } from 'app/listeners/event-service-provider';
import { TvContactPoint } from 'app/map/models/tv-common';
import { RoadDividerService } from 'app/services/road/road-divider.service';
import { RoadService } from 'app/services/road/road.service';
import { Vector2, Vector3 } from 'three';
import { OpenDriveParserService } from "../../app/importers/open-drive/open-drive-parser.service";
import { XML } from '../stubs/straight-road-stub';
import { MapService } from "../../app/services/map/map.service";
import { SplineService } from 'app/services/spline/spline.service';
import { SplineTestHelper } from 'app/services/spline/spline-test-helper.service';


describe( 'Service: RoadDivider Simple', () => {

	let eventServiceProvider: EventServiceProvider;
	let roadDividerService: RoadDividerService;
	let splineService: SplineService;
	let testHelper: SplineTestHelper;

	beforeEach( () => {
		TestBed.configureTestingModule( {
			providers: [ RoadService ],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );

		eventServiceProvider = TestBed.get( EventServiceProvider );
		eventServiceProvider.init();

		roadDividerService = TestBed.get( RoadDividerService );
		splineService = TestBed.get( SplineService );
		testHelper = TestBed.get( SplineTestHelper );

	} );

	it( 'should divide straight road in middle', () => {

		// const road = roadService.createDefaultRoad();
		// road.spline.controlPoints.pushAt( new Vector3( -50, 0, 0 ) );
		// road.spline.controlPoints.pushAt( new Vector3( 50, 0, 0 ) );
		// roadService.addRoad( road );

		const S_OFFSET = 50;

		const road = testHelper.createDefaultRoad( [
			new Vector2( -50, 0 ),
			new Vector2( 50, 0 ),
		] );

		expect( road.length ).toBe( 100 );

		const oldLaneSection = road.getLaneProfile().getLaneSectionAt( S_OFFSET );

		const newRoad = roadDividerService.divideRoadAt( road, S_OFFSET );

		splineService.update( road.spline );

		expect( newRoad ).toBeDefined();
		expect( newRoad.sStart ).toBe( S_OFFSET );
		expect( newRoad.length ).toBe( 100 - S_OFFSET );

		expect( road ).toBeDefined();
		expect( road.sStart ).toBe( 0 );
		expect( road.length ).toBe( 50 );

		expect( newRoad.geometries.length ).toBe( 1 );
		expect( newRoad.geometries[ 0 ].s ).toBe( 0 );
		expect( newRoad.geometries[ 0 ].x ).toBe( 0 );
		expect( newRoad.geometries[ 0 ].y ).toBe( 0 );
		expect( newRoad.geometries[ 0 ].length ).toBe( 50 );

		expect( road.geometries.length ).toBe( 1 );
		expect( road.geometries[ 0 ].s ).toBe( 0 );
		expect( road.geometries[ 0 ].x ).toBe( -50 );
		expect( road.geometries[ 0 ].y ).toBe( 0 );
		expect( road.geometries[ 0 ].length ).toBe( 50 );

		expect( road.successor ).toBeDefined();
		expect( road.successor.id ).toBe( newRoad.id );
		expect( road.successor.contactPoint ).toBe( TvContactPoint.START );

		expect( newRoad.predecessor ).toBeDefined();
		expect( newRoad.predecessor.id ).toBe( road.id );
		expect( newRoad.predecessor.contactPoint ).toBe( TvContactPoint.END );

		// check laneSection
		const laneSection = newRoad.laneSections[ 0 ];

		expect( newRoad.laneSections.length ).toBe( 1 );
		expect( laneSection ).toBeDefined();
		expect( laneSection.s ).toBe( 0 );

		expect( laneSection.isMatching( oldLaneSection ) ).toBe( true );
		expect( laneSection.isWidthMatching( oldLaneSection ) );
		expect( laneSection.isHeightMatching( oldLaneSection ) ).toBe( true );
		expect( laneSection.isMarkingMatching( oldLaneSection ) ).toBe( true );

	} );

	it( 'should divide straight road multiple times', () => {

		const road1 = testHelper.addStraightRoad( new Vector3(), 500 );

		expect( road1.length ).toBe( 500 );

		const road2 = roadDividerService.divideRoadAt( road1, 300 );
		splineService.update( road1.spline );

		const road3 = roadDividerService.divideRoadAt( road1, 100 );
		splineService.update( road1.spline );

		expect( road1.successor.element ).toBe( road3 )
		expect( road1.successor.contactPoint ).toBe( TvContactPoint.START );

		expect( road2.predecessor.element ).toBe( road3 );
		expect( road2.predecessor.contactPoint ).toBe( TvContactPoint.END );

		expect( road3.predecessor.element ).toBe( road1 );
		expect( road3.predecessor.contactPoint ).toBe( TvContactPoint.END );

		expect( road1.length ).toBe( 100 );
		expect( road2.length ).toBe( 200 );
		expect( road3.length ).toBe( 200 );

	} );

} );


describe( 'Service: RoadDivider Junctions', () => {

	let openDriveParser: OpenDriveParserService;
	let roadDividerService: RoadDividerService;
	let mapService: MapService;
	let splineService: SplineService;
	let eventServiceProvider: EventServiceProvider;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [ RoadService, OpenDriveParserService, RoadDividerService, MapService ],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );

		eventServiceProvider = TestBed.get( EventServiceProvider );
		eventServiceProvider.init();

		openDriveParser = TestBed.get( OpenDriveParserService );
		roadDividerService = TestBed.get( RoadDividerService );
		mapService = TestBed.get( MapService );
		splineService = TestBed.get( SplineService );

	} );

	it( 'should divide straight imported road', () => {

		const S_OFFSET = 50;

		mapService.map = openDriveParser.parse( XML );

		const road = mapService.getRoad( 1 );

		expect( mapService.map.roads.size ).toBe( 1 );

		expect( road.length ).toBe( 200 );

		const oldLaneSection = road.getLaneProfile().getLaneSectionAt( S_OFFSET );

		const newRoad = roadDividerService.divideRoadAt( road, S_OFFSET );

		splineService.update( newRoad.spline );

		expect( newRoad ).toBeDefined();
		expect( newRoad.sStart ).toBe( S_OFFSET );
		expect( newRoad.length ).toBe( 200 - S_OFFSET ); //

		expect( road ).toBeDefined();
		expect( road.sStart ).toBe( 0 );
		expect( road.length ).toBe( 50 );

		expect( newRoad.geometries.length ).toBe( 1 );
		expect( newRoad.geometries[ 0 ].s ).toBe( 0 );
		expect( newRoad.geometries[ 0 ].x ).toBeCloseTo( 0 );
		expect( newRoad.geometries[ 0 ].y ).toBe( 50 );
		expect( newRoad.geometries[ 0 ].length ).toBe( 150 );//

		expect( road.geometries.length ).toBe( 1 );
		expect( road.geometries[ 0 ].s ).toBe( 0 );
		expect( road.geometries[ 0 ].x ).toBe( 0 );
		expect( road.geometries[ 0 ].y ).toBe( 0 );
		expect( road.geometries[ 0 ].length ).toBe( 50 );

		expect( road.successor ).toBeDefined();
		expect( road.successor.id ).toBe( newRoad.id );
		expect( road.successor.contactPoint ).toBe( TvContactPoint.START );

		expect( newRoad.predecessor ).toBeDefined();
		expect( newRoad.predecessor.id ).toBe( road.id );
		expect( newRoad.predecessor.contactPoint ).toBe( TvContactPoint.END );

		// check laneSection
		const laneSection = newRoad.laneSections[ 0 ];

		expect( newRoad.laneSections.length ).toBe( 1 );
		expect( laneSection ).toBeDefined();
		expect( laneSection.s ).toBe( 0 );

		expect( laneSection.isMatching( oldLaneSection ) ).toBe( true );
		expect( laneSection.isWidthMatching( oldLaneSection ) );
		expect( laneSection.isHeightMatching( oldLaneSection ) ).toBe( true );
		expect( laneSection.isMarkingMatching( oldLaneSection ) ).toBe( true );


	} )

} );
