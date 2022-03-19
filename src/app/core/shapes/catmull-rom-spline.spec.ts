/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from '@angular/core/testing';
import { Vector3 } from 'three';
import { GameObject } from '../game-object';
import { CatmullRomSpline } from './catmull-rom-spline';
import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';


describe( 'CatmullRomSpline test', () => {

    let spline: CatmullRomSpline;

    beforeEach( () => TestBed.configureTestingModule( {} ) );

    beforeEach( () => {
        spline = new CatmullRomSpline( false );
    } );

    it( 'should give correct positions', () => {

        spline.add( AnyControlPoint.create( "", new Vector3( 0, 0, 0 ) ) )

        spline.add( AnyControlPoint.create( "", new Vector3( 50, 0, 0 ) ) )

        spline.add( AnyControlPoint.create( "", new Vector3( 100, 0, 0 ) ) )

        const points = spline.getPoints( 10 );

        // 11 becuase 1 is at the start as well 
        expect( points.length ).toBe( 11 );

        expect( spline.getLength() ).toBe( 100 );

    } );


} );
