/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline } from "../core/shapes/abstract-spline";
import { Vector3 } from "three";
import { MapEvents } from "../events/map-events";
import { DynamicControlPoint } from "./dynamic-control-point";
import { ControlPointUpdatedEvent } from "../events/control-point-updated-event";

export class SplineControlPoint extends DynamicControlPoint<AbstractSpline> {

    constructor ( public spline: AbstractSpline, position?: Vector3 ) {

        super( spline, position );

    }

    update (): void {

        super.update();

        // MapEvents.roadControlPointUpdated.emit( new RoadControlPointUpdatedEvent( null, this ) );

    }

}
