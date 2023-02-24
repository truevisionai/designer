/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Mesh, Object3D } from 'three';
import { PointerEventData } from '../../events/pointer-event-data';
import { OdLaneDirectionBuilder } from '../../modules/tv-map/builders/od-lane-direction-builder';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { LaneInspectorComponent } from '../../views/inspectors/lane-type-inspector/lane-inspector.component';
import { AppInspector } from '../inspector';
import { BaseTool } from './base-tool';

export class LaneTool extends BaseTool {

    name: string = 'LaneTool';
    private laneDirectionHelper: OdLaneDirectionBuilder;

    init () {

        super.init();

        this.laneDirectionHelper = new OdLaneDirectionBuilder( null );
    }

    disable (): void {

        super.disable();

        this.laneDirectionHelper.clear();
    }

    onPointerDown ( e: PointerEventData ) {

        super.onPointerDown( e );

        let laneFound = false;

        this.checkLaneIntersection( e.intersections, ( object: Object3D ) => {

            laneFound = true;

            // this.removeHighlight();

            // this.highlight( object as Mesh );

            this.selectLane( object as Mesh );

        } );

        if ( !laneFound ) {

            // this.removeHighlight();

            this.clearInspector();
        }
    }

    private selectLane ( object: Mesh ) {

        let lane = ( object.userData.lane as TvLane );

        if ( lane == null ) return;

        AppInspector.setInspector( LaneInspectorComponent, lane );

        this.laneDirectionHelper.clear();

        const road = this.map.getRoadById( lane.roadId );

        this.laneDirectionHelper.drawSingleLane( road, lane );
    }
}
