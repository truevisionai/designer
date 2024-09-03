/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { DebugLine } from "../../objects/debug-line";
import { BaseController } from "./base-controller";

@Injectable( {
	providedIn: 'root'
} )
export abstract class LineController<T extends DebugLine<any>> extends BaseController<T> {

	isDraggingSupported (): boolean {

		return true;

	}

}