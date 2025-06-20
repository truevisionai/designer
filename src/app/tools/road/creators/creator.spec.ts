/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from "@angular/core/testing";
import { CreationStrategy } from "app/core/interfaces/creation-strategy";
import { SplineCreationRoadToolStrategy } from "./spline-creator";
import { PointCreationRoadToolStrategy } from "./spline-point-creator";
import { PointerEventData } from "app/events/pointer-event-data";
import { Vector3 } from "app/core/maths"
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { SplineTestHelper } from "app/services/spline/spline-test-helper.service";
import { setupTest } from "../../../../tests/setup-tests";

describe( 'RoadTool: SplineCreator', () => {

	let creator: CreationStrategy<any>;

	beforeEach( () => {

		setupTest();

		creator = TestBed.inject( SplineCreationRoadToolStrategy );

	} );

	it( 'should create instance', () => {

		expect( creator ).toBeTruthy();

	} );

} );

describe( 'RoadTool: PointCreationRoadToolStrategy', () => {

	let creator: PointCreationRoadToolStrategy;

	let spline: AbstractSpline;

	beforeEach( () => {

		setupTest();

		creator = TestBed.inject( PointCreationRoadToolStrategy );

		spline = TestBed.inject( SplineTestHelper ).createStraightSpline( new Vector3() );

	} );

	it( 'should create instance', () => {

		expect( creator ).toBeTruthy();

	} );

	it( 'should can create when spline is given ', () => {

		const event = PointerEventData.create( new Vector3( 100, 100, 0 ) );

		expect( creator.canCreate( event, null ) ).toBeFalse();

		expect( creator.canCreate( event, spline ) ).toBeTrue();

		expect( creator.canCreate( event, spline.getControlPoints()[ 0 ] ) ).toBeTrue();

	} );

	it( 'should fail when spline is not selected ', () => {

		const event = PointerEventData.create( new Vector3( 100, 100, 0 ) );

		expect( creator.validate( event, null ).passed ).toBeFalse();

	} );

	it( 'should fail if spline has successor ', () => {

		const event = PointerEventData.create( new Vector3( 100, 100, 0 ) );

		spyOn( spline, 'hasSuccessor' ).and.returnValue( true );
		spyOn( creator, 'isSameRoadClicked' ).and.returnValue( true );

		expect( creator.validate( event, null ).passed ).toBeFalse();

	} );

	it( 'should pass if spline has successor ', () => {

		const event = PointerEventData.create( new Vector3( 100, 100, 0 ) );

		spyOn( spline, 'hasSuccessor' ).and.returnValue( true );
		spyOn( creator, 'isSameRoadClicked' ).and.returnValue( false );

		expect( creator.validate( event, null ).passed ).toBeFalse();

	} );

	it( 'should pass when spline is not selected ', () => {

		const event = PointerEventData.create( new Vector3( 100, 100, 0 ) );

		expect( creator.validate( event, spline ).passed ).toBeTrue();

	} );


} );
