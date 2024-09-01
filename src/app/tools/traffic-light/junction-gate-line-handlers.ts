import { Injectable } from "@angular/core";
import { EmptyController } from "app/core/object-handlers/empty-controller";
import { NodeVisualizer } from "app/core/overlay-handlers/node-visualizer";
import { JunctionGateLine } from "app/services/junction/junction-gate-line";
import { JunctionGateInspector } from "./junction-gate-inspector";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionGateLineController extends EmptyController<JunctionGateLine> {

	showInspector ( object: JunctionGateLine ): void {

		this.setInspector( new JunctionGateInspector() );

	}

}


@Injectable( {
	providedIn: 'root'
} )
export class JunctionGateLineVisualizer extends NodeVisualizer<JunctionGateLine> {

}
