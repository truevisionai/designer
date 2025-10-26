/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { SelectionStrategy } from './select-strategy';

/**
 * Allows composing multiple selection strategies so tools can evaluate them
 * in a specific order without duplicating orchestration logic.
 */
export class CompositeSelectionStrategy<T = any> implements SelectionStrategy<T> {

	constructor ( private readonly strategies: SelectionStrategy<any>[] ) {
	}

	onPointerDown ( pointerEventData: PointerEventData ): T | undefined {
		return this.handleSelection( pointerEventData );
	}

	onPointerMoved ( pointerEventData: PointerEventData ): T | undefined {
		return this.handleSelection( pointerEventData );
	}

	onPointerUp ( pointerEventData: PointerEventData ): T | undefined {
		return this.handleSelection( pointerEventData );
	}

	handleSelection ( event: PointerEventData ): T | undefined {

		for ( const strategy of this.strategies ) {

			const result = strategy.handleSelection( event );

			if ( result ) return result as T;

		}

		return undefined;
	}

}

