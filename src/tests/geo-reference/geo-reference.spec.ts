import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { getWorldOriginInLatLong, convertToWGS84String, convertToTMerc } from "app/importers/coordinate-transformer";
import { EventServiceProvider } from "app/listeners/event-service-provider";
import { FRENCH_SMALL_XODR, OSM2_XODR, SplineTestHelper } from "app/services/spline/spline-test-helper.service";

import proj4 from 'proj4';

describe( 'GeoReference', () => {

	let testHelper: SplineTestHelper;
	let eventServicePtrovider: EventServiceProvider;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
			providers: []
		} );

		testHelper = TestBed.inject( SplineTestHelper );
		eventServicePtrovider = TestBed.inject( EventServiceProvider );
		eventServicePtrovider.init();

	} );

	xit( 'should transform coordinates correctly', () => {

		const projString = '+proj=tmerc +lat_0=51.2377326 +lon_0=7.1584828 +x_0=0 +y_0=0 +ellps=GRS80 +units=m +no_defs';

		// const newProjection = getWorldProjection( projString );

		const worldOrigin = getWorldOriginInLatLong( projString );

		expect( worldOrigin ).toEqual( [ 51.2377326, 7.1584828 ] );

	} );

	xit( 'should convert projection string to WGS84', () => {

		const projString = '+proj=tmerc +lat_0=51.2377326 +lon_0=7.1584828 +x_0=0 +y_0=0 +ellps=GRS80 +units=m +no_defs';

		const wgs84String = convertToWGS84String( projString );

		console.log( 'WGS84 Proj String:', wgs84String );

		// Add your expectations here
		expect( wgs84String ).toContain( '+proj=longlat' );
		expect( wgs84String ).toContain( '+datum=WGS84' );
		expect( wgs84String ).toContain( '+lon_0=7.1584828' );
		expect( wgs84String ).toContain( '+lat_0=51.2377326' );

	} );

	xit( 'should convert the given projection string to TMerc correctly', () => {

		const inputProjString = '+proj=tmerc +lat_0=51.2377326 +lon_0=7.1584828 +x_0=0 +y_0=0 +ellps=GRS80 +units=m +no_defs';

		const result = convertToTMerc( inputProjString );

		// Log the result for debugging
		console.log( 'Converted TMerc string:', result );

		// Check if the result contains all expected parameters
		expect( result ).toContain( '+proj=tmerc' );
		expect( result ).toContain( '+lat_0=51.2377326' );
		expect( result ).toContain( '+lon_0=7.1584828' );
		expect( result ).toContain( '+k=1' );
		expect( result ).toContain( '+x_0=0' );
		expect( result ).toContain( '+y_0=0' );
		expect( result ).toContain( '+ellps=GRS80' );
		expect( result ).toContain( '+units=m' );
		expect( result ).toContain( '+no_defs' );

		// The input is already TMerc, so the output should be very similar
		// Let's split both strings and compare the parameters
		const inputParams = new Set( inputProjString.split( '+' ).map( s => s.trim() ).filter( s => s ) );
		const outputParams = new Set( result.split( '+' ).map( s => s.trim() ).filter( s => s ) );

		// The only difference should be the addition of +k=1
		outputParams.delete( 'k=1' );
		expect( outputParams ).toEqual( inputParams );

		// Parse both projections and check if they're equivalent
		const inputProj = proj4( inputProjString );
		const outputProj = proj4( result );

		// Transform a point and check if the results are the same
		const testPoint = [ 7.1584828, 51.2377326 ]; // lon, lat
		const inputTransformed = inputProj.forward( testPoint );
		const outputTransformed = outputProj.forward( testPoint );

		expect( inputTransformed[ 0 ] ).toBeCloseTo( outputTransformed[ 0 ], 6 );
		expect( inputTransformed[ 1 ] ).toBeCloseTo( outputTransformed[ 1 ], 6 );

	} );

	it( 'should transform coordinates correctly for french-map', async () => {

		const contents = await testHelper.loadXodr( FRENCH_SMALL_XODR ).toPromise();

		const map = testHelper.openDriveParser.parse( contents );

		const road = map.roads.get( 3690 );

		expect( road ).toBeDefined();
		expect( road.length ).toBe( 6.30498600 );
		expect( road.spline.getLength() ).toBe( 6.30498600 );
		expect( road.spline.controlPoints.length ).toBe( 2 );

		expect( road.spline.controlPoints[ 0 ].position.x ).toBeCloseTo( 1835.7 );
		expect( road.spline.controlPoints[ 0 ].position.y ).toBeCloseTo( 476.48 );
		expect( road.spline.controlPoints[ 0 ].position.z ).toBe( 0 );

		expect( road.spline.controlPoints[ 1 ].position.x ).toBeCloseTo( 1835.8 );
		expect( road.spline.controlPoints[ 1 ].position.y ).toBeCloseTo( 470.177 );
		expect( road.spline.controlPoints[ 1 ].position.z ).toBe( 0 );

	} )

	it( 'should transform coordinates correctly for osm-map', async () => {

		const contents = await testHelper.loadXodr( OSM2_XODR ).toPromise();

		const map = testHelper.openDriveParser.parse( contents );

		const road = map.roads.get( 1 );

		expect( road ).toBeDefined();
		expect( road.length ).toBeCloseTo( 39.8908043358925 );
		expect( road.spline.getLength() ).toBeCloseTo( 39.8908043358925 );
		expect( road.spline.controlPoints.length ).toBeGreaterThan( 2 );

		expect( road.spline.controlPoints[ 0 ].position.x ).toBeCloseTo( 368.49, 0.1 );
		expect( road.spline.controlPoints[ 0 ].position.y ).toBeCloseTo( 220.97, 0.1 );
		expect( road.spline.controlPoints[ 0 ].position.z ).toBe( 0 );

	} )

} );
