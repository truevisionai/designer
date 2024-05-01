/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { DebugState } from 'app/services/debug/debug-state';

export interface IDebugger<T, K> {

	setDebugState ( object: T, state: DebugState ): void;

	updateDebugState ( object: T, state: DebugState ): void;

	enable (): void;

	clear (): void;

	resetHighlighted (): void;

	onHighlight ( object: T ): void;

	onUnhighlight ( object: T ): void;

	onSelected ( object: T ): void;

	onUnselected ( object: T ): void;

	onDefault ( object: T ): void;

	onRemoved ( object: T ): void;

	addControl ( object: T, control: K, state: DebugState ): void;

	updatePosition ( object: T, control: K ): void;

	removeControl ( object: T, control: K ): void;

}

