import { Injectable } from "@angular/core";
import { BaseOverlayHandler } from "app/core/overlay-handlers/base-overlay-handler";
import { TvRoadObject } from "app/map/models/objects/tv-road-object";
import { CrosswalkToolDebugger } from "./crosswalk-tool-debugger";

@Injectable( {
	providedIn: 'root'
} )
export class CrosswalkOverlayHandler extends BaseOverlayHandler<TvRoadObject> {

	constructor (
		private crosswalkDebugService: CrosswalkToolDebugger
	) {
		super();
	}

	onHighlight ( object: TvRoadObject ): void {
		//
	}

	onSelected ( object: TvRoadObject ): void {
		//
	}

	onDefault ( object: TvRoadObject ): void {
		//
	}

	onUnselected ( object: TvRoadObject ): void {
		//
	}

	onAdded ( object: TvRoadObject ): void {

		this.crosswalkDebugService.addGizmo( object.road, object );

		const firstPoint = this.crosswalkDebugService.getNodes( object )[ 0 ];

		if ( firstPoint ) {
			firstPoint.select();
		}

	}

	onUpdated ( object: TvRoadObject ): void {
		this.crosswalkDebugService.removeGizmo( object );
		this.crosswalkDebugService.addGizmo( object.road, object );
	}

	onRemoved ( object: TvRoadObject ): void {
		this.crosswalkDebugService.removeGizmo( object );
	}

	onClearHighlight (): void {
		// this.crosswalkDebugService.clear();
	}

	clear (): void {
		this.crosswalkDebugService.clear();
	}

}
