/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from 'app/tools/tool-types.enum';
import { PointerEventData } from 'app/events/pointer-event-data';
import { ElevationControlPoint } from 'app/modules/road-elevation/tv-elevation.object';
import { TvRoad } from 'app/map/models/tv-road.model';
import { BaseTool } from '../../tools/base-tool'
import { AppInspector } from 'app/core/inspector';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { DepSelectRoadStrategy } from 'app/core/strategies/select-strategies/select-road-strategy';
import { TvElevation } from 'app/map/road-elevation/tv-elevation.model';
import { DepPointStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';
import { RoadElevationToolService } from './road-elevation-tool.service';
import { RoadLineMovingStrategy } from 'app/core/strategies/move-strategies/road-line-moving.strategy';
import { RoadPosition } from 'app/scenario/models/positions/tv-road-position';
import { TvRoadElevationInspector } from "./tv-road-elevation.inspector";
import { TvElevationInspector } from "./tv-elevation.inspector";
import { Log } from 'app/core/utils/log';
import { Commands } from 'app/commands/commands';

export class RoadElevationTool extends BaseTool<any> {

	name: string = 'Road Elevation Tool';

	toolType: ToolType = ToolType.RoadElevation;

	nodeChanged: boolean = false;

	debug: boolean = false;

	get selectedRoad (): TvRoad {

		return this.selectionService.findSelectedObject<TvRoad>( TvRoad );

	}

	get selectedNode (): ElevationControlPoint {

		return this.selectionService.findSelectedObject<ElevationControlPoint>( ElevationControlPoint );

	}

	constructor (
		private tool: RoadElevationToolService,
	) {
		super();
	}

	init (): void {

		this.setHint( 'use LEFT CLICK to select a road' );

		this.selectionService.registerStrategy( ElevationControlPoint, new DepPointStrategy<ElevationControlPoint>() );

		this.selectionService.registerStrategy( TvRoad, new DepSelectRoadStrategy() );

		this.tool.base.addMovingStrategy( new RoadLineMovingStrategy() );

	}

	enable (): void {

		super.enable();

	}

	disable (): void {

		super.disable();

		if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );

		if ( this.selectedRoad ) this.onRoadUnselected( this.selectedRoad );

		this.tool.base.reset();

		this.tool.debug.clear();

		this.tool.onToolDisabled();

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( !this.selectedRoad ) return;

		this.tool.base.selection.handleCreation( e, ( object ) => {

			if ( object instanceof TvRoad ) {

				const elevation = this.tool.elevationService.createElevation( object, e.point );

				this.executeAddObject( elevation );

				// const addCommand = new AddObjectCommand( elevation );

				// const selectCommand = new SelectObjectCommand( node, this.selectedNode );

				// CommandHistory.executeMany( addCommand, selectCommand );

			}

		} )

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.selectionService.handleSelection( e );

	}

	onPointerUp (): void {

		if ( !this.nodeChanged ) return;

		if ( !this.selectedNode ) return;

		const newPosition = this.selectedNode.position.clone();

		const oldPosition = this.pointerDownAt.clone();

		Commands.SetPosition( this.selectedNode, newPosition, oldPosition );

		this.nodeChanged = false;
	}

	onPointerMoved ( e: PointerEventData ): void {

		if ( !this.isPointerDown ) {

			this.tool.debug.clearLines();

			this.tool.base.selection.handleHighlight( e, ( object ) => {

				if ( object instanceof TvRoad ) {

					this.tool.debug.highlightRoad( object );

				}

			} );

			return;
		}

		if ( !this.selectedRoad ) return;

		if ( !this.selectedNode ) return;

		if ( !this.selectedNode.isSelected ) return;

		this.tool.base.handleTargetMovement( e, this.selectedRoad, ( position ) => {

			if ( position instanceof RoadPosition ) {

				this.selectedNode.setPosition( position.position );

				this.nodeChanged = true;

			}

		} );

	}

	onObjectAdded ( object: any ): void {

		if ( this.debug ) Log.info( 'onObjectAdded', object );

		if ( object instanceof TvElevation ) {

			if ( !this.selectedRoad ) return;

			this.tool.addElevation( this.selectedRoad, object );

		}
	}

	onObjectUpdated ( object: any ): void {

		if ( this.debug ) Log.info( 'onObjectUpdated', object );

		if ( object instanceof TvElevation ) {

			if ( !this.selectedRoad ) return;

			this.tool.updateElevation( this.selectedRoad, object );

		} else if ( object instanceof ElevationControlPoint ) {

			this.tool.updateElevationNode( object.road, object, object.position );

		} else if ( object instanceof TvElevationInspector ) {

			this.tool.updateElevation( object.road, object.elevation );

		} else if ( object instanceof TvRoadElevationInspector ) {

			object.road.getElevationProfile().getElevations().forEach( elevation => {

				this.tool.updateElevation( object.road, elevation );

			} );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( this.debug ) Log.info( 'onObjectRemoved', object );

		if ( object instanceof TvElevation ) {

			if ( !this.selectedRoad ) return;

			this.tool.removeElevation( this.selectedRoad, object );

		}

	}

	onObjectSelected ( object: any ): void {

		if ( this.debug ) Log.info( 'onObjectSelected', object );

		if ( object instanceof ElevationControlPoint ) {

			this.onNodeSelected( object );

		} else if ( object instanceof TvRoad ) {

			this.onRoadSelected( object );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( this.debug ) Log.info( 'onObjectUnselected', object );

		if ( object instanceof ElevationControlPoint ) {

			this.onNodeUnselected( object );

		} else if ( object instanceof TvRoad ) {

			this.onRoadUnselected( object );

		}

	}

	onNodeSelected ( object: ElevationControlPoint ): void {

		object?.select();

		AppInspector.setInspector( DynamicInspectorComponent, new TvElevationInspector( object.road, object.elevation ) );

		this.setHint( 'Drag node to modify position. Change properties from inspector' );

	}

	onNodeUnselected ( object: ElevationControlPoint ): void {

		object?.unselect();

		AppInspector.clear();

		this.setHint( 'use LEFT CLICK to select a node' );

	}

	onRoadUnselected ( road: TvRoad ): void {

		this.tool.hideControlPoints( road );

		AppInspector.clear();

		this.setHint( 'use LEFT CLICK to select a road' );

	}

	onRoadSelected ( road: TvRoad ): void {

		this.tool.showControlPoints( road );

		AppInspector.setInspector( DynamicInspectorComponent, new TvRoadElevationInspector( road ) );

		this.setHint( 'use LEFT CLICK to select a node' );

	}

}

