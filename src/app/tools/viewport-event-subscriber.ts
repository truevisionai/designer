/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseEventData, MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { Subscription } from 'rxjs';
import { Vector3 } from 'three';
import { AppService } from '../services/app.service';
import { KeyboardEvents } from 'app/events/keyboard-events';

export abstract class ViewportEventSubscriber {

	private subscribed: boolean = false;

	private pointerClickedSubscriber: Subscription;
	private pointerMovedSubscriber: Subscription;
	private pointerEnterSubscriber: Subscription;
	private pointerExitSubscriber: Subscription;
	private pointerUpSubscriber: Subscription;
	private pointerDownSubscriber: Subscription;
	private pointerLeaveSubscriber: Subscription;
	private pointerOutSubscriber: Subscription;
	private beginDragSubscriber: Subscription;
	private endDragSubscriber: Subscription;
	private dragSubscriber: Subscription;
	private dropSubscriber: Subscription;
	private selectSubscriber: Subscription;
	private deSelectSubscriber: Subscription;
	private keyboardSubscriber: Subscription;

	protected pointerDownAt: Vector3;
	protected isPointerDown: boolean;

	constructor () {

		this.subscribeToEvents();

	}

	subscribeToEvents () {

		if ( this.subscribed ) return;

		if ( !AppService.eventSystem ) return;

		this.pointerClickedSubscriber = AppService.eventSystem.pointerClicked.subscribe( e => {

			if ( e.button !== MouseButton.LEFT ) return;

			if ( e.point == null ) return;

			this.onPointerClicked( e );

		} );

		this.pointerMovedSubscriber = AppService.eventSystem.pointerMoved.subscribe( e => {

			if ( e.button !== MouseButton.LEFT ) return;

			if ( e.point == null ) return;

			this.onPointerMoved( e );

		} );

		this.pointerEnterSubscriber = AppService.eventSystem.pointerEnter.subscribe( e => this.onPointerEnter( e ) );

		this.pointerExitSubscriber = AppService.eventSystem.pointerExit.subscribe( e => this.onPointerExit( e ) );

		this.pointerUpSubscriber = AppService.eventSystem.pointerUp.subscribe( e => {

			if ( e.button !== MouseButton.LEFT ) return;

			this.onPointerUp( e );

			this.isPointerDown = false;

			this.pointerDownAt = null;

		} );

		this.pointerDownSubscriber = AppService.eventSystem.pointerDown.subscribe( e => {

			if ( e.button !== MouseButton.LEFT ) return;

			if ( e.point == null ) return;

			this.pointerDownAt = e.button === MouseButton.LEFT ? e.point?.clone() : null;

			this.isPointerDown = e.button === MouseButton.LEFT;

			this.onPointerDown( e );

		} );

		this.pointerLeaveSubscriber = AppService.eventSystem.pointerLeave.subscribe( e => this.onPointerLeave( e ) );

		this.pointerOutSubscriber = AppService.eventSystem.pointerOut.subscribe( e => this.onPointerOut( e ) );

		this.beginDragSubscriber = AppService.eventSystem.beginDrag.subscribe( e => this.onBeginDrag( e ) );

		this.endDragSubscriber = AppService.eventSystem.endDrag.subscribe( e => this.onEndDrag( e ) );

		this.dragSubscriber = AppService.eventSystem.drag.subscribe( e => this.onDrag( e ) );

		this.dropSubscriber = AppService.eventSystem.drop.subscribe( e => this.onDrop( e ) );

		this.selectSubscriber = AppService.eventSystem.select.subscribe( e => this.onSelect( e ) );

		this.deSelectSubscriber = AppService.eventSystem.deSelect.subscribe( e => this.onDeSelect( e ) );

		this.keyboardSubscriber = KeyboardEvents.keyDown.subscribe( e => this.onKeyDown( e ) );

		this.subscribed = true;
	}

	unsubscribeToEvents () {

		if ( !this.subscribed ) return;

		this.pointerClickedSubscriber.unsubscribe();
		this.pointerMovedSubscriber.unsubscribe();
		this.pointerEnterSubscriber.unsubscribe();
		this.pointerExitSubscriber.unsubscribe();
		this.pointerUpSubscriber.unsubscribe();
		this.pointerDownSubscriber.unsubscribe();
		this.pointerLeaveSubscriber.unsubscribe();
		this.pointerOutSubscriber.unsubscribe();
		this.beginDragSubscriber.unsubscribe();
		this.endDragSubscriber.unsubscribe();
		this.dragSubscriber.unsubscribe();
		this.dropSubscriber.unsubscribe();
		this.selectSubscriber.unsubscribe();
		this.deSelectSubscriber.unsubscribe();
		this.keyboardSubscriber.unsubscribe();

		this.subscribed = false;
	}

	onPointerClicked ( pointerEventData: PointerEventData ): void { /*Debug.log( 'clicked' )*/
	}

	onPointerMoved ( pointerEventData: PointerEventData ): void { /*Debug.log( 'moved' )*/
	}

	onPointerEnter ( pointerEventData: PointerEventData ): void { /*Debug.log( 'enter' )*/
	}

	onPointerExit ( pointerEventData: PointerEventData ): void { /*Debug.log( 'exit' )*/
	}

	onPointerDown ( pointerEventData: PointerEventData ): void { /*Debug.log( 'down' )*/
	}

	onPointerUp ( pointerEventData: PointerEventData ): void { /*Debug.log( 'up' )*/
	}

	onPointerOut ( pointerEventData: PointerEventData ): void { /*Debug.log( 'out' )*/
	}

	onPointerLeave ( pointerEventData: PointerEventData ): void { /*Debug.log( 'leave' )*/
	}

	onBeginDrag ( pointerEventData: PointerEventData ): void { /*Debug.log( 'begin-drag' )*/
	}

	onEndDrag ( pointerEventData: PointerEventData ): void { /*Debug.log( 'end-drag' )*/
	}

	onDrag ( pointerEventData: PointerEventData ): void { /*Debug.log( 'drag' )*/
	}

	onDrop ( pointerEventData: PointerEventData ): void { /*Debug.log( 'drop' )*/
	}

	onKeyDown ( e: KeyboardEvent ): void { }

	onDeSelect ( baseEventData: BaseEventData ): any {

		// if ( baseEventData.object != null ) Debug.log( 'deselect', baseEventData.object.id );

	}

	onSelect ( baseEventData: BaseEventData ): any {

		// Debug.log( 'selected', baseEventData.object.id );

	}


}
