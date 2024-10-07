/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from "@angular/core/testing";
import { ExplicitGeometryService } from "./explicit-geometry.service";
import { ControlPointFactory } from "app/factories/control-point.factory";
import { Vector3 } from "three";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvGeometryType } from "app/map/models/tv-common";
import { RoadControlPoint } from "app/objects/road/road-control-point";
import { EXPLICIT_CIRCLE_XODR, SplineTestHelper } from "./spline-test-helper.service";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { HttpClientModule } from "@angular/common/http";
import { SplineGeometryGenerator } from "./spline-geometry-generator";
import { SplineFactory } from "./spline.factory";
import { AbstractSpline, SplineType } from "app/core/shapes/abstract-spline";

describe( 'ExplicitGeometryService', () => {

	let builder: SplineGeometryGenerator;
	let service: ExplicitGeometryService;
	let spline: AbstractSpline;
	let testHelper: SplineTestHelper;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ MatSnackBarModule, HttpClientModule ],
			providers: [ ExplicitGeometryService ]
		} );

		testHelper = TestBed.get( SplineTestHelper );
		service = TestBed.get( ExplicitGeometryService );
		builder = TestBed.get( SplineGeometryGenerator );

		const road = new TvRoad( '', 0, 100 );

		spline = SplineFactory.createSpline( SplineType.EXPLICIT );

		road.spline = spline;

	} );


	it( 'should ...', () => {

		expect( service ).toBeTruthy();

	} );

	it( 'should create line', () => {

		spline.addControlPoint( ControlPointFactory.createControl( spline, new Vector3( 0, 0, 0 ) ) );
		spline.addControlPoint( ControlPointFactory.createControl( spline, new Vector3( 100, 0, 0 ) ) );

		service.updateGeometry( spline );

		expect( spline.getGeometryCount() ).toBe( 1 );
		expect( spline.getGeometries()[ 0 ].length ).toBe( 100 );
		expect( spline.getGeometries()[ 0 ].geometryType ).toBe( TvGeometryType.LINE );

	} );

	it( 'should have correct headings for line', () => {

		spline.addControlPoint( ControlPointFactory.createControl( spline, new Vector3( 0, 0, 0 ) ) );
		spline.addControlPoint( ControlPointFactory.createControl( spline, new Vector3( 100, 0, 0 ) ) );

		service.updateGeometry( spline );

		expect( spline.getControlPoints()[ 0 ].getHeading() ).toEqual( 0 );
		expect( spline.getControlPoints()[ 1 ].getHeading() ).toEqual( 0 );

	} );

	it( 'should have correct headings for line at 90 degree', () => {

		spline.addControlPoint( ControlPointFactory.createControl( spline, new Vector3( 0, 0, 0 ) ) );
		spline.addControlPoint( ControlPointFactory.createControl( spline, new Vector3( 100, 0, 0 ) ) );

		service.updateGeometry( spline );

		expect( spline.getGeometryCount() ).toBe( 1 );
		expect( spline.getGeometries()[ 0 ].length ).toBe( 100 );
		expect( spline.getGeometries()[ 0 ].geometryType ).toBe( TvGeometryType.LINE );

		expect( spline.getControlPoints()[ 0 ].getHeading() ).toEqual( 0 );
		expect( spline.getControlPoints()[ 1 ].getHeading() ).toEqual( 0 );

	} );

	it( 'should create 3 points forming a line', () => {

		spline.addControlPoint( ControlPointFactory.createControl( spline, new Vector3( 0, 0, 0 ) ) );
		spline.addControlPoint( ControlPointFactory.createControl( spline, new Vector3( 100, 0, 0 ) ) );
		spline.addControlPoint( ControlPointFactory.createControl( spline, new Vector3( 200, 0, 0 ) ) );

		service.updateGeometry( spline );

		expect( spline.getGeometryCount() ).toBe( 2 );
		expect( spline.getGeometries()[ 0 ].geometryType ).toBe( TvGeometryType.LINE );
		expect( spline.getGeometries()[ 1 ].geometryType ).toBe( TvGeometryType.LINE );

		expect( spline.getControlPoints()[ 0 ].getHeading() ).toEqual( 0 );
		expect( spline.getControlPoints()[ 1 ].getHeading() ).toEqual( 0 );
		expect( spline.getControlPoints()[ 2 ].getHeading() ).toEqual( 0 );

	} );

	it( 'should create spiral with 3 points', () => {

		spline.addControlPoint( ControlPointFactory.createControl( spline, new Vector3( 0, 0, 0 ) ) );
		spline.addControlPoint( ControlPointFactory.createControl( spline, new Vector3( 100, 0, 0 ) ) );
		spline.addControlPoint( ControlPointFactory.createControl( spline, new Vector3( 100, 100, 0 ) ) );

		service.updateGeometry( spline );

		expect( spline.getGeometryCount() ).toBe( 2 );
		expect( spline.getGeometries()[ 0 ].geometryType ).toBe( TvGeometryType.LINE );
		expect( spline.getGeometries()[ 1 ].geometryType ).toBe( TvGeometryType.SPIRAL );
		expect( spline.getLength() ).toBeGreaterThan( 200 );

		expect( spline.getControlPoints()[ 0 ].getHeading() ).toEqual( 0 );
		expect( spline.getControlPoints()[ 1 ].getHeading() ).toEqual( 0 );
		expect( spline.getControlPoints()[ 2 ].getHeading() ).toEqual( 0 );

	} );

	it( 'should import explicit spline ', async () => {

		const map = await testHelper.loadAndParseXodr( EXPLICIT_CIRCLE_XODR );

		const road = map.getRoads()[ 0 ];

		expect( road.spline.getControlPointCount() ).toBe( 5 );
		expect( road.spline.getGeometryCount() ).toBe( 4 );
		expect( road.spline.getGeometryCount() ).toBe( 4 );

		expect( road.spline.getGeometries()[ 0 ].geometryType ).toBe( TvGeometryType.LINE );
		expect( road.spline.getGeometries()[ 1 ].geometryType ).toBe( TvGeometryType.ARC );
		expect( road.spline.getGeometries()[ 2 ].geometryType ).toBe( TvGeometryType.ARC );
		expect( road.spline.getGeometries()[ 3 ].geometryType ).toBe( TvGeometryType.LINE );
		expect( road.spline.getLength() ).toBeCloseTo( 63.91 );


	} );


	it( 'should update explicit spline', async () => {

		const map = await testHelper.loadAndParseXodr( EXPLICIT_CIRCLE_XODR );

		const road = map.getRoads()[ 0 ];

		// move all control points
		road.spline.getControlPoints().forEach( ( point: RoadControlPoint ) => {
			point.position.x += 0.01;
		} );

		const prevHdgs = road.spline.getControlPoints().map( ( point: RoadControlPoint ) => point.hdg );

		const newHdgs = road.spline.getControlPoints().map( ( point: RoadControlPoint ) => point.hdg );

		expect( prevHdgs ).toEqual( newHdgs );

		builder.generateGeometryAndBuildSegmentsAndBounds( road.spline );

		expect( road.spline.getControlPointCount() ).toBe( 5 );
		expect( road.spline.getGeometryCount() ).toBe( 4 );
		expect( road.spline.getGeometryCount() ).toBe( 4 );

		expect( road.spline.getGeometries()[ 0 ].geometryType ).toBe( TvGeometryType.LINE );
		expect( road.spline.getGeometries()[ 1 ].geometryType ).toBe( TvGeometryType.ARC );
		expect( road.spline.getGeometries()[ 2 ].geometryType ).toBe( TvGeometryType.ARC );
		expect( road.spline.getGeometries()[ 3 ].geometryType ).toBe( TvGeometryType.LINE );
		expect( road.spline.getLength() ).toBeCloseTo( 63.91 );


	} );



} );
