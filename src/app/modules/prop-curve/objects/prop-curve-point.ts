/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PropCurve } from "app/map/prop-curve/prop-curve.model";
import { SimpleControlPoint } from "app/objects/simple-control-point";

export class PropCurvePoint extends SimpleControlPoint<PropCurve> {

	constructor ( public curve: PropCurve ) {

		super( curve );

	}

}
