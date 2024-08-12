/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AppInspector } from 'app/core/inspector';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { StatusBarService } from 'app/services/status-bar.service';
import { Vector3 } from 'three';
import { ViewportEventSubscriber } from './viewport-event-subscriber';
import { KeyboardEvents } from '../events/keyboard-events';
import { ToolType } from './tool-types.enum';
import { CommandHistory } from 'app/commands/command-history';
import { AddObjectCommand } from "../commands/add-object-command";
import { SelectObjectCommand } from "../commands/select-object-command";
import { Asset } from 'app/core/asset/asset.model';
import { IDebugger } from "../core/interfaces/debug.service";
import { BaseDataService } from 'app/core/interfaces/data.service';
import { DebugState } from "../services/debug/debug-state";
import { SelectionService } from "./selection.service";
import { AbstractFactory } from 'app/core/interfaces/abstract-factory';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { ToolHints } from "../core/interfaces/tool.hints";
import { Tool } from "./tool";
import { SimpleControlPoint } from "../objects/simple-control-point";
import { Commands } from 'app/commands/commands';

export abstract class BaseTool<T> extends ViewportEventSubscriber implements Tool {

	abstract name: string;

	abstract toolType: ToolType;

	protected selectionService: SelectionService;

	protected debugService: IDebugger<T, any>;

	protected dataService: BaseDataService<T>;

	protected objectFactory: AbstractFactory<T>;

	protected pointFactory: ControlPointFactory;

	protected typeName: string;

	protected currentSelectedPointMoved: boolean;

	protected hints: ToolHints<T>;

	protected get currentSelectedPoint (): SimpleControlPoint<T> {
		return this.selectionService?.getLastSelected<SimpleControlPoint<T>>( SimpleControlPoint.name );
	}

	protected get currentSelectedObject (): T {

		if ( this.currentSelectedPoint ) {
			return this.currentSelectedPoint.mainObject;
		}

		if ( this.typeName ) {
			return this.selectionService?.getLastSelected<T>( this.typeName );
		}

	}

	protected constructor () {

		super();

		this.clearInspector();

	}

	init (): void {

		this.setHint( this.hints?.toolOpened() );

	}

	enable (): void {

		this.subscribeToEvents();

		this.dataService?.all().forEach( object => {

			this.debugService?.setDebugState( object, DebugState.DEFAULT );

		} );

		this.debugService?.enable();
	}

	disable (): void {

		this.dataService?.all().forEach( object => {

			this.debugService?.setDebugState( object, DebugState.REMOVED );

		} );

		this.debugService?.clear();

		StatusBarService.clearHint();

		this.unsubscribeToEvents();

	}

	clearInspector () {

		AppInspector.clear();

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

	onPointerDownSelect ( e: PointerEventData ) {

		this.selectionService?.handleSelection( e );

	}

	onPointerDownCreate ( e: PointerEventData ) {

		if ( !this.currentSelectedObject ) {

			this.onCreateObject( e );

		} else {

			this.onCreatePoint( e );

		}

	}

	onPointerMoved ( e: PointerEventData ): void {

		this.highlight( e );

		if ( !this.isPointerDown ) return;

		if ( !this.currentSelectedPoint ) return;

		if ( !this.currentSelectedPoint.isSelected ) return;

		this.currentSelectedPoint.copyPosition( e.point );

		this.dataService.updatePoint( this.currentSelectedPoint.mainObject, this.currentSelectedPoint );

		this.debugService.setDebugState( this.currentSelectedPoint.mainObject, DebugState.SELECTED );

		this.currentSelectedPointMoved = true;

	}

	onPointerUp ( e: PointerEventData ): void {

		if ( !this.currentSelectedPointMoved ) return;

		if ( !this.currentSelectedPoint ) return;

		if ( !this.currentSelectedPoint.isSelected ) return;

		const oldPosition = this.pointerDownAt.clone();

		const newPosition = this.currentSelectedPoint.position.clone();

		Commands.UpdatePosition( this.currentSelectedPoint, newPosition, oldPosition );

		this.currentSelectedPointMoved = false;

	}

	onCreateObject ( e: PointerEventData ) {

		if ( e.point == null ) return;

		if ( this.objectFactory == null ) return;

		if ( this.pointFactory == null ) return;

		const object = this.objectFactory.createFromPosition( e.point );

		const point = this.pointFactory.createSimpleControlPoint<T>( object, e.point );

		const addObjectCommand = new AddObjectCommand( object );

		const addPointCommand = new AddObjectCommand( point );

		const selectCommand = new SelectObjectCommand( object, this.currentSelectedObject );

		CommandHistory.executeMany( addObjectCommand, addPointCommand, selectCommand );

	}

	onCreatePoint ( e: PointerEventData ) {

		const point = this.pointFactory.createSimpleControlPoint<T>( this.currentSelectedObject, e.point );

		this.executeAddAndSelect( point, this.currentSelectedPoint );

	}

	onKeyDown ( e: KeyboardEvent ): void {

		if ( e.key === 'Delete' || ( e.key === 'Backspace' && e.metaKey ) ) {

			this.onDeleteKeyDown();

		} else if ( e.key === 'd' ) {

			this.onDuplicateKeyDown();

		}

	}

	onDeleteKeyDown () {

		if ( this.currentSelectedPoint ) {

			this.executeRemoveObject( this.currentSelectedPoint );

		} else if ( this.currentSelectedObject ) {

			this.executeRemoveObject( this.currentSelectedObject );

		}

	}

	onDuplicateKeyDown () {
	}

	onObjectSelected ( object: T ): void {

		if ( object.constructor.name === this.typeName ) {

			this.debugService.setDebugState( object, DebugState.SELECTED );

			this.onShowInspector( object );

			this.setHint( this.hints?.objectSelected( object ) );

		} else if ( object instanceof SimpleControlPoint ) {

			object.select();

			this.onShowInspector( object.mainObject, object );

			this.debugService.setDebugState( object.mainObject, DebugState.SELECTED );

			this.setHint( this.hints?.pointSelected( object.mainObject ) );
		}

	}

	onObjectUnselected ( object: T ): void {

		if ( object.constructor.name === this.typeName ) {

			this.debugService.setDebugState( object, DebugState.DEFAULT );

			AppInspector.clear();

			this.setHint( this.hints?.objectUnselected( object ) );

		} else if ( object instanceof SimpleControlPoint ) {

			object.unselect();

			AppInspector.clear();

			this.debugService.setDebugState( object.mainObject, DebugState.DEFAULT );

			this.setHint( this.hints?.pointUnselected() );

		}

	}

	onObjectAdded ( object: T ): void {

		if ( object.constructor.name === this.typeName ) {

			this.dataService.add( object );

			this.debugService.setDebugState( object, DebugState.SELECTED );

			this.setHint( this.hints?.objectAdded( object ) );

		} else if ( object instanceof SimpleControlPoint ) {

			this.dataService.addPoint( object.mainObject, object );

			this.debugService.setDebugState( object.mainObject, DebugState.SELECTED );

			this.setHint( this.hints?.pointAdded() );
		}

	}

	onObjectUpdated ( object: T ) {

		if ( object.constructor.name === this.typeName ) {

			this.dataService.update( object );

			this.debugService.setDebugState( object, DebugState.SELECTED );

			this.setHint( this.hints?.objectUpdated( object ) );

		} else if ( object instanceof SimpleControlPoint ) {

			this.dataService.update( object.mainObject );

			this.debugService.setDebugState( object.mainObject, DebugState.SELECTED );

			this.setHint( this.hints?.pointUpdated() );

		}

	}

	onObjectRemoved ( object: T ) {

		if ( object.constructor.name === this.typeName ) {

			this.dataService.remove( object );

			this.debugService.setDebugState( object, DebugState.REMOVED );

			AppInspector.clear();

			this.selectionService?.clearSelection();

			this.setHint( this.hints?.objectRemoved( object ) );

		} else if ( object instanceof SimpleControlPoint ) {

			this.dataService.removePoint( object.mainObject, object );

			this.debugService.setDebugState( object.mainObject, DebugState.DEFAULT );

			this.onShowInspector( object.mainObject );

			this.setHint( this.hints?.pointRemoved() );

		}

	}

	onAssetDropped ( asset: Asset, position: Vector3 ) {

		if ( !this.objectFactory ) {

			this.setHint( 'Importing asset is not supported in this tool.' );

			return;
		}

		const object = this.objectFactory.createFromAsset( asset, position );

		if ( !object ) {

			this.setHint( 'Importing ' + asset.getTypeAsString() + ' asset is not supported in this tool.' );

			return;
		}

		this.executeAddObject( object );

	}

	setDebugService ( debugService: IDebugger<T, any> ) {

		this.debugService = debugService;

	}

	setDataService ( dataService: BaseDataService<T> ) {

		this.dataService = dataService;

	}

	setSelectionService ( selectionService: SelectionService ) {

		this.selectionService = selectionService;

	}

	setTypeName ( typeName: string ) {

		this.typeName = typeName;

	}

	setObjectFactory ( objectFactory: AbstractFactory<T> ) {

		this.objectFactory = objectFactory;

	}

	setPointFactory ( controlPointFactory: ControlPointFactory ) {

		this.pointFactory = controlPointFactory;

	}

	setHints ( hints: ToolHints<T> ) {

		this.hints = hints;

	}

	protected setHint ( msg: string ) {

		StatusBarService.setHint( msg );

	}

	protected selectObject ( object: object, previousObject: object ) {

		Commands.Select( object, previousObject );

	}

	protected unselectObject ( object: object ) {

		Commands.Unselect( object );

	}

	protected executeAddObject ( object: object ) {

		Commands.AddObject( object );

	}

	protected executeAddAndSelect ( object: object, previousObject: object ) {

		CommandHistory.executeMany( new AddObjectCommand( object ), new SelectObjectCommand( object, previousObject ) );

	}

	protected executeRemoveObject ( object: object ) {

		Commands.RemoveObject( object );

	}

	protected setInspector ( data: object ) {

		AppInspector.setDynamicInspector( data );

	}

	protected highlight ( e: PointerEventData ) {

		if ( this.isPointerDown ) return;

		for ( const strategy of this.selectionService?.getStrategies() ) {

			const result = strategy.onPointerMoved( e );

			if ( result ) {

				return result;

			}
		}

	}

	protected handleSelection ( e: PointerEventData ) {

		this.selectionService?.handleSelection( e );

	}

	protected onShowInspector ( object: T, controlPoint?: AbstractControlPoint ): void {

	}

}

