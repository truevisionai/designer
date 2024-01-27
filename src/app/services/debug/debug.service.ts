import { DebugState } from 'app/services/debug/debug-state';

export abstract class DebugService<T> {

	protected highlighted = new Set<T>();

	protected selected = new Set<T>();

	abstract setDebugState ( object: T, state: DebugState ): void;

	abstract onHighlight ( object: T ): void;

	abstract onUnhighlight ( object: T ): void;

	abstract onSelected ( object: T ): void;

	abstract onUnselected ( object: T ): void;

	abstract onDefault ( object: T ): void;

	abstract onRemoved ( object: T ): void;

	protected setBaseState ( object: T, state: DebugState ) {

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

	private shouldHighlight ( object: T ) {

		// we don't want to highlight selected objects
		if ( this.selected.has( object ) ) return false;

		// we don't want to highlight already highlighted objects
		if ( this.highlighted.has( object ) ) return false;

		return true;
	}

	private setHighlightState ( object: T ) {

		if ( !this.shouldHighlight( object ) ) return;

		this.highlighted.add( object );

		this.onHighlight( object );

	}

	private setDefaultState ( object: T ) {

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

	private setSelectedState ( object: T ) {

		if ( this.selected.has( object ) ) return;

		if ( this.highlighted.has( object ) ) {

			this.onUnhighlight( object );

			this.highlighted.delete( object );

		}

		this.selected.add( object );

		this.onSelected( object );
	}

	private setRemovedState ( object: T ) {

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

	resetHighlighted () {

		this.highlighted.forEach( object => this.setDebugState( object, DebugState.DEFAULT ) );

		this.highlighted.clear();

	}

	resetSelected () {

		this.selected.forEach( object => this.setDebugState( object, DebugState.DEFAULT ) );

		this.selected.clear();

	}

	updateDebugState ( object: T, state: DebugState ) {

		if ( object ) this.onRemoved( object );

		if ( object ) this.setDebugState( object, state );

	}

}
