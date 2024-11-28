/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { EmptyController } from "app/core/controllers/empty-controller";
import { EmptyVisualizer } from "app/core/visualizers/empty-visualizer";
import { NodeVisualizer } from "app/core/visualizers/node-visualizer";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { JunctionNode } from "app/services/junction/junction-node";
import { JunctionService } from "app/services/junction/junction.service";
import { JunctionInspector } from "./junction.inspector";
import { JunctionDebugService } from "app/services/junction/junction.debug";

@Injectable()
export class JunctionToolJunctionVisualizer extends EmptyVisualizer<TvJunction> {

	constructor ( private junctionDebugService: JunctionDebugService ) {
		super();
	}

	onAdded ( object: TvJunction ): void {
		this.junctionDebugService.onDefault( object );
	}

	onRemoved ( object: TvJunction ): void {
		this.junctionDebugService.onRemoved( object );
	}

}

@Injectable()
export class JunctionToolJunctionController extends EmptyController<TvJunction> {

	constructor ( private junctionService: JunctionService ) {
		super();
	}

	showInspector ( object: TvJunction ): void {
		this.setInspector( new JunctionInspector( object ) );
	}

	onAdded ( object: TvJunction ): void {
		this.junctionService.fireCreatedEvent( object );
	}

	onRemoved ( object: TvJunction ): void {
		this.junctionService.fireRemovedEvent( object );
	}

	onUpdated ( object: TvJunction ): void {
		this.junctionService.updateJunctionMeshAndBoundary( object );
	}

}

@Injectable()
export class JunctionNodeVisualizer extends NodeVisualizer<JunctionNode> {
}

@Injectable()
export class JunctionNodeController extends EmptyController<JunctionNode> {
}
