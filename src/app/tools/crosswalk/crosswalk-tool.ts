/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommandHistory } from 'app/commands/command-history';
import { PointerEventData } from '../../events/pointer-event-data';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { ToolType } from '../tool-types.enum';
import { ControlPointStrategy } from '../../core/strategies/select-strategies/control-point-strategy';
import { RoadCoordStrategy } from '../../core/strategies/select-strategies/road-coord-strategy';
import { TvRoad } from 'app/map/models/tv-road.model';
import { SelectRoadStrategy } from 'app/core/strategies/select-strategies/select-road-strategy';
import { OnRoadMovingStrategy } from 'app/core/strategies/move-strategies/on-road-moving.strategy';
import { AddObjectCommand } from "../../commands/add-object-command";
import { SelectObjectCommand } from "../../commands/select-object-command";
import { TvRoadObject, TvRoadObjectType } from 'app/map/models/objects/tv-road-object';
import { CrosswalkToolHelper } from "./crosswalk-tool.helper";
import { CrosswalkInspector } from './crosswalk.inspector';
import { TvCornerRoad } from 'app/map/models/objects/tv-corner-road';
import { CornerControlPoint } from './crosswalk-tool-debugger';
import { CornerPointOverlayHandler } from "./corner-point-overlay-handler";
import { RoadHandler } from "../../core/object-handlers/road-handler";
import { ToolWithHandler } from "../base-tool-v2";
import { CrosswalkToolOverlayHandler } from "./crosswalk-tool-overlay-handler";
import { CornerControlPointHandler } from './corner-point-handler';
import { CrosswalkOverlayHandler } from './crosswalk-overlay-handler';
import { CrosswalkHandler } from "./crosswalk-handler";
import { RoadObjectFactory } from 'app/services/road-object/road-object.factory';

export class CrosswalkTool extends ToolWithHandler<any> {

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

		this.selectionService.registerStrategy( CornerControlPoint.name, new ControlPointStrategy() );
		this.selectionService.registerStrategy( TvRoadObject.name, new ControlPointStrategy() );
		this.selectionService.registerStrategy( TvRoad.name, new SelectRoadStrategy( false ) );

		this.tool.base.addCreationStrategy( new RoadCoordStrategy() );
		this.tool.base.addMovingStrategy( new OnRoadMovingStrategy() );

		this.addHandlers();

		this.setHint( 'Use LEFT CLICK to select a road' );
	}

	private addHandlers (): void {

		this.addObjectHandler( CornerControlPoint.name, this.tool.base.injector.get( CornerControlPointHandler ) );
		this.addObjectHandler( TvRoadObject.name, this.tool.base.injector.get( CrosswalkHandler ) );
		this.addObjectHandler( TvRoad.name, this.tool.base.injector.get( RoadHandler ) );

		this.addOverlayHandler( CornerControlPoint.name, this.tool.base.injector.get( CornerPointOverlayHandler ) );
		this.addOverlayHandler( TvRoadObject.name, this.tool.base.injector.get( CrosswalkOverlayHandler ) );
		this.addOverlayHandler( TvRoad.name, this.tool.base.injector.get( CrosswalkToolOverlayHandler ) );

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

	onPointerDownSelect ( pointerEventData: PointerEventData ): void {

		this.selectionService.handleSelection( pointerEventData );

	}

	onPointerMoved ( pointerEventData: PointerEventData ): void {

		this.highlightWithHandlers( pointerEventData );

		if ( !this.isPointerDown ) return;

		for ( const [ name, handler ] of this.getObjectHandlers() ) {

			const selected = handler.getSelected();

			if ( selected.length > 0 ) {

				this.tool.base.disableControls();

				selected.forEach( object => handler.onDrag( object, pointerEventData ) );

				this.pointMoved = true;

				break;

			}

		}

	}

	onPointerUp ( pointerEventData: PointerEventData ): void {

		this.tool.base.enableControls();

		if ( !this.pointMoved ) return;

		for ( const [ name, handler ] of this.getObjectHandlers() ) {

			const selected = handler.getSelected();

			if ( selected.length > 0 ) {

				selected.forEach( object => handler.onDragEnd( object, pointerEventData ) );

				break;

			}

		}

		this.pointMoved = false;

	}

	onObjectUpdated ( object: object ): void {

		if ( object instanceof CrosswalkInspector ) {

			super.handleAction( object.roadObject, 'onUpdated' );

		} else {

			super.onObjectUpdated( object );

		}

	}

	createCornerRoad ( roadObject: TvRoadObject, roadCoord: TvRoadCoord ): void {

		if ( roadCoord.roadId != roadObject.road.id ) return;

		const id = this.selectedCrosswalk.outlines[ 0 ].cornerRoads.length;

		const corner = new TvCornerRoad( id, roadCoord.road, roadCoord.s, roadCoord.t );

		const point = this.tool.toolDebugger.createNode( roadCoord.road, roadObject, corner );

		const addCommand = new AddObjectCommand( point );

		const selectCommand = new SelectObjectCommand( point, this.selectedPoint );

		CommandHistory.executeMany( addCommand, selectCommand );

	}

	createCrosswalk ( roadCoord: TvRoadCoord ): void {

		const crosswalk = RoadObjectFactory.createRoadObject( TvRoadObjectType.crosswalk, roadCoord );

		const addCommand = new AddObjectCommand( crosswalk );

		const selectCommand = new SelectObjectCommand( crosswalk );

		CommandHistory.executeMany( addCommand, selectCommand );

	}

	showObjectInspector ( object: object ): void {

		if ( object instanceof CornerControlPoint ) {

			this.setInspector( new CrosswalkInspector( object.roadObject, object.roadObject.markings[ 0 ] ) );

		} else if ( object instanceof TvRoadObject ) {

			this.setInspector( new CrosswalkInspector( object, object.markings[ 0 ] ) );

		}

	}

}
