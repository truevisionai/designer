import { Injectable } from "@angular/core";
import { PointerEventData } from "app/events/pointer-event-data";
import { BaseObjectHandler } from "./base-object-handler";

@Injectable( {
	providedIn: 'root'
} )
export class EmptyObjectHandler<T> extends BaseObjectHandler<T> {

	onAdded ( object: any ): void { }

	onUpdated ( object: any ): void { }

	onRemoved ( object: any ): void { }

	onDrag ( object: any, e: PointerEventData ): void { }

	onDragEnd ( object: any, e: PointerEventData ): void { }

}
