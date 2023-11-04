/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AddObjectCommand, IToolWithPoint, SelectObjectCommandv2 } from 'app/commands/select-point-command';
import { ToolType } from 'app/tools/tool-types.enum';
import { PointerEventData } from 'app/events/pointer-event-data';
import { ISelectable } from 'app/modules/three-js/objects/i-selectable';
import { RoadElevationNode } from 'app/modules/three-js/objects/road-elevation-node';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { CommandHistory } from 'app/services/command-history';
import { BaseTool } from '../base-tool'
import { NodeStrategy } from "../../core/snapping/select-strategies/node-strategy";
import { RoadElevationService } from 'app/services/road/road-elevation.service';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { AppInspector } from 'app/core/inspector';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { UpdatePositionCommand } from 'app/commands/copy-position-command';
import { SelectRoadStrategy } from 'app/core/snapping/select-strategies/SelectRoadStrategy';

export class RoadElevationTool extends BaseTool implements IToolWithPoint {

	name: string = 'Road Elevation Tool';

	toolType: ToolType = ToolType.RoadElevation;

	selectedRoad: TvRoad;

	selectedNode: RoadElevationNode;

	nodeChanged: boolean = false;

	constructor (
		private tool: RoadElevationService,
	) {
		super();
	}


	init (): void {

		this.setHint( 'use LEFT CLICK to select a road' );

		// this.pointStrategy = new ControlPointStrategy<RoadControlPoint>();
		// this.nodeStrategy = new NodeStrategy<RoadElevationNode>( RoadElevationNode.TAG, true );
		// this.roadStrategy = new OnRoadStrategy();
		// this.tool.base.addSelectionStrategy( new ControlPointStrategy<RoadControlPoint>() );
		this.tool.base.addSelectionStrategy( new NodeStrategy<RoadElevationNode>( RoadElevationNode.TAG ) );
		this.tool.base.addSelectionStrategy( new SelectRoadStrategy() );

	}

	enable (): void {

		super.enable();

	}

	disable (): void {

		super.disable();

		if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );

		if ( this.selectedRoad ) this.onRoadUnselected( this.selectedRoad );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( !this.tool.base.onPointerDown( e ) ) return;

		if ( !this.selectedRoad ) return;

		const node = this.tool.createElevation( this.selectedRoad, e.point );

		const addCommand = new AddObjectCommand( node );

		const selectCommand = new SelectObjectCommandv2( node, this.selectedNode );

		CommandHistory.executeMany( addCommand, selectCommand );

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.tool.base.select( e );

	}

	public onPointerUp () {

		if ( !this.nodeChanged ) return;

		if ( !this.selectedNode ) return;

		const newPosition = this.selectedNode.position.clone();

		const oldPosition = this.pointerDownAt.clone();

		const updateCommand = new UpdatePositionCommand( this.selectedNode, newPosition, oldPosition );

		CommandHistory.execute( updateCommand );

		this.nodeChanged = false;
	}

	public onPointerMoved ( e: PointerEventData ) {

		if ( !this.isPointerDown ) return;

		if ( !this.selectedNode ) return;

		if ( !this.tool.base.onPointerDown( e ) ) return;

		this.selectedNode.updateByPosition( e.point );

		this.nodeChanged = true;

	}

	setPoint ( value: ISelectable ): void {

		this.selectedNode = value as RoadElevationNode;

	}

	getPoint (): ISelectable {

		return this.selectedNode;

	}

	onObjectAdded ( object: any ): void {

		console.log( 'onObjectAdded', object );

		if ( object instanceof RoadElevationNode ) {

			this.tool.addNode( object );

		}
	}

	onObjectUpdated ( object: any ): void {

		console.log( 'onObjectUpdated', object );

		if ( object instanceof RoadElevationNode ) {

			// this.tool.updateNode( object );

		}

	}

	onObjectRemoved ( object: any ): void {

		console.log( 'onObjectRemoved', object );

		if ( object instanceof RoadElevationNode ) {

			this.tool.removeNode( object );

		}

	}

	onObjectSelected ( object: any ): void {

		console.log( 'onObjectSelected', object );

		if ( object instanceof TvRoadCoord ) {

			this.onRoadSelected( object.road );

		} else if ( object instanceof RoadElevationNode ) {

			this.onNodeSelected( object );

		} else if ( object instanceof TvRoad ) {

			this.onRoadSelected( object );

		}

	}

	onObjectUnselected ( object: any ): void {

		console.log( 'onObjectUnselected', object );

		if ( object instanceof TvRoadCoord ) {

			this.onRoadUnselected( object.road );

		} else if ( object instanceof RoadElevationNode ) {

			this.onNodeUnselected( object );

		} else if ( object instanceof TvRoad ) {

			this.onRoadUnselected( object );

		}

	}

	onNodeSelected ( object: RoadElevationNode ) {

		if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );

		this.selectedNode = object;

		this.selectedNode?.select();

		AppInspector.setInspector( DynamicInspectorComponent, object );

		this.setHint( 'Drag node to modify position. Change properties from inspector' );

	}

	onNodeUnselected ( object: RoadElevationNode ) {

		object?.unselect();

		this.selectedNode = null;

		AppInspector.clear();

		this.setHint( 'use LEFT CLICK to select a node' );

	}

	onRoadUnselected ( road: TvRoad ): void {

		this.selectedRoad = null;

		this.tool.removeElevationNodes( road );

		this.setHint( 'use LEFT CLICK to select a road' );

	}

	onRoadSelected ( road: TvRoad ): void {

		if ( this.selectedRoad ) this.onRoadUnselected( this.selectedRoad );

		if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );

		this.selectedRoad = road;

		this.tool.showElevationNodes( road );

		this.setHint( 'use LEFT CLICK to select a node' );

	}

}
