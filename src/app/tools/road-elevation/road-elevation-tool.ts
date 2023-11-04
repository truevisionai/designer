/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IToolWithPoint, SelectPointCommand } from 'app/commands/select-point-command';
import { SetInspectorCommand } from 'app/commands/set-inspector-command';
import { KeyboardEvents } from 'app/events/keyboard-events';
import { ToolType } from 'app/tools/tool-types.enum';
import { PickingHelper } from 'app/services/picking-helper.service';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { ISelectable } from 'app/modules/three-js/objects/i-selectable';
import { RoadElevationNode } from 'app/modules/three-js/objects/road-elevation-node';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { CommandHistory } from 'app/services/command-history';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { Vector3 } from 'three';
import { BaseTool } from '../base-tool';
import { CreateElevationNodeCommand } from './create-elevation-node-command';
import { UpdateElevationNodePosition } from './update-elevation-node-position';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { OnRoadStrategy } from 'app/core/snapping/select-strategies/on-road-strategy';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { NodeStrategy } from "../../core/snapping/select-strategies/node-strategy";
import { SelectRoadCommand } from 'app/commands/select-road-command';
import { UnselectRoadCommand } from "app/commands/unselect-road-command";

export class RoadElevationTool extends BaseTool implements IToolWithPoint {

	name: string = 'Road Elevation Tool';

	toolType: ToolType = ToolType.RoadElevation;

	node: RoadElevationNode;

	nodeChanged: boolean = false;

	private pointStrategy: SelectStrategy<RoadControlPoint>;
	private nodeStrategy: SelectStrategy<RoadElevationNode>;
	private roadStrategy: SelectStrategy<TvRoadCoord>;


	init (): void {

		this.setHint( 'use LEFT CLICK to select a road' );

		this.pointStrategy = new ControlPointStrategy<RoadControlPoint>();
		this.nodeStrategy = new NodeStrategy<RoadElevationNode>( RoadElevationNode.TAG, true );
		this.roadStrategy = new OnRoadStrategy();

	}

	enable (): void {

		super.enable();

	}

	disable (): void {

		super.disable();

		// this.map.getRoads().forEach( road => this.roadService.removeElevationNodes( road ) );

	}

	onPointerDown ( e: PointerEventData ): void {

		// if ( !e.point || e.button != MouseButton.LEFT ) return;

		// if ( KeyboardEvents.isShiftKeyDown ) {

		// 	const lane = PickingHelper.checkLaneObjectInteraction( e );

		// 	if ( !lane ) return;

		// 	this.createRoadElevationNode( lane.laneSection.road, e.point );

		// } else {

		// 	if ( this.isNodeSelected( e ) ) return;

		// 	if ( this.isRoadSelected( e ) ) return;

		// 	if ( this.selectedRoad ) this.unselectRoad();

		// 	this.setHint( 'use LEFT CLICK to select a road' );

		// }

	}

	public onPointerUp () {

		if ( this.nodeChanged && this.node ) {

			const newPosition = this.node.position.clone();

			const oldPosition = this.pointerDownAt.clone();

			CommandHistory.execute( new UpdateElevationNodePosition( this.node, newPosition, oldPosition ) );

		}

		this.nodeChanged = false;
	}

	public onPointerMoved ( e: PointerEventData ) {

		if ( !this.pointStrategy.onPointerMoved( e ) ) this.nodeStrategy.onPointerMoved( e );

		if ( this.isPointerDown && this.node ) {

			this.nodeChanged = true;

			this.node.updateByPosition( e.point );

		}

	}

	createRoadElevationNode ( road: TvRoad, point: Vector3 ) {

		// this.roadService.showElevationNodes( road );

		// const roadCoord = road.getCoordAt( point );

		// const elevation = road.getElevationAt( roadCoord.s ).clone( roadCoord.s );

		// elevation.node = new RoadElevationNode( road, elevation );

		// CommandHistory.execute( new CreateElevationNodeCommand( this, elevation.node ) );

	}

	selectRoad ( road: TvRoad ): void {

		this.setHint( 'New Road Selected' );

		CommandHistory.execute( new SelectRoadCommand( this, road ) );

	}

	unselectRoad (): void {

		// CommandHistory.execute( new UnselectRoadCommand( this, this.selectedRoad ) );

	}

	selectNode ( node: RoadElevationNode ) {

		const command = new SelectPointCommand( this, node, DynamicInspectorComponent, node );

		CommandHistory.execute( command );

		this.setHint( 'Drag node to modify position. Change properties from inspector' );
	}

	setPoint ( value: ISelectable ): void {

		this.node = value as RoadElevationNode;

	}

	getPoint (): ISelectable {

		return this.node;

	}

	private isRoadSelected ( e: PointerEventData ): boolean {

		// const newLane = PickingHelper.checkLaneObjectInteraction( e );

		// if ( !newLane ) return false;

		// if ( !this.selectedRoad || this.selectedRoad?.id !== newLane.roadId ) {

		// 	this.selectRoad( newLane.laneSection.road );

		// } else if ( this.selectedRoad && this.node ) {

		// 	// unselct node because road is selected
		// 	CommandHistory.executeMany(
		// 		new SelectPointCommand( this, null ),
		// 		new SetInspectorCommand( null, null )
		// 	);

		// }

		return true;
	}

	onRoadSelected ( road: TvRoad ): void {

		// if ( road ) this.roadService.showElevationNodes( road );

	}

	onRoadUnselected ( road: TvRoad ): void {

		// if ( road ) this.roadService.removeElevationNodes( road );

	}

	private isNodeSelected ( e: PointerEventData ): boolean {

		const node = PickingHelper.checkControlPointInteraction( e, RoadElevationNode.TAG ) as RoadElevationNode;

		if ( !node || !node.parent ) return false;

		if ( !this.node || this.node.uuid !== node.uuid ) {

			this.selectNode( node );

		}

		return true;
	}

}
