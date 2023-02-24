/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SceneService } from 'app/core/services/scene.service';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { Maths } from 'app/utils/maths';
import { Vector2, Vector3 } from 'three';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { RoadFactory } from '../factories/road-factory.service';
import { AutoSpline } from '../shapes/auto-spline';
import { OdBaseCommand } from './od-base-command';

export class AddRoadCircleCommand extends OdBaseCommand {

    private roads: TvRoad[] = [];
    private points: RoadControlPoint[] = [];

    constructor ( private centre: Vector3, private end: Vector3, private radius: number ) {

        super();

    }

    execute (): void {

        this.makePoints();

        TvMapBuilder.buildMap( this.map );

    }

    undo (): void {

        this.roads.forEach( road => {

            road.hideNodes();

            road.spline.hide();

            this.map.removeRoad( road );

        } );

        this.points.forEach( point => {

            SceneService.remove( point );

        } );

        this.roads.splice( 0, this.roads.length );

        this.points.splice( 0, this.points.length );
    }

    redo (): void {

        this.execute();

    }

    makePoints () {

        const p1 = new Vector2( this.centre.x, this.centre.y );
        const p2 = new Vector2( this.end.x, this.end.y );

        let start = this.end;

        let hdg = new Vector2().subVectors( p2, p1 ).angle() + Maths.M_PI_2;

        const circumference = 2 * Math.PI * this.radius;

        const arcLength = circumference * 0.25;

        const curvature = 1 / this.radius;

        for ( let i = 0; i < 4; i++ ) {

            const road = this.roads[ i ] = this.map.addDefaultRoad();

            const arc = road.addGeometryArc( 0, start.x, start.y, hdg, arcLength, curvature );

            const startPosTheta = new TvPosTheta();
            const endPosTheta = new TvPosTheta();

            arc.getCoords( 0, startPosTheta );
            arc.getCoords( arcLength, endPosTheta );

            const distance = start.distanceTo( arc.endV3 ) * 0.3;

            let a2 = startPosTheta.moveForward( +distance );
            let b2 = endPosTheta.moveForward( -distance );

            if ( i == 0 ) this.points.push( new RoadControlPoint( road, start, 'cp', 0, 0 ) );
            this.points.push( new RoadControlPoint( road, a2.toVector3(), 'cp', 0, 0 ) );
            this.points.push( new RoadControlPoint( road, b2.toVector3(), 'cp', 0, 0 ) );
            this.points.push( new RoadControlPoint( road, arc.endV3, 'cp', 0, 0 ) );

            start = arc.endV3;

            hdg += Maths.M_PI_2;

        }

        this.makeRoadsFromPoints( this.roads, this.points );

    }

    makeRoadsFromPoints ( roads: TvRoad[], points: RoadControlPoint[] ) {

        if ( roads.length != 4 ) throw new Error( 'Road count for circular road is incorrect' );

        if ( points.length != 13 ) throw new Error( 'Point count for circular road is incorrect' );

        points.forEach( p => SceneService.add( p ) );

        for ( let i = 0; i < 4; i++ ) {

            const road = roads[ i ];

            const spline = new AutoSpline( road );

            spline.addControlPoint( points[ i * 3 + 0 ] );
            spline.addControlPoint( points[ i * 3 + 1 ] );
            spline.addControlPoint( points[ i * 3 + 2 ] );
            spline.addControlPoint( points[ i * 3 + 3 ] );

            road.spline = spline;

            road.spline.hide();

            road.updateGeometryFromSpline();

            if ( ( i + 1 ) < roads.length ) {

                RoadFactory.makeSuccessorConnection( roads[ i ], roads[ i + 1 ] );

            } else {

                // its last road, so make connection with the first one
                RoadFactory.makeSuccessorConnection( roads[ i ], roads[ 0 ] );

            }

        }
    }


}
