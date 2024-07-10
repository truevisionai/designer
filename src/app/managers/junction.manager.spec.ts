/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { HttpClientModule } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { JunctionManager } from "./junction-manager";
import { SplineFactory } from "../services/spline/spline.factory";
import { Vector3 } from "three";
import { TvPosTheta } from "../map/models/tv-pos-theta";
import { Maths } from "../utils/maths";

describe( 'JunctionManager', () => {

	let manager: JunctionManager;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			providers: [ JunctionManager ],
			imports: [ HttpClientModule, MatSnackBarModule ]
		} );

		manager = TestBed.inject( JunctionManager );
	} );

	it( 'should create correctly', () => {
		expect( manager ).toBeTruthy();
	} );

	it( 'should give correct output for getCoordAtOffset', () => {

		const splineA = SplineFactory.createStraight( new Vector3( -100, 0, 0 ), 200 );
		const splineB = SplineFactory.createStraight( new Vector3( 0, -100, 0 ), 200, 90 );

		manager.splineBuilder.buildSpline( splineA );
		manager.splineBuilder.buildSpline( splineB );

		const coords: TvPosTheta[] = [];

		const entryA = manager.splineService.getCoordAtOffset( splineA, 90 );
		const exitA = manager.splineService.getCoordAtOffset( splineA, 110 );
		const entryB = manager.splineService.getCoordAtOffset( splineB, 90 );
		const exitB = manager.splineService.getCoordAtOffset( splineB, 110 );

		coords.push( entryA );
		coords.push( exitA );
		coords.push( entryB );
		coords.push( exitB );

		for ( let i = 0; i < coords.length; i++ ) {

			const coord = coords[ i ];

			for ( let j = i + 1; j < coords.length; j++ ) {

				const otherCoord = coords[ j ];

				const distance = coord.position.distanceTo( otherCoord.position );

				expect( distance ).toBeGreaterThan( 10 );

				expect( distance ).toBeLessThan( 30 );

			}

		}


	} );

	it( 'should give adjust spline coords', () => {

		const desiredRadius = 50;

		// 90 degrees
		const distance90 = desiredRadius * Math.tan( Math.abs( Maths.PI2 - ( Math.PI / 2 ) ) / 2 );
		expect( distance90 ).toBeCloseTo( 9.9 );

		// 45 degrees
		const distance45 = desiredRadius * Math.tan( Math.abs( Maths.PI2 - ( Math.PI / 4 ) ) / 2 );
		expect( distance45 ).toBeCloseTo( 20.7 );

		// 135 degrees
		const distance135 = desiredRadius * Math.tan( Math.abs( Maths.PI2 - ( 3 * Math.PI / 4 ) ) / 2 );
		expect( distance135 ).toBeCloseTo( 20.7 );

	} );

} );