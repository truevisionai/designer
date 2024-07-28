/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ExplicitSpline } from '../../app/core/shapes/explicit-spline';
import { TvRoad } from "../../app/map/models/tv-road.model";
import { AbstractSpline } from "../../app/core/shapes/abstract-spline";
import { ControlPointFactory } from "../../app/factories/control-point.factory";
import { Vector3 } from "three";

xdescribe( 'ExplicitSpline Test', () => {

	let road: TvRoad;
	let spline: AbstractSpline;
	let pointFactory: ControlPointFactory;

	beforeEach( () => {

		spline = new ExplicitSpline( road );
		pointFactory = new ControlPointFactory();

	} );

	it( 'should create 2 point spline ', () => {


		// horizontal
		spline = new ExplicitSpline( road );
		spline.controlPoints.push( pointFactory.createSplineControlPoint( spline, new Vector3() ) );
		spline.controlPoints.push( pointFactory.createSplineControlPoint( spline, new Vector3( 100 ) ) );
		spline.controlPoints.push( pointFactory.createSplineControlPoint( spline, new Vector3( 200 ) ) );

		expect( spline.getLength() ).toBe( 200 );

		// vertical
		spline = new ExplicitSpline( road );
		spline.controlPoints.push( pointFactory.createSplineControlPoint( spline, new Vector3() ) );
		spline.controlPoints.push( pointFactory.createSplineControlPoint( spline, new Vector3( 0, 100, 0 ) ) );
		spline.controlPoints.push( pointFactory.createSplineControlPoint( spline, new Vector3( 0, 200, 0 ) ) );

		expect( spline.getLength() ).toBeCloseTo( 217.03 );

	} );

} );
