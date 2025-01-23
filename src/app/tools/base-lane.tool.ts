/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from "./tool-types.enum";
import { TvLane } from "app/map/models/tv-lane";
import { SelectionService } from "./selection.service";
import { LinkedDataService } from "app/core/interfaces/data.service";
import { Tool } from "./tool";
import { MouseButton, PointerEventData } from "app/events/pointer-event-data";
import { Asset } from "app/assets/asset.model";
import { Vector3 } from "app/core/maths"
import { IDebugger } from "app/core/interfaces/debug.service";
import { AddObjectCommand } from "app/commands/add-object-command";
import { SelectObjectCommand } from "app/commands/select-object-command";
import { AppInspector } from "app/core/inspector";
import { CommandHistory } from "app/commands/command-history";
import { StatusBarService } from "app/services/status-bar.service";
import { DebugState } from "app/services/debug/debug-state";
import { KeyboardEvents } from "app/events/keyboard-events";
import { ILaneNodeFactory } from "app/core/interfaces/lane-element.factory";
import { HasDistanceValue } from "app/core/interfaces/has-distance-value";
import { DebugDrawService } from "app/services/debug/debug-draw.service";
import { LanePointNode } from "../objects/lane-node";
import { Commands } from "app/commands/commands";

export abstract class BaseLaneTool<T extends HasDistanceValue> implements Tool {

	name: string;

	toolType: ToolType;

	abstract typeName: string;

	public data: LinkedDataService<TvLane, T>;

	public debugger: IDebugger<TvLane, LanePointNode<T>>;

	public selection: SelectionService;

	public factory: ILaneNodeFactory<LanePointNode<T>>;

	public debugDrawService: DebugDrawService;

	protected nodeChanged: boolean;

	public pointerDownAt: Vector3;

	public isPointerDown: boolean;

	protected get selectedNode (): LanePointNode<T> {

		return this.selection?.findSelectedObject<LanePointNode<T>>( LanePointNode );

	}

	protected get selectedLane (): TvLane {

		return this.selection?.findSelectedObject<TvLane>( TvLane );

	}

	protected get selectedObject (): T {

		if ( this.selectedNode ) {
			return this.selectedNode.mainObject;
		}

	}

	updateVisuals ( object: any ): void {

		// throw new Error( "Method not implemented." );

	}

	init (): void {

		//

	}

	enable (): void {

		this.debugger.enable();

	}

	disable (): void {

		this.debugger.clear();

	}

	onPointerDown ( e: PointerEventData ): void {

		if ( e.button !== MouseButton.LEFT ) return;

		if ( e.point == null ) return;

		const shiftKeyDown = KeyboardEvents.isShiftKeyDown;

		if ( shiftKeyDown ) {

			this.onPointerDownCreate( e );

		} else {

			this.onPointerDownSelect( e );

		}

	}

	onPointerUp ( e: PointerEventData ): void {

		if ( !this.nodeChanged ) return;

		if ( !this.selectedNode ) return;

		const newPosition = this.selectedNode.position.clone();

		const oldPosition = this.pointerDownAt.clone();

		Commands.UpdatePosition( this.selectedNode, newPosition, oldPosition );

		this.nodeChanged = false;
	}

	onPointerMoved ( e: PointerEventData ): void {

		if ( !this.isPointerDown ) {

			this.highlight( e );

			return;
		}

		if ( !this.selectedLane ) return;

		if ( !this.selectedNode ) return;

		if ( !this.selectedNode.isSelected ) return;

		const position = this.selection.handleTargetMovement( e, this.selectedLane );

		if ( !position ) return;

		this.selectedNode.setPosition( position.position );

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

	onAssetDroppedEvent ( asset: Asset, event: PointerEventData ): void {

		this.setHint( 'Asset drop is not supported' );

	}

	onAssetDragOverEvent ( asset: Asset, event: PointerEventData ): void {

		this.setHint( 'Asset drag over is not supported' );

	}

	onDuplicateKeyDown (): void {

		//

	}

	onDeleteKeyDown (): void {

		//

	}

	protected setHint ( msg: string ): void {

		StatusBarService.setHint( msg );

	}

	protected selectObject ( object: any, previousObject: any ): void {

		Commands.Select( object, previousObject );

	}

	protected unselectObject ( object: any ): void {

		Commands.Unselect( object );

	}

	protected executeAddObject ( object: any ): void {

		Commands.AddObject( object );

	}

	protected executeAddAndSelect ( object: any, previousObject: any ): void {

		CommandHistory.executeMany( new AddObjectCommand( object ), new SelectObjectCommand( object, previousObject ) );

	}

	protected executeRemoveObject ( object: any ): void {

		Commands.RemoveObject( object );

	}

	protected setInspector ( data: any ): void {

		AppInspector.setDynamicInspector( data );

	}

	protected highlight ( e: PointerEventData ): any {

		this.debugger.resetHighlighted();

		for ( const strategy of this.selection?.getStrategies() ) {

			const object = strategy.onPointerMoved( e );

			if ( object instanceof TvLane ) {

				this.debugger.setDebugState( object, DebugState.HIGHLIGHTED );

			}

			if ( object ) return object;

		}

	}

	protected handleSelection ( e: PointerEventData ): void {

		this.selection?.handleSelection( e );

	}

	protected onShowInspector ( object: LanePointNode<T> ): void {

	}

	onKeyDown ( e: KeyboardEvent ): void {

		// throw new Error("Method not implemented.");

	}

}
