/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from '@angular/core/testing';
import { Vector3 } from 'app/core/maths';
import { CatmullRomSpline } from './catmull-rom-spline';


describe( 'CatmullRomSpline test', () => {

	let spline: CatmullRomSpline;

	beforeEach( () => TestBed.configureTestingModule( {} ) );

	beforeEach( () => {
		spline = new CatmullRomSpline( false );
	} );

	it( 'should give correct positions', () => {

		spline.addControlPoint( new Vector3( 0, 0, 0 ) );
		spline.addControlPoint( new Vector3( 50, 0, 0 ) );
		spline.addControlPoint( new Vector3( 100, 0, 0 ) );

		spline.update();

		const points = spline.getPoints( 10 );

		// 11 becuase 1 is at the start as well
		expect( points.length ).toBe( 11 );

		expect( spline.getLength() ).toBe( 100 );

	} );


} );
