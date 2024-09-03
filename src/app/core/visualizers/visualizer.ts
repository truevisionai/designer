/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export interface Visualizer<T> {

	getHighlighted (): T[];

	onHighlight ( object: T ): void;

	addToHighlighted ( object: T ): void;

	removeFromHighlighted ( object: T ): void;

	onDefault ( object: T ): void;

	onSelected ( object: T ): void;

	onUnselected ( object: T ): void;

	onAdded ( object: T ): void;

	onUpdated ( object: T ): void;

	onRemoved ( object: T ): void;

	onClearHighlight (): void;

	clear (): void;

	disable (): void;

	enable (): void;

}

