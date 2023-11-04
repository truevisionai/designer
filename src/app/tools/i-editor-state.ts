/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseEventData, PointerEventData, PointerMoveData } from '../events/pointer-event-data';

export interface IEditorState {

	enable (): void;

	disable (): void;

	onPointerClicked ( e: PointerEventData ): void;

	onPointerUp ( e: PointerEventData ): void;

	onPointerDown ( e: PointerEventData ): void;

	onPointerEnter ( e: PointerEventData ): void;

	onPointerExit ( e: PointerEventData ): void;

	onPointerOut ( e: PointerEventData ): void;

	onPointerLeave ( e: PointerEventData ): void;

	onBeginDrag ( e: PointerEventData ): void;

	onEndDrag ( e: PointerEventData ): void;

	onDrag ( e: PointerEventData ): void;

	onDrop ( e: PointerEventData ): void;

	onPointerMoved ( e: PointerMoveData ): void;

	onSelect ( e: BaseEventData ): void;

	onDeSelect ( e: BaseEventData ): void;

}
