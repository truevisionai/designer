/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolManager } from "app/managers/tool-manager";
import { Visualizer } from "./visualizer";

export abstract class BaseVisualizer<T> implements Visualizer<T> {

	protected isEnabled = true;

	protected highlighted: Set<T>;

	abstract onHighlight ( object: T ): void;

	abstract onSelected ( object: T ): void;

	abstract onDefault ( object: T ): void;

	abstract onUnselected ( object: T ): void;

	abstract onAdded ( object: T ): void;

	abstract onUpdated ( object: T ): void;

	abstract onRemoved ( object: T ): void;

	abstract onClearHighlight (): void;

	abstract clear (): void;

	constructor () {

		this.highlighted = new Set<T>();

	}

	getHighlighted (): T[] {
		return Array.from( this.highlighted );
	}

	enable (): void {
		this.isEnabled = true;
	}

	disable (): void {
		this.isEnabled = false;
	}

	addToHighlighted ( object: T ): void {
		this.highlighted.add( object );
	}

	removeFromHighlighted ( object: T ): void {
		this.highlighted.delete( object );
	}

	updateVisuals ( object: object ): void {
		ToolManager.updateVisuals( object );
	}
}
