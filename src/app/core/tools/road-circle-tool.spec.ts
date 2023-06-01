/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { Vector3 } from 'three';
import { RoadCircleTool } from './road-circle-tool';


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

		tool.initCircle( centre, end, 100 );

		tool.createRoads();

		expect( map.roads.size ).toBe( 4 );

	} );

} );

