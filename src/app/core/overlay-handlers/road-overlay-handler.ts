/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvRoad } from "../../map/models/tv-road.model";
import { RoadDebugService } from "../../services/debug/road-debug.service";
import { BaseOverlayHandler } from "./base-overlay-handler";
import { COLOR } from "app/views/shared/utils/colors.service";
import { MapEvents } from "app/events/map-events";

@Injectable( {
	providedIn: 'root'
} )
export class RoadOverlayHandler extends BaseOverlayHandler<TvRoad> {

	constructor ( private roadDebug: RoadDebugService ) {

		super();

		MapEvents.roadUpdated.subscribe( e => {

			if ( this.isEnabled ) this.onUpdated( e.road );

		} );
	}

	onAdded ( object: TvRoad ): void {

		this.onSelected( object );

	}

	onUpdated ( object: TvRoad ): void {

		this.roadDebug.removeRoadBorderLine( object );

		this.onSelected( object );

	}

	onClearHighlight (): void {

		this.highlighted.forEach( road => {

			this.onRemoved( road );

		} )

	}

	onHighlight ( object: TvRoad ): void {

		this.roadDebug.showRoadBorderLine( object );

	}

	onDefault ( object: TvRoad ): void {

		this.roadDebug.removeRoadBorderLine( object );

	}

	onSelected ( object: TvRoad ): void {

		this.roadDebug.showRoadBorderLine( object, 3, COLOR.RED );

	}

	onUnselected ( object: TvRoad ): void {

		this.roadDebug.removeRoadBorderLine( object );

	}

	onRemoved ( object: TvRoad ): void {

		this.roadDebug.removeRoadBorderLine( object );

	}

	clear (): void {

		this.roadDebug.clear();

		this.highlighted.clear();

	}

}



