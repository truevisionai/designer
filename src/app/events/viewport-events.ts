/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable, Output } from '@angular/core';
import { BaseEventData, PointerEventData } from './pointer-event-data';

@Injectable( {
	providedIn: 'root'
} )
export class ViewportEvents {

	@Output() pointerClicked = new EventEmitter<PointerEventData>();
	@Output() pointerMoved = new EventEmitter<PointerEventData>();
	@Output() pointerUp = new EventEmitter<PointerEventData>();
	@Output() pointerDown = new EventEmitter<PointerEventData>();
	@Output() pointerEnter = new EventEmitter<PointerEventData>();
	@Output() pointerExit = new EventEmitter<PointerEventData>();
	@Output() pointerOut = new EventEmitter<PointerEventData>();
	@Output() pointerLeave = new EventEmitter<PointerEventData>();
	@Output() beginDrag = new EventEmitter<PointerEventData>();
	@Output() endDrag = new EventEmitter<PointerEventData>();
	@Output() drag = new EventEmitter<PointerEventData>();
	@Output() drop = new EventEmitter<PointerEventData>();
	@Output() select = new EventEmitter<BaseEventData>();
	@Output() deSelect = new EventEmitter<BaseEventData>();

	static instance: any;

	constructor () {

		ViewportEvents.instance = this;

	}
}
