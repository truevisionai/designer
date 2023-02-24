/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';
import { TvContactPoint, TvLaneSide, TvRoadType } from 'app/modules/tv-map/models/tv-common';
import { TvLaneSection } from 'app/modules/tv-map/models/tv-lane-section';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { Maths } from 'app/utils/maths';
import { RoadInspector } from 'app/views/inspectors/road-inspector/road-inspector.component';
import { Vector3 } from 'three';
import { AppInspector } from '../inspector';
import { SceneService } from '../services/scene.service';
import { ExplicitSpline } from '../shapes/explicit-spline';
import { NodeFactoryService } from './node-factory.service';

export class RoadFactory {

    static get map () {
        return TvMapInstance.map;
    }

    static createRoad ( position: Vector3 ) {

        const road = this.map.addDefaultRoadWithType( TvRoadType.TOWN, 40 );

        const point = this.addControlPoint( road, position );

        return { road, point };
    }

    static removeRoad ( road: TvRoad ) {

        this.map.removeRoad( road );

    }

    static updateGeometryAndRebuild ( road: TvRoad ): void {

        this.updateGeometry( road );

        this.rebuildRoad( road );
    }

    static updateGeometry ( road: TvRoad ) {

        road.updateGeometryFromSpline();

    }

    static rebuildRoad ( road: TvRoad ) {

        this.map.gameObject.remove( road.gameObject );

        TvMapBuilder.buildRoad( this.map.gameObject, road );

        if ( !road.isJunction ) NodeFactoryService.updateRoadNodes( road );

    }

    static addControlPoint ( road: TvRoad, position: Vector3 ): RoadControlPoint {

        let point: RoadControlPoint;

        // TODO: Fix addControlPointAtNew

        if ( road.spline instanceof ExplicitSpline ) {

            point = road.spline.addControlPointAtNew( position );

        } else {

            point = new RoadControlPoint( road, position, 'cp', 0, 0 );

            point.mainObject = point.userData.road = road;

            this.addControlPointNew( road, point );

        }

        return point;
    }

    static addControlPointNew ( road: TvRoad, point: RoadControlPoint ) {

        // TODO: spline should take this responsibility
        SceneService.add( point );

        road.addControlPoint( point );

        AppInspector.setInspector( RoadInspector, {
            road: road,
            controlPoint: point
        } );

        if ( road.spline.controlPoints.length > 1 ) {
            this.updateGeometryAndRebuild( road );
        }


    }

    static removeControlPoint ( road: TvRoad, cp: RoadControlPoint ) {

        road.spline.removeControlPoint( cp );

        SceneService.remove( cp );

        if ( road.spline.controlPoints.length < 1 ) {

            this.map.gameObject.remove( road.gameObject );

            // nothing to update, will throw error
            // road.spline.update();

            road.clearGeometries();


        } else if ( road.spline.controlPoints.length === 1 ) {

            this.map.gameObject.remove( road.gameObject );

            road.spline.update();

            road.clearGeometries();

            this.clearNodes( road );

        } else if ( road.spline.controlPoints.length > 1 ) {

            this.updateGeometryAndRebuild( road );

        }
    }

    static clearNodes ( road: TvRoad ) {

        if ( road.startNode ) {

            SceneService.remove( road.startNode );

            road.startNode = null;

        }

        if ( road.endNode ) {

            SceneService.remove( road.endNode );

            road.endNode = null;
        }
    }

    static joinRoadNodes ( firstRoad: TvRoad, firstNode: RoadNode, secondRoad: TvRoad, secondNode: RoadNode ): TvRoad {

        const distance = 20;

        let laneSection: TvLaneSection, firstRoadS: number;

        let firstPoint: RoadControlPoint, lastPoint: RoadControlPoint;

        let secondPosition: TvPosTheta, thirdPosition: TvPosTheta, fourPosition: TvPosTheta, fivePosition: TvPosTheta;

        if ( firstNode.distance === 'start' ) {

            firstRoadS = 0;

            laneSection = firstRoad.getLaneSectionAt( 0 ).cloneAtS( 0, firstRoadS );

            secondPosition = firstRoad.startPosition().clone().rotateDegree( 180 ).moveForward( distance );
            thirdPosition = firstRoad.startPosition().clone().rotateDegree( 180 ).moveForward( distance + 20 ).addLateralOffset( 5 );

        } else {

            firstRoadS = firstRoad.length - Maths.Epsilon;

            laneSection = firstRoad.getLaneSectionAt( firstRoadS ).cloneAtS( 0, firstRoadS );

            secondPosition = firstRoad.endPosition().clone().moveForward( distance );
            thirdPosition = firstRoad.endPosition().clone().moveForward( distance + 20 ).addLateralOffset( 5 );

        }

        if ( secondNode.distance === 'start' ) {

            fourPosition = secondRoad.startPosition().clone().rotateDegree( 180 ).moveForward( distance + 20 ).addLateralOffset( 5 );
            fivePosition = secondRoad.startPosition().clone().rotateDegree( 180 ).moveForward( distance );

        } else {

            fourPosition = secondRoad.endPosition().clone().moveForward( distance + 20 ).addLateralOffset( 5 );
            fivePosition = secondRoad.endPosition().clone().moveForward( distance );

        }

        // Make control points required for road geometry
        const joiningRoad = this.map.addDefaultRoad();

        if ( firstRoad.hasType ) {

            const roadType = firstRoad.getRoadTypeAt( firstRoadS );

            joiningRoad.setType( roadType.type, roadType.speed.max, roadType.speed.unit );

        } else {

            joiningRoad.setType( TvRoadType.TOWN, 40 );

        }


        // remove lane section as will create copy of first road
        joiningRoad.clearLaneSections();

        joiningRoad.addLaneSectionInstance( laneSection );

        if ( firstNode.distance === 'start' ) {

            firstPoint = new RoadControlPoint( joiningRoad, firstRoad.spline.getFirstPoint().position.clone(), 'cp', 0, 0 );

        } else {

            firstPoint = new RoadControlPoint( joiningRoad, firstRoad.spline.getLastPoint().position.clone(), 'cp', 0, 0 );

        }

        if ( secondNode.distance === 'start' ) {

            lastPoint = new RoadControlPoint( joiningRoad, secondRoad.spline.getFirstPoint().position.clone(), 'cp', 0, 0 );

        } else {

            lastPoint = new RoadControlPoint( joiningRoad, secondRoad.spline.getLastPoint().position.clone(), 'cp', 0, 0 );

        }

        const secondPoint = new RoadControlPoint( joiningRoad, secondPosition.toVector3(), 'cp', 0, 0 );
        const thirdPoint = new RoadControlPoint( joiningRoad, thirdPosition.toVector3(), 'cp', 0, 0 );
        const fourthPoint = new RoadControlPoint( joiningRoad, fourPosition.toVector3(), 'cp', 0, 0 );
        const fifthPoint = new RoadControlPoint( joiningRoad, fivePosition.toVector3(), 'cp', 0, 0 );

        SceneService.add( firstPoint );
        SceneService.add( secondPoint );
        SceneService.add( thirdPoint );
        SceneService.add( fifthPoint );
        SceneService.add( fourthPoint );
        SceneService.add( lastPoint );

        joiningRoad.spline.addControlPoint( firstPoint );
        joiningRoad.spline.addControlPoint( secondPoint );
        joiningRoad.spline.addControlPoint( thirdPoint );
        joiningRoad.spline.addControlPoint( fourthPoint );
        joiningRoad.spline.addControlPoint( fifthPoint );
        joiningRoad.spline.addControlPoint( lastPoint );


        joiningRoad.updateGeometryFromSpline();

        /////////////////////////////////////////////////////////////////////////////////


        // TODO: add more logic to smoothen the geometry

        // for ( let i = 0; i < roadC.geometries.length; i++ ) {

        //     const geometry = roadC.geometries[ i ];

        //     if ( geometry.geometryType === OdGeometryType.ARC ) {

        //         const arcGeometry = geometry as OdArcGeometry;

        //         if ( arcGeometry.attr_curvature < 0.01 ) {

        //             // first geometry so update second point
        //             if ( i < 1 ) {

        //             }

        //         }
        //     }

        // }

        /////////////////////////////////////////////////////////////////////////////////
        //
        // Update the road connections


        this.makeRoadConnections( firstRoad, firstNode, secondRoad, secondNode, joiningRoad );

        /////////////////////////////////////////////////////////////////////////////////


        TvMapBuilder.buildRoad( this.map.gameObject, joiningRoad );

        return joiningRoad;
    }

    static makeRoadConnections ( firstRoad: TvRoad, firstNode: RoadNode, secondRoad: TvRoad, secondNode: RoadNode, joiningRoad: TvRoad ) {

        if ( firstNode.distance === 'start' ) {

            // link will be negative as joining roaad will in opposite direction

            firstRoad.setPredecessor( 'road', joiningRoad.id, TvContactPoint.START );
            firstRoad.getFirstLaneSection().lanes.forEach( lane => {
                if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( -lane.id );
            } );

            joiningRoad.setPredecessor( 'road', firstRoad.id, TvContactPoint.START );
            joiningRoad.getFirstLaneSection().lanes.forEach( lane => {
                if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( -lane.id );
            } );

        } else {

            // links will be in same direction

            firstRoad.setSuccessor( 'road', joiningRoad.id, TvContactPoint.START );
            firstRoad.getLastLaneSection().lanes.forEach( lane => {
                if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( lane.id );
            } );

            joiningRoad.setPredecessor( 'road', firstRoad.id, TvContactPoint.END );
            joiningRoad.getFirstLaneSection().lanes.forEach( lane => {
                if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( lane.id );
            } );

        }

        if ( secondNode.distance === 'start' ) {

            secondRoad.setPredecessor( 'road', joiningRoad.id, TvContactPoint.END );
            secondRoad.getFirstLaneSection().lanes.forEach( lane => {
                if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( lane.id );
            } );

            joiningRoad.setSuccessor( 'road', secondRoad.id, TvContactPoint.START );
            joiningRoad.getLastLaneSection().lanes.forEach( lane => {
                if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( lane.id );
            } );

        } else {

            secondRoad.setSuccessor( 'road', joiningRoad.id, TvContactPoint.END );
            secondRoad.getLastLaneSection().lanes.forEach( lane => {
                if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( -lane.id );
            } );

            joiningRoad.setSuccessor( 'road', secondRoad.id, TvContactPoint.END );
            joiningRoad.getLastLaneSection().lanes.forEach( lane => {
                if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( -lane.id );
            } );

        }
    }

    static makeSuccessorConnection ( firstRoad: TvRoad, secondRoad: TvRoad ) {

        firstRoad.setSuccessor( 'road', secondRoad.id, TvContactPoint.START );

        firstRoad.getLastLaneSection().lanes.forEach( lane => {
            if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( lane.id );
        } );

        secondRoad.setPredecessor( 'road', firstRoad.id, TvContactPoint.END );

        secondRoad.getFirstLaneSection().lanes.forEach( lane => {
            if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( lane.id );
        } );

    }

    static removeRoadConnections ( firstRoad: TvRoad, secondRoad: TvRoad ) {

        if ( firstRoad.predecessor && firstRoad.predecessor.elementId === secondRoad.id ) {

            firstRoad.predecessor = null;

        }

        if ( firstRoad.successor && firstRoad.successor.elementId === secondRoad.id ) {

            firstRoad.successor = null;

        }

        if ( secondRoad.predecessor && secondRoad.predecessor.elementId === firstRoad.id ) {

            secondRoad.predecessor = null;

        }

        if ( secondRoad.successor && secondRoad.successor.elementId === firstRoad.id ) {

            secondRoad.successor = null;

        }

    }
}
