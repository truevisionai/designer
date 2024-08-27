/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { BaseObjectHandler } from "./base-object-handler";
import { Vector3 } from "three";
import { PointerEventData } from "../../events/pointer-event-data";

@Injectable( {
	providedIn: 'root'
} )
export class BasePointHandler<T extends AbstractControlPoint> extends BaseObjectHandler<T> {

	protected oldPosition: Vector3;

	constructor () {
		super();
	}

	onAdded ( point: AbstractControlPoint ): void {
	}

	onUpdated ( point: AbstractControlPoint ): void {
	}

	onRemoved ( point: AbstractControlPoint ): void {
	}

	onDrag ( point: AbstractControlPoint, e: PointerEventData ): void {

		this.oldPosition = this.oldPosition || e.point;

	}

	onDragEnd ( point: AbstractControlPoint, e: PointerEventData ): void {

		this.oldPosition = null;

	}

}