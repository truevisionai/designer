/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from "app/events/pointer-event-data";

export interface ObjectHandler<T> {

	onDrag ( object: T, e: PointerEventData ): void;

	onDragEnd ( object: T, e: PointerEventData ): void;

	isSelected ( object: T ): boolean;

	getSelected (): T[];

	select ( object: T ): void;

	onSelected ( object: T ): void;

	unselect ( object: T ): void;

	onUnselected ( object: T ): void;

	onAdded ( object: T ): void;

	onUpdated ( object: T ): void;

	onRemoved ( object: T ): void;

}


