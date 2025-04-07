import { Injectable } from "@angular/core";
import { MapService } from "../../services/map/map.service";
import { ParkingCurve } from "../../map/parking/parking-curve";

@Injectable()
export class ParkingCurveService {

	constructor ( private mapService: MapService ) {
	}

	getParkingCurves (): readonly ParkingCurve[] {

		return this.mapService.map.getParkingGraph().getParkingCurves();

	}

	add ( parkingCurve: ParkingCurve ): void {

		this.mapService.map.getParkingGraph().addParkingCurve( parkingCurve );

	}

	remove ( parkingCurve: ParkingCurve ): void {

		this.mapService.map.getParkingGraph().removeParkingCurve( parkingCurve );

	}

	update ( parkingCurve: ParkingCurve ): void {

		parkingCurve.update();

	}

}
