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
import { Debug } from 'app/core/utils/debug';
import { PointMarkingInspector } from './PointMarkingInspector';

export class PointMarkingTool extends BaseTool<any> {

	public name: string = 'Point Marking Tool';

	public toolType = ToolType.PointMarkingTool;

	private boxSelectionStarted: boolean = false;

	get selectedRoad () {

		return this.selectionService.getLastSelected<TvRoad>( TvRoad.name );

	}

	get selectedMarking () {

		return this.selectionService.getLastSelected<SimpleControlPoint<TvRoadObject>>( SimpleControlPoint.name );

	}

	constructor ( private tool: PointMarkingToolService ) {

		super();

	}

	init () {

		super.init();

		this.selectionService.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );

		this.selectionService.registerStrategy( TvRoad.name, new SelectRoadStrategy() );

		this.tool.base.addMovingStrategy( new OnRoadMovingStrategy() );

	}

	enable () {

		super.enable();

		// this.tool.boxSelectionService.setStrategy( new ControlPointStrategy() );

		// this.tool.boxSelectionService.init();

	}

	disable (): void {

		super.disable();

		this.tool.hideAllControls();

		this.tool.base.reset();

		// this.tool.boxSelectionService.reset();

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

		this.createPointMarking( this.tool.getSelectedAsset(), e.point );

	}

	onPointerMoved ( pointerEventData: PointerEventData ): void {

		if ( !this.isPointerDown ) return;

		if ( !this.selectedRoad ) return;

		if ( !this.selectedMarking ) return;

		if ( !this.selectedMarking.isSelected ) return;

		// if ( !this.boxSelectionStarted ) return;

		// this.tool.boxSelectionService.update( pointerEventData );

		this.tool.base.handleMovement( pointerEventData, ( position ) => {

			if ( position instanceof RoadPosition ) {

				Debug.log( position );

				this.selectedMarking.mainObject.s = position.s;

				this.selectedMarking.mainObject.t = position.t;

				this.selectedMarking.copyPosition( position.position );

				this.tool.updateControls( this.selectedMarking.mainObject );

				this.tool.roadObjectService.updateRoadObject( this.selectedRoad, this.selectedMarking.mainObject );

				// this.nodeChanged = true;

			}

		} );

	}

	onAssetDropped ( asset: Asset, position: Vector3 ): void {

		this.createPointMarking( asset, position );

	}

	createPointMarking ( asset: Asset, position: Vector3 ) {

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

		this.executeAddObject( roadObject );

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof TvRoad ) {

			if ( this.selectedRoad ) this.onObjectUnselected( this.selectedRoad );

			this.tool.showControls( object );

		} else if ( object instanceof SimpleControlPoint ) {

			if ( this.selectedMarking ) this.onObjectUnselected( this.selectedMarking );

			object.select();

			this.tool.showControls( object.mainObject.road );

			AppInspector.setDynamicInspector( new PointMarkingInspector( [ object.mainObject ] ) );

		} else if ( object instanceof Array ) {

			if ( object[ 0 ] instanceof SimpleControlPoint ) {

				AppInspector.setDynamicInspector( new PointMarkingInspector( object.map( o => o.mainObject ) ) );

			}


		}

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.tool.hideControls( object );

		} else if ( object instanceof SimpleControlPoint ) {

			object.unselect();

			AppInspector.setDynamicInspector( null );

		}

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvRoadObject ) {

			this.addRoadObject( object );

		} else if ( object instanceof Array ) {

			if ( object[ 0 ] instanceof TvRoadObject ) {

				object.forEach( obj => this.addRoadObject( obj ) );

			}

		}

	}

	addRoadObject ( object: TvRoadObject ) {

		this.tool.roadObjectService.addRoadObject( object.road, object );

		this.tool.hideAllControls();

		this.tool.showControls( object.road );

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.tool.hideControls( object );

		} else if ( object instanceof TvRoadObject ) {

			this.tool.removePointMarking( object );

		} else if ( object instanceof Array ) {

			if ( object[ 0 ] instanceof TvRoadObject ) {

				object.forEach( obj => this.tool.removePointMarking( obj ) );

			}

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof PointMarkingInspector ) {

			object.items.forEach( obj => {

				this.tool.roadObjectService.updateRoadObject( obj.road, obj );

				this.tool.updateControls( obj );

			} )

			if ( object.items instanceof Array ) {

				object.items.forEach( obj => {

					this.tool.roadObjectService.updateRoadObject( obj.road, obj );

					this.tool.updateControls( obj );

				} )

			} else {

				// this.tool.roadObjectService.updateRoadObject( object.object.road, object.object );

				// this.tool.updateControls( object.object );

			}

		}

	}

	onDeleteKeyDown (): void {

		if ( !this.selectedMarking ) return;

		if ( this.selectedMarking instanceof Array ) {

			this.selectedMarking.forEach( marking => {

				this.tool.removePointMarking( marking.mainObject );

			} );

		} else {

			this.tool.removePointMarking( this.selectedMarking.mainObject );

		}

	}

	onDuplicateKeyDown (): void {

		if ( !this.selectedMarking ) return;

		const clone = this.tool.roadObjectService.clone( this.selectedMarking.mainObject );

		clone.s += 5;

		this.executeAddObject( clone );

	}

}
