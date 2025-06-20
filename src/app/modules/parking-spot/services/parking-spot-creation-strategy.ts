/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { FreeValidationCreationStrategy } from "../../../core/interfaces/base-creation-strategy";
import { PointerEventData } from "../../../events/pointer-event-data";
import { ValidationFailed, ValidationPassed, ValidationResult } from "app/core/interfaces/creation-strategy";
import { MapService } from "../../../services/map/map.service";
import { ParkingCurve } from "../../../map/parking/parking-curve";
import { ParkingCurvePoint } from "../objects/parking-curve-point";

@Injectable()
export class ParkingCurveCreator extends FreeValidationCreationStrategy<ParkingCurve> {

	constructor ( private mapService: MapService ) {
		super();
	}

	validate ( event: PointerEventData, lastSelected?: any ): ValidationResult {

		if ( this.mapService.getRoadCount() == 0 ) {
			return new ValidationFailed( 'Need atleast one road' );
		}

		return new ValidationPassed();

	}

	canCreate ( event: PointerEventData, lastSelected?: ParkingCurve | ParkingCurvePoint | null ): boolean {

		return lastSelected === null;

	}

	createObject ( event: PointerEventData, lastSelected?: ParkingCurve | ParkingCurvePoint | null ): ParkingCurve {

		const curve = new ParkingCurve();

		const point = new ParkingCurvePoint( curve );

		point.position.copy( event.point );

		curve.addPoint( point );

		return curve;

	}

}


@Injectable()
export class ParkingCurvePointCreator extends FreeValidationCreationStrategy<ParkingCurvePoint> {

	constructor ( private mapService: MapService ) {
		super();
	}

	canCreate ( event: PointerEventData, lastSelected?: ParkingCurve | ParkingCurvePoint | null ): boolean {

		return this.getCurve( lastSelected ) !== undefined;

	}

	getCurve ( lastSelected: ParkingCurve | ParkingCurvePoint ): ParkingCurve {

		if ( lastSelected instanceof ParkingCurve ) {

			return lastSelected;

		} else if ( lastSelected instanceof ParkingCurvePoint ) {

			return lastSelected.mainObject;

		}

	}

	createObject ( event: PointerEventData, lastSelected?: ParkingCurve | ParkingCurvePoint | null ): ParkingCurvePoint {

		const curve = this.getCurve( lastSelected );

		const point = new ParkingCurvePoint( curve );

		point.position.copy( event.point );

		return point;

	}

}
