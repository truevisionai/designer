/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { NewSelectionStrategy } from "./select-strategy";
import { AbstractSpline, SplineType } from "../../shapes/abstract-spline";
import { PointerEventData } from "../../../events/pointer-event-data";
import { AutoSpline } from "app/core/shapes/auto-spline-v2";
import { ExplicitSpline } from "app/core/shapes/explicit-spline";

abstract class SplineSelectionStrategy<T extends AbstractSpline> extends NewSelectionStrategy<T> {

	constructor ( protected includeJunctionRoads = false ) {
		super();
	}

}

export class AutoSplineSelectionStrategy extends SplineSelectionStrategy<AutoSpline> {

	handleSelection ( e: PointerEventData ): AutoSpline | undefined {

		const spline = this.findSpline( e, this.includeJunctionRoads );

		if ( spline && spline.type === SplineType.AUTO ) {
			return spline as AutoSpline;
		}

		if ( spline && spline.type === SplineType.AUTOV2 ) {
			return spline as AutoSpline;
		}

	}
}


export class ExplicitSplineSelectionStrategy extends SplineSelectionStrategy<ExplicitSpline> {

	handleSelection ( e: PointerEventData ): ExplicitSpline | undefined {

		const spline = this.findSpline( e, this.includeJunctionRoads );

		if ( spline && spline.type === SplineType.EXPLICIT ) {
			return spline as ExplicitSpline;
		}

	}
}
