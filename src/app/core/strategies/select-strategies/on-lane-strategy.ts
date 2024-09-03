/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { NewSelectionStrategy, SelectionStrategy } from "./select-strategy";
import { TvLane } from "../../../map/models/tv-lane";
import { PointerEventData } from "../../../events/pointer-event-data";
import { TvLaneCoord } from "../../../map/models/tv-lane-coord";
import { IDebugger } from "app/core/interfaces/debug.service";
import { TvRoad } from "app/map/models/tv-road.model";

/**
 * @deprecated
 */
export class DepSelectLaneStrategy extends SelectionStrategy<TvLane> {

	private lane: TvLane;
	private selected: TvLane;

	public debugger: IDebugger<TvRoad, any>;

	constructor ( private hoverHighlight = true, private selectHighlight = false ) {
		super();
	}

	onPointerDown ( pointerEventData: PointerEventData ): TvLane {

		// this.selected?.unselect();

		this.selected = this.onLaneGeometry( pointerEventData );

		// this.selected?.select();

		return this.selected;

	}

	onPointerMoved ( pointerEventData: PointerEventData ): TvLane {

		if ( this.hoverHighlight && this.lane ) {
			this.debugger?.onUnhighlight( this.lane.laneSection.road );
		}

		this.lane = this.onLaneGeometry( pointerEventData );

		if ( this.hoverHighlight && this.lane ) {
			this.debugger?.onHighlight( this.lane.laneSection.road );
		}

		return this.lane;
	}

	onPointerUp ( pointerEventData: PointerEventData ): TvLane {

		return this.onLaneGeometry( pointerEventData );

	}

	dispose (): void {

		this.lane?.unhighlight();
		this.selected?.unselect();

	}

}

export class SelectLaneStrategy extends SelectionStrategy<TvLane> {

	constructor () {
		super();
	}

	onPointerDown ( pointerEventData: PointerEventData ): TvLane {

		return this.onLaneGeometry( pointerEventData );

	}

	onPointerMoved ( pointerEventData: PointerEventData ): TvLane {

		return this.onLaneGeometry( pointerEventData );
	}

	onPointerUp ( pointerEventData: PointerEventData ): TvLane {

		return this.onLaneGeometry( pointerEventData );

	}

	dispose (): void {

		// not needed

	}

}


/**
 * @deprecated
 */
export class DepLaneCoordStrategy extends SelectionStrategy<TvLaneCoord> {

	private lane: TvLane;
	private selectedLane: TvLane;

	constructor () {
		super();
	}

	onPointerDown ( pointerEventData: PointerEventData ): TvLaneCoord {

		const laneCoord = this.onLaneCoord( pointerEventData );

		if ( !laneCoord ) return;

		this.selectedLane = laneCoord.lane;

		return laneCoord;

	}

	onPointerMoved ( pointerEventData: PointerEventData ): TvLaneCoord {

		const laneCoord = this.onLaneCoord( pointerEventData );

		if ( !laneCoord ) return;

		this.lane?.unhighlight();

		this.lane = laneCoord.lane;

		this.lane?.highlight();

		return laneCoord;
	}

	onPointerUp ( pointerEventData: PointerEventData ): TvLaneCoord {

		return this.onLaneCoord( pointerEventData );

	}

	dispose (): void {

		this.lane?.unhighlight();
		this.selectedLane?.unselect();

	}

}


export class LaneCoordStrategy extends NewSelectionStrategy<TvLaneCoord> {

	constructor () {
		super();
	}

	handleSelection ( e: PointerEventData ): TvLaneCoord {

		return this.onLaneCoord( e );

	}

}
