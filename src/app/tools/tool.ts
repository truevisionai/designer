/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from "./tool-types.enum";
import { PointerEventData } from "../events/pointer-event-data";
import { Asset } from "../core/asset/asset.model";
import { Vector3 } from "three";

export interface Tool {

	name: string;

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

	onAssetDropped ( asset: Asset, position: Vector3 ): void;

	onKeyDown ( e: KeyboardEvent ): void;

	onDuplicateKeyDown (): void;

	onDeleteKeyDown (): void;

}
