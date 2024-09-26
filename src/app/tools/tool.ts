/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from "./tool-types.enum";
import { PointerEventData } from "../events/pointer-event-data";
import { Asset } from "../assets/asset.model";
import { InjectionToken } from '@angular/core';
import { Vector3 } from "three";

export const TOOL_PROVIDERS = new InjectionToken<Tool[]>( 'TOOL_PROVIDERS' );


export interface Tool {

	name: string;

	pointerDownAt: Vector3;

	isPointerDown: boolean;

	toolType: ToolType;

	init (): void;

	enable (): void;

	disable (): void;

	onPointerDown ( e: PointerEventData ): void;

	onPointerDownSelect ( e: PointerEventData ): void;

	onPointerDownCreate ( e: PointerEventData ): void;

	onPointerMoved ( e: PointerEventData ): void;

	onPointerUp ( e: PointerEventData ): void;

	onCreateObject ( e: PointerEventData ): void;

	onCreatePoint ( e: PointerEventData ): void;

	onObjectSelected ( object: any ): void;

	onObjectUnselected ( object: any ): void;

	onObjectAdded ( object: any ): void;

	onObjectUpdated ( object: any ): void;

	updateVisuals ( object: any ): void;

	onObjectRemoved ( object: any ): void;

	onAssetDroppedEvent ( asset: Asset, event: PointerEventData ): void;

	onAssetDragOverEvent ( asset: Asset, event: PointerEventData ): void;

	onKeyDown ( e: KeyboardEvent ): void;

	onDuplicateKeyDown (): void;

	onDeleteKeyDown (): void;

}
