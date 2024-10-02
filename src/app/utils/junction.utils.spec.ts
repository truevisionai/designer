/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventServiceProvider } from "../listeners/event-service-provider";
import { SplineTestHelper } from "../services/spline/spline-test-helper.service";
import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { HttpClientModule } from "@angular/common/http";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { RoadToolHelper } from "../tools/road/road-tool-helper.service";
import { JunctionUtils } from "./junction.utils";
import { JunctionService } from "../services/junction/junction.service";
import { disableMeshBuilding } from "app/modules/builder/builders/od-builder-config";

describe( 'JunctionUtils', () => {

	let eventServiceProvider: EventServiceProvider;
	let helper: SplineTestHelper;
	let junctionService: JunctionService;

	beforeEach( () => {

		TestBed.configureTestingModule( {
			imports: [ HttpClientModule, MatSnackBarModule ],
			providers: []
		} );

		helper = TestBed.inject( SplineTestHelper );
		junctionService = TestBed.inject( JunctionService );

		eventServiceProvider = TestBed.inject( EventServiceProvider );
		eventServiceProvider.init();

		disableMeshBuilding();

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
		expect( JunctionUtils.findSuccessors( incomingRoad, incomingLaneSection.lanesMap.get( -2 ), incomingRoad.successor ).length ).toBe( 1 );

		// outgoing road lane:1 must have 3 predecessors
		expect( JunctionUtils.findPredecessors( outgoingRoad, outgoingLeftLane, outgoingRoad.predecessor ).length ).toBe( 3 );
		// outgoing road lane:-1 must have 3 successors
		expect( JunctionUtils.findSuccessors( outgoingRoad, outgoingRightLane, outgoingRoad.predecessor ).length ).toBe( 3 );
		// sidewalk should have only 1 successor
		expect( JunctionUtils.findSuccessors( outgoingRoad, outgoingLaneSection.lanesMap.get( -2 ), outgoingRoad.predecessor ).length ).toBe( 1 );


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
