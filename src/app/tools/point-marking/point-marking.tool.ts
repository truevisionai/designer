/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { Asset, AssetType } from 'app/core/asset/asset.model';
import { PointMarkingToolService } from './point-marking-tool.service';
import { AppInspector } from 'app/core/inspector';
import { TvRoadObject } from 'app/map/models/objects/tv-road-object';
import { TvRoad } from 'app/map/models/tv-road.model';
import { SelectRoadStrategy } from 'app/core/strategies/select-strategies/select-road-strategy';
import { PointerEventData } from 'app/events/pointer-event-data';
import { ControlPointStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';
import { Vector3 } from 'three';
import { OnRoadMovingStrategy } from 'app/core/strategies/move-strategies/on-road-moving.strategy';
import { RoadPosition } from 'app/scenario/models/positions/tv-road-position';
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { PointMarkingInspector } from './point-marking.inspector';
import { DebugState } from "../../services/debug/debug-state";
import { Commands } from 'app/commands/commands';

export class PointMarkingTool extends BaseTool<any> {

	public name: string = 'Point Marking Tool';

	public toolType = ToolType.PointMarkingTool;

	private boxSelectionStarted: boolean = false;

	get selectedRoad () {
		return this.selectionService.getLastSelected<TvRoad>( TvRoad.name );
	}

	override get currentSelectedPoint () {
		return this.selectionService.getLastSelected<SimpleControlPoint<TvRoadObject>>( SimpleControlPoint.name );
	}

	constructor ( private tool: PointMarkingToolService ) {

		super();

	}

	init () {

		super.init();

		this.selectionService.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );

		const selectRoadStrategy = new SelectRoadStrategy( false, true );

		selectRoadStrategy.debugger = this.tool.toolDebugger;

		this.selectionService.registerStrategy( TvRoad.name, selectRoadStrategy );

		this.tool.base.addMovingStrategy( new OnRoadMovingStrategy() );

		this.setDebugService( this.tool.toolDebugger );

	}

	enable () {

		super.enable();

		// this.tool.boxSelectionService.setStrategy( new ControlPointStrategy() );

		// this.tool.boxSelectionService.init();

	}

	disable (): void {

		super.disable();

		this.debugService?.clear();

		this.tool.base.reset();

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		// if ( this.boxSelectionStarted ) {

		// 	const objects = this.tool.boxSelectionService.end( e );

		// 	this.selectObject( objects, this.selectedMarking );

		// 	this.boxSelectionStarted = false;

		// 	return;
		// };

		this.selectionService.handleSelection( e );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( !this.selectedRoad ) return;

		// if ( this.boxSelectionStarted ) {

		// 	const objects = this.tool.boxSelectionService.end( e );

		// 	this.selectObject( objects, this.selectedMarking );

		// 	this.boxSelectionStarted = false;

		// } else {

		// 	this.tool.boxSelectionService.start( e );

		// 	this.boxSelectionStarted = true;

		// }

		const roadObject = this.createPointMarking( this.tool.getSelectedAsset(), e.point );

		if ( !roadObject ) return;

		const point = this.tool.toolDebugger.createNode( this.selectedRoad, roadObject );

		this.executeAddAndSelect( point, this.currentSelectedPoint );

	}

	onPointerUp ( e: PointerEventData ) {

		this.tool.base.enableControls();

		if ( !this.pointerDownAt ) return;

		if ( !this.currentSelectedPointMoved ) return;

		if ( !this.currentSelectedPoint ) return;

		if ( !this.currentSelectedPoint.isSelected ) return;

		const newPosition = e.point.clone();

		const oldPosition = this.pointerDownAt.clone();

		Commands.CopyPosition( this.currentSelectedPoint, newPosition, oldPosition );

		this.currentSelectedPointMoved = false;

	}

	onPointerMoved ( pointerEventData: PointerEventData ): void {

		this.highlight( pointerEventData );

		if ( !this.isPointerDown ) return;

		if ( !this.selectedRoad ) return;

		if ( !this.currentSelectedPoint ) return;

		if ( !this.currentSelectedPoint.isSelected ) return;

		// if ( !this.boxSelectionStarted ) return;

		// this.tool.boxSelectionService.update( pointerEventData );

		this.tool.base.handleMovement( pointerEventData, ( position ) => {

			if ( position instanceof RoadPosition ) {

				this.tool.base.disableControls();

				this.currentSelectedPoint?.position.copy( position.position );

				this.currentSelectedPointMoved = true;

			}

		} );

	}

	onAssetDropped ( asset: Asset, position: Vector3 ): void {

		const roadObject = this.createPointMarking( asset, position );

		if ( !roadObject ) return;

		const node = this.tool.toolDebugger.createNode( roadObject.road, roadObject );

		this.executeAddAndSelect( node, this.currentSelectedPoint );

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.onRoadSelected( object );

		} else if ( object instanceof SimpleControlPoint ) {

			this.onPointSelected( object );

		} else if ( object instanceof Array ) {

			object.forEach( obj => this.onObjectSelected( obj ) );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.onRoadUnselected( object );

		} else if ( object instanceof SimpleControlPoint ) {

			this.onPointUnselected( object );

		} else if ( object instanceof Array ) {

			object.forEach( obj => this.onObjectUnselected( obj ) );


		}

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof Array ) {

			object.forEach( obj => this.onObjectAdded( obj ) );

		} else if ( object instanceof SimpleControlPoint ) {

			this.addPointMarking( object.userData.road, object.mainObject );

		} else if ( object instanceof Array ) {

			object.forEach( obj => this.onObjectAdded( obj ) );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof SimpleControlPoint ) {

			this.removePointMarking( object.userData.road, object.mainObject );

		} else if ( object instanceof Array ) {

			object.forEach( obj => this.onObjectRemoved( obj ) );

		} else if ( object instanceof Array ) {

			object.forEach( obj => this.onObjectRemoved( obj ) );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof PointMarkingInspector ) {

			object.points.forEach( point => {

				this.tool.roadObjectService.updateRoadObject( point.userData.road, point.mainObject );

				this.debugService?.updateDebugState( point.userData.road, DebugState.SELECTED );

			} )

		} else if ( object instanceof SimpleControlPoint ) {

			this.onPointUpdated( object );

		}

	}

	onDeleteKeyDown (): void {

		if ( !this.currentSelectedPoint ) return;

		this.executeRemoveObject( this.currentSelectedPoint );

	}

	onDuplicateKeyDown (): void {

		if ( !this.currentSelectedPoint ) return;

		const road = this.currentSelectedPoint.userData.road;
		const s = this.currentSelectedPoint.mainObject.s + 5;   // 5 mtrs ahead
		const t = this.currentSelectedPoint.mainObject.t;

		if ( !road || !s || !t ) return;

		if ( s > road.length ) {
			this.setHint( 'Cannot duplicate point marking outside road' );
			return;
		}

		const posTheta = this.tool.roadService.findRoadPosition( road, s, t );

		if ( !posTheta ) return;

		const assetGuid = this.currentSelectedPoint.mainObject.assetGuid;

		const asset = assetGuid ? this.tool.assetService.getAsset( assetGuid ) : this.tool.getSelectedAsset();

		const roadObject = this.createPointMarking( asset, posTheta.position );

		if ( !roadObject ) return;

		const point = this.tool.toolDebugger.createNode( this.selectedRoad, roadObject );

		this.executeAddAndSelect( point, this.currentSelectedPoint );
	}

	onRoadSelected ( road: TvRoad ) {

		this.debugService?.updateDebugState( road, DebugState.SELECTED );

		this.clearInspector();

	}

	onRoadUnselected ( road: TvRoad ) {

		this.debugService?.updateDebugState( road, DebugState.DEFAULT );

	}

	onPointSelected ( point: SimpleControlPoint<TvRoadObject> ) {

		point.select();

		AppInspector.setDynamicInspector( new PointMarkingInspector( [ point ] ) );

	}

	onPointUnselected ( point: SimpleControlPoint<TvRoadObject> ) {

		point.unselect();

		this.clearInspector();

	}

	private createPointMarking ( asset: Asset, position: Vector3 ) {

		if ( !position ) {
			this.setHint( 'Drag point marking on a road or lane' );
			return;
		}

		if ( !asset ) {
			this.setHint( 'Drag a texture or material asset from the project browser' );
			return;
		}

		if ( asset.type != AssetType.TEXTURE && asset.type != AssetType.MATERIAL ) {
			this.setHint( 'Drag a texture or material asset from the project browser' );
			return;
		}

		const roadObject = this.tool.createPointMarking( asset, position );

		if ( !roadObject ) {
			this.setHint( 'Drag point marking on a road or lane' );
			return;
		}

		return roadObject;

	}

	private addPointMarking ( road: TvRoad, object: TvRoadObject ) {

		this.tool.roadObjectService.addRoadObject( road, object );

		this.debugService?.updateDebugState( road, DebugState.SELECTED );

	}

	private updatePointMarking ( road: TvRoad, object: TvRoadObject ) {

		this.tool.roadObjectService.updateRoadObject( road, object );

		this.debugService?.updateDebugState( road, DebugState.SELECTED );

	}

	private onPointUpdated ( point: SimpleControlPoint<TvRoadObject> ) {

		const coord = this.tool.roadService.findRoadCoord( point.position );

		if ( !coord ) return;

		point.mainObject.s = coord.s;

		point.mainObject.t = coord.t;

		point.copyPosition( coord.position );

		this.debugService?.updateDebugState( coord.road, DebugState.SELECTED );

		this.updatePointMarking( point.userData.road, point.mainObject );

	}

	private removePointMarking ( road: TvRoad, object: TvRoadObject ) {

		this.tool.roadObjectService.removeRoadObject( road, object );

		this.debugService?.updateDebugState( road, DebugState.SELECTED );

		this.clearInspector();

	}

}
