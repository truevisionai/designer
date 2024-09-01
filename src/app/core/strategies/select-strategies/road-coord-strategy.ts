/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from '../../../events/pointer-event-data';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { SelectionStrategy } from './select-strategy';
import { IDebugger } from 'app/core/interfaces/debug.service';
import { TvRoad } from 'app/map/models/tv-road.model';

export class RoadCoordStrategy extends SelectionStrategy<TvRoadCoord> {

	public debugger: IDebugger<TvRoad, any>;

	private road: TvRoad;
	private highlight = true;

	constructor ( private includeJunctionRoads = false, highlight = false, roadDebugger?: IDebugger<TvRoad, any> ) {

		super();

		this.highlight = highlight;
		this.debugger = roadDebugger;
	}

	onPointerDown ( pointerEventData: PointerEventData ): TvRoadCoord {

		const coord = this.onRoadGeometry( pointerEventData );

		if ( !coord ) return;

		if ( coord.road.isJunction && !this.includeJunctionRoads ) {
			return;
		}

		return coord
	}

	onPointerMoved ( pointerEventData: PointerEventData ): TvRoadCoord {

		if ( this.highlight && this.road ) {
			this.debugger?.onUnhighlight( this.road );
		}

		const coord = this.onRoadGeometry( pointerEventData );

		if ( !coord ) return;

		this.road = coord.road;

		if ( this.road.isJunction && !this.includeJunctionRoads ) {
			return;
		}

		if ( this.highlight && this.road ) {
			this.debugger?.onHighlight( this.road );
		}

		return coord

	}

	onPointerUp ( pointerEventData: PointerEventData ): TvRoadCoord {

		const coord = this.onRoadGeometry( pointerEventData );

		if ( !coord ) return;

		if ( coord.road.isJunction && !this.includeJunctionRoads ) {
			return;
		}

		return coord

	}

	dispose (): void {

		// Debug.log( 'dispose' );

	}

}
