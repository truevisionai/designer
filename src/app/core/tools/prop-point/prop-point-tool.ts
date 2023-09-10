/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AssetDatabase } from 'app/core/asset/asset-database';
import { DynamicControlPoint } from 'app/modules/three-js/objects/dynamic-control-point';
import { CommandHistory } from 'app/services/command-history';
import { PropManager } from 'app/services/prop-manager';
import { SnackBar } from 'app/services/snack-bar.service';
import { PropInstance } from '../../models/prop-instance.model';
import { ToolType } from '../../models/tool-types.enum';
import { BaseTool } from '../base-tool';
import { CreatePropPointCommand } from './create-prop-point-command';
import { SceneService } from 'app/core/services/scene.service';
import { IToolWithPoint, SelectPointCommand } from 'app/core/commands/select-point-command';
import { ISelectable } from 'app/modules/three-js/objects/i-selectable';
import { PointerEventData } from 'app/events/pointer-event-data';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { CopyPositionCommand, UpdatePositionCommand } from 'app/modules/three-js/commands/copy-position-command';
import { MovePointStrategy } from 'app/core/snapping/move-strategies/move-strategy';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { Subscription } from 'rxjs';
import { Object3D } from 'three';

/**
 * Prop point tool
 *
 * Steps
 * 1. Select a prop (fbx, gltf) from library browser
 * 2. SHIFT + LEFT-CLICK to drop it in the scene
 *
 * Requires an instance of prop to be able to drop them in the scene
 *
 *
 */
export class PropPointTool extends BaseTool implements IToolWithPoint {

	public name: string = 'PropPointTool';
	public toolType = ToolType.PropPoint;

	public points: DynamicControlPoint<PropInstance>[] = [];

	private point: DynamicControlPoint<PropInstance>;
	private selectStrategy: SelectStrategy<DynamicControlPoint<PropInstance>>;
	private moveStrategy: MovePointStrategy;
	private subscriptions: Subscription[] = [];

	constructor () {

		super();

		this.selectStrategy = new ControlPointStrategy();

		this.moveStrategy = new MovePointStrategy();

		this.setHint( 'Use LEFT CLICK to select control point or use SHIFT + LEFT CLICK to create control point' );

	}

	get prop (): PropInstance {

		const prop = PropManager.getProp();

		if ( prop ) {

			const object = AssetDatabase.getInstance<Object3D>( prop.guid );

			return new PropInstance( prop.guid, object.clone() );

		}

	}

	init (): void {

		super.init();

	}

	enable (): void {

		super.enable();

		this.clearScene();

		this.map.props.forEach( ( prop: PropInstance ) => {

			const point = new DynamicControlPoint( prop, prop.getPosition().clone() );

			this.points.push( point );

			SceneService.add( point )

			const subscription = prop.updated.subscribe( prop => this.onPropUpdated( point, prop ) );

			this.subscriptions.push( subscription )

		} );

	}

	disable (): void {

		super.disable();

		this.clearScene();

	}

	clearScene (): void {

		this.points.forEach( point => SceneService.remove( point ) );

		this.points = [];

		this.subscriptions.forEach( subscription => subscription.unsubscribe() );

		this.subscriptions = [];

	}

	setPoint ( value: ISelectable ): void {

		this.point = value as DynamicControlPoint<PropInstance>;

	}

	getPoint (): ISelectable {

		return this.point;

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		const point = this.selectStrategy.onPointerDown( e );

		if ( point ) {

			if ( point == this.point ) return;

			const command = new SelectPointCommand( this, point, DynamicInspectorComponent, point.mainObject );

			CommandHistory.execute( command );

			this.setProp( point.mainObject );

			this.setHint( 'Drag control point using LEFT CLICK is down' );

		} else if ( this.point ) {

			CommandHistory.execute( new SelectPointCommand( this, null, null, null ) );

		}

		this.setHint( 'Use LEFT CLICK to select control point or use SHIFT + LEFT CLICK to create control point' );
	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( !this.prop ) SnackBar.warn( 'Select a prop from the project browser' );

		if ( !this.prop ) this.setHint( 'Select a prop from the project browser' );

		if ( !this.prop ) return;

		const point = new DynamicControlPoint( this.prop, e.point );

		CommandHistory.execute( new CreatePropPointCommand( this, this.prop, point ) );

		this.setHint( 'Add more control points or drag control points to modify' );

	}

	onPointerMoved ( e: PointerEventData ): void {

		this.selectStrategy.onPointerMoved( e );

		if ( !this.point?.isSelected ) return;

		if ( !this.pointerDownAt ) return;

		const position = this.moveStrategy.getPosition( e );

		this.point.copyPosition( position )

		this.point.mainObject.copyPosition( position );

	}

	onPointerUp ( e: PointerEventData ): void {

		if ( !this.point?.isSelected ) return;

		if ( !this.pointerDownAt ) return;

		const position = this.moveStrategy.getPosition( e );

		if ( position.distanceTo( this.pointerDownAt ) < 0.5 ) return;

		CommandHistory.executeMany(

			new UpdatePositionCommand( this.point.mainObject, position, this.pointerDownAt ),

			new CopyPositionCommand( this.point, position, this.pointerDownAt )

		);

		this.setHint( 'Use Inspector to modify prop properties' );

	}

	private setProp ( mainObject: PropInstance ) {

		if ( !mainObject ) return;

		const metadata = AssetDatabase.getMetadata( mainObject?.guid );

		if ( metadata ) PropManager.setProp( metadata );

	}

	private onPropUpdated ( point: DynamicControlPoint<PropInstance>, prop: PropInstance ): void {

		point.copyPosition( prop.getPosition() );

	}

}
