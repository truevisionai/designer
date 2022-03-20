/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseTool } from './base-tool';
import { MouseButton, PointerEventData } from '../../events/pointer-event-data';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { TvLaneSide } from '../../modules/tv-map/models/tv-common';
import { KeyboardInput } from '../input';
import { PickingHelper } from '../services/picking-helper.service';
import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { COLOR } from 'app/shared/utils/colors.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { SceneService } from '../services/scene.service';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';
import { AppInspector } from '../inspector';
import { LaneInspectorComponent } from 'app/views/inspectors/lane-type-inspector/lane-inspector.component';

export class LaneAddTool extends BaseTool {

    public name: string = 'AddLane';

    private lane: TvLane;

    private laneHelper = new OdLaneReferenceLineBuilder( null, LineType.SOLID, COLOR.MAGENTA );

    constructor () {

        super();

    }

    enable (): void {

        super.enable();

    }

    disable (): void {

        super.disable();

        if ( this.laneHelper ) this.laneHelper.clear();
    }

    public onPointerDown ( e: PointerEventData ) {

        if ( e.button == MouseButton.RIGHT || e.button == MouseButton.MIDDLE ) return;

        const shiftKeyDown = KeyboardInput.isShiftKeyDown;

        let hasInteracted = false;

        if ( shiftKeyDown && !hasInteracted ) hasInteracted = this.checkReferenceLineInteraction( e );

        if ( !hasInteracted ) hasInteracted = this.checkLaneObjectInteraction( e );

    }

    private checkLaneObjectInteraction ( e: PointerEventData ): boolean {

        const newLane = PickingHelper.checkLaneObjectInteraction( e );

        if ( this.lane && newLane == null ) {

            // clear

            this.laneHelper.clear();

            this.lane = null;

            AppInspector.clear();

        } else if ( this.lane && newLane && this.lane.gameObject.id != newLane.gameObject.id ) {

            // clear and select new

            this.laneHelper.clear();

            this.lane = newLane;

            const newRoad = this.map.getRoadById( newLane.roadId );

            this.laneHelper.drawRoad( newRoad, LineType.SOLID );

            AppInspector.setInspector( LaneInspectorComponent, newLane );

        } else if ( !this.lane && newLane ) {

            // select new

            this.lane = newLane;

            const newRoad = this.map.getRoadById( newLane.roadId );

            this.laneHelper.drawRoad( newRoad, LineType.SOLID );

            AppInspector.setInspector( LaneInspectorComponent, newLane );

        } else if ( !this.lane && newLane == null ) {

            // clear

            AppInspector.clear();

        }

        return newLane != null;
    }

    private checkReferenceLineInteraction ( e: PointerEventData ) {

        let hasInteracted = false;

        for ( let i = 0; i < e.intersections.length; i++ ) {

            const intersection = e.intersections[ i ];

            if ( e.button === MouseButton.LEFT && intersection.object && intersection.object[ 'tag' ] == this.laneHelper.tag ) {

                hasInteracted = true;

                if ( intersection.object.userData.lane ) {

                    this.cloneLane( intersection.object.userData.lane as TvLane );

                }

                break;
            }
        }

        return hasInteracted;
    }

    private cloneLane ( lane: TvLane ): void {

        const road = this.map.getRoadById( lane.roadId );

        const laneSection = road.getLaneSectionById( lane.laneSectionId );

        const newLaneId = lane.side === TvLaneSide.LEFT ? lane.id + 1 : lane.id - 1;

        const newLane = lane.clone( newLaneId );

        laneSection.addLaneInstance( newLane, true );

        this.rebuild( road );
    }

    private rebuild ( road: TvRoad ): void {

        if ( !road ) return;

        SceneService.removeWithChildren( road.gameObject, true );

        TvMapBuilder.buildRoad( this.map.gameObject, road );

        this.laneHelper.redraw( LineType.SOLID );
    }
}
