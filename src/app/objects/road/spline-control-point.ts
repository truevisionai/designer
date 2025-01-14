/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline } from "../../core/shapes/abstract-spline";
import { Vector3 } from "app/core/maths"
import { DynamicControlPoint } from "../dynamic-control-point";

export class SplineControlPoint extends DynamicControlPoint<AbstractSpline> {

    constructor ( public spline: AbstractSpline, position: Vector3, index: number ) {

        super( spline, position );

		this.index = index;

    }

    update (): void {

        super.update();

    }

	getSpline (): object {

		return this.spline;

	}


}
