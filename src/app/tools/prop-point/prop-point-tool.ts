/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AssetDatabase } from 'app/core/asset/asset-database';
import { DynamicControlPoint } from 'app/modules/three-js/objects/dynamic-control-point';
import { CommandHistory } from 'app/services/command-history';
import { PropManager } from 'app/managers/prop-manager';
import { SnackBar } from 'app/services/snack-bar.service';
import { PropInstance } from '../../core/models/prop-instance.model';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { AddObjectCommand, IToolWithPoint, SelectObjectCommandv2, SelectPointCommand } from 'app/commands/select-point-command';
import { ISelectable } from 'app/modules/three-js/objects/i-selectable';
import { PointerEventData } from 'app/events/pointer-event-data';
import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { CopyPositionCommand, UpdatePositionCommand } from 'app/commands/copy-position-command';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { Object3D } from 'three';
import { FreeMovingStrategy } from "../../core/snapping/move-strategies/free-moving-strategy";
import { AnyLaneMovingStrategy } from "app/core/snapping/move-strategies/any-lane.moving.strategy";
import { TvContactPoint } from 'app/modules/tv-map/models/tv-common';
import { PropPointService } from './prop-point.service';
import { AppInspector } from 'app/core/inspector';

export class PropPointTool extends BaseTool {

	public name: string = 'PropPointTool';

	public toolType = ToolType.PropPoint;

	private selectedPoint: DynamicControlPoint<PropInstance>;

	private selectedProp: PropInstance;

	private debug: boolean;

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

		this.tool.base.init();
		this.tool.base.addSelectionStrategy( new ControlPointStrategy() );
		this.tool.base.addMovingStrategy( new FreeMovingStrategy() );
		this.tool.base.addMovingStrategy( new AnyLaneMovingStrategy( TvContactPoint.END ) );

		this.tool.base.setHint( 'Use LEFT CLICK to select control point or use SHIFT + LEFT CLICK to create control point' );

	}

	enable (): void {

		super.enable();

		this.tool.addAllPropPoints();

	}

	disable (): void {

		super.disable();

		this.tool.removeAllPropPoints();

	}

	setPoint ( value: ISelectable ): void {

		this.selectedPoint = value as DynamicControlPoint<PropInstance>;

	}

	getPoint (): ISelectable {

		return this.selectedPoint;

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.tool.base.select( e );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( !this.prop ) SnackBar.warn( 'Select a prop from the project browser' );

		if ( !this.prop ) this.tool.base.setHint( 'Select a prop from the project browser' );

		if ( !this.prop ) return;

		const prop = this.tool.createPropPoint( this.prop, e.point );

		const addCommand = new AddObjectCommand( prop );

		const selectCommand = new SelectObjectCommandv2( prop, this.selectedProp );

		CommandHistory.executeMany( addCommand, selectCommand )

		this.tool.base.setHint( 'Add more control points or drag control points to modify' );

	}

	onPointerMoved ( e: PointerEventData ): void {

		this.tool.base.highlight( e );

		if ( !this.selectedProp ) return;

		if ( !this.selectedPoint ) return;

		if ( !this.pointerDownAt ) return;

		const position = this.tool.base.move( e );

		this.selectedPoint.copyPosition( position.position );

		this.selectedProp.copyPosition( position.position );

	}

	onPointerUp ( e: PointerEventData ): void {

		if ( !this.selectedPoint?.isSelected ) return;

		if ( !this.pointerDownAt ) return;

		const position = this.tool.base.move( e );

		if ( position.position.distanceTo( this.pointerDownAt ) < 0.5 ) return;

		CommandHistory.executeMany(

			new UpdatePositionCommand( this.selectedProp, position.position, this.pointerDownAt ),

			new CopyPositionCommand( this.selectedPoint, position.position, this.pointerDownAt )

		);

		this.tool.base.setHint( 'Use Inspector to modify prop properties' );
	}

	onObjectSelected ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectSelected', object );

		if ( object instanceof PropInstance ) {

			this.selectedProp = object;

			AppInspector.setInspector( DynamicInspectorComponent, object );

			this.tool.base.setHint( 'Drag control point using LEFT CLICK is down' );

		} else if ( object instanceof DynamicControlPoint ) {

			this.selectedPoint = object;

			this.selectedProp = object.mainObject;

			AppInspector.setInspector( DynamicInspectorComponent, object.mainObject );

			this.tool.base.setHint( 'Drag control point using LEFT CLICK is down' );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectUnselected', object );

		if ( object instanceof PropInstance ) {

			this.selectedProp = null;

			AppInspector.setInspector( null, null );

		} else if ( object instanceof DynamicControlPoint ) {

			this.selectedProp = null;

			this.selectedPoint = null;

			AppInspector.setInspector( null, null );

		}

	}

	onObjectAdded ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectAdded', object );

		if ( object instanceof PropInstance ) {

			this.tool.addPropPoint( object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectRemoved', object );

		if ( object instanceof PropInstance ) {

			this.tool.removePropPoint( object )

		}

	}

}
