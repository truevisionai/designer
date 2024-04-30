import { Injectable } from '@angular/core';
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { DebugState } from "./debug-state";
import { BaseDebugger } from "../../core/interfaces/base-debugger";

@Injectable( {
	providedIn: 'root'
} )
export class ControlPointDebugger extends BaseDebugger <AbstractControlPoint> {

	setDebugState ( object: AbstractControlPoint, state: DebugState ): void {

		if ( !object ) {
			return;
		}

		this.setBaseState( object, state );

	}

	onDefault ( object: AbstractControlPoint ): void {

		object.unselect();

	}

	onHighlight ( object: AbstractControlPoint ): void {

		object.onMouseOver();

	}


	onRemoved ( object: AbstractControlPoint ): void {

	}

	onSelected ( object: AbstractControlPoint ): void {

		object.select();

	}


	onUnhighlight ( object: AbstractControlPoint ): void {

		object.onMouseOut();

	}

	onUnselected ( object: AbstractControlPoint ): void {

		object.unselect();

	}

}
