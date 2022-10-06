/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { TvContactPoint, TvRoadType } from 'app/modules/tv-map/models/tv-common';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { Vector3 } from 'three';
import { NodeFactoryService } from '../factories/node-factory.service';
import { RoadFactory } from '../factories/road-factory.service';
import { RoadTool } from './road-tool';

describe( 'RoadTool', () => {

    let map: TvMap;

    let roadTool: RoadTool;

    beforeEach( () => {

        map = TvMapInstance.map = new TvMap();

        roadTool = new RoadTool();

    } );

    it( 'should maintain hdg for connected roads', () => {

        // c is th joining road
        let roadA: TvRoad, roadB: TvRoad, roadC: TvRoad;

        let roadAHdg, roadBHdg, roadCHdg;

        [ roadA, roadC, roadB ] = createRoads();

        roadAHdg = roadA.spline.controlPoints.map( ( p: RoadControlPoint ) => p.hdg );
        roadBHdg = roadB.spline.controlPoints.map( ( p: RoadControlPoint ) => p.hdg );
        roadCHdg = roadC.spline.controlPoints.map( ( p: RoadControlPoint ) => p.hdg );

        roadA.spline.getLastPoint().copyPosition( new Vector3( 120, 0, 0 ) );

        roadA.updateGeometryFromSpline();

        roadAHdg = roadA.spline.controlPoints.map( ( p: RoadControlPoint ) => p.hdg );
        roadBHdg = roadB.spline.controlPoints.map( ( p: RoadControlPoint ) => p.hdg );
        roadCHdg = roadC.spline.controlPoints.map( ( p: RoadControlPoint ) => p.hdg );

        // nothing happening in this test for now
        expect( true ).toBe( true );

    } );

    it( 'should join 2 road nodes correctly', () => {

        // start |---------------->

        // start |---------------->

        let roadA, roadB, joiningRoad;

        [ roadA, roadB, joiningRoad ] = createRoads();

        expect( !joiningRoad ).toBe( false );

        expect( joiningRoad.spline.controlPoints.length ).toBe( 6 );

    } );

    function createRoads () {

        const roadA = map.addDefaultRoad();

        roadA.spline.addControlPoint( new RoadControlPoint( roadA, new Vector3( 0, 0, 0 ) ) );
        roadA.spline.addControlPoint( new RoadControlPoint( roadA, new Vector3( 50, 5, 0 ) ) );
        roadA.spline.addControlPoint( new RoadControlPoint( roadA, new Vector3( 100, 0, 0 ) ) );

        roadA.updateGeometryFromSpline();

        NodeFactoryService.updateRoadNodes( roadA );

        const roadB = map.addDefaultRoad();

        roadB.spline.addControlPoint( new RoadControlPoint( roadB, new Vector3( 0, 50, 0 ) ) );
        roadB.spline.addControlPoint( new RoadControlPoint( roadB, new Vector3( 55, 50, 0 ) ) );
        roadB.spline.addControlPoint( new RoadControlPoint( roadB, new Vector3( 100, 50, 0 ) ) );

        roadB.updateGeometryFromSpline();

        NodeFactoryService.updateRoadNodes( roadB );

        const joiningRoad = RoadFactory.joinRoadNodes( roadA, roadA.endNode, roadB, roadB.endNode );

        return [ roadA, roadB, joiningRoad ];
    }

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
