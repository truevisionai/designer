/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from '../tv-road.model';
import { TvPosTheta } from '../tv-pos-theta';
import { TvMap } from '../tv-map.model';
import { TvMapQueries } from '../../queries/tv-map-queries';
import { TvMapSourceFile } from '../../services/tv-map-source-file';

describe( 'OdArcGeometry', () => {

    let openDrive: TvMap;
    let road: TvRoad;
    let pose = new TvPosTheta();

    beforeEach( () => {

        openDrive = new TvMap();

        TvMapSourceFile.openDrive = openDrive;

        road = new TvRoad( '', 10, 1, -1 );

        road.addPlanView();

    } );

    it( 'should give nearest point on arc', () => {

        // add roads
        // 3 arc roads
        // ==========|==========|==========
        const road1 = openDrive.addRoad( '', 10, 1, -1 );
        const road2 = openDrive.addRoad( '', 10, 2, -1 );
        const road3 = openDrive.addRoad( '', 10, 3, -1 );

        road1.addPlanView();
        road2.addPlanView();
        road3.addPlanView();

        road1.addGeometryArc( 0, 0, 0, 0, 10, 0 );
        road2.addGeometryArc( 0, 10, 0, 0, 10, 0 );
        road3.addGeometryArc( 0, 20, 0, 0, 10, 0 );

        let roadResult = TvMapQueries.getRoadByCoords( 0, 0 );
        expect( roadResult ).not.toBeNull();
        expect( roadResult.id ).toBe( 1 );

        roadResult = TvMapQueries.getRoadByCoords( 1, 9 );
        expect( roadResult ).not.toBeNull();
        expect( roadResult.id ).toBe( 1 );

        roadResult = TvMapQueries.getRoadByCoords( 11, 0 );
        expect( roadResult ).not.toBeNull();
        expect( roadResult.id ).toBe( 2 );

        roadResult = TvMapQueries.getRoadByCoords( 11, 10 );
        expect( roadResult ).not.toBeNull();
        expect( roadResult.id ).toBe( 2 );

        roadResult = TvMapQueries.getRoadByCoords( 21, 0 );
        expect( roadResult ).not.toBeNull();
        expect( roadResult.id ).toBe( 3 );

        roadResult = TvMapQueries.getRoadByCoords( 21, 10 );
        expect( roadResult ).not.toBeNull();
        expect( roadResult.id ).toBe( 3 );

    } );

} );
