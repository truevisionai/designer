/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { EmptyObjectHandler } from "./empty-object-handler";

@Injectable( {
	providedIn: 'root'
} )
export class BasePointHandler<T extends AbstractControlPoint> extends EmptyObjectHandler<T> {

	isDraggingSupported (): boolean {

		return true;

	}

}
