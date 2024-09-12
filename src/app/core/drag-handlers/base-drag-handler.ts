/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from "app/events/pointer-event-data";
import { Vector3 } from "three";
import { StatusBarService } from "app/services/status-bar.service";
import { DragHandler } from "./drag-handler";

export abstract class BaseDragHandler<T> implements DragHandler<T> {

	protected dragStartPosition: Vector3;

	protected currentDragPosition: Vector3;

	protected dragEndPosition: Vector3;

	protected dragDelta: Vector3;

	abstract onDragStart ( object: T, event: PointerEventData ): void

	abstract onDrag ( object: T, event: PointerEventData ): void

	abstract onDragEnd ( object: T, event: PointerEventData ): void;

	isDraggingSupported ( object: T ): boolean {
		return true;
	}

	setDragStartPosition ( position: Vector3 ): void {
		this.dragStartPosition = position;
	}

	getDragStartPosition (): Vector3 | undefined {
		return this.dragStartPosition;
	}

	isDragStarted (): boolean {
		return !!this.dragStartPosition;
	}

	setCurrentDragPosition ( position: Vector3 ): void {
		this.currentDragPosition = position;
	}

	getCurrentDragPosition (): Vector3 | undefined {
		return this.currentDragPosition;
	}

	setDragEndPosition ( position: Vector3 ): void {
		this.dragEndPosition = position;
	}

	getDragEndPosition (): Vector3 | undefined {
		return this.dragEndPosition;
	}

	updateDragDelta ( position: Vector3 ): void {
		if ( position && this.currentDragPosition ) {
			this.dragDelta = position.clone().sub( this.currentDragPosition );
		} else {
			this.dragDelta = new Vector3();
		}
	}

	getDragTip ( object: T ): string | null {
		return;
	}

	setHint ( msg: string ): void {
		StatusBarService.setHint( msg );
	}

	reset (): void {
		this.setDragStartPosition( undefined );
		this.setCurrentDragPosition( undefined );
		this.setDragEndPosition( undefined );
	}
}
