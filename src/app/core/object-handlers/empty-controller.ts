/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { PointerEventData } from "app/events/pointer-event-data";
import { BaseController } from "./base-controller";

@Injectable( {
	providedIn: 'root'
} )
export class EmptyController<T> extends BaseController<T> {

	onAdded ( object: T ): void { }

	onUpdated ( object: T ): void { }

	onRemoved ( object: T ): void { }

	onDrag ( object: T, e: PointerEventData ): void { }

	onDragEnd ( object: T, e: PointerEventData ): void { }

	showInspector ( object: T ): void { }

}
