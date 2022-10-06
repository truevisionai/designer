/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SceneService } from 'app/core/services/scene.service';
import { ArrowHelper, Object3D, Vector3 } from 'three';
import { Maths } from '../../../utils/maths';
import { TvLaneSide, TvLaneType } from '../models/tv-common';
import { TvLane } from '../models/tv-lane';
import { TvLaneSection } from '../models/tv-lane-section';
import { TvPosTheta } from '../models/tv-pos-theta';
import { TvRoad } from '../models/tv-road.model';

export class OdLaneDirectionBuilder {

    private stepValue = 5;
    private arrows: Object3D[] = [];

    constructor ( private road: TvRoad ) {

    }

    setRoad ( value: TvRoad ): void {

        this.clear();

        this.road = value;

    }

    create () {

        const container = this.road.getLanes();

        container.computeLaneSectionEnd( this.road );

        for ( let i = 0; i < this.road.lanes.laneSections.length; i++ ) {

            const laneSection = this.road.lanes.laneSections[ i ];

            laneSection.getLeftLanes().forEach( lane => this.drawLane( lane, laneSection ) );

            laneSection.getRightLanes().forEach( lane => this.drawLane( lane, laneSection ) );
        }

    }

    clear () {

        this.arrows.forEach( arrow => SceneService.removeHelper( arrow ) );

    }

    drawSingleLane ( road: TvRoad, lane: TvLane ) {

        this.road = road;

        for ( let i = 0; i < this.road.lanes.laneSections.length; i++ ) {

            const laneSection = this.road.lanes.laneSections[ i ];

            this.drawLane( lane, laneSection );
        }
    }

    private createArrow ( origin: Vector3, direction: Vector3 ) {

        // var dir = new Vector3( 0, 1, 0 );

        // normalize the direction vector (convert to vector of length 1)
        direction.normalize();

        const length = 2.5;
        const hex = 0xffff00;

        const headLength = 0.2 * length;
        const headWidth = 0.75 * headLength;

        origin.setZ( origin.z + 0.1 );

        const arrowHelper = new ArrowHelper( direction, origin, length, hex, headLength, headWidth );

        arrowHelper.renderOrder = 3;

        this.arrows.push( arrowHelper );

        // add to helper to avoid raycasting
        SceneService.addHelper( arrowHelper );
    }

    private drawLane ( lane: TvLane, laneSection: TvLaneSection ) {

        if ( lane.type !== TvLaneType.driving ) return;

        let s = laneSection.s;

        const posTheta = new TvPosTheta();

        let laneOffset = 0;

        let width = 0;

        while ( s <= laneSection.lastSCoordinate ) {

            laneOffset = this.road.lanes.getLaneOffsetValue( s );

            width = laneSection.getWidthUptoCenter( lane, s );

            this.road.getGeometryCoords( s, posTheta );

            posTheta.addLateralOffset( laneOffset );

            if ( lane.side === TvLaneSide.RIGHT ) {

                width *= -1;

            } else if ( lane.side === TvLaneSide.LEFT ) {

                // to show arrow in traffic direction
                // TODO: Make traffic direction editable from editor
                posTheta.hdg += Maths.M_PI;
                width *= -1;
            }

            posTheta.addLateralOffset( width );

            this.createArrow( posTheta.toVector3(), posTheta.toDirectionVector() );

            s += this.stepValue;
        }

    }
}
