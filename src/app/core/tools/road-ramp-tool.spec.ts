/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { Vector3 } from 'three';
import { RoadRampTool } from './road-ramp-tool';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';


// describe( 'RoadRampTool Test', () => {

// 	let tool: RoadRampTool;
// 	let map: TvMap;

// 	beforeEach( () => {

// 		tool = new RoadRampTool();

// 		tool.init();

// 		map = TvMapInstance.map = new TvMap();

// 	} );

// 	it( 'should create 4 arc roads', () => {

// 		const A = new Vector3( 0, 0, 0 );
// 		const B = new Vector3( 10, 10, 0 );
// 		const posTheta = new TvPosTheta( 0, 0, 0, 0, 0);

// 		const points = tool.makeRampRoadPoints( A, B, posTheta);

// 		// TODO: write actual expectations here
// 		// expect( points.length ).toBe( 4 );
// 		// expect( points[1].x ).toBe( 4 );
// 		// expect( points[1].y ).toBe( 4 );
// 		// expect( points[2].x ).toBe( 4 );
// 		// expect( points[2].y ).toBe( 4 );

// 	} );

// } );

