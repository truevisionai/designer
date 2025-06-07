/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SplineTestHelper } from "../services/spline/spline-test-helper.service";
import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { JunctionUtils } from "./junction.utils";
import { JunctionService } from "../services/junction/junction.service";
import { setupTest } from "tests/setup-tests";

describe( 'JunctionUtils', () => {

	let helper: SplineTestHelper;
	let junctionService: JunctionService;

	beforeEach( () => {

		setupTest();

		helper = TestBed.inject( SplineTestHelper );
		junctionService = TestBed.inject( JunctionService );

	} );

	it( 'should give successors correctly', fakeAsync( () => {

		helper.addDefaultJunction();

		tick( 1000 );

		const junction = helper.mapService.findJunction( 1 );

		const incomingRoad = helper.mapService.findRoad( 1 );
		const incomingLaneSection = incomingRoad.laneSections[ 0 ];
		const incomingLeftLane = incomingLaneSection.getLaneById( 1 );
		const incomingRightLane = incomingLaneSection.getLaneById( -1 );

		const outgoingRoad = helper.mapService.findRoad( 4 );
		const outgoingLaneSection = outgoingRoad.laneSections[ 0 ];
		const outgoingLeftLane = outgoingLaneSection.getLaneById( 1 );
		const outgoingRightLane = outgoingLaneSection.getLaneById( -1 );

		// incoming road lane:1 must have 3 predecessors
		expect( JunctionUtils.findPredecessors( incomingRoad, incomingLeftLane, incomingRoad.successor ).length ).toBe( 3 );
		// incoming road lane:-1 must have 3 successors
		expect( JunctionUtils.findSuccessors( incomingRoad, incomingRightLane, incomingRoad.successor ).length ).toBe( 3 );
		// sidewalk should have only 1 successor
		expect( JunctionUtils.findSuccessors( incomingRoad, incomingLaneSection.getLaneById( -2 ), incomingRoad.successor ).length ).toBe( 1 );

		// outgoing road lane:1 must have 3 predecessors
		expect( JunctionUtils.findPredecessors( outgoingRoad, outgoingLeftLane, outgoingRoad.predecessor ).length ).toBe( 3 );
		// outgoing road lane:-1 must have 3 successors
		expect( JunctionUtils.findSuccessors( outgoingRoad, outgoingRightLane, outgoingRoad.predecessor ).length ).toBe( 3 );
		// sidewalk should have only 1 successor
		expect( JunctionUtils.findSuccessors( outgoingRoad, outgoingLaneSection.getLaneById( -2 ), outgoingRoad.predecessor ).length ).toBe( 1 );


	} ) );

	// it( 'should work with router graph', () => {

	// 	splineTestHelper.addDefaultJunction();

	// 	const incomingRoad = helper.mapService.findRoad( 1 );
	// 	const incomingLeftLane = incomingRoad.laneSections[ 0 ].getLaneById( 1 );
	// 	const incomingRightLane = incomingRoad.laneSections[ 0 ].getLaneById( -1 );

	// 	// const currentMap = helper.mapService.map;
	// 	// const routeMap = new OpenDriveMap( currentMap.roads.toArray(), currentMap.junctions.toArray() );

	// 	// const graph = routeMap.getRoutingGraph();
	// 	// const laneKey = new LaneKey( incomingRoad.id, incomingRightLane.laneSection.s, incomingLeftLane.id );
	// 	// const successors = graph.getLaneSuccessors( laneKey );

	// 	// expect( successors.length ).toBe( 30 );

	// } );

} );
