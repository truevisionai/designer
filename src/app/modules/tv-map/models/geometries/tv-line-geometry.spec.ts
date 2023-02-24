/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMapQueries } from '../../queries/tv-map-queries';
import { TvMapInstance } from '../../services/tv-map-source-file';
import { TvMap } from '../tv-map.model';
import { TvPosTheta } from '../tv-pos-theta';
import { TvRoad } from '../tv-road.model';

describe( 'OdLineGeometry', () => {

    let map: TvMap;
    let road: TvRoad;
    let pose = new TvPosTheta();

    beforeEach( () => {

        map = new TvMap();

        TvMapInstance.map = map;

        road = new TvRoad( '', 10, 1, -1 );

        road.addPlanView();

    } );

    it( 'should give correct coordinates with 0-degree hdg', () => {

        road.addGeometryLine( 0, 0, 1, 0, 10 );

        const posTheta = new TvPosTheta();

        road.getGeometryCoords( 0, posTheta );

        expect( posTheta.x ).toBe( 0 );
        expect( posTheta.y ).toBe( 1 );
        expect( posTheta.hdg ).toBe( 0 );

        road.getGeometryCoords( 10, posTheta );

        expect( posTheta.x ).toBe( 10 );
        expect( posTheta.y ).toBe( 1 );
        expect( posTheta.hdg ).toBe( 0 );

    } );

    it( 'should give correct coordinates with 90degree hdg', () => {

        const hdg = 90 * ( Math.PI / 180 );

        road.addGeometryLine( 0, 1, 0, hdg, 10 );

        const posTheta = new TvPosTheta();

        road.getGeometryCoords( 0, posTheta );

        expect( posTheta.x ).toBe( 1 );
        expect( posTheta.y ).toBe( 0 );
        expect( posTheta.hdg ).toBe( hdg );

        road.getGeometryCoords( 10, posTheta );

        expect( Math.round( posTheta.x ) ).toBe( 1 );
        expect( Math.round( posTheta.y ) ).toBe( 10 );
        expect( posTheta.hdg ).toBe( hdg );

    } );

    it( 'should give correct coordinates with 180 degree hdg', () => {

        const hdg = 180 * ( Math.PI / 180 );

        road.addGeometryLine( 0, 0, 0, hdg, 10 );

        const posTheta = new TvPosTheta();

        road.getGeometryCoords( 0, posTheta );

        expect( Math.round( posTheta.x ) ).toBe( 0 );
        expect( posTheta.y ).toBe( 0 );
        expect( posTheta.hdg ).toBe( hdg );

        road.getGeometryCoords( 10, posTheta );

        expect( Math.round( posTheta.x ) ).toBe( -10 );
        expect( Math.round( posTheta.y ) ).toBe( 0 );
        expect( posTheta.hdg ).toBe( hdg );

    } );

    it( 'should give correct coordinates for s and t with 0 degree hdg', () => {

        const hdg = 0;
        const x = 0;
        const y = 0;
        const s = 0;
        const length = 10;

        let t = 0;

        road.addGeometryLine( s, x, y, hdg, length );

        road.getGeometryCoordsAt( s, t, pose );

        expect( Math.round( pose.x ) ).toBe( 0 );
        expect( pose.y ).toBe( 0 );

        t = 1;

        road.getGeometryCoordsAt( s, t, pose );

        expect( Math.round( pose.x ) ).toBe( 0 );
        expect( pose.y ).toBe( t );

    } );

    it( 'should give correct coordinates for s and t with 90 degree hdg', () => {

        const hdg = 90 * ( Math.PI / 180 );
        const x = 0;
        const y = 0;
        const s = 0;
        const length = 10;

        let t = 0;

        road.addGeometryLine( s, x, y, hdg, length );

        road.getGeometryCoordsAt( s, t, pose );

        expect( Math.round( pose.x ) ).toBe( 0 );
        expect( Math.round( pose.y ) ).toBe( 0 );

        t = 1;

        road.getGeometryCoordsAt( s, t, pose );

        expect( Math.round( pose.x ) ).toBe( -1 );
        expect( Math.round( pose.y ) ).toBe( 0 );

    } );

    it( 'should give nearest point on line', () => {

        // add roads
        // 3 straight road
        // ==========|==========|==========
        const road1 = map.addRoad( '', 10, 1, -1 );
        const road2 = map.addRoad( '', 10, 2, -1 );
        const road3 = map.addRoad( '', 10, 3, -1 );

        road1.addPlanView();
        road2.addPlanView();
        road3.addPlanView();

        road1.addGeometryLine( 0, 0, 0, 0, 10 );
        road2.addGeometryLine( 0, 10, 0, 0, 10 );
        road3.addGeometryLine( 0, 20, 0, 0, 10 );

        let roadResult = TvMapQueries.getRoadByCoords( 0, 0 );
        expect( roadResult ).not.toBeNull();
        expect( roadResult.id ).toBe( 1 );

        roadResult = TvMapQueries.getRoadByCoords( 1, 10 );
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
