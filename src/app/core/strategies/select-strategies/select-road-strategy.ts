/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IDebugger } from 'app/core/interfaces/debug.service';
import { PointerEventData } from '../../../events/pointer-event-data';
import { SelectStrategy } from './select-strategy';
import { TvRoad } from 'app/map/models/tv-road.model';


export class SelectRoadStrategy extends SelectStrategy<TvRoad> {

	public debugger: IDebugger<TvRoad, any>;

	private road: TvRoad;

	private highlight = true;

	constructor ( private includeJunctionRoads = false, higlight = false ) {

		super();

		this.highlight = higlight;

	}

	onPointerDown ( pointerEventData: PointerEventData ): TvRoad {

		const coord = this.onRoadGeometry( pointerEventData );

		if ( !coord ) return;

		if ( coord.road.isJunction && !this.includeJunctionRoads ) {
			return;
		}

		return coord.road;
	}

	onPointerMoved ( pointerEventData: PointerEventData ): TvRoad {

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

		return this.road;

	}

	onPointerUp ( pointerEventData: PointerEventData ): TvRoad {

		const coord = this.onRoadGeometry( pointerEventData );

		if ( !coord ) return;

		if ( coord.road.isJunction && !this.includeJunctionRoads ) {
			return;
		}

		return coord.road;

	}

	dispose (): void {

		// nothing to dispose

	}

}
