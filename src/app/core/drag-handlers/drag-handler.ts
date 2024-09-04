/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from "../../events/pointer-event-data";

export interface DragHandler<T> {

	onDragStart ( object: T, e: PointerEventData ): void;

	onDrag ( object: T, e: PointerEventData ): void;

	onDragEnd ( object: T, e: PointerEventData ): void;

}
