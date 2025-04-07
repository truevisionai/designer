import { Injectable } from "@angular/core";
import { PointVisualizer } from "../../tools/maneuver/point-visualizer";

import { ParkingCurvePoint } from "./objects/parking-curve-point";

@Injectable()
export class ParkingCurvePointVisualizer extends PointVisualizer<ParkingCurvePoint> {

	protected updateSpline ( point: ParkingCurvePoint ): void {

		this.updateVisuals( point.mainObject );

	}

}
