/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AssetDatabase } from 'app/core/asset/asset-database';
import { DynamicControlPoint } from 'app/objects/dynamic-control-point';
import { CommandHistory } from 'app/services/command-history';
import { PropManager } from 'app/managers/prop-manager';
import { SnackBar } from 'app/services/snack-bar.service';
import { PropInstance } from '../../core/models/prop-instance.model';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { PointerEventData } from 'app/events/pointer-event-data';
import { ControlPointStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';
import { UpdatePositionCommand } from 'app/commands/copy-position-command';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { Object3D, Vector3 } from 'three';
import { FreeMovingStrategy } from "../../core/strategies/move-strategies/free-moving-strategy";
import { AnyLaneMovingStrategy } from "app/core/strategies/move-strategies/any-lane.moving.strategy";
import { TvContactPoint } from 'app/map/models/tv-common';
import { PropPointService } from './prop-point.service';
import { AppInspector } from 'app/core/inspector';
import { AddObjectCommand } from "../../commands/add-object-command";
import { SelectObjectCommand } from "../../commands/select-object-command";

export class PropPointTool extends BaseTool {

	public name: string = 'PropPointTool';

	public toolType = ToolType.PropPoint;

	private propMoved: boolean;

	get selectedProp (): PropInstance {
		return this.tool.selection.getLastSelected<PropInstance>( PropInstance.name );
	}

	get selectedPoint (): DynamicControlPoint<PropInstance> {
		return this.selectedProp ? this.tool.getPoint( this.selectedProp ) : null;
	}

	private debug: boolean = true;

	constructor ( private tool: PropPointService ) {

		super();

	}

	get prop (): PropInstance {

		const prop = PropManager.getProp();

		if ( prop ) {

			const object = AssetDatabase.getInstance<Object3D>( prop.guid );

			return new PropInstance( prop.guid, object.clone() );

		}

	}

	init (): void {

		this.tool.base.reset();

		this.tool.selection.reset();

		this.tool.selection.registerStrategy( PropInstance.name, new ControlPointStrategy( {
			higlightOnHover: true,
			higlightOnSelect: false,
			returnTarget: true
		} ) );

		this.tool.base.addMovingStrategy( new FreeMovingStrategy() );

		this.tool.base.addMovingStrategy( new AnyLaneMovingStrategy( TvContactPoint.END ) );

		this.tool.base.setHint( 'use SHIFT + LEFT CLICK to create control point' );

	}

	enable (): void {

		super.enable();

		this.tool.showAll();

	}

	disable (): void {

		super.disable();

		this.tool.base.reset();

		this.tool.removeAll();

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.tool.selection.handleSelection( e );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( !this.prop ) this.tool.base.setWarning( 'Select a prop from the project browser' );

		if ( !this.prop ) this.tool.base.setHint( 'Select a prop from the project browser' );

		if ( !this.prop ) return;

		const prop = this.createPropInstance( this.prop, e.point );

		const addCommand = new AddObjectCommand( prop );

		const selectCommand = new SelectObjectCommand( prop, this.selectedProp );

		CommandHistory.executeMany( addCommand, selectCommand );

		this.tool.base.setHint( 'Add more control points or drag control points to modify' );

	}

	createPropInstance ( prop: PropInstance, point: Vector3 ) {

		return this.tool.createPropInstance( prop, point );

	}

	onPointerMoved ( e: PointerEventData ): void {

		this.tool.base.highlight( e );

		if ( !this.selectedPoint ) return;

		if ( !this.selectedPoint.isSelected ) return;

		if ( !this.pointerDownAt ) return;

		const position = this.tool.base.move( e );

		this.selectedProp.copyPosition( position.position );

		this.tool.updatePropInstance( this.selectedProp );

		this.selectedPoint.mainObject.copyPosition( position.position );

		this.propMoved = true;
	}

	onPointerUp ( e: PointerEventData ): void {

		if ( !this.propMoved ) return;

		if ( !this.selectedProp ) return;

		if ( !this.pointerDownAt ) return;

		const position = this.tool.base.move( e );

		if ( position.position.distanceTo( this.pointerDownAt ) < 0.5 ) return;

		const updateCommand = new UpdatePositionCommand( this.selectedProp, position.position, this.pointerDownAt );

		CommandHistory.executeMany( updateCommand );

		this.propMoved = false;

		this.tool.base.setHint( 'Use Inspector to modify prop properties' );
	}

	onObjectSelected ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectSelected', object );

		if ( object instanceof DynamicControlPoint ) {

			this.onPropSelected( object.mainObject );

		} else if ( object instanceof PropInstance ) {

			this.onPropSelected( object );

		}

	}

	onPropSelected ( prop: PropInstance ): void {

		if ( this.selectedProp ) this.onPropUnselected( this.selectedProp );

		this.tool.getPoint( prop )?.select();

		AppInspector.setInspector( DynamicInspectorComponent, prop );

		this.tool.base.setHint( 'Drag control point using LEFT CLICK is down' );

	}

	onObjectUnselected ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectUnselected', object );

		if ( object instanceof DynamicControlPoint ) {

			this.onPropUnselected( object.mainObject );

		} else if ( object instanceof PropInstance ) {

			this.onPropUnselected( object );

		}

	}

	onPropUnselected ( prop: PropInstance ): void {

		this.tool.getPoint( prop )?.unselect();

		AppInspector.setInspector( null, null );

	}

	onObjectAdded ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectAdded', object );

		if ( object instanceof PropInstance ) {

			this.tool.addPropInstance( object );

			const point = this.tool.createControlPoint( object, object.getPosition() );

			this.tool.addPoint( point );

		} else if ( object instanceof DynamicControlPoint ) {

			this.tool.addPropInstance( object.mainObject );

			this.tool.addPoint( object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectRemoved', object );

		if ( object instanceof PropInstance ) {

			this.tool.removePropInstance( object );

		} else if ( object instanceof DynamicControlPoint ) {

			this.tool.removePropInstance( object.mainObject );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectUpdated', object );

		if ( object instanceof DynamicControlPoint ) {

			this.tool.updatePropInstance( object.mainObject );

		} else if ( object instanceof PropInstance ) {

			this.tool.updatePropInstance( object );

		}

	}

}
