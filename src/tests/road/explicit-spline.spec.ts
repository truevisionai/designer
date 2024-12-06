/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from "../../app/map/models/tv-road.model";
import { AbstractSpline } from "../../app/core/shapes/abstract-spline";
import { SplineType } from 'app/core/shapes/spline-type';
import { ControlPointFactory } from "../../app/factories/control-point.factory";
import { Vector3 } from "three";
import { SplineFactory } from 'app/services/spline/spline.factory';

xdescribe( 'ExplicitSpline Test', () => {

	let road: TvRoad;
	let spline: AbstractSpline;
	let pointFactory: ControlPointFactory;

	beforeEach( () => {

		spline = SplineFactory.createSpline( SplineType.EXPLICIT );
		pointFactory = new ControlPointFactory();

	} );

	it( 'should create 2 point spline ', () => {


		// horizontal
		spline = SplineFactory.createSpline( SplineType.EXPLICIT );
		spline.addControlPoint( pointFactory.createSplineControlPoint( spline, new Vector3() ) );
		spline.addControlPoint( pointFactory.createSplineControlPoint( spline, new Vector3( 100 ) ) );
		spline.addControlPoint( pointFactory.createSplineControlPoint( spline, new Vector3( 200 ) ) );

		expect( spline.getLength() ).toBe( 200 );

		// vertical
		spline = SplineFactory.createSpline( SplineType.EXPLICIT );
		spline.addControlPoint( pointFactory.createSplineControlPoint( spline, new Vector3() ) );
		spline.addControlPoint( pointFactory.createSplineControlPoint( spline, new Vector3( 0, 100, 0 ) ) );
		spline.addControlPoint( pointFactory.createSplineControlPoint( spline, new Vector3( 0, 200, 0 ) ) );

		expect( spline.getLength() ).toBeCloseTo( 217.03 );

	} );

} );
