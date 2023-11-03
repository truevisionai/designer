/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { TvContactPoint, TvRoadType } from 'app/modules/tv-map/models/tv-common';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-instance';
import { Vector3 } from 'three';
import { RoadFactory } from '../../factories/road-factory.service';
import { RoadTool } from './road-tool';

describe( 'RoadTool', () => {

	let map: TvMap;

	let roadTool: RoadTool;

	beforeEach( () => {

		map = TvMapInstance.map = new TvMap();

		roadTool = new RoadTool();

	} );

	it( 'should update successor', () => {

		const road1 = map.addNewRoad( 'road1', 10, 1, -1 );
		road1.addControlPointAt( new Vector3( 0, 0, 0 ) );
		road1.addControlPointAt( new Vector3( 10, 0, 0 ) );
		road1.updateGeometryFromSpline();

		const road2 = map.addNewRoad( 'road2', 10, 2, -1 );
		road2.addControlPointAt( new Vector3( 10, 0, 0 ) );
		road2.addControlPointAt( new Vector3( 20, 0, 0 ) );
		road2.updateGeometryFromSpline();

		const road3 = map.addNewRoad( 'road3', 10, 3, -1 );
		road3.addControlPointAt( new Vector3( 10, 0, 0 ) );
		road3.addControlPointAt( new Vector3( 20, 0, 0 ) );
		road3.updateGeometryFromSpline();

		road1.setSuccessorRoad( road2, TvContactPoint.START );
		road2.setPredecessorRoad( road1, TvContactPoint.END );

		road2.setSuccessorRoad( road3, TvContactPoint.END );
		road3.setSuccessorRoad( road2, TvContactPoint.END );

		const road1LastPoint = road1.spline.getLastPoint() as RoadControlPoint;
		const road2FirstPoint = road2.spline.getFirstPoint() as RoadControlPoint;

		road1LastPoint.position.copy( new Vector3( 15, 0, 0 ) );
		road1.successor?.update( road1, TvContactPoint.END, false );
		road1.predecessor?.update( road1, TvContactPoint.START, false );

		// expect( road1LastPoint.position.x ).toBe( road2FirstPoint.position.x );
		expect( road1LastPoint.position.y ).toBe( road2FirstPoint.position.y );
		expect( road1LastPoint.position.z ).toBe( road2FirstPoint.position.z );

		const road2LastPoint = road2.spline.getLastPoint() as RoadControlPoint;
		const road3LastPoint = road3.spline.getLastPoint() as RoadControlPoint;

		road2LastPoint.position.copy( new Vector3( 25, 0, 0 ) );
		road2.successor?.update( road2, TvContactPoint.END, false );
		road2.predecessor?.update( road2, TvContactPoint.START, false );

		expect( road2LastPoint.position.x ).toBe( 25 );
		expect( road2LastPoint.position.y ).toBe( road3LastPoint.position.y );
		expect( road2LastPoint.position.z ).toBe( road3LastPoint.position.z );

		road3LastPoint.position.copy( new Vector3( 30, 0, 0 ) );
		road3.successor?.update( road3, TvContactPoint.END, false );
		road3.predecessor?.update( road3, TvContactPoint.START, false );

		expect( road3LastPoint.position.x ).toBe( 30 );
		expect( road3LastPoint.position.y ).toBe( road2LastPoint.position.y );
		expect( road3LastPoint.position.z ).toBe( road2LastPoint.position.z );


	} );

	// it( 'should maintain hdg for connected roads', () => {

	// 	// c is th joining road
	// 	let roadA: TvRoad, roadB: TvRoad, roadC: TvRoad;

	// 	let roadAHdg, roadBHdg, roadCHdg;

	// 	[ roadA, roadC, roadB ] = createRoads();

	// 	roadAHdg = roadA.spline.controlPoints.map( ( p: RoadControlPoint ) => p.hdg );
	// 	roadBHdg = roadB.spline.controlPoints.map( ( p: RoadControlPoint ) => p.hdg );
	// 	roadCHdg = roadC.spline.controlPoints.map( ( p: RoadControlPoint ) => p.hdg );

	// 	roadA.spline.getLastPoint().copyPosition( new Vector3( 120, 0, 0 ) );

	// 	roadA.updateGeometryFromSpline();

	// 	roadAHdg = roadA.spline.controlPoints.map( ( p: RoadControlPoint ) => p.hdg );
	// 	roadBHdg = roadB.spline.controlPoints.map( ( p: RoadControlPoint ) => p.hdg );
	// 	roadCHdg = roadC.spline.controlPoints.map( ( p: RoadControlPoint ) => p.hdg );

	// 	// nothing happening in this test for now
	// 	expect( true ).toBe( true );

	// } );

	// it( 'should join 2 road nodes correctly', () => {

	// 	// start |---------------->

	// 	// start |---------------->

	// 	let roadA, roadB, joiningRoad;

	// 	[ roadA, roadB, joiningRoad ] = createRoads();

	// 	expect( !joiningRoad ).toBe( false );

	// 	expect( joiningRoad.spline.controlPoints.length ).toBe( 6 );

	// } );

	// function createRoads () {

	// 	const roadA = map.addDefaultRoad();

	// 	roadA.spline.addControlPoint( new RoadControlPoint( roadA, new Vector3( 0, 0, 0 ) ) );
	// 	roadA.spline.addControlPoint( new RoadControlPoint( roadA, new Vector3( 50, 5, 0 ) ) );
	// 	roadA.spline.addControlPoint( new RoadControlPoint( roadA, new Vector3( 100, 0, 0 ) ) );

	// 	roadA.updateGeometryFromSpline();

	// 	const roadB = map.addDefaultRoad();

	// 	roadB.spline.addControlPoint( new RoadControlPoint( roadB, new Vector3( 0, 50, 0 ) ) );
	// 	roadB.spline.addControlPoint( new RoadControlPoint( roadB, new Vector3( 55, 50, 0 ) ) );
	// 	roadB.spline.addControlPoint( new RoadControlPoint( roadB, new Vector3( 100, 50, 0 ) ) );

	// 	roadB.updateGeometryFromSpline();

	// 	const joiningRoad = RoadFactory.joinRoadNodes( roadA, roadA.endNode, roadB, roadB.endNode );

	// 	return [ roadA, roadB, joiningRoad ];
	// }

	function suc_pre () {
		const road1 = this.map.addDefaultRoadWithType( TvRoadType.TOWN );

		road1.addControlPointAt( new Vector3( 0, 0, 0 ) );
		road1.addControlPointAt( new Vector3( 0, 50, 0 ) );
		road1.addControlPointAt( new Vector3( 80, 50, 0 ) );

		road1.updateGeometryFromSpline();

		RoadFactory.rebuildRoad( road1 );

		const road2 = this.map.addDefaultRoadWithType( TvRoadType.TOWN );

		road2.addControlPointAt( new Vector3( 80, 50, 0 ) );
		road2.addControlPointAt( new Vector3( 160, 50, 0 ) );
		road2.addControlPointAt( new Vector3( 160, 0, 0 ) );

		road2.updateGeometryFromSpline();

		RoadFactory.rebuildRoad( road2 );

		road1.setSuccessor( 'road', road2.id, TvContactPoint.START );
		road2.setPredecessor( 'road', road1.id, TvContactPoint.END );
	}

	function suc_suc () {
		const road1 = this.map.addDefaultRoadWithType( TvRoadType.TOWN );

		road1.addControlPointAt( new Vector3( 0, 0, 0 ) );
		road1.addControlPointAt( new Vector3( 0, 50, 0 ) );
		road1.addControlPointAt( new Vector3( 80, 50, 0 ) );

		road1.updateGeometryFromSpline();

		RoadFactory.rebuildRoad( road1 );

		const road2 = this.map.addDefaultRoadWithType( TvRoadType.TOWN );

		road2.addControlPointAt( new Vector3( 160, 0, 0 ) );
		road2.addControlPointAt( new Vector3( 160, 50, 0 ) );
		road2.addControlPointAt( new Vector3( 80, 50, 0 ) );

		road2.updateGeometryFromSpline();

		RoadFactory.rebuildRoad( road2 );

		road1.setSuccessor( 'road', road2.id, TvContactPoint.END );
		road2.setSuccessor( 'road', road1.id, TvContactPoint.END );
	}

	function pre_pre () {
		const road1 = this.map.addDefaultRoadWithType( TvRoadType.TOWN );

		road1.addControlPointAt( new Vector3( 80, 50, 0 ) );
		road1.addControlPointAt( new Vector3( 0, 50, 0 ) );
		road1.addControlPointAt( new Vector3( 0, 0, 0 ) );

		road1.updateGeometryFromSpline();

		RoadFactory.rebuildRoad( road1 );

		const road2 = this.map.addDefaultRoadWithType( TvRoadType.TOWN );

		road2.addControlPointAt( new Vector3( 80, 50, 0 ) );
		road2.addControlPointAt( new Vector3( 160, 50, 0 ) );
		road2.addControlPointAt( new Vector3( 160, 0, 0 ) );

		road2.updateGeometryFromSpline();

		RoadFactory.rebuildRoad( road2 );

		road1.setPredecessor( 'road', road2.id, TvContactPoint.START );
		road2.setPredecessor( 'road', road1.id, TvContactPoint.START );
	}

	function pre_suc () {
		const road1 = this.map.addDefaultRoadWithType( TvRoadType.TOWN );

		road1.addControlPointAt( new Vector3( 80, 50, 0 ) );
		road1.addControlPointAt( new Vector3( 0, 50, 0 ) );
		road1.addControlPointAt( new Vector3( 0, 0, 0 ) );

		road1.updateGeometryFromSpline();

		RoadFactory.rebuildRoad( road1 );

		const road2 = this.map.addDefaultRoadWithType( TvRoadType.TOWN );

		road2.addControlPointAt( new Vector3( 160, 0, 0 ) );
		road2.addControlPointAt( new Vector3( 160, 50, 0 ) );
		road2.addControlPointAt( new Vector3( 80, 50, 0 ) );

		road2.updateGeometryFromSpline();

		RoadFactory.rebuildRoad( road2 );

		road1.setPredecessor( 'road', road2.id, TvContactPoint.END );
		road2.setSuccessor( 'road', road1.id, TvContactPoint.START );
	}


} );
