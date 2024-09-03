/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline } from "../../core/shapes/abstract-spline";
import { Vector3 } from "three";
import { DynamicControlPoint } from "../dynamic-control-point";

export class SplineControlPoint extends DynamicControlPoint<AbstractSpline> {

	hdg: number;

    constructor ( public spline: AbstractSpline, position?: Vector3 ) {

        super( spline, position );

    }

    update (): void {

        super.update();

    }

}
