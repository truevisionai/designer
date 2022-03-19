/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from '@angular/core/testing';
import { Vector3 } from 'three';
import { CustomSplineCurve } from './arc-spline-curve';


describe( 'ArcSplineCurve test', () => {

    let curve: CustomSplineCurve;

    beforeEach( () => TestBed.configureTestingModule( {} ) );

    beforeEach( () => {
        curve = new CustomSplineCurve();
    } );

    it( 'should give correct angle', () => {

        // tslint:disable-next-line: one-variable-per-declaration
        let p1, p2, p3: Vector3;

        p1 = new Vector3( 0, 0, 0 );
        p2 = new Vector3( 10, 0, 0 );
        p3 = new Vector3( 20, 10, 0 );

        curve.addPoints( [ p1, p2, p3 ] );

        const geomtries = curve.geometries;


    } );


} );
