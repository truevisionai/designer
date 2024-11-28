/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneTool } from './lane-tool';
import { ToolType } from '../tool-types.enum';
import { LaneToolHelper } from './lane-tool.helper';
import { TestBed } from '@angular/core/testing';
import { SplineTestHelper } from 'app/services/spline/spline-test-helper.service';
import { LaneService } from 'app/services/lane/lane.service';
import { exportCorrectLaneOrder } from 'tests/base-test.spec';
import { LaneFactory } from "../../services/lane/lane.factory";
import { setupTest } from "../../../tests/setup-tests";

describe( 'LaneTool', () => {

	let laneTool: LaneTool;
	let testHelper: SplineTestHelper;
	let laneService: LaneService;

	beforeEach( () => {

		setupTest();

		laneTool = new LaneTool( TestBed.inject( LaneToolHelper ) );
		testHelper = TestBed.inject( SplineTestHelper );
		laneService = TestBed.inject( LaneService );

	} );

	it( 'should be created', () => {
		expect( laneTool ).toBeTruthy();
	} );

	it( 'should have name LaneTool', () => {
		expect( laneTool.name ).toBe( 'LaneTool' );
	} );

	it( 'should have tool type Lane', () => {
		expect( laneTool.toolType ).toBe( ToolType.Lane );
	} );

	it( 'should add lane correctly on simple road', () => {

		const road = testHelper.addStraightRoad();
		const laneSection = road.laneSections[ 0 ];
		const lane = laneSection.getLaneById( -1 );

		expect( laneSection.getLaneCount() ).toBe( 7 );
		exportCorrectLaneOrder( laneSection );

		const duplicate = LaneFactory.createDuplicate( lane );
		laneService.addLane( duplicate );

		expect( laneSection.getLaneCount() ).toBe( 8 );
		exportCorrectLaneOrder( laneSection );

		laneService.removeLane( duplicate );

		expect( laneSection.getLaneCount() ).toBe( 7 );
		exportCorrectLaneOrder( laneSection );


	} );

} );
