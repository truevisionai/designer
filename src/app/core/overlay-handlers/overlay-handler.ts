/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export interface OverlayHandler<T> {

	getHighlighted (): T[];

	onHighlight ( object: T ): void;

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


export abstract class BaseOverlayHandler<T> implements OverlayHandler<T> {

	protected isEnabled = true;

	protected highlighted: Set<T>;

	getHighlighted (): T[] {
		return Array.from( this.highlighted );
	}

	enable (): void {
		this.isEnabled = true;
	}

	disable (): void {
		this.isEnabled = false;
	}

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

}
