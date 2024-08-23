import { Injectable } from "@angular/core";
import { BaseOverlayHandler } from "./overlay-handler";
import { LaneDebugService } from "../../services/debug/lane-debug.service";
import { TvLane } from "app/map/models/tv-lane";

@Injectable( {
	providedIn: 'root'
} )
export class LaneOverlayHandler extends BaseOverlayHandler<TvLane> {

	constructor ( private laneDebugger: LaneDebugService ) {

		super();

	}

	onAdded ( object: TvLane ): void {

		this.laneDebugger.showLaneOutline( object );

		this.onSelected( object );

	}

	onUpdated ( object: TvLane ): void {

		// do nothing

	}

	onClearHighlight (): void {

		this.highlighted.forEach( lane => {

			this.laneDebugger.removeDirectionalArrows( lane );

			this.highlighted.delete( lane );

		} )

	}

	onHighlight ( object: TvLane ): void {

		this.laneDebugger.showDirectionalArrows( object );

	}

	onDefault ( object: TvLane ): void {

		this.laneDebugger.removeDirectionalArrows( object );

	}

	onSelected ( object: TvLane ): void {

		this.laneDebugger.showDirectionalArrows( object );

	}

	onUnselected ( object: TvLane ): void {

		this.laneDebugger.removeDirectionalArrows( object );

	}

	onRemoved ( object: TvLane ): void {

		this.laneDebugger.removeLaneOverlay( object );

		this.laneDebugger.removeLaneOutline( object );

		this.laneDebugger.removeDirectionalArrows( object );

	}

	clear (): void {

		this.laneDebugger.clear();

		this.highlighted.clear();

	}

}
