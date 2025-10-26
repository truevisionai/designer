import { PointerEventData } from 'app/events/pointer-event-data';
import { ViewportEvents } from 'app/events/viewport-events';
import { ViewControllerService } from '../view-controller.service';
import { ViewportDragManager } from '../viewport-drag-manager';
import { Intersection } from 'three';
import { IView, isView } from 'app/tools/lane/visualizers/i-view';

export interface PointerModeHandlerContext {
	readonly eventSystem: ViewportEvents;
	readonly dragManager: ViewportDragManager;
	readonly viewControllerService: ViewControllerService;
	readonly isPointerDown: boolean;
	fireSelectionEvents (): void;
	preparePointerData ( event: MouseEvent, intersection: Intersection | null ): PointerEventData;
	getLastObject (): IView | undefined;
	setLastObject ( object: IView | undefined ): void;
}

export interface PointerEventPayload {
	event: MouseEvent;
	intersection: Intersection | null;
}

export interface PointerModeHandler {
	onMouseMove ( context: PointerModeHandlerContext, payload: PointerEventPayload ): void;
	onLeftMouseDown ( context: PointerModeHandlerContext, payload: PointerEventPayload ): void;
	onMouseUp ( context: PointerModeHandlerContext, payload: PointerEventPayload ): void;
}

export class PointerSelectionModeHandler implements PointerModeHandler {

	onMouseMove ( context: PointerModeHandlerContext, payload: PointerEventPayload ): void {

		const { event, intersection } = payload;

		if ( !intersection ) {
			clearHover( context );
			return;
		}

		if ( context.isPointerDown ) {

			const pointerData = context.preparePointerData( event, intersection );

			pointerData.pointerDown = true;

			if ( !context.dragManager.isDragging ) {
				context.dragManager.onDragStart( intersection.object, pointerData );
			}

			context.dragManager.onDrag( intersection.object, pointerData );

			context.eventSystem.pointerMoved.emit( pointerData );

			return;
		}

		if ( isView( intersection.object ) ) {
			hoverObject( context, intersection.object );
			return;
		}

		clearHover( context );

		context.eventSystem.pointerMoved.emit( context.preparePointerData( event, intersection ) );

	}

	onLeftMouseDown ( context: PointerModeHandlerContext, payload: PointerEventPayload ): void {

		const { event, intersection } = payload;

		if ( !intersection ) return;

		const pointerData = context.preparePointerData( event, intersection );

		pointerData.pointerDown = true;

		context.fireSelectionEvents();

		// disable orbit controls while dragging point handles
		if ( intersection.object?.type === 'Points' && intersection.object[ 'tag' ] != null ) {
			context.viewControllerService.disableControls();
		} else {
			context.viewControllerService.enableControls();
		}

		context.eventSystem.pointerDown.emit( pointerData );
	}

	onMouseUp ( context: PointerModeHandlerContext, payload: PointerEventPayload ): void {

		const { event, intersection } = payload;

		if ( !intersection ) return;

		const pointerData = context.preparePointerData( event, intersection );

		pointerData.pointerDown = false;

		context.eventSystem.pointerUp.emit( pointerData );

		context.dragManager.onDragEnd( pointerData );
	}
}

export class BoxSelectionModeHandler implements PointerModeHandler {

	onMouseMove ( context: PointerModeHandlerContext, payload: PointerEventPayload ): void {

		const { event, intersection } = payload;

		if ( !intersection ) {

			if ( context.isPointerDown ) {
				const pointerData = context.preparePointerData( event, null );
				pointerData.pointerDown = true;
				context.eventSystem.pointerMoved.emit( pointerData );
			} else {
				clearHover( context );
			}

			return;
		}

		if ( context.isPointerDown ) {

			const pointerData = context.preparePointerData( event, intersection );

			pointerData.pointerDown = true;

			context.eventSystem.pointerMoved.emit( pointerData );

			return;
		}

		if ( isView( intersection.object ) ) {
			hoverObject( context, intersection.object );
			return;
		}

		clearHover( context );

		context.eventSystem.pointerMoved.emit( context.preparePointerData( event, intersection ) );
	}

	onLeftMouseDown ( context: PointerModeHandlerContext, payload: PointerEventPayload ): void {

		const pointerData = context.preparePointerData( payload.event, payload.intersection );

		pointerData.pointerDown = true;

		context.eventSystem.pointerDown.emit( pointerData );

	}

	onMouseUp ( context: PointerModeHandlerContext, payload: PointerEventPayload ): void {

		const pointerData = context.preparePointerData( payload.event, payload.intersection );

		pointerData.pointerDown = false;

		context.eventSystem.pointerUp.emit( pointerData );

	}

}

function hoverObject ( context: PointerModeHandlerContext, nextObject: IView ): void {

	// No change, keep hover
	if ( context.getLastObject() === nextObject ) return;

	clearHover( context );

	context.setLastObject( nextObject );
	nextObject.onMouseOver();
}

function clearHover ( context: PointerModeHandlerContext ): void {

	const lastObject = context.getLastObject();

	lastObject?.onMouseOut();

	context.setLastObject( undefined );
}
