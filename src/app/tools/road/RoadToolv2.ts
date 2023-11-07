import { SelectObjectCommandv2, SelectPointCommandv2, UnselectObjectCommandv2 } from 'app/commands/select-point-command';
import { AddRoadPointCommand } from 'app/tools/road/add-road-point-command';
import { PointerEventData } from 'app/events/pointer-event-data';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { CommandHistory } from 'app/services/command-history';
import { RoadInspector } from 'app/views/inspectors/road-inspector/road-inspector.component';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { SelectRoadCommandv2 } from 'app/commands/select-road-command';
import { AppInspector } from 'app/core/inspector';
import { AddRoadCommandv2 } from './add-road-command';
import { RoadFactory } from 'app/factories/road-factory.service';
import { RoadToolService } from './road-tool.service';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';
import { UpdatePositionCommand } from 'app/commands/copy-position-command';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { Object3D } from 'three';


export class RoadToolv2 extends BaseTool {

	name: string;

	toolType: ToolType = ToolType.Road;
	selectedControlPoint: AbstractControlPoint;
	selectedNode: RoadNode;
	roadChanged: boolean;
	selectedRoad: TvRoad;

	constructor ( private roadToolService: RoadToolService ) {

		super();

	}

	init (): void { }

	enable (): void {

		super.enable();

		this.roadToolService.roadService.showAllRoadNodes();

	}

	disable (): void {

		super.disable();

		if ( this.selectedRoad ) this.onRoadUnselected( this.selectedRoad );

		this.selectedControlPoint?.unselect();

		this.roadToolService.roadService.hideAllRoadNodes();

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

			CommandHistory.executeMany(

				new AddRoadCommandv2( this.roadToolService.mapService.map, [ road ], true ),

				new AddRoadPointCommand( road, point ),

				new SelectRoadCommandv2( road )

			);

		}

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		const point = this.roadToolService.pointStrategy.onPointerDown( e );
		const node = this.roadToolService.nodeStrategy.onPointerDown( e );
		const roadCoord = this.roadToolService.roadStrategy.onPointerDown( e );

		// If a point is selected, select this point and return immediately.
		if ( point && point !== this.selectedControlPoint ) {
			CommandHistory.execute( new SelectPointCommandv2( point, this.selectedControlPoint ) );
			return;
		}

		// If a node is selected, select this node and return immediately.
		if ( node && node !== this.selectedNode ) {
			CommandHistory.execute( new SelectObjectCommandv2( node, this.selectedNode ) );
			return;
		}

		// If a road is selected, and it's not the currently selected road, select this road.
		if ( roadCoord && roadCoord.road !== this.selectedRoad ) {
			CommandHistory.execute( new SelectObjectCommandv2( roadCoord.road, this.selectedRoad ) );
			return;
		}

		// If nothing is found, and there's a previously selected point, node, or road, unselect it.
		if ( !point && !node && !roadCoord ) {
			if ( this.selectedControlPoint ) {
				CommandHistory.execute( new SelectPointCommandv2( null, this.selectedControlPoint ) );
			} else if ( this.selectedNode ) {
				CommandHistory.execute( new UnselectObjectCommandv2( this.selectedNode ) );
			} else if ( this.selectedRoad ) {
				CommandHistory.execute( new UnselectObjectCommandv2( this.selectedRoad ) );
			}
		}

	}

	onPointerMoved ( e: PointerEventData ): void {

		const roadCoord = this.roadToolService.roadStrategy.onPointerDown( e );

		// console.log( 'roadCoord', roadCoord );

		// if ( !this.roadToolService.pointStrategy.onPointerMoved( e ) ) this.nodeStrategy.onPointerMoved( e );

		if ( this.isPointerDown && this.selectedControlPoint?.isSelected ) {

			this.selectedControlPoint.position.copy( e.point );

			// this.controlPoint.position.copy( e.point );

			// this.selectedRoad.spline.update();

			// this.roadLinkService.updateLinks( this.selectedRoad, this.controlPoint );

			// this.roadLinkService.showLinks( this.selectedRoad, this.controlPoint );

			this.roadChanged = true;

		}

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

		this.selectedRoad = road;

		this.roadToolService.showRoad( road );

		AppInspector.setInspector( RoadInspector, { road } );

	}

	onRoadUnselected ( road: TvRoad ): void {

		this.selectedRoad = null;

		this.roadToolService.hideRoad( road );

		AppInspector.clear();

	}

	onControlPointSelected ( controlPoint: AbstractControlPoint ): void {

		this.selectedControlPoint?.unselect();

		this.selectedControlPoint = controlPoint;

		this.selectedControlPoint?.select();

		AppInspector.setInspector( RoadInspector, { road: this.selectedRoad, controlPoint } );

	}

	onControlPointUnselected ( controlPoint: AbstractControlPoint ): void {

		controlPoint?.unselect();

		this.selectedControlPoint = null;

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

		this.selectedNode?.unselect();

		this.selectedNode = object;

		this.selectedNode?.select();

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

		this.selectedNode = null;

	}

}
