/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from "./tool-types.enum";
import { TvLane } from "app/map/models/tv-lane";
import { AbstractControlPoint } from "../objects/abstract-control-point";
import { SelectionService } from "./selection.service";
import { LinkedDataService } from "app/core/interfaces/data.service";
import { Tool } from "./tool";
import { ViewportEventSubscriber } from "./viewport-event-subscriber";
import { MouseButton, PointerEventData } from "app/events/pointer-event-data";
import { AssetNode } from "app/views/editor/project-browser/file-node.model";
import { Vector3 } from "three";
import { DebugService } from "app/core/interfaces/debug.service";
import { ToolHints } from "app/core/interfaces/tool.hints";
import { AddObjectCommand } from "app/commands/add-object-command";
import { RemoveObjectCommand } from "app/commands/remove-object-command";
import { SelectObjectCommand } from "app/commands/select-object-command";
import { UnselectObjectCommand } from "app/commands/unselect-object-command";
import { AppInspector } from "app/core/inspector";
import { CommandHistory } from "app/services/command-history";
import { StatusBarService } from "app/services/status-bar.service";
import { SimpleControlPoint } from "app/objects/dynamic-control-point";
import { DebugState } from "app/services/debug/debug-state";
import { KeyboardEvents } from "app/events/keyboard-events";
import { LaneElementFactory } from "app/core/interfaces/lane-element.factory";

export abstract class BaseLaneTool<T> extends ViewportEventSubscriber implements Tool {

	name: string;

	toolType: ToolType;

	abstract typeName: string;

	public data: LinkedDataService<TvLane, T>;

	public debugger: DebugService<TvLane>;

	public hints: ToolHints<T>;

	public selection: SelectionService;

	public factory: LaneElementFactory<T>;

	protected get selectedPoint (): SimpleControlPoint<T> {

		return this.selection?.getLastSelected<SimpleControlPoint<T>>( SimpleControlPoint.name );

	}

	protected get selectedLane (): TvLane {

		return this.selection?.getLastSelected<TvLane>( TvLane.name );

	}

	protected get selectedObject (): T {

		if ( this.selectedPoint ) {
			return this.selectedPoint.mainObject;
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

	}

	disable (): void {

		this.unsubscribeToEvents();

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

		const object = this.factory.createFromPosition( e.point, this.selectedLane );

		const addCommand = new AddObjectCommand( object );

		const selectCommand = new SelectObjectCommand( object, this.selectedObject );

		CommandHistory.executeMany( addCommand, selectCommand );

	}

	onCreatePoint ( e: PointerEventData ): void {

		// invalid for lane tools

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof TvLane ) {

			this.debugger.setDebugState( object, DebugState.SELECTED );

		} else if ( object.constructor.name === this.typeName ) {

			this.debugger.setDebugState( object, DebugState.SELECTED );

			this.onShowInspector( object );

			this.setHint( this.hints?.objectSelected( object ) );

		} else if ( object instanceof SimpleControlPoint ) {

			object.select();

			this.onShowInspector( object.mainObject, object );

			this.debugger.setDebugState( object.mainObject, DebugState.SELECTED );

			this.setHint( this.hints?.pointSelected( object.mainObject ) );
		}

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof TvLane ) {

			this.debugger.setDebugState( object, DebugState.DEFAULT );

		} else if ( object.constructor.name === this.typeName ) {

			this.debugger.setDebugState( object, DebugState.DEFAULT );

			AppInspector.clear();

			this.setHint( this.hints?.objectUnselected( object ) );

		} else if ( object instanceof SimpleControlPoint ) {

			object.unselect();

			AppInspector.clear();

			this.debugger.setDebugState( object.mainObject, DebugState.DEFAULT );

			this.setHint( this.hints?.pointUnselected() );

		}

	}

	onObjectAdded ( object: any ): void {

		if ( object.constructor.name === this.typeName ) {

			this.data.add( this.selectedLane, object );

			this.debugger.setDebugState( object, DebugState.SELECTED );

			this.setHint( this.hints?.objectAdded( object ) );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object.constructor.name === this.typeName ) {

			this.data.update( this.selectedLane, object );

			this.debugger.setDebugState( object, DebugState.SELECTED );

			this.setHint( this.hints?.objectUpdated( object ) );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object.constructor.name === this.typeName ) {

			this.data.remove( this.selectedLane, object );

			this.debugger.setDebugState( object, DebugState.REMOVED );

			AppInspector.clear();

			this.selection?.clearSelection();

			this.setHint( this.hints?.objectRemoved( object ) );

		}

	}

	onAssetDropped ( asset: AssetNode, position: Vector3 ): void {

		this.setHint( 'Asset drop is not supported' );

	}

	onDuplicateKeyDown (): void {

		// throw new Error( "Method not implemented." );

	}

	onDeleteKeyDown (): void {

		// throw new Error( "Method not implemented." );

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

		for ( const strategy of this.selection?.getStrategies() ) {

			strategy.onPointerMoved( e );

		}

	}

	protected handleSelection ( e: PointerEventData ) {

		this.selection?.handleSelection( e );

	}

	protected onShowInspector ( object: any, controlPoint?: AbstractControlPoint ): void {

		// throw new Error( "Method not implemented." );

	}

}
