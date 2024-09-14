/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SplineIntersectionService } from './spline-intersection.service';
import { SplineTestHelper } from './spline-test-helper.service';
import { Vector3 } from 'three';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { SplineBoundsService } from './spline-bounds.service';
import { SplineGeometryService } from './spline-geometry.service';

describe( 'Service: SplineIntersection', () => {

	let service: SplineIntersectionService;
	let helper: SplineTestHelper;
	let splineGeometryService: SplineGeometryService;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ MatSnackBarModule, HttpClientModule ],
			providers: [ SplineIntersectionService ]
		} );

		service = TestBed.get( SplineIntersectionService );

		helper = TestBed.get( SplineTestHelper );
		splineGeometryService = TestBed.get( SplineGeometryService );

	} );

	xit( 'should ...', inject( [ SplineIntersectionService ], ( service: SplineIntersectionService ) => {
		expect( service ).toBeTruthy();
	} ) );

	it( 'should detect intersection in auto & auto spline', () => {

		const roadA = helper.createStraightRoad( new Vector3( -100, 0, 0 ), 100, 0 );
		const roadB = helper.createStraightRoad( new Vector3( 0, -100, 0 ), 100, 90 );

		splineGeometryService.updateGeometryAndBounds( roadA.spline );
		splineGeometryService.updateGeometryAndBounds( roadB.spline );

		const intersections = service.findIntersectionsViaBox2D( roadA.spline, roadB.spline );

		expect( intersections.length ).toBe( 1 );

	} );

	xit( 'should detect intersection in auto & explicit spline', () => {
		expect( true ).toBe( false );
	} );

	xit( 'should detect intersection in explicit & explicit spline', () => {
		expect( true ).toBe( false );
	} );

	xit( 'should detect intersection in crossing xodr & auto spline', () => {
		expect( true ).toBe( false );
	} );

	xit( 'should detect intersection in crossing xodr & explicit spline', () => {
		expect( true ).toBe( false );
	} );


} );
