/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { BaseDragHandler } from "./base-drag-handler";

@Injectable( {
	providedIn: 'root'
} )
export abstract class PointDragHandler<T extends AbstractControlPoint> extends BaseDragHandler<T> {


}