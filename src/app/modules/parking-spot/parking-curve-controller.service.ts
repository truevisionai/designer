/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseController } from "../../core/controllers/base-controller";
import { ParkingCurve } from "../../map/parking/parking-curve";
import { ParkingCurveInspector } from "./parking-curve.inspector";
import { MapService } from "app/services/map/map.service";

@Injectable()
export class ParkingCurveController extends BaseController<ParkingCurve> {

	constructor ( private mapService: MapService ) {
		super();
	}

	onAdded ( parkingCurve: ParkingCurve ): void {

		this.mapService.map.getParkingGraph().addParkingCurve( parkingCurve );

	}

	onUpdated ( parkingCurve: ParkingCurve ): void {

		parkingCurve.update();

	}

	onRemoved ( parkingCurve: ParkingCurve ): void {

		this.mapService.map.getParkingGraph().removeParkingCurve( parkingCurve );

	}

	showInspector ( parkingCurve: ParkingCurve ): void {

		this.setInspector( new ParkingCurveInspector( parkingCurve ) );

	}

}
