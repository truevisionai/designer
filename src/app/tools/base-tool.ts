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
import { Tool } from "./tool";
import { SimpleControlPoint } from "../objects/simple-control-point";
import { Commands } from 'app/commands/commands';
import { Visualizer } from "../core/visualizers/visualizer";
import { ToolHintConfig } from 'app/core/interfaces/tool.hints';
import { ViewControllerService } from 'app/views/editor/viewport/view-controller.service';
import { BaseController } from 'app/core/controllers/base-controller';
import { ToolHandlers } from './tool-handlers';
import { SelectionStrategy } from 'app/core/strategies/select-strategies/select-strategy';
import { BaseDragHandler } from 'app/core/drag-handlers/base-drag-handler';
import { ConstructorFunction } from 'app/core/models/class-map';

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

	protected handlers: ToolHandlers;

	protected get currentSelectedPoint (): SimpleControlPoint<T> {
		return this.selectionService?.findSelectedObject<SimpleControlPoint<T>>( SimpleControlPoint );
	}

	private hintConfig: ToolHintConfig;

	protected get currentSelectedObject (): T {

		if ( this.currentSelectedPoint ) {
			return this.currentSelectedPoint.mainObject;
		}

	}

	protected constructor () {

		super();

		this.clearInspector();

		this.handlers = new ToolHandlers( this.selectionService );

	}

	setHintConfig ( config: ToolHintConfig ): void {
		this.hintConfig = config;
	}

	getHintConfig (): ToolHintConfig {
		return this.hintConfig;
	}

	getObjectHint ( objectName: string, action: 'onAdded' | 'onUpdated' | 'onRemoved' | 'onSelected' | 'onUnselected' ): string {
		return this.hintConfig?.objects[ objectName ]?.[ action ];
	}

	setObjectHint ( object: Object, action: 'onAdded' | 'onUpdated' | 'onRemoved' | 'onSelected' | 'onUnselected' ): void {
		this.setHint( this.getObjectHint( object.constructor.name, action ) );
	}

	addController ( key: ConstructorFunction, controller: BaseController<Object> ): void {
		this.handlers.addController( key, controller );
	}

	getControllers (): Map<ConstructorFunction, BaseController<Object>> {
		return this.handlers.getControllers();
	}

	getDragHandlers (): Map<Function, BaseDragHandler<Object>> {
		return this.handlers.getDragHandlers();
	}

	getControllerByObject ( object: object ): BaseController<Object> {
		return this.handlers.getControllerByObject( object );
	}

	getControllerCount (): number {
		return this.handlers.getControllerCount();
	}

	addVisualizer ( key: ConstructorFunction, visualizer: Visualizer<Object> ): void {
		this.handlers.addVisualizer( key, visualizer );
	}

	addDragHandler ( key: ConstructorFunction, dragHandler: BaseDragHandler<Object> ): void {
		this.handlers.addDragHandler( key, dragHandler );
	}

	updateVisuals ( object: any ): void {
		this.handlers.updateVisuals( object );
	}

	addSelectionStrategy ( key: ConstructorFunction, strategy: SelectionStrategy<T> ): void {
		this.selectionService.registerStrategy( key, strategy );
	}

	init (): void {

		this.setHint( this.hintConfig?.toolOpened );

	}

	enable (): void {

		this.subscribeToEvents();

		this.dataService?.all().forEach( object => {

			this.debugService?.setDebugState( object, DebugState.DEFAULT );

		} );

		this.debugService?.enable();

		this.handlers.enable();

	}

	disable (): void {

		this.dataService?.all().forEach( object => {

			this.debugService?.setDebugState( object, DebugState.REMOVED );

		} );

		this.handlers.disable()

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

	onDeleteKeyDown (): void {

		const lastSelectedObject = this.selectionService.getLastSelectedObject();

		if ( lastSelectedObject ) {

			this.executeRemoveObject( lastSelectedObject );

		} else if ( this.currentSelectedPoint ) {

			this.executeRemoveObject( this.currentSelectedPoint );

		} else if ( this.currentSelectedObject ) {

			this.executeRemoveObject( this.currentSelectedObject );

		}

	}

	onDuplicateKeyDown () {
	}

	onObjectSelected ( object: T ): void {

		if ( this.hasHandlersForObject( object ) ) {

			this.handleSelectionWithHandlers( object );

			return;

		}

		if ( object.constructor.name === this.typeName ) {

			this.debugService.setDebugState( object, DebugState.SELECTED );

			this.onShowInspector( object );

		} else if ( object instanceof SimpleControlPoint ) {

			object.select();

			this.onShowInspector( object.mainObject, object );

			this.debugService.setDebugState( object.mainObject, DebugState.SELECTED );
		}

	}

	onObjectUnselected ( object: T ): void {

		if ( this.hasHandlersForObject( object ) ) {

			this.handleDeselection( object );

			return;

		}

		if ( object.constructor.name === this.typeName ) {

			this.debugService.setDebugState( object, DebugState.DEFAULT );

			AppInspector.clear();

		} else if ( object instanceof SimpleControlPoint ) {

			object.unselect();

			AppInspector.clear();

			this.debugService.setDebugState( object.mainObject, DebugState.DEFAULT );

		}

	}

	onObjectAdded ( object: T ): void {

		if ( object.constructor.name === this.typeName ) {

			this.dataService.add( object );

			this.debugService.setDebugState( object, DebugState.SELECTED );

		} else if ( object instanceof SimpleControlPoint ) {

			this.dataService.addPoint( object.mainObject, object );

			this.debugService.setDebugState( object.mainObject, DebugState.SELECTED );

		}

	}

	onObjectUpdated ( object: T ) {

		if ( object.constructor.name === this.typeName ) {

			this.dataService.update( object );

			this.debugService.setDebugState( object, DebugState.SELECTED );

		} else if ( object instanceof SimpleControlPoint ) {

			this.dataService.update( object.mainObject );

			this.debugService.setDebugState( object.mainObject, DebugState.SELECTED );

		}

	}

	onObjectRemoved ( object: T ) {

		if ( object.constructor.name === this.typeName ) {

			this.dataService.remove( object );

			this.debugService.setDebugState( object, DebugState.REMOVED );

			AppInspector.clear();

			this.selectionService?.clearSelection();

		} else if ( object instanceof SimpleControlPoint ) {

			this.dataService.removePoint( object.mainObject, object );

			this.debugService.setDebugState( object.mainObject, DebugState.DEFAULT );

			this.onShowInspector( object.mainObject );

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

		this.handlers.setSelectionService( selectionService );

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

	setHint ( msg: string ) {

		StatusBarService.setHint( msg );

	}

	protected selectObject ( object: Object, previousObject: Object ) {

		Commands.Select( object, previousObject );

	}

	protected unselectObject ( object: Object ) {

		Commands.Unselect( object );

	}

	protected executeAddObject ( object: Object ) {

		Commands.AddObject( object );

	}

	protected executeAddAndSelect ( object: Object, previousObject: Object ): void {

		Commands.AddSelect( object, previousObject );

	}

	protected executeRemoveObject ( object: Object, fireUnselectEvent = false ) {

		Commands.RemoveObject( object, fireUnselectEvent );

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

	protected highlightWithHandlers ( e: PointerEventData ): void {

		this.handlers.handleHighlight( e );

	}


	protected handleSelectionWithHandlers ( object: Object ): void {
		this.handlers.handleSelection( object );
	}

	hasHandlersForObject ( object: any ): boolean {
		return this.handlers.hasHandlersForObject( object );
	}

	hasHandlerForKey ( key: ConstructorFunction ): boolean {
		return this.handlers.hasHandlersForKey( key );
	}

	hasSelectorForKey ( key: ConstructorFunction ): boolean {
		return this.selectionService.hasSelectorByKey( key );
	}

	protected handleDeselection ( ...objects: any ): void {

		objects.forEach( item => {

			this.handlers.handleDeselection( item );

			this.setObjectHint( item, 'onUnselected' );

			this.selectionService.removeFromSelected( item );

		} );

	}

	protected handleAction ( object: Object, action: 'onAdded' | 'onRemoved' ): void {
		this.handlers.handleAction( object, action );
	}

	public getSelectionService (): SelectionService {
		return this.selectionService;
	}

	public getSelectedObjects (): any[] {
		return this.selectionService.getSelectedObjects();
	}

	public getSelectObjectByName<T> ( key: ConstructorFunction ): T {
		return this.selectionService.findSelectedObject<T>( key );
	}

	public getSelectedObjectCount (): number {
		return this.selectionService.getSelectedObjectCount();
	}

	protected enableControls (): void {
		ViewControllerService.instance?.enableControls();
	}

	protected disableControls (): void {
		ViewControllerService.instance?.disableControls();
	}
}
