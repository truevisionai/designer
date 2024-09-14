/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { CornerControlPoint } from "../objects/corner-control-point";
import { RoadPointDragHandler } from "app/core/drag-handlers/road-point-drag-handler";

@Injectable( {
	providedIn: 'root'
} )
export class CornerControlPointDragHandler extends RoadPointDragHandler<CornerControlPoint> {


}
