import { Vector3 } from "three";
import { AbstractControlPoint } from "../modules/three-js/objects/abstract-control-point";
import { SplineControlPoint } from "../modules/three-js/objects/spline-control-point";

export class ControlPointFactory {

	static createControl ( target: any, position: Vector3, type = 'spline' ): AbstractControlPoint {

		if ( type = 'spline' ) {

			return this.createSplineControlPoint( target, position );

		}

		return this.createSplineControlPoint( target, position );

	}

	static createSplineControlPoint ( target: any, position: Vector3 ) {

		return new SplineControlPoint( target, position );

	}

}
