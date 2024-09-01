import { Injectable } from "@angular/core";
import { EmptyController } from "app/core/object-handlers/empty-controller";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { JunctionDebugService } from "app/services/junction/junction.debug";
import { TvJunctionSignalizationInspector } from "../traffic-light/tv-junction-signalization.inspector";
import { EmptyVisualizer } from "app/core/overlay-handlers/empty-visualizer";

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverToolJunctionController extends EmptyController<TvJunction> {

	showInspector ( object: TvJunction ): void {

		this.setInspector( new TvJunctionSignalizationInspector( object ) );

	}

}

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverToolJunctionVisualizer extends EmptyVisualizer<TvJunction> {

	constructor (
		private junctionDebugService: JunctionDebugService,
	) {
		super();
	}

	onSelected ( object: TvJunction ): void {

		this.junctionDebugService.removeEntries( object );
		this.junctionDebugService.removeManeuvers( object );

		this.junctionDebugService.showManeuvers( object );
		this.junctionDebugService.showEntries( object );

	}

	onUnselected ( object: TvJunction ): void {

		this.junctionDebugService.removeManeuvers( object );
		this.junctionDebugService.removeEntries( object );

	}

	clear (): void {

		this.junctionDebugService.clear();

	}

}
