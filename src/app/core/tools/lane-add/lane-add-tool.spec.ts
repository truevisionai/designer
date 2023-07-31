/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData } from '../../../events/pointer-event-data';
import { LaneAddTool } from './lane-add-tool';
import { TvLane } from '../../../modules/tv-map/models/tv-lane';
import { Object3D, Vector3 } from 'three';
import { TvLaneSide, TvLaneType } from 'app/modules/tv-map/models/tv-common';

// describe( 'LaneAddTool', () => {

// 	let laneAddTool: LaneAddTool;

// 	beforeEach( () => {
// 		laneAddTool = new LaneAddTool();
// 	} );

// 	// Test 1: onPointerDown with right or middle mouse button press
// 	it( 'should not perform any actions on right or middle mouse button press', () => {
// 		const eventRightClick: PointerEventData = new PointerEventData( {
// 			button: MouseButton.RIGHT,
// 			intersections: [],
// 			// ... other properties
// 		} );

// 		const eventMiddleClick: PointerEventData = new PointerEventData( {
// 			button: MouseButton.MIDDLE,
// 			intersections: [],
// 		} );

// 		spyOn( laneAddTool, 'isLaneSelected' );
// 		spyOn( laneAddTool, 'isReferenceLineSelected' );

// 		laneAddTool.onPointerDown( eventRightClick );
// 		laneAddTool.onPointerDown( eventMiddleClick );

// 		expect( laneAddTool.isLaneSelected ).not.toHaveBeenCalled();
// 		expect( laneAddTool.isReferenceLineSelected ).not.toHaveBeenCalled();
// 	} );

// 	// Test 2: onPointerDown with left mouse button press and no lane selected
// 	it( 'should clear the current lane and inspector on left mouse button press with no lane selected', () => {
// 		const eventLeftClick: PointerEventData = new PointerEventData( {
// 			button: MouseButton.LEFT,
// 		} );

// 		spyOn( laneAddTool, 'shouldClearLane' ).and.returnValue( true );
// 		spyOn( laneAddTool, 'isReferenceLineSelected' ).and.returnValue( false );
// 		spyOn( laneAddTool, 'clearLane' );

// 		laneAddTool.onPointerDown( eventLeftClick );

// 		expect( laneAddTool.clearLane ).toHaveBeenCalled();
// 	} );

// 	// Test 3: onPointerDown with left mouse button press and a new lane selected
// 	it( 'should select the new lane, draw the road, and set the inspector on left mouse button press with a new lane selected', () => {

// 		const gameObject = new Object3D();

// 		const newLane = new TvLane( TvLaneSide.LEFT, 1, TvLaneType.driving, false );

// 		gameObject.userData.lane = newLane;

// 		const intersection = {
// 			object: gameObject,
// 			distance: 0,
// 			point: new Vector3( 0, 0, 0 ),
// 			face: null,
// 			uv: null,
// 			instanceId: null,
// 			index: null
// 		};

// 		const eventLeftClick: PointerEventData = new PointerEventData( {
// 			button: MouseButton.LEFT,
// 			intersections: [ intersection ],
// 		} );

// 		spyOn( laneAddTool, 'shouldSelectNewLane' ).and.returnValue( true );
// 		spyOn( laneAddTool, 'isReferenceLineSelected' ).and.returnValue( false );
// 		spyOn( laneAddTool, 'selectNewLane' );

// 		laneAddTool.onPointerDown( eventLeftClick );

// 		expect( laneAddTool.selectNewLane ).toHaveBeenCalled()
// 	} );
// } );
