/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { DebugState } from "../../services/debug/debug-state";
import { Vector3 } from "app/core/maths"
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { IDebugger } from "./debug.service";

export abstract class BaseDebugger<T> implements IDebugger<T, any> {

	abstract setDebugState ( object: T, state: DebugState ): void

	abstract onHighlight ( object: T ): void

	abstract onUnhighlight ( object: T ): void

	abstract onSelected ( object: T ): void

	abstract onUnselected ( object: T ): void

	abstract onDefault ( object: T ): void

	abstract onRemoved ( object: T ): void

	protected highlighted = new Set<T>();

	protected selected = new Set<T>();

	protected setBaseState ( object: T, state: DebugState ): void {

		if ( !object ) return;

		switch ( state ) {

			case DebugState.DEFAULT:
				this.setDefaultState( object );
				break;

			case DebugState.HIGHLIGHTED:
				this.setHighlightState( object );
				break;

			case DebugState.SELECTED:
				this.setSelectedState( object );
				break;

			case DebugState.REMOVED:
				this.setRemovedState( object );
				break;

		}

	}

	private shouldHighlight ( object: T ): boolean {

		// we don't want to highlight selected objects
		if ( this.selected.has( object ) ) return false;

		// we don't want to highlight already highlighted objects
		if ( this.highlighted.has( object ) ) return false;

		return true;
	}

	private setHighlightState ( object: T ): void {

		if ( !this.shouldHighlight( object ) ) return;

		this.highlighted.add( object );

		this.onHighlight( object );

	}

	private setDefaultState ( object: T ): void {

		if ( this.highlighted.has( object ) ) {

			this.onUnhighlight( object );

			this.highlighted.delete( object );

		}

		if ( this.selected.has( object ) ) {

			this.onUnselected( object );

			this.selected.delete( object );

		}

		this.onDefault( object );
	}

	private setSelectedState ( object: T ): void {

		if ( this.selected.has( object ) ) {

			this.onSelected( object );

			return
		}

		if ( this.highlighted.has( object ) ) {

			this.onUnhighlight( object );

			this.highlighted.delete( object );

		}

		this.selected.add( object );

		this.onSelected( object );
	}

	private setRemovedState ( object: T ): void {

		if ( this.selected.has( object ) ) {

			this.onUnselected( object );

			this.selected.delete( object );

		}

		if ( this.highlighted.has( object ) ) {

			this.onUnhighlight( object );

			this.highlighted.delete( object );

		}

		this.onRemoved( object );

	}

	resetHighlighted (): void {

		this.highlighted.forEach( object => this.setDebugState( object, DebugState.DEFAULT ) );

		this.highlighted.clear();

	}

	resetSelected (): void {

		this.selected.forEach( object => this.setDebugState( object, DebugState.DEFAULT ) );

		this.selected.clear();

	}

	updateDebugState ( object: T, state: DebugState ): void {

		if ( object ) this.onRemoved( object );

		if ( object ) this.setDebugState( object, state );

	}

	clear (): void {

		this.highlighted.clear();

		this.selected.clear();

	}

	enable (): void {

		//

	}

	addControl ( object: T, item: any, state: DebugState ): void {

		//

	}

	updatePosition ( object: T, control: any ): void {

		//

	}

	protected createControlPoint ( object: T, position: Vector3 ): SimpleControlPoint<T> {

		return new SimpleControlPoint( object, position );

	}

	removeControl ( lane: T, object: any ): void {

		//

	}
}
