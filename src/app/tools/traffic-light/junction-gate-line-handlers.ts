import { Injectable } from "@angular/core";
import { EmptyObjectHandler } from "app/core/object-handlers/empty-object-handler";
import { NodeOverlayHandler } from "app/core/overlay-handlers/node-overlay-handler";
import { JunctionGateLine } from "app/services/junction/junction-gate-line";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionGateLineHandler extends EmptyObjectHandler<JunctionGateLine> { }


@Injectable( {
	providedIn: 'root'
} )
export class JunctionGateLineOverlayHandler extends NodeOverlayHandler<JunctionGateLine> {

}
