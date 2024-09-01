import { Injectable } from "@angular/core";
import { EmptyController } from "app/core/object-handlers/empty-controller";
import { NodeVisualizer } from "app/core/overlay-handlers/node-visualizer";
import { JunctionNode } from "app/services/junction/junction-node";
import { JunctionOverlay } from "app/services/junction/junction-overlay";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionToolJunctionVisualizer extends NodeVisualizer<JunctionOverlay> { }

@Injectable( {
	providedIn: 'root'
} )
export class JunctionToolJunctionController extends EmptyController<JunctionOverlay> { }


@Injectable( {
	providedIn: 'root'
} )
export class JunctionNodeVisualizer extends NodeVisualizer<JunctionNode> { }

@Injectable( {
	providedIn: 'root'
} )
export class JunctionNodeController extends EmptyController<JunctionNode> { }
