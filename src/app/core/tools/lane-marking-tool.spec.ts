/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { LaneMarkingTool } from './lane-marking-tool';


describe( 'LaneMarkingTool Test', () => {

	let tool: LaneMarkingTool;
	let map: TvMap;
	let road: TvRoad;

	beforeEach( () => {

		tool = new LaneMarkingTool();

		map = TvMapInstance.map = new TvMap();

		road = map.addDefaultRoad();

		road.addGeometryLine( 0, 0, 0, 0, 100 );

		TvMapBuilder.buildMap( map );

	} );

	// it( 'should do nothing on right-click', () => {

	//     tool.onPointerDown( PointerEventData.new( MouseButton.RIGHT, new Vector3() ) );

	//     expect( tool.lane ).toBeUndefined();
	//     expect( tool.controlPoint ).toBeUndefined();
	//     expect( tool.node ).toBeUndefined();
	//     expect( tool.roadMark ).toBeUndefined();

	//     expect( tool.pointerDown ).toBeTruthy();
	//     expect( tool.pointerDownAt ).toBeUndefined();

	// } );

	// it( 'should set right tool variables on left-click', () => {

	//     tool.onPointerDown( PointerEventData.new( MouseButton.LEFT, new Vector3() ) );

	//     expect( tool.lane ).toBeNull();
	//     expect( tool.controlPoint ).toBeNull();
	//     expect( tool.node ).toBeNull();

	//     expect( tool.pointerDown ).toBeTruthy();
	//     expect( tool.pointerDownAt ).toBeDefined();

	// } );

	// it( 'should select lane & highlight reference lines', () => {

	//     const selectedLane = road.getLaneSectionAt( 0 ).getLeftLanes()[ 0 ];

	//     const intersection = {
	//         distance: 1,
	//         distanceToRay: 1,
	//         point: new Vector3(),
	//         object: selectedLane.gameObject,
	//     }

	//     tool.onPointerDown( PointerEventData.new( MouseButton.LEFT, new Vector3(), [ intersection ] ) );

	//     expect( tool.lane ).toBeDefined();
	//     expect( tool.lane.id ).toEqual( selectedLane.id );

	//     expect( tool.controlPoint ).toBeUndefined();
	//     expect( tool.node ).toBeUndefined();

	//     expect( tool.pointerDown ).toBeTruthy();
	//     expect( tool.pointerDownAt ).toBeDefined();

	//     road.getLaneSectionAt( 0 ).lanes.forEach( lane => {

	//         // now lets check if the lane lines are visible on all the lanes
	//         expect( lane.startLine ).toBeDefined();
	//         expect( lane.startLine.visible ).toBeTruthy();
	//         expect( lane.startLine.isSelected ).toBeFalsy();

	//     } );

	//     expect( AppInspector.currentInspector ).toBeNull();

	// } );

	// it( 'should select lane & highlight reference lines', () => {

	//     const selectedLane = road.getLaneSectionAt( 0 ).getLeftLanes()[ 0 ];

	//     const laneIntersection = {
	//         distance: 1,
	//         distanceToRay: 1,
	//         point: new Vector3(),
	//         object: selectedLane.gameObject,
	//     }

	//     tool.onPointerDown( PointerEventData.new( MouseButton.LEFT, new Vector3(), [ laneIntersection ] ) );

	//     expect( tool.lane ).toBeDefined();
	//     expect( tool.lane.id ).toEqual( selectedLane.id );

	//     // at this point lane is selected and reference lines should be visible

	//     const lineIntersection = {
	//         distance: 1,
	//         distanceToRay: 1,
	//         point: new Vector3(),
	//         object: selectedLane.startLine,
	//     }

	//     tool.onPointerDown( PointerEventData.new( MouseButton.LEFT, new Vector3(), [ lineIntersection ] ) );

	//     // at this point line lane line should be selected

	//     expect( tool.lane.startLine.isSelected ).toBe( true );

	//     expect( tool.roadMark ).toBeDefined();


	// } );

} );
