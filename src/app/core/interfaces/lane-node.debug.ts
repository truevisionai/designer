/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { DebugState } from 'app/services/debug/debug-state';
import { Vector3 } from "three";
import { SimpleControlPoint } from "../../objects/dynamic-control-point";
import { DebugService } from './debug.service';


export abstract class LaneNodeDebugService<TvLane> implements DebugService<TvLane> {

	abstract setDebugState ( object: TvLane, state: DebugState ): void;

	abstract onHighlight ( object: TvLane ): void;

	abstract onUnhighlight ( object: TvLane ): void;

	abstract onSelected ( object: TvLane ): void;

	abstract onUnselected ( object: TvLane ): void;

	abstract onDefault ( object: TvLane ): void;

	abstract onRemoved ( object: TvLane ): void;

	protected highlighted = new Set<TvLane>();

	protected selected = new Set<TvLane>();

	protected setBaseState ( object: TvLane, state: DebugState ) {

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

	private shouldHighlight ( object: TvLane ) {

		// we don't want to highlight selected objects
		if ( this.selected.has( object ) ) return false;

		// we don't want to highlight already highlighted objects
		if ( this.highlighted.has( object ) ) return false;

		return true;
	}

	private setHighlightState ( object: TvLane ) {

		if ( !this.shouldHighlight( object ) ) return;

		this.highlighted.add( object );

		this.onHighlight( object );

	}

	private setDefaultState ( object: TvLane ) {

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

	private setSelectedState ( object: TvLane ) {

		if ( this.selected.has( object ) ) {

			this.onSelected( object );

			return;
		}

		if ( this.highlighted.has( object ) ) {

			this.onUnhighlight( object );

			this.highlighted.delete( object );

		}

		this.selected.add( object );

		this.onSelected( object );
	}

	private setRemovedState ( object: TvLane ) {

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

	updateDebugState ( object: TvLane, state: DebugState ) {

		if ( object ) this.onRemoved( object );

		if ( object ) this.setDebugState( object, state );

	}

	protected createControlPoint ( object: TvLane, position: Vector3 ) {

		return new SimpleControlPoint( object, position );

	}
}
