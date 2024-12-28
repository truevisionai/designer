/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline } from "../../app/core/shapes/abstract-spline";
import { SplineType } from 'app/core/shapes/spline-type';
import { Vector3 } from "three";
import { SplineFactory } from 'app/services/spline/spline.factory';

xdescribe( 'ExplicitSpline Test', () => {

	let spline: AbstractSpline;

	beforeEach( () => {

		spline = SplineFactory.createSpline( SplineType.EXPLICIT );

	} );

	it( 'should create 2 point spline ', () => {


		// horizontal
		spline = SplineFactory.createSpline( SplineType.EXPLICIT );
		spline.addControlPoint( new Vector3() );
		spline.addControlPoint( new Vector3( 100 ) );
		spline.addControlPoint( new Vector3( 200 ) );

		expect( spline.getLength() ).toBe( 200 );

		// vertical
		spline = SplineFactory.createSpline( SplineType.EXPLICIT );
		spline.addControlPoint( new Vector3() );
		spline.addControlPoint( new Vector3( 0, 100, 0 ) );
		spline.addControlPoint( new Vector3( 0, 200, 0 ) );

		expect( spline.getLength() ).toBeCloseTo( 217.03 );

	} );

} );
