/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMapSourceFile } from '../services/tv-map-source-file';
import { TvRoad } from '../models/tv-road.model';
import { TvMap } from '../models/tv-map.model';
import { TvMapQueries } from './tv-map-queries';
import { TvLaneSide, TvLaneType } from '../models/tv-common';

describe( 'OpenDriveQueries', () => {

    let road: TvRoad;

    beforeEach( () => {

        TvMapSourceFile.openDrive = new TvMap();

        road = TvMapSourceFile.openDrive.addDefaultRoad();

        road.addGeometryLine( 0, 0, 0, 0, 10 );

    } );

    it( 'should give correct left side width of road', () => {

        const result = TvMapQueries.getRoadWidthAt( road.id, 0 );

        expect( result.totalWidth ).toBe( 12.2 );

        expect( result.leftSideWidth ).toBe( 6.1 );

        expect( result.rightSideWidth ).toBe( 6.1 );

    } );


    it( 'should give correct position for road start node', () => {

        const s = 0;

        // add left lane with 2 width 
        road.getLaneSectionAt( 0 ).addLane( TvLaneSide.LEFT, 4, TvLaneType.driving, false, true ).addWidthRecord( 0, 2, 0, 0, 0 );

        const result = TvMapQueries.getRoadWidthAt( road.id, s );

        const start = TvMapQueries.getRoadPosition( road.id, s, -result.leftSideWidth );
        const end = TvMapQueries.getRoadPosition( road.id, s, result.rightSideWidth );

    } );

} );
