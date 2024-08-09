/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */
import { Vector3 } from 'three';
import { PointerEventData } from '../../events/pointer-event-data';
import { TvRoadSignal } from '../../map/road-signal/tv-road-signal.model';
import { TvRoad } from '../../map/models/tv-road.model';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { RoadSignToolService } from './road-sign-tool.service';
import { Asset, AssetType } from 'app/core/asset/asset.model';
import { OnRoadMovingStrategy } from 'app/core/strategies/move-strategies/on-road-moving.strategy';
import { ControlPointStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';
import { SelectRoadStrategy } from 'app/core/strategies/select-strategies/select-road-strategy';
import { RoadCoordStrategy } from 'app/core/strategies/select-strategies/road-coord-strategy';
import { AppInspector } from 'app/core/inspector';
import { RoadSignalInspector } from '../../map/road-signal/road-signal.inspector';
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { DebugState } from 'app/services/debug/debug-state';
import { CopyPositionCommand } from "../../commands/copy-position-command";
import { CommandHistory } from "../../commands/command-history";
import { Log } from 'app/core/utils/log';

export class RoadSignTool extends BaseTool<any> {

	public name: string = 'RoadSignTool';

	public toolType = ToolType.RoadSignTool;

	constructor ( private tool: RoadSignToolService ) {

		super();

	}

	get selectedPoint (): SimpleControlPoint<TvRoadSignal> {
		return this.selectionService.getLastSelected<SimpleControlPoint<TvRoadSignal>>( SimpleControlPoint.name );
	}

	get selectedRoad (): TvRoad {
		return this.selectionService.getLastSelected<TvRoad>( TvRoad.name );
	}

	init () {

		super.init();

		this.tool.base.addSelectionStrategy( new ControlPointStrategy() );
		this.selectionService.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );
		this.selectionService.registerStrategy( TvRoad.name, new SelectRoadStrategy( true, true, this.tool.toolDebugger ) );
		this.tool.base.addCreationStrategy( new RoadCoordStrategy() );
		this.tool.base.addMovingStrategy( new OnRoadMovingStrategy() );

		this.setDebugService( this.tool.toolDebugger );
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
			this.setHint( 'Select a road' );
			return;
		}

		const asset = this.tool.getSelectedAsset();

		this.createSignal( this.selectedRoad, asset, e.point );

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.selectionService.handleSelection( e );

	}

	onPointerUp ( e: PointerEventData ): void {

		if ( !this.currentSelectedPoint ) return;

		if ( !this.currentSelectedPointMoved ) return;

		if ( !this.pointerDownAt ) return;

		const command = new CopyPositionCommand( this.currentSelectedPoint, this.currentSelectedPoint.position, this.pointerDownAt );

		CommandHistory.execute( command );

		this.currentSelectedPointMoved = false;

	}

	onPointerMoved ( pointerEventData: PointerEventData ): void {

		this.highlight( pointerEventData );

		if ( !this.isPointerDown ) return;

		if ( !this.currentSelectedObject ) return;

		const road = this.tool.roadService.getRoad( this.currentSelectedObject.roadId );

		if ( !road ) {
			Log.error( `Road with ID ${ this.currentSelectedObject.roadId } could not be retrieved.` );
			return;
		}

		const position = this.tool.roadService.findRoadCoord( pointerEventData.point );

		if ( !position ) {
			this.setHint( 'Drag signal on a road or lane' );
			return;
		}

		this.currentSelectedObject.s = position.s;

		this.updateRoadSignal( road, this.currentSelectedObject );

		this.currentSelectedPointMoved = true;

	}

	onAssetDropped ( asset: Asset, position: Vector3 ): void {

		const coord = this.tool.roadService.findRoadCoord( position );

		this.createSignal( coord?.road || this.selectedRoad, asset, position );

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			const road = this.selectedRoad || this.tool.roadService.getRoad( object.roadId );

			if ( !road ) {
				this.setHint( 'Road not found for signal' );
				return;
			}

			this.setHint( 'Drag the signal to the desired position' );

			this.addRoadSignal( road, object );

		} else if ( object instanceof SimpleControlPoint ) {

			const road = this.selectedRoad || this.tool.roadService.getRoad( object.mainObject.roadId );

			if ( !road ) {
				this.setHint( 'Road not found for signal' );
				return;
			}

			this.setHint( 'Drag the signal to the desired position' );

			this.addRoadSignal( road, object.mainObject );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			const road = this.tool.roadService.getRoad( object.roadId );

			this.updateRoadSignal( road, object );

		} else if ( object instanceof RoadSignalInspector ) {

			this.onObjectUpdated( object.signal );

		} else if ( object instanceof SimpleControlPoint ) {

			if ( object.mainObject instanceof TvRoadSignal ) {

				const road = this.tool.roadService.getRoad( object.mainObject.roadId );

				if ( !road ) return;

				const coord = road.getPosThetaByPosition( object.position );

				if ( !coord ) return;

				object.mainObject.s = coord.s;

				this.updateRoadSignal( road, object.mainObject );

			}

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			const road = this.selectedRoad || this.tool.roadService.getRoad( object.roadId );

			if ( !road ) return;

			this.removeRoadSignal( road, object );

			this.onObjectUnselected( object );

		} else if ( object instanceof SimpleControlPoint ) {

			const road = this.selectedRoad || this.tool.roadService.getRoad( object.mainObject.roadId );

			if ( !road ) return;

			this.removeRoadSignal( road, object.mainObject );

			this.onObjectUnselected( object );

		}

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			AppInspector.setDynamicInspector( new RoadSignalInspector( object ) );

		} else if ( object instanceof SimpleControlPoint ) {

			object.select();

			AppInspector.setDynamicInspector( new RoadSignalInspector( object.mainObject ) );

		} else if ( object instanceof TvRoad ) {

			// if ( this.selectedPoint ) this.onObjectUnselected( this.selectedPoint );

			this.tool.toolDebugger.updateDebugState( object, DebugState.SELECTED );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof TvRoadSignal ) {

			AppInspector.clear();

		} else if ( object instanceof SimpleControlPoint ) {

			object.unselect();

			AppInspector.clear();

		} else if ( object instanceof TvRoad ) {

			if ( this.selectedPoint ) return;

			this.tool.toolDebugger.updateDebugState( object, DebugState.DEFAULT );

		}

	}

	createSignal ( road: TvRoad, asset: Asset, position: Vector3 ) {

		if ( !road ) {
			this.setHint( 'Please select a road first.' );
			return;
		}

		if ( !position ) {
			this.setHint( 'Drag signal on a road or lane' );
			return;
		}

		if ( !asset ) {
			this.setHint( 'Drag a texture asset from the project browser' );
			return;
		}

		if ( asset.type != AssetType.TEXTURE && asset.type != AssetType.MATERIAL && asset.type != AssetType.OBJECT && asset.type != AssetType.MODEL ) {
			this.setHint( 'Drag a texture asset from the project browser' );
			return;
		}

		const lane = this.tool.roadService.findLaneAtPosition( position );

		if ( !lane ) {
			this.setHint( 'Drag signal on a road or lane' );
			return;
		}

		const roodCoord = this.tool.roadService.findRoadCoordAtPosition( position );

		if ( !roodCoord ) {
			this.setHint( 'Drag signal on a road or lane' );
			return;
		}

		const signal = this.tool.signalFactory.createSignalFromAsset( asset, roodCoord, asset.name );

		const node = this.tool.toolDebugger.createNode( road, signal );

		this.executeAddAndSelect( node, this.selectedPoint );

	}

	private addRoadSignal ( road: TvRoad, object: TvRoadSignal ) {

		this.tool.roadSignalService.addSignalNew( road, object );

		this.tool.toolDebugger.updateDebugState( road, DebugState.SELECTED );

	}

	private updateRoadSignal ( road: TvRoad, signal: TvRoadSignal ) {

		this.tool.roadSignalService.updateSignal( road, signal );

		this.tool.toolDebugger.updateDebugState( road, DebugState.SELECTED );

	}

	private removeRoadSignal ( road: TvRoad, signal: TvRoadSignal ) {

		this.tool.roadSignalService.removeSignal( road, signal );

		this.tool.toolDebugger.updateDebugState( road, DebugState.DEFAULT );

	}

}

