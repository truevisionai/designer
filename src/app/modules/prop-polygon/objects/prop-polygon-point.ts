/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PropPolygon } from "app/map/prop-polygon/prop-polygon.model";
import { SimpleControlPoint } from "app/objects/simple-control-point";

export class PropPolygonPoint extends SimpleControlPoint<PropPolygon> {

	constructor ( public polygon: PropPolygon ) {

		super( polygon );

	}

}
