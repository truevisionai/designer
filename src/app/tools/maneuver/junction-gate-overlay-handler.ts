/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseOverlayHandler } from "app/core/overlay-handlers/base-overlay-handler";
import { JunctionGatePoint } from "app/objects/junction-gate-point";



@Injectable( {
	providedIn: 'root'
} )
export class JunctionGateOverlayHandler extends BaseOverlayHandler<JunctionGatePoint> {

	constructor () {
		super();
	}

	onHighlight ( object: JunctionGatePoint ): void {

		object.highlight();

	}

	onSelected ( object: JunctionGatePoint ): void {

		object.select();

	}

	onDefault ( object: JunctionGatePoint ): void {

		object.unselect();

	}

	onUnselected ( object: JunctionGatePoint ): void {

		object.unselect();

	}

	onAdded ( object: JunctionGatePoint ): void {
		//
	}

	onUpdated ( object: JunctionGatePoint ): void {
		//
	}

	onRemoved ( object: JunctionGatePoint ): void {
		//
	}

	onClearHighlight (): void {
		//
	}

	clear (): void {
		//
	}


}
