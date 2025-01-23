import { KeyboardEvents } from "app/events/keyboard-events";
import { MouseButton, PointerEventData } from "app/events/pointer-event-data";
import { AppService } from "app/services/app.service";
import { Subscription } from "rxjs";
import { Vector3 } from "app/core/maths"


export abstract class DeprecatedViewportEventSubscriber {

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
	private keyboardSubscriber: Subscription;

	protected pointerDownAt: Vector3;
	protected isPointerDown: boolean;

	constructor () {

		this.subscribeToEvents();

	}

	subscribeToEvents (): void {

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

		this.keyboardSubscriber = KeyboardEvents.keyDown.subscribe( e => this.onKeyDown( e ) );

		this.subscribed = true;
	}

	unsubscribeToEvents (): void {

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
		this.keyboardSubscriber.unsubscribe();

		this.subscribed = false;
	}

	onPointerClicked ( pointerEventData: PointerEventData ): void {
	}

	onPointerMoved ( pointerEventData: PointerEventData ): void {
	}

	onPointerEnter ( pointerEventData: PointerEventData ): void {
	}

	onPointerExit ( pointerEventData: PointerEventData ): void {
	}

	onPointerDown ( pointerEventData: PointerEventData ): void {
	}

	onPointerUp ( pointerEventData: PointerEventData ): void {
	}

	onPointerOut ( pointerEventData: PointerEventData ): void {
	}

	onPointerLeave ( pointerEventData: PointerEventData ): void {
	}

	onBeginDrag ( pointerEventData: PointerEventData ): void {
	}

	onEndDrag ( pointerEventData: PointerEventData ): void {
	}

	onDrag ( pointerEventData: PointerEventData ): void {
	}

	onDrop ( pointerEventData: PointerEventData ): void {
	}

	onKeyDown ( e: KeyboardEvent ): void { }

}
