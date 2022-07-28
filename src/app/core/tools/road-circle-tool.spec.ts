/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { Maths } from 'app/utils/maths';
import { TvDirection } from 'app/modules/tv-map/models/tv-common';
import { RoadCircleTool } from './road-circle-tool';
import { Vector3 } from 'three';


describe( 'RoadCircleTool Test', () => {

    let tool: RoadCircleTool;
    let map: TvMap;

    beforeEach( () => {

        tool = new RoadCircleTool();

        tool.init();

        map = TvMapInstance.map = new TvMap();

    } );

    it( 'should create 4 arc roads', () => {

        const centre = new Vector3( 0, 0, 0 );
        const end = new Vector3( 0, 100, 0 );

        tool.createCircularRoad( centre, end, 100 );

        expect( true ).toBe( false );

    } );

} );

