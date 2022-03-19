/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Shape } from 'three';
import { ExplicitSpline } from './explicit-spline';
import { ExplicitSplinePath } from './cubic-spline-curve';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapSourceFile } from 'app/modules/tv-map/services/tv-map-source-file';
import { TvGeometryType } from 'app/modules/tv-map/models/tv-common';
import { Maths } from 'app/utils/maths';


describe( 'ExplicitSpline Test', () => {

    let road: TvRoad;
    let spline: ExplicitSpline;

    beforeEach( () => {

        road = TvMapSourceFile.openDrive.addDefaultRoad();

        spline = road.spline = new ExplicitSpline();

    } );

    it( 'should work as curve path', () => {

        road.addGeometryLine( 0, 0, 0, 0, 100 );

        const shape = new Shape(); shape.moveTo( 0, -0.25 ); shape.lineTo( 0, 0.25 );

        spline.addFromFile( 0, road.startPosition().toVector3(), 0, TvGeometryType.LINE );
        spline.addFromFile( 1, road.endPosition().toVector3(), 0, TvGeometryType.LINE );

        const path = new ExplicitSplinePath( spline );
        // const path = new CatmullRomPath( [ road.startPosition().toVector3(), road.endPosition().toVector3() ] );

        expect( Maths.approxEquals( path.getLength(), 100, 0.01 ) ).toBe( true );

        // const extrudeSettings = {
        //     steps: path.getLength() * 2,
        //     bevelEnabled: false,
        //     extrudePath: path
        // };

        // const geometry = new ExtrudeGeometry( shape, extrudeSettings );

    } );


} );