/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { DynamicControlPoint } from "../../../objects/dynamic-control-point";
import { ParkingCurve } from "../../../map/parking/parking-curve";
import { Vector3 } from "three";

export class ParkingCurvePoint extends DynamicControlPoint<ParkingCurve> {

	public static readonly TAG = 'ParkingCurvePoint';

	constructor ( mainObject: ParkingCurve, position?: Vector3 ) {
		super( mainObject, position );
		this.userData.tag = this.tag = ParkingCurvePoint.TAG;
	}

	setPosition ( position: Vector3 ): void {
		super.setPosition( position );
		this.mainObject.update();
	}

	update (): void {
		super.update();
	}

}
