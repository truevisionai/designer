/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { BaseController } from "./base-controller";

@Injectable( {
	providedIn: 'root'
} )
export abstract class PointController<T extends AbstractControlPoint> extends BaseController<T> {

	isDraggingSupported (): boolean {

		return true;

	}

}
