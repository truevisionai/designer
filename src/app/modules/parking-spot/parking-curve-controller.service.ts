import { Injectable } from "@angular/core";
import { BaseController } from "../../core/controllers/base-controller";
import { ParkingCurve } from "../../map/parking/parking-curve";
import { ParkingCurveService } from "./parking-curve.service";

import { ParkingCurveInspector } from "./parking-curve.inspector";

@Injectable()
export class ParkingCurveController extends BaseController<ParkingCurve> {

	constructor ( private service: ParkingCurveService ) {
		super();
	}

	onAdded ( parkingCurve: ParkingCurve ): void {

		this.service.add( parkingCurve );

	}

	onUpdated ( parkingCurve: ParkingCurve ): void {

		this.service.update( parkingCurve );

	}

	onRemoved ( parkingCurve: ParkingCurve ): void {

		this.service.remove( parkingCurve );

	}

	showInspector ( parkingCurve: ParkingCurve ): void {

		this.setInspector( new ParkingCurveInspector( parkingCurve ) );

	}

}
