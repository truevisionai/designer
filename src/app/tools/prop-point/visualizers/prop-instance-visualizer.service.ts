/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseVisualizer } from 'app/core/visualizers/base-visualizer';
import { PropInstance } from 'app/map/prop-point/prop-instance.object';
import { PointDebugService } from 'app/services/debug/point-debug.service';
import { DebugState } from 'app/services/debug/debug-state';

@Injectable( {
	providedIn: 'root'
} )
export class PropInstanceVisualizer extends BaseVisualizer<PropInstance> {

	constructor ( private readonly debugService: PointDebugService ) {
		super();
	}

	onHighlight ( object: PropInstance ): void {
		this.setState( object, DebugState.HIGHLIGHTED );
	}

	onSelected ( object: PropInstance ): void {
		this.setState( object, DebugState.SELECTED );
	}

	onDefault ( object: PropInstance ): void {
		this.setState( object, DebugState.DEFAULT );
	}

	onUnselected ( object: PropInstance ): void {
		this.setState( object, DebugState.DEFAULT );
	}

	onAdded ( object: PropInstance ): void {
		this.setState( object, DebugState.DEFAULT );
	}

	onUpdated ( object: PropInstance ): void {
		this.setState( object, DebugState.DEFAULT );
	}

	onRemoved ( object: PropInstance ): void {
		this.setState( object, DebugState.REMOVED );
	}

	onClearHighlight (): void {
		this.highlighted.forEach( object => this.onUnselected( object ) );
		this.highlighted.clear();
	}

	clear (): void {
		this.highlighted.clear();
		this.debugService.clear();
	}

	private setState ( object: PropInstance, state: DebugState ): void {
		this.debugService.setDebugState( object, state );
	}

}
