/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { PointerEventData } from "app/events/pointer-event-data";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { SplineFactory } from "app/services/spline/spline.factory";
import { FreeValidationCreationStrategy } from "app/core/interfaces/base-creation-strategy";

@Injectable( {
	providedIn: 'root'
} )
export class SplineCreationRoadToolStrategy extends FreeValidationCreationStrategy<AbstractSpline> {

	constructor () {

		super();

	}

	canCreate ( event: PointerEventData, lastSelected?: object ): boolean {

		return !lastSelected;

	}

	createObject ( e: PointerEventData ): AbstractSpline {

		return SplineFactory.createAtPosition( e.point );

	}

}
