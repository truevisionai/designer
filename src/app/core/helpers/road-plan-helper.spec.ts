/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from '@angular/core/testing';
import { Vector3 } from 'three';
import { Maths } from '../../utils/maths';
import { RoadPlanHelper } from './road-plan-helper';


describe( 'RoadPlanHelper test', () => {

    let helper: RoadPlanHelper;

    beforeEach( () => TestBed.configureTestingModule( {} ) );

    beforeEach( () => {
        helper = new RoadPlanHelper( null );
    } );

    it( 'should give correct angle', () => {

        let p1, p2, p3: Vector3;

        p1 = new Vector3( 0, 0, 0 );
        p2 = new Vector3( 10, 0, 0 );

        ////////////////////////////////////////////////////////////////

        p3 = new Vector3( 5, 5, 0 );

        expect( Math.round( helper.calculateAngle( p1, p2, p3 ) ) ).toBe( 45 );

        ////////////////////////////////////////////////////////////////

        p3 = new Vector3( 10, 10, 0 );

        expect( Math.round( helper.calculateAngle( p1, p2, p3 ) ) ).toBe( 90 );

        ////////////////////////////////////////////////////////////////

        p3 = new Vector3( 15, 5, 0 );

        expect( Math.round( helper.calculateAngle( p1, p2, p3 ) ) ).toBe( 135 );

    } );

    it( 'should give correct area for triangle', () => {

        let p1, p2, p3: Vector3;

        const height = 10;
        const base = 10;

        p1 = new Vector3( 0, 0, 0 );
        p2 = new Vector3( 0, height, 0 );
        p3 = new Vector3( base, height, 0 );

        expect( Maths.areaOfTriangle( p1, p2, p3 ) ).toBe( 50 );

    } );

    it( 'should give correct height for triangle', () => {

        let p1, p2, p3: Vector3;

        const height = 8;
        const base = 15;

        p1 = new Vector3( 0, 0, 0 );
        p2 = new Vector3( 0, height, 0 );
        p3 = new Vector3( base, height, 0 );

        expect( Maths.heightOfTriangle( p1, p2, p3 ) ).toBe( 7.0588235294117645 );


    } );


} );
