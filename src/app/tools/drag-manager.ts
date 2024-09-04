/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseDragHandler } from "app/core/drag-handlers/base-drag-handler";
import { PointerEventData } from "app/events/pointer-event-data";
import { ToolTipService } from "app/services/debug/tool-tip.service";
import { ViewControllerService } from "app/views/editor/viewport/view-controller.service";

export class DragManager {

	private dragHandlers: Map<string, BaseDragHandler<object>>;

	private isDragging: boolean;

	private draggingObject: any;

	constructor () {
		this.dragHandlers = new Map();
	}

	addDragHandler ( objectName: string, dragHandler: BaseDragHandler<object> ): void {
		this.dragHandlers.set( objectName, dragHandler );
	}

	getDragHandlers (): Map<string, BaseDragHandler<object>> {
		return this.dragHandlers;
	}

	getDragHandler ( objectName: string ): BaseDragHandler<object> {
		return this.dragHandlers.get( objectName );
	}

	hasDragHandler ( objectName: string ): boolean {
		return this.dragHandlers.has( objectName );
	}

	private enableControls (): void {
		ViewControllerService.instance?.enableControls();
	}

	private disableControls (): void {
		ViewControllerService.instance?.disableControls();
	}

	handleDrag ( object: object, e: PointerEventData ): void {

		if ( !this.hasDragHandler( object.constructor.name ) ) {
			return;
		}

		const dragHandler = this.getDragHandler( object.constructor.name );

		if ( !dragHandler.isDraggingSupported() ) {
			return;
		}

		this.dragObject( dragHandler, object, e );

		this.isDragging = true;

	}

	private dragObject<T> ( handler: BaseDragHandler<T>, object: T, e: PointerEventData ): void {

		this.disableControls();

		if ( !handler.isDragStarted() ) {

			handler.onDragStart( object, e );

			handler.setDragStartPosition( e.point );

		}

		this.draggingObject = object;

		handler.updateDragDelta( e.point );

		handler.setCurrentDragPosition( e.point );

		handler.onDrag( object, e );

		this.showDragToolTip( handler, object, e );

	}

	private showDragToolTip<T> ( handler: BaseDragHandler<T>, object: T, e: PointerEventData ): void {

		const toolTip = handler.getDragTip( object );

		if ( !toolTip ) return;

		// add scalar 1 to move tool tip to the right and avoid collision with the object
		ToolTipService.instance?.createOrUpdate( toolTip, e.point.clone().addScalar( 1 ) );

	}

	handleDragEnd ( e: PointerEventData ): void {

		this.enableControls();

		ToolTipService.instance?.removeLastTooltip();

		if ( !this.isDragging ) return;

		const handler = this.getDragHandler( this.draggingObject.constructor.name );

		this.dragEndObject( handler, this.draggingObject, e );

		this.isDragging = false;

		this.draggingObject = null;

	}

	private dragEndObject<T> ( handler: BaseDragHandler<T>, object: T, e: PointerEventData ): void {

		if ( !handler.isDraggingSupported() ) {
			return;
		}

		handler.setDragEndPosition( e.point );

		handler.onDragEnd( object, e );

		handler.reset();

	}

}
