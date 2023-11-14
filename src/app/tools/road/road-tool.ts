import { AddObjectCommand } from 'app/commands/select-point-command';
import { AddRoadPointCommand } from 'app/tools/road/add-road-point-command';
import { PointerEventData } from 'app/events/pointer-event-data';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { CommandHistory } from 'app/services/command-history';
import { RoadInspector } from 'app/views/inspectors/road-inspector/road-inspector.component';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { AppInspector } from 'app/core/inspector';
import { RoadFactory } from 'app/factories/road-factory.service';
import { RoadToolService } from './road-tool.service';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';
import { UpdatePositionCommand } from 'app/commands/copy-position-command';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { Object3D } from 'three';
import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { SelectRoadStrategy } from 'app/core/snapping/select-strategies/select-road-strategy';
import { SplineControlPoint } from 'app/modules/three-js/objects/spline-control-point';
import { NodeStrategy } from 'app/core/snapping/select-strategies/node-strategy';


export class RoadTool extends BaseTool {

	name: string;

	toolType: ToolType = ToolType.Road;

	roadChanged: boolean;

	get selectedControlPoint (): SplineControlPoint {

		return this.tool.selection.getLastSelected<SplineControlPoint>( SplineControlPoint.name );

	}

	get selectedNode (): RoadNode {

		return this.tool.selection.getLastSelected<RoadNode>( RoadNode.name );

	}

	get selectedRoad (): TvRoad {

		return this.tool.selection.getLastSelected<TvRoad>( TvRoad.name );

	}

	constructor ( private tool: RoadToolService ) {

		super();

	}

	init (): void {

		this.tool.selection.reset();

		this.tool.selection.registerStrategy( SplineControlPoint.name, new ControlPointStrategy() );

		this.tool.selection.registerStrategy( RoadNode.name, new NodeStrategy<RoadNode>( RoadNode.lineTag, true ) );

		this.tool.selection.registerStrategy( TvRoad.name, new SelectRoadStrategy() );

	}

	enable (): void {

		super.enable();

		this.tool.roadService.showAllRoadNodes();

	}

	disable (): void {

		super.disable();

		if ( this.selectedRoad ) this.onRoadUnselected( this.selectedRoad );

		this.selectedControlPoint?.unselect();

		this.tool.roadService.hideAllRoadNodes();

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( this.selectedRoad ) {

			const point = ControlPointFactory.createControl( this.selectedRoad.spline, e.point );

			CommandHistory.executeMany(

				new AddRoadPointCommand( this.selectedRoad, point )

			);

		} else {

			const road = RoadFactory.createDefaultRoad();

			const point = ControlPointFactory.createControl( road.spline, e.point );

			const addCommand = new AddObjectCommand( road );

			// CommandHistory.executeMany(

			// 	new AddRoadCommandv2( this.tool.mapService.map, [ road ], true ),

			// 	new AddRoadPointCommand( road, point ),

			// 	new SelectRoadCommandv2( road )

			// );

		}

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.tool.selection.handleSelection( e );

	}

	onPointerMoved ( e: PointerEventData ): void {

		// const roadCoord = this.tool.roadStrategy.onPointerDown( e );

		// // console.log( 'roadCoord', roadCoord );

		// // if ( !this.roadToolService.pointStrategy.onPointerMoved( e ) ) this.nodeStrategy.onPointerMoved( e );

		// if ( this.isPointerDown && this.selectedControlPoint?.isSelected ) {

		// 	this.selectedControlPoint.position.copy( e.point );

		// 	// this.controlPoint.position.copy( e.point );

		// 	// this.selectedRoad.spline.update();

		// 	// this.roadLinkService.updateLinks( this.selectedRoad, this.controlPoint );

		// 	// this.roadLinkService.showLinks( this.selectedRoad, this.controlPoint );

		// 	this.roadChanged = true;

		// }

	}

	onPointerUp ( e: PointerEventData ): void {

		if ( this.roadChanged && this.selectedControlPoint ) {

			const oldPosition = this.pointerDownAt.clone();

			const newPosition = this.selectedControlPoint.position.clone();

			CommandHistory.execute( new UpdatePositionCommand( this.selectedControlPoint, newPosition, oldPosition ) );

			// this.roadLinkService.hideLinks( this.selectedRoad );

		}

		this.roadChanged = false;

	}

	onRoadSelected ( road: TvRoad ): void {

		if ( this.selectedRoad ) this.onRoadUnselected( this.selectedRoad );

		// this.selectedRoad = road;

		this.tool.showRoad( road );

		AppInspector.setInspector( RoadInspector, { road } );

	}

	onRoadUnselected ( road: TvRoad ): void {

		// this.selectedRoad = null;

		this.tool.hideRoad( road );

		AppInspector.clear();

	}

	onControlPointSelected ( controlPoint: AbstractControlPoint ): void {

		// this.selectedControlPoint?.unselect();

		// this.selectedControlPoint = controlPoint;

		controlPoint?.select();

		AppInspector.setInspector( RoadInspector, { road: this.selectedRoad, controlPoint } );

	}

	onControlPointUnselected ( controlPoint: AbstractControlPoint ): void {

		controlPoint?.unselect();

		// this.selectedControlPoint = null;

		AppInspector.clear();
	}

	onObjectSelected ( object: Object3D ): void {

		if ( object instanceof RoadNode ) {

			this.onNodeSelected( object );

		} else if ( object instanceof TvRoad ) {

			this.onRoadSelected( object );

		}

	}

	onNodeSelected ( object: RoadNode ) {

		// this.selectedNode?.unselect();

		// this.selectedNode = object;

		// this.selectedNode?.select();

	}

	onObjectUnselected ( object: Object3D ): void {

		if ( object instanceof RoadNode ) {

			this.onNodeUnselected( object );

		} else if ( object instanceof TvRoad ) {

			this.onRoadUnselected( object );

		}

	}

	onNodeUnselected ( object: RoadNode ) {

		object?.unselect();

		// this.selectedNode = null;

	}

}
