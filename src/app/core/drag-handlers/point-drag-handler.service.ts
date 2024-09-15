/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { BaseDragHandler } from "./base-drag-handler";
import { SimpleControlPoint } from "app/objects/simple-control-point";
import { Commands } from "app/commands/commands";
import { PointerEventData } from "app/events/pointer-event-data";

@Injectable( {
	providedIn: 'root'
} )
export abstract class PointDragHandler<T extends AbstractControlPoint> extends BaseDragHandler<T> {


}

@Injectable( {
	providedIn: 'root'
} )
export abstract class SimpleControlPointDragHandler<T> extends BaseDragHandler<SimpleControlPoint<T>> {

	constructor () {
		super();
	}

	onDragStart ( point: SimpleControlPoint<T>, event: PointerEventData ): void {
		//
	}

	onDrag ( point: SimpleControlPoint<T>, event: PointerEventData ): void {
		point.setPosition( event.point );
	}

	onDragEnd ( point: SimpleControlPoint<T>, event: PointerEventData ): void {
		Commands.SetPosition( point, event.point, this.dragStartPosition );
	}

}
