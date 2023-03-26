/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable, Output } from '@angular/core';
import { BaseEventData, PointerEventData } from './pointer-event-data';

@Injectable( {
	providedIn: 'root'
} )
export class EventSystem {

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


	constructor () {

		// this.pointerClicked.subscribe( e => Debug.log( 'pointerClicked', e ) );
		// this.pointerMoved.subscribe( e => Debug.log( 'pointerMoved', e ) );
		// this.pointerUp.subscribe( e => Debug.log( 'pointerUp', e ) );
		// this.pointerDown.subscribe( e => Debug.log( 'pointerDown', e ) );
		// this.pointerEnter.subscribe( e => Debug.log( 'pointerEnter', e ) );
		// this.pointerExit.subscribe( e => Debug.log( 'pointerExit', e ) );
		// this.select.subscribe( e => Debug.log( 'select', e ) );
		// this.deSelect.subscribe( e => Debug.log( 'deSelect', e ) );
		// this.beginDrag.subscribe( e => Debug.log( 'beginDrag', e ) );
		// this.drag.subscribe( e => Debug.log( 'drag', e ) );

	}
}
