/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoadMarkingManager } from 'app/map/services/marking-manager';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { AssetNode, AssetType } from 'app/views/editor/project-browser/file-node.model';
import { PointMarkingToolService } from './point-marking-tool.service';
import { AppInspector } from 'app/core/inspector';
import { TvRoadObject } from 'app/map/models/objects/tv-road-object';
import { Action, SerializedField } from 'app/core/components/serialization';
import { RemoveObjectCommand } from 'app/commands/remove-object-command';
import { CommandHistory } from 'app/services/command-history';
import { TvRoad } from 'app/map/models/tv-road.model';
import { SelectRoadStrategy } from 'app/core/strategies/select-strategies/select-road-strategy';
import { PointerEventData } from 'app/events/pointer-event-data';
import { ControlPointStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';
import { MathUtils, Vector3 } from 'three';
import { OnRoadMovingStrategy } from 'app/core/strategies/move-strategies/on-road-moving.strategy';
import { RoadPosition } from 'app/scenario/models/positions/tv-road-position';
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { Debug } from 'app/core/utils/debug';

export class PointMarkingTool extends BaseTool<any>{

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

	get marking () {

		return TvRoadMarkingManager.currentMarking;

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

	onAssetDropped ( asset: AssetNode, position: Vector3 ): void {

		this.createPointMarking( asset, position );

	}

	createPointMarking ( asset: AssetNode, position: Vector3 ) {

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

			AppInspector.setDynamicInspector( new PointMarkingObject( [ object.mainObject ] ) );

		} else if ( object instanceof Array ) {

			if ( object[ 0 ] instanceof SimpleControlPoint ) {

				AppInspector.setDynamicInspector( new PointMarkingObject( object.map( o => o.mainObject ) ) );

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

		if ( object instanceof PointMarkingObject ) {

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

class PointMarkingObject {

	constructor ( public items: TvRoadObject[] ) { }

	getValue<T, K extends keyof T> ( items: T[], key: K, multi = true ): T[ K ] {

		if ( items.length > 1 ) {

			return multi ? items[ 0 ][ key ] : undefined;

		} else if ( items.length == 1 ) {

			return items[ 0 ][ key ];

		}

	}

	setValue<T, K extends keyof T> ( items: T[], key: K, value: T[ K ], multi = true ) {

		if ( items.length > 1 ) {

			if ( multi ) {

				items.forEach( obj => obj[ key ] = value );

			}

		} else if ( items.length == 1 ) {

			items[ 0 ][ key ] = value;

		}

	}

	@SerializedField( { 'type': 'float', label: 'Distance' } )
	get s () {

		return this.getValue( this.items, 's', false );

	}

	set s ( value ) {

		this.setValue( this.items, 's', value, false );

	}

	@SerializedField( { 'type': 'float', label: 'Offset' } )
	get t () {

		return this.getValue( this.items, 't', true );

	}

	set t ( value ) {

		this.setValue( this.items, 't', value, true );

	}

	@SerializedField( { 'type': 'float', label: 'Z Offset' } )
	get zOffset () {

		return this.getValue( this.items, 'zOffset', true );

	}

	set zOffset ( value ) {

		this.setValue( this.items, 'zOffset', value, true );

	}

	@SerializedField( { 'type': 'vector3', label: 'Rotation' } )
	get rotation () {

		// convert from radians to degrees
		const value = this.getValue( this.items, 'rotation', true );

		value.x = MathUtils.radToDeg( value.x );
		value.y = MathUtils.radToDeg( value.y );
		value.z = MathUtils.radToDeg( value.z );

		return value;

	}

	set rotation ( value ) {

		// convert from degrees to radians
		value.x = MathUtils.degToRad( value.x );
		value.y = MathUtils.degToRad( value.y );
		value.z = MathUtils.degToRad( value.z );

		this.setValue( this.items, 'rotation', value, true );

	}

	@SerializedField( { 'type': 'vector3', label: 'Scale' } )
	get scale () {

		return this.getValue( this.items, 'scale', true );

	}

	set scale ( value ) {

		this.setValue( this.items, 'scale', value, true );

	}

	@Action( { label: 'Delete' } )
	delete () {

		CommandHistory.execute( new RemoveObjectCommand( this.items ) );

	}

}
