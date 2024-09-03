/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from '../../events/pointer-event-data';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { ToolType } from '../tool-types.enum';
import { DepPointStrategy } from '../../core/strategies/select-strategies/control-point-strategy';
import { RoadCoordStrategy } from '../../core/strategies/select-strategies/road-coord-strategy';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadSelectionStrategy } from 'app/core/strategies/select-strategies/select-road-strategy';
import { OnRoadMovingStrategy } from 'app/core/strategies/move-strategies/on-road-moving.strategy';
import { TvRoadObject, TvRoadObjectType } from 'app/map/models/objects/tv-road-object';
import { CrosswalkToolHelper } from "./crosswalk-tool.helper";
import { CrosswalkInspector } from './crosswalk.inspector';
import { TvCornerRoad } from 'app/map/models/objects/tv-corner-road';
import { CornerControlPoint } from './crosswalk-tool-debugger';
import { CornerPointVisualizer } from "./corner-point-visualizer";
import { RoadController } from "../../core/object-handlers/road-handler";
import { ToolWithHandler } from "../base-tool-v2";
import { CrosswalkToolRoadVisualizer } from "./crosswalk-tool-overlay-handler";
import { CornerControlPointController } from './corner-point-controller';
import { CrosswalkVisualizer } from './crosswalk-visualizer';
import { CrosswalkController } from "./crosswalk-controller";
import { RoadObjectFactory } from 'app/services/road-object/road-object.factory';
import { Commands } from 'app/commands/commands';

export class CrosswalkTool extends ToolWithHandler {

	name: string = 'CrosswalkTool';

	toolType = ToolType.Crosswalk;

	get selectedCrosswalk (): TvRoadObject {

		if ( this.selectedPoint?.roadObject?.attr_type == TvRoadObjectType.crosswalk ) {
			return this.selectedPoint.roadObject;
		}

		return this.selectionService.getLastSelected<TvRoadObject>( TvRoadObject.name );
	}

	get selectedPoint (): CornerControlPoint {
		return this.selectionService.getLastSelected<CornerControlPoint>( CornerControlPoint.name );
	}

	get selectedRoad (): TvRoad {
		return this.selectionService.getLastSelected<TvRoad>( TvRoad.name );
	}

	private pointMoved: boolean;

	constructor ( private tool: CrosswalkToolHelper ) {

		super();

	}

	init () {

		super.init();

		this.tool.base.reset();

		this.selectionService.registerStrategy( CornerControlPoint.name, new DepPointStrategy() );
		this.selectionService.registerStrategy( TvRoadObject.name, new DepPointStrategy() );
		this.selectionService.registerStrategy( TvRoad.name, new RoadSelectionStrategy() );

		this.tool.base.addCreationStrategy( new RoadCoordStrategy() );
		this.tool.base.addMovingStrategy( new OnRoadMovingStrategy() );

		this.addHandlers();

		this.setHint( 'Use LEFT CLICK to select a road' );
	}

	private addHandlers (): void {

		this.addController( CornerControlPoint.name, this.tool.base.injector.get( CornerControlPointController ) );
		this.addController( TvRoadObject.name, this.tool.base.injector.get( CrosswalkController ) );
		this.addController( TvRoad.name, this.tool.base.injector.get( RoadController ) );

		this.addVisualizer( CornerControlPoint.name, this.tool.base.injector.get( CornerPointVisualizer ) );
		this.addVisualizer( TvRoadObject.name, this.tool.base.injector.get( CrosswalkVisualizer ) );
		this.addVisualizer( TvRoad.name, this.tool.base.injector.get( CrosswalkToolRoadVisualizer ) );

	}

	disable (): void {

		super.disable();

		this.tool.base.reset();

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( !this.selectedRoad ) return;

		const roadCoord = this.tool.roadService.findRoadCoord( e.point, false );

		if ( !roadCoord ) {
			this.setHint( 'Click on a non-junction road to create a crosswalk' );
			return;
		}

		if ( roadCoord.road.isJunction ) {
			this.setHint( 'Cannot create crosswalk on junction road' );
			return;
		}

		if ( !this.selectedCrosswalk ) {

			this.createCrosswalk( roadCoord );

		} else {

			this.createCornerRoad( this.selectedCrosswalk, roadCoord );

		}

	}

	onObjectUpdated ( object: object ): void {

		if ( object instanceof CrosswalkInspector ) {

			super.onObjectUpdated( object.roadObject );

		} else {

			super.onObjectUpdated( object );

		}

	}

	createCornerRoad ( roadObject: TvRoadObject, roadCoord: TvRoadCoord ): void {

		if ( roadCoord.roadId != roadObject.road.id ) {
			this.setHint( 'Road should be same to create crosswalk' );
			return;
		}

		const id = this.selectedCrosswalk.outlines[ 0 ].cornerRoads.length;

		const corner = new TvCornerRoad( id, roadCoord.road, roadCoord.s, roadCoord.t );

		const point = this.tool.toolDebugger.createNode( roadCoord.road, roadObject, corner );

		Commands.AddSelect( point, this.selectedPoint );

	}

	createCrosswalk ( roadCoord: TvRoadCoord ): void {

		const crosswalk = RoadObjectFactory.createRoadObject( TvRoadObjectType.crosswalk, roadCoord );

		Commands.AddSelect( crosswalk, this.selectedCrosswalk );

	}


}
