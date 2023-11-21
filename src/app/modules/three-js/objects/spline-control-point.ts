import { AbstractSpline } from "../../../core/shapes/abstract-spline";
import { Vector3 } from "three";
import { MapEvents, RoadControlPointUpdatedEvent } from "../../../events/map-events";
import { DynamicControlPoint } from "./dynamic-control-point";

export class SplineControlPoint extends DynamicControlPoint<AbstractSpline> {

    constructor ( spline: AbstractSpline, position?: Vector3 ) {

        super( spline, position );

    }

    update (): void {

        super.update();

        // MapEvents.roadControlPointUpdated.emit( new RoadControlPointUpdatedEvent( null, this ) );

    }

}
