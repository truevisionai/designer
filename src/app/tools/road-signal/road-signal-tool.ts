/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */
import { Vector3 } from 'three';
import { PointerEventData, PointerMoveData } from '../../events/pointer-event-data';
import { TvRoadSignal } from '../../map/models/tv-road-signal.model';
import { TvRoad } from '../../map/models/tv-road.model';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { RoadSignalToolService } from './road-signal-tool.service';
import { AssetNode, AssetType } from 'app/views/editor/project-browser/file-node.model';
import { OnRoadMovingStrategy } from 'app/core/strategies/move-strategies/on-road-moving.strategy';
import { ControlPointStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';
import { SelectRoadStrategy } from 'app/core/strategies/select-strategies/select-road-strategy';
import { SimpleControlPoint } from 'app/objects/dynamic-control-point';
import { RoadCoordStrategy } from 'app/core/strategies/select-strategies/road-coord-strategy';
import { AppInspector } from 'app/core/inspector';
import { RoadSignalInspector } from './road-signal.inspector';

export class RoadSignalTool extends BaseTool {

	public name: string = 'RoadSignalTool';

	public toolType = ToolType.RoadSignalTool;


	get selectedPoint (): SimpleControlPoint<TvRoadSignal> {
		return this.tool.base.selection.getLastSelected<SimpleControlPoint<TvRoadSignal>>( SimpleControlPoint.name );
	}

	get selectedRoad (): TvRoad {
		return this.tool.base.selection.getLastSelected<TvRoad>( TvRoad.name );
	}

	constructor ( private tool: RoadSignalToolService ) {

		super();

	}

	init () {

		super.init();

		this.tool.base.addSelectionStrategy( new ControlPointStrategy() );
		this.tool.base.selection.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );
		this.tool.base.selection.registerStrategy( TvRoad.name, new SelectRoadStrategy() );
		this.tool.base.addCreationStrategy( new RoadCoordStrategy() );
		this.tool.base.addMovingStrategy( new OnRoadMovingStrategy() );
	}

	enable () {

		super.enable();


	}

	disable (): void {

		super.disable();

		this.tool.base.reset();

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( !this.selectedRoad ) {
			this.tool.base.setWarning( 'Select a road' );
			return;
		}

		this.createSignal( this.tool.getSelectedAsset(), e.point );

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.tool.base.selection.handleSelection( e );

	}

	onPointerMoved ( pointerEventData: PointerEventData ): void {

		this.tool.base.highlight( pointerEventData );

	}

	onAssetDropped ( asset: AssetNode, position: Vector3 ): void {

		this.createSignal( asset, position );

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			if ( !this.selectedRoad ) {
				console.log( 'selected road is null' );
				return;
			}

			this.tool.base.setHint( 'Drag the signal to the desired position' );

			this.tool.addRoadSignal( this.selectedRoad, object );

			this.selectObject( object, this.selectedPoint );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			const road = this.tool.roadService.getRoad( object.roadId );

			this.tool.updateRoadSignal( road, object );

		} else if ( object instanceof RoadSignalInspector ) {

			this.onObjectUpdated( object.signal );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			if ( !this.selectedRoad ) {
				console.log( 'selected road is null' );
				return;
			}

			this.tool.removeRoadSignal( this.selectedRoad, object );
		}

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			AppInspector.setDynamicInspector( new RoadSignalInspector( object ) );

		} else if ( object instanceof SimpleControlPoint ) {

			this.onObjectSelected( object.mainObject );

		} else if ( object instanceof TvRoad ) {

			this.tool.showControls( object );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			AppInspector.clear();

		} else if ( object instanceof SimpleControlPoint ) {

			AppInspector.clear();

		} else if ( object instanceof TvRoad ) {

			this.tool.hideControls( object );

		}

	}

	createSignal ( asset: AssetNode, position: Vector3 ) {

		if ( !position ) {
			this.tool.base.setWarning( 'Drag signal on a road or lane' );
			return;
		}

		if ( !asset ) {
			this.tool.base.setWarning( 'Drag a texture asset from the project browser' );
			return;
		}

		if ( asset.type != AssetType.TEXTURE && asset.type != AssetType.MATERIAL ) {
			this.tool.base.setWarning( 'Drag a texture asset from the project browser' );
			return;
		}

		const roadSignal = this.tool.createRoadSignal( asset, position, 'truevision', 'stop' );

		if ( !roadSignal ) {
			this.tool.base.setWarning( 'Drag signal on a road or lane' );
			return;
		}

		this.executeAddObject( roadSignal );

	}

}

