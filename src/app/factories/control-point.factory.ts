import { Vector3 } from "three";
import { AbstractControlPoint } from "../modules/three-js/objects/abstract-control-point";
import { SplineControlPoint } from "../modules/three-js/objects/spline-control-point";
import { Injectable } from "@angular/core";
import { DynamicControlPoint, SimpleControlPoint } from "app/modules/three-js/objects/dynamic-control-point";
import { IHasUpdate } from "app/commands/set-value-command";

@Injectable( {
	providedIn: 'root'
} )
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

	createDynamic<T extends IHasUpdate> ( target: T, position: Vector3 ): DynamicControlPoint<T> {

		return new DynamicControlPoint( target, position );

	}

	createSimpleControlPoint<T> ( target: T, position: Vector3 ): SimpleControlPoint<T> {

		return new SimpleControlPoint( target, position );

	}

	createSplineControlPoint ( target: any, position: Vector3 ) {

		return new SplineControlPoint( target, position );

	}

}
