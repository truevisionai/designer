/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from "app/events/pointer-event-data";

export interface Controller<T> {

	// isDraggingSupported (): boolean;

	// onDragStart ( object: T, e: PointerEventData ): void;

	// setDragStartPosition ( position: Vector3 ): void;

	// getDragStartPosition (): Vector3 | undefined;

	onDrag ( object: T, e: PointerEventData ): void;

	// setCurrentDragPosition ( position: Vector3 ): void;

	// getCurrentDragPosition (): Vector3 | undefined;

	// setDragEndPosition ( position: Vector3 ): void;

	// getDragEndPosition (): Vector3 | undefined;

	onDragEnd ( object: T, e: PointerEventData ): void;

	isSelected ( object: T ): boolean;

	getSelected (): T[];

	select ( object: T ): void;

	showInspector ( object: T ): void;

	onSelected ( object: T ): void;

	unselect ( object: T ): void;

	onUnselected ( object: T ): void;

	onAdded ( object: T ): void;

	onUpdated ( object: T ): void;

	onRemoved ( object: T ): void;

}


