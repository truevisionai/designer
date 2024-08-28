/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IDebugger } from 'app/core/interfaces/debug.service';
import { PointerEventData } from '../../../events/pointer-event-data';
import { SelectStrategy } from './select-strategy';
import { TvRoad } from 'app/map/models/tv-road.model';


export class SelectRoadStrategy extends SelectStrategy<TvRoad> {

	public debugger: IDebugger<TvRoad, any>;

	private road?: TvRoad;

	private highlight = true;

	constructor ( private includeJunctionRoads = false, highlight = false, roadDebugger?: IDebugger<TvRoad, any> ) {

		super();

		this.highlight = highlight;

		this.debugger = roadDebugger;

	}

	onPointerDown ( pointerEventData: PointerEventData ): TvRoad | undefined {

		return this.findRoad( pointerEventData, this.includeJunctionRoads );

	}

	onPointerMoved ( pointerEventData: PointerEventData ): TvRoad | undefined {

		if ( this.highlight && this.road ) {
			this.debugger?.onUnhighlight( this.road );
		}

		this.road = this.findRoad( pointerEventData, this.includeJunctionRoads );

		if ( this.highlight && this.road ) {
			this.debugger?.onHighlight( this.road );
		}

		return this.road;

	}

	onPointerUp ( pointerEventData: PointerEventData ): TvRoad | undefined {

		return this.findRoad( pointerEventData, this.includeJunctionRoads );

	}

	dispose (): void {

		// nothing to dispose

	}

}
