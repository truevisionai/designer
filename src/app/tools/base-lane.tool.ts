/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from "./tool-types.enum";
import { TvLane } from "app/map/models/tv-lane";
import { SelectionService } from "./selection.service";
import { LinkedDataService } from "app/core/interfaces/data.service";
import { Tool } from "./tool";
import { ViewportEventSubscriber } from "./viewport-event-subscriber";
import { MouseButton, PointerEventData } from "app/events/pointer-event-data";
import { Asset } from "app/core/asset/asset.model";
import { Vector3 } from "three";
import { IDebugger } from "app/core/interfaces/debug.service";
import { ToolHints } from "app/core/interfaces/tool.hints";
import { AddObjectCommand } from "app/commands/add-object-command";
import { RemoveObjectCommand } from "app/commands/remove-object-command";
import { SelectObjectCommand } from "app/commands/select-object-command";
import { UnselectObjectCommand } from "app/commands/unselect-object-command";
import { AppInspector } from "app/core/inspector";
import { CommandHistory } from "app/services/command-history";
import { StatusBarService } from "app/services/status-bar.service";
import { DebugState } from "app/services/debug/debug-state";
import { KeyboardEvents } from "app/events/keyboard-events";
import { ILaneNodeFactory } from "app/core/interfaces/lane-element.factory";
import { HasDistanceValue } from "app/core/interfaces/has-distance-value";
import { DebugDrawService } from "app/services/debug/debug-draw.service";
import { LanePointNode } from "../objects/lane-node";
import { UpdatePositionCommand } from "app/commands/update-position-command";

export abstract class BaseLaneTool<T extends HasDistanceValue> extends ViewportEventSubscriber implements Tool {

	name: string;

	toolType: ToolType;

	abstract typeName: string;

	public data: LinkedDataService<TvLane, T>;

	public debugger: IDebugger<TvLane, LanePointNode<T>>;

	public hints: ToolHints<T>;

	public selection: SelectionService;

	public factory: ILaneNodeFactory<LanePointNode<T>>;

	public debugDrawService: DebugDrawService;

	protected nodeChanged: boolean;

	protected get selectedNode (): LanePointNode<T> {

		return this.selection?.getLastSelected<LanePointNode<T>>( LanePointNode.name );

	}

	protected get selectedLane (): TvLane {

		return this.selection?.getLastSelected<TvLane>( TvLane.name );

	}

	protected get selectedObject (): T {

		if ( this.selectedNode ) {
			return this.selectedNode.mainObject;
		}

		if ( this.typeName ) {
			return this.selection?.getLastSelected<T>( this.typeName );
		}

	}

	init (): void {

		this.setHint( this.hints?.toolOpened() );

	}

	enable (): void {

		this.subscribeToEvents();

		this.debugger.enable();

	}

	disable (): void {

		this.unsubscribeToEvents();

		this.debugger.clear();

	}

	onPointerDown ( e: PointerEventData ) {

		if ( e.button !== MouseButton.LEFT ) return;

		if ( e.point == null ) return;

		const shiftKeyDown = KeyboardEvents.isShiftKeyDown;

		if ( shiftKeyDown ) {

			this.onPointerDownCreate( e );

		} else {

			this.onPointerDownSelect( e );

		}

	}

	onPointerUp ( e: PointerEventData ) {

		if ( !this.nodeChanged ) return;

		if ( !this.selectedNode ) return;

		const newPosition = this.selectedNode.position.clone();

		const oldPosition = this.pointerDownAt.clone();

		const updateCommand = new UpdatePositionCommand( this.selectedNode, newPosition, oldPosition );

		CommandHistory.execute( updateCommand );

		this.nodeChanged = false;
	}

	onPointerMoved ( e: PointerEventData ) {

		if ( !this.isPointerDown ) {

			this.highlight( e );

			return;
		}

		if ( !this.selectedLane ) return;

		if ( !this.selectedNode ) return;

		if ( !this.selectedNode.isSelected ) return;

		const position = this.selection.handleTargetMovement( e, this.selectedLane );

		if ( !position ) return;

		this.selectedNode.copyPosition( position.position );

		this.nodeChanged = true;

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.selection?.handleSelection( e );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		this.onCreateObject( e );

	}

	onCreateObject ( e: PointerEventData ): void {

		if ( e.point == null ) return;

		if ( this.factory == null ) return;

		if ( this.selectedLane == null ) return;

		const node = this.factory.createNode( e.point, this.selectedLane );

		this.executeAddAndSelect( node, this.selectedNode );

	}

	onCreatePoint ( e: PointerEventData ): void {

		// invalid for lane tools

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof TvLane ) {

			this.debugger.setDebugState( object, DebugState.SELECTED );

		} else if ( object instanceof LanePointNode ) {

			object.select();

			this.onShowInspector( object );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof TvLane ) {

			this.debugger.setDebugState( object, DebugState.DEFAULT );

		} else if ( object instanceof LanePointNode ) {

			object.unselect();

			AppInspector.clear();

		}

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof LanePointNode ) {

			this.data.add( object.lane, object.mainObject );

			this.debugger.addControl( object.lane, object, DebugState.SELECTED );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object.constructor.name === this.typeName ) {

			this.data.update( this.selectedLane, object );

			this.debugger.updateDebugState( this.selectedLane, DebugState.SELECTED );

			this.setHint( this.hints?.objectUpdated( object ) );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof LanePointNode ) {

			this.data.remove( object.lane, object.mainObject );

			this.debugger.removeControl( object.lane, object );

			AppInspector.clear();

			this.selection?.clearSelection();

		}

	}

	onAssetDropped ( asset: Asset, position: Vector3 ): void {

		this.setHint( 'Asset drop is not supported' );

	}

	onDuplicateKeyDown (): void {

		//

	}

	onDeleteKeyDown (): void {

		//

	}

	protected setHint ( msg: string ) {

		StatusBarService.setHint( msg );

	}

	protected selectObject ( object: any, previousObject: any ) {

		CommandHistory.execute( new SelectObjectCommand( object, previousObject ) );

	}

	protected unselectObject ( object: any ) {

		CommandHistory.execute( new UnselectObjectCommand( object ) );

	}

	protected executeAddObject ( object: any ) {

		CommandHistory.execute( new AddObjectCommand( object ) );

	}

	protected executeAddAndSelect ( object: any, previousObject: any ) {

		CommandHistory.executeMany( new AddObjectCommand( object ), new SelectObjectCommand( object, previousObject ) );

	}

	protected executeRemoveObject ( object: any ) {

		CommandHistory.execute( new RemoveObjectCommand( object ) );

	}

	protected setInspector ( data: any ) {

		AppInspector.setDynamicInspector( data );

	}

	protected highlight ( e: PointerEventData ) {

		this.debugger.resetHighlighted();

		for ( const strategy of this.selection?.getStrategies() ) {

			const object = strategy.onPointerMoved( e );

			if ( object instanceof TvLane ) {

				this.debugger.setDebugState( object, DebugState.HIGHLIGHTED );

			}

			if ( object ) return object;

		}

	}

	protected handleSelection ( e: PointerEventData ) {

		this.selection?.handleSelection( e );

	}

	protected onShowInspector ( object: LanePointNode<T> ): void {

	}

}
