/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TestBed } from '@angular/core/testing';
import { PropPolygon } from 'app/modules/tv-map/models/prop-polygons';
import earcut from 'earcut';
import { Triangle } from 'three';


describe( 'PropService test', () => {

    beforeEach( () => TestBed.configureTestingModule( {} ) );

    beforeEach( () => {
    } );

    it( 'should place props in polygon correctly', () => {

        const polygon = new PropPolygon( 'blank' );

        // triangulating a polygon with 3d coords0
        const triangles = earcut( [ 10, 0, 1, 0, 50, 2, 60, 60, 3, 70, 10, 4 ], null, 3 );

        const faces = [];

        for ( let i = 0; i < triangles.length; i += 3 ) {

            faces.push( triangles.slice( i, i + 3 ) );

        }

        function randomInTriangle ( v1, v2, v3 ) {
            var r1 = Math.random();
            var r2 = Math.sqrt( Math.random() );
            var a = 1 - r2;
            var b = r2 * ( 1 - r1 );
            var c = r1 * r2;
            return ( v1.clone().multiplyScalar( a ) ).add( v2.clone().multiplyScalar( b ) ).add( v3.clone().multiplyScalar( c ) );
        }


        faces.forEach( face => {

            const t = new Triangle( face[ 0 ], face[ 1 ], face[ 2 ] );

            const area = t.getArea();

            const count = area / polygon.density;

            for ( let i = 0; i < count; i++ ) {

                const p = randomInTriangle( face[ 0 ], face[ 1 ], face[ 2 ] );


            }

        } );

        // const ts = THREE.ShapeUtils.triangulate( [], false );

        // PropService.updateCurvePolygonProps( polygon );

    } );


} );
