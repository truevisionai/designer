/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SelectStrategy } from "./select-strategy";
import { AbstractSpline } from "../../shapes/abstract-spline";
import { PointerEventData } from "../../../events/pointer-event-data";

export class SelectSplineStrategy extends SelectStrategy<AbstractSpline> {

	constructor ( private includeJunctionRoads = false ) {

		super();

	}

	onPointerDown ( pointerEventData: PointerEventData ): AbstractSpline {

		return this.findSpline( pointerEventData, this.includeJunctionRoads );

	}

	onPointerMoved ( pointerEventData: PointerEventData ): AbstractSpline {

		return this.findSpline( pointerEventData, this.includeJunctionRoads );

	}

	onPointerUp ( pointerEventData: PointerEventData ): AbstractSpline {

		return this.findSpline( pointerEventData, this.includeJunctionRoads );

	}

	dispose (): void {

		// nothing to dispose

	}

}
