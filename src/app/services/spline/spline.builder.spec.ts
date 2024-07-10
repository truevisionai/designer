/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed, async, inject } from '@angular/core/testing';
import { AutoSplineBuilder, SplineBuilder } from "./spline.builder";
import { TvLineGeometry } from "../../map/models/geometries/tv-line-geometry";

describe( 'Service: SplineBuilder', () => {

	let splineBuilder: AutoSplineBuilder;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [ AutoSplineBuilder ]
		} );

		splineBuilder = TestBed.get( AutoSplineBuilder );

	} );


	it( 'should ...', () => {

		expect( splineBuilder ).toBeTruthy();

	} );

	it( 'should cut geometries for start=0', () => {

		const splineGeometries = [ new TvLineGeometry( 0, 0, 0, 0, 100 ) ];

		const geometries = splineBuilder.breakGeometries( splineGeometries, 0, 10 );

		expect( geometries.length ).toBe( 1 );
		expect( geometries[ 0 ].s ).toBe( 0 );
		expect( geometries[ 0 ].x ).toBe( 0 );
		expect( geometries[ 0 ].y ).toBe( 0 );
		expect( geometries[ 0 ].hdg ).toBe( 0 );
		expect( geometries[ 0 ].length ).toBe( 10 );

	} );

	it( 'should cut geometries for start=10', () => {

		const splineGeometries = [ new TvLineGeometry( 0, 0, 0, 0, 100 ) ];

		const geometries = splineBuilder.breakGeometries( splineGeometries, 10, 50 );

		expect( geometries.length ).toBe( 1 );
		expect( geometries[ 0 ].s ).toBe( 0 );
		expect( geometries[ 0 ].x ).toBe( 10 );
		expect( geometries[ 0 ].y ).toBe( 0 );
		expect( geometries[ 0 ].hdg ).toBe( 0 );
		expect( geometries[ 0 ].length ).toBe( 40 );

	} );

	it( 'should cut and adjust geometries for multiple segments', () => {

		const splineGeometries = [
			new TvLineGeometry( 0, 0, 0, 0, 50 ),
			new TvLineGeometry( 50, 50, 0, 0, 100 )
		];

		const geometries = splineBuilder.breakGeometries( splineGeometries, 10, 120 );

		expect( geometries.length ).toBe( 2 );
		expect( geometries[ 0 ].s ).toBe( 0 ); // s should be 0 for the first segment
		expect( geometries[ 0 ].x ).toBe( 10 ); // Updated based on calculation
		expect( geometries[ 0 ].y ).toBe( 0 );  // Updated based on calculation
		expect( geometries[ 0 ].hdg ).toBe( 0 ); // Updated based on calculation
		expect( geometries[ 0 ].length ).toBe( 40 );

		expect( geometries[ 1 ].s ).toBe( 40 ); // s should be length of previous geometry
		expect( geometries[ 1 ].x ).toBe( 50 ); // Updated based on calculation
		expect( geometries[ 1 ].y ).toBe( 0 );  // Updated based on calculation
		expect( geometries[ 1 ].hdg ).toBe( 0 ); // Updated based on calculation
		expect( geometries[ 1 ].length ).toBe( 70 );
	} );

	it( 'should handle sEnd as null', () => {
		const splineGeometries = [ new TvLineGeometry( 0, 0, 0, 0, 100 ) ];

		const geometries = splineBuilder.breakGeometries( splineGeometries, 10, null );

		expect( geometries.length ).toBe( 1 );
		expect( geometries[ 0 ].s ).toBe( 0 ); // s should be 0
		expect( geometries[ 0 ].x ).toBe( 10 ); // Updated based on calculation
		expect( geometries[ 0 ].y ).toBe( 0 );  // Updated based on calculation
		expect( geometries[ 0 ].hdg ).toBe( 0 ); // Updated based on calculation
		expect( geometries[ 0 ].length ).toBe( 90 ); // Adjusted to fit within sEnd
	} );

	it( 'should handle sEnd exactly the length of the geometry', () => {
		const splineGeometries = [ new TvLineGeometry( 0, 0, 0, 0, 100 ) ];

		const geometries = splineBuilder.breakGeometries( splineGeometries, 0, 100 );

		expect( geometries.length ).toBe( 1 );
		expect( geometries[ 0 ].s ).toBe( 0 ); // s should be 0
		expect( geometries[ 0 ].x ).toBe( 0 ); // Updated based on calculation
		expect( geometries[ 0 ].y ).toBe( 0 );  // Updated based on calculation
		expect( geometries[ 0 ].hdg ).toBe( 0 ); // Updated based on calculation
		expect( geometries[ 0 ].length ).toBe( 100 ); // Should be the full length
	} );

} );
