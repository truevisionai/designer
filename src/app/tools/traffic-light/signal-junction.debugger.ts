/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { DebugState } from "../../services/debug/debug-state";
import { BaseDebugger } from "app/core/interfaces/base-debugger";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { JunctionGateBuilder } from "./junction-gate.builder";
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { JunctionRoadService } from "app/services/junction/junction-road.service";

@Injectable( {
	providedIn: 'root'
} )
export class SignalJunctionDebugger extends BaseDebugger<TvJunction> {

	private gates = new Object3DArrayMap<any, any>();

	constructor (
		private junctionRoadService: JunctionRoadService,
		private junctionGateBuilder: JunctionGateBuilder,
	) {
		super();
	}

	setDebugState ( object: TvJunction, state: DebugState ): void {

		this.setBaseState( object, state );

	}

	onHighlight ( object: TvJunction ): void {

		//

	}

	onUnhighlight ( object: TvJunction ): void {

		//

	}

	onSelected ( object: TvJunction ): void {

		for ( const laneCoord of this.junctionRoadService.getJunctionGates( object ) ) {

			this.gates.addItem( object, this.junctionGateBuilder.build( laneCoord ) );

		}

	}

	onUnselected ( object: TvJunction ): void {

		this.gates.removeKey( object );

	}

	onDefault ( object: TvJunction ): void {

		//

	}

	onRemoved ( object: TvJunction ): void {

		//

	}

	clear (): void {
		super.clear();
		this.gates.clear();
	}

}
