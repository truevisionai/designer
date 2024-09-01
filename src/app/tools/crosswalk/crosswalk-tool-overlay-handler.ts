/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { RoadDebugService } from "../../services/debug/road-debug.service";
import { TvRoad } from "../../map/models/tv-road.model";
import { RoadVisualizer } from "../../core/overlay-handlers/road-visualizer";
import { CrosswalkToolDebugger } from "./crosswalk-tool-debugger";
import { TvRoadObjectType } from "app/map/models/objects/tv-road-object";

@Injectable( {
	providedIn: 'root'
} )
export class CrosswalkToolRoadVisualizer extends RoadVisualizer {

	constructor ( private crosswalkDebugService: CrosswalkToolDebugger, roadDebug: RoadDebugService ) {

		super( roadDebug );

	}

	override onSelected ( road: TvRoad ): void {

		super.onSelected( road );

		this.crosswalkDebugService.removeAll( road );

		this.showCrosswalks( road );

	}

	override onUnselected ( road: TvRoad ): void {

		super.onUnselected( road );

		this.crosswalkDebugService.removeAll( road );

	}

	override onUpdated ( road: TvRoad ): void {

		super.onUpdated( road );

		this.crosswalkDebugService.removeAll( road );

		this.showCrosswalks( road );

	}

	override onRemoved ( road: TvRoad ): void {

		super.onRemoved( road );

		this.crosswalkDebugService.removeAll( road );

		this.showCrosswalks( road );

	}

	override clear (): void {

		super.clear();

		this.crosswalkDebugService.clear();

	}

	private showCrosswalks ( road: TvRoad ): void {

		road.getRoadObjects()
			.filter( roadObject => roadObject.attr_type == TvRoadObjectType.crosswalk )
			.forEach( roadObject => this.crosswalkDebugService.addGizmo( road, roadObject ) );

	}

}


