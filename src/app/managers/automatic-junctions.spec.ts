/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from "@angular/core/testing";
import { Vector3 } from "app/core/maths";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { AutomaticJunctions } from "./automatic-junctions";
import { AutoJunction } from "app/map/models/junctions/auto-junction";
import { MapService } from "app/services/map/map.service";
import { SplineFactory } from "app/services/spline/spline.factory";
import { SplineService } from "app/services/spline/spline.service";
import { expectCorrectSegmentOrder } from "tests/base-test.spec";
import { setupTest } from "tests/setup-tests";

describe( "AutomaticJunctions", () => {

	let automaticJunctions: AutomaticJunctions;
	let splineService: SplineService;
	let mapService: MapService;

	beforeEach( () => {

		setupTest();

		automaticJunctions = TestBed.inject( AutomaticJunctions );
		splineService = TestBed.inject( SplineService );
		mapService = TestBed.inject( MapService );

	} );

	function addSpline ( spline: AbstractSpline ): AbstractSpline {

		splineService.add( spline );

		spline.updateSegmentGeometryAndBounds();

		return spline;

	}

	it( "should merge new spline into existing auto junction", () => {

		const horizontal = addSpline( SplineFactory.createStraightSplineAndPoints( new Vector3( -100, 0, 0 ), 200 ) );
		const vertical = addSpline( SplineFactory.createStraightSplineAndPoints( new Vector3( 0, -100, 0 ), 200, 90 ) );

		automaticJunctions.detectJunctions( horizontal );
		automaticJunctions.detectJunctions( vertical );

		expect( mapService.junctions.length ).toBe( 1 );

		let junction = mapService.junctions[ 0 ] as AutoJunction;

		expect( junction.auto ).toBeTrue();
		expect( junction.getIncomingSplines().length ).toBe( 2 );

		const diagonal = addSpline( SplineFactory.createStraightSplineAndPoints( new Vector3( -150, -150, 0 ), 300, 45 ) );

		automaticJunctions.detectJunctions( diagonal );
		automaticJunctions.detectJunctions( horizontal );
		automaticJunctions.detectJunctions( vertical );

		expect( mapService.junctions.length ).toBe( 1 );

		junction = mapService.junctions[ 0 ] as AutoJunction;

		expect( junction.getIncomingSplines().length ).toBe( 3 );

		expect( new Set( junction.getIncomingSplines().map( spline => spline.uuid ) ).size ).toBe( 3 );

		expectCorrectSegmentOrder( horizontal );
		expectCorrectSegmentOrder( vertical );
		expectCorrectSegmentOrder( diagonal );

		expect( horizontal.getJunctionSegments().length ).toBe( 1 );
		expect( vertical.getJunctionSegments().length ).toBe( 1 );
		expect( diagonal.getJunctionSegments().length ).toBe( 1 );

		expect( horizontal.getJunctionSegments()[ 0 ] ).toBe( junction );
		expect( vertical.getJunctionSegments()[ 0 ] ).toBe( junction );
		expect( diagonal.getJunctionSegments()[ 0 ] ).toBe( junction );

	} );

} );
