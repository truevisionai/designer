import { ToolType } from "./tool-types.enum";
import { PointerEventData } from "../events/pointer-event-data";
import { AssetNode } from "../views/editor/project-browser/file-node.model";
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

	onObjectSelected ( object ): void;

	onObjectUnselected ( object ): void;

	onObjectAdded ( object ): void;

	onObjectUpdated ( object ): void;

	onObjectRemoved ( object ): void;

	onAssetDropped ( asset: AssetNode, position: Vector3 ): void;

	onKeyDown ( e: KeyboardEvent ): void;

	onDuplicateKeyDown (): void;

	onDeleteKeyDown (): void;

}