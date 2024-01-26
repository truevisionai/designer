/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { TvSurface } from 'app/map/models/tv-surface.model';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { SurfaceToolService } from './surface-tool.service';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { ControlPointStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';
import { FreeMovingStrategy } from 'app/core/strategies/move-strategies/free-moving-strategy';
import { WorldPosition } from 'app/scenario/models/positions/tv-world-position';
import { ObjectUserDataStrategy } from 'app/core/strategies/select-strategies/object-tag-strategy';
import { Vector3 } from 'three';
import { AppInspector } from 'app/core/inspector';
import { UpdatePositionCommand } from 'app/commands/copy-position-command';
import { CommandHistory } from 'app/services/command-history';
import { SimpleControlPoint } from 'app/objects/dynamic-control-point';
import { AddObjectCommand } from "../../commands/add-object-command";
import { SelectObjectCommand } from "../../commands/select-object-command";
import { AssetNode } from 'app/views/editor/project-browser/file-node.model';
import { TvSurfaceInspector } from './surface.inspector';


export class SurfaceTool extends BaseTool {

	name: string = 'Surface Tool';

	toolType: ToolType = ToolType.Surface;

	get selectedSurface (): TvSurface {
		return this.tool.base.selection.getLastSelected<TvSurface>( TvSurface.name );
	}

	get selectedControlPoint (): SimpleControlPoint<TvSurface> {
		return this.tool.base.selection.getLastSelected<SimpleControlPoint<TvSurface>>( SimpleControlPoint.name );
	}

	controlPointMoved: boolean;

	constructor ( private tool: SurfaceToolService ) {

		super();

	}

	init (): void {

		this.tool.base.reset();

		this.tool.base.selection.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );

		this.tool.base.selection.registerStrategy( TvSurface.name, new ObjectUserDataStrategy( TvSurface.tag, 'surface' ) );

		this.tool.base.addMovingStrategy( new FreeMovingStrategy() );

	}

	enable (): void {

		super.enable();

		this.tool.onToolEnabled();

	}

	disable (): void {

		super.disable();

		this.tool.base.reset();

		this.tool.onToolDisabled();

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		this.tool.base.handleMovement( e, ( position ) => {

			if ( position instanceof WorldPosition ) {

				if ( !this.selectedSurface ) {

					this.createSurface( position.position );

				} else {

					this.addConrolPoint( position.position );

				}

			}

		} );

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.tool.selection.handleSelection( e );

	}

	onPointerMoved ( pointerEventData: PointerEventData ): void {

		this.tool.base.highlight( pointerEventData );

		if ( !this.isPointerDown ) return;

		if ( !this.selectedSurface ) return;

		if ( !this.selectedControlPoint ) return;

		if ( !this.selectedControlPoint.isSelected ) return;

		this.tool.base.handleMovement( pointerEventData, ( position ) => {

			if ( position instanceof WorldPosition ) {

				this.selectedControlPoint.copyPosition( position.position );

				this.selectedSurface.spline.update();

			}

		} );

		this.controlPointMoved = true;

	}

	onPointerUp ( pointerEventData: PointerEventData ): void {

		if ( !this.controlPointMoved ) return;

		if ( !this.selectedControlPoint ) return;

		if ( !this.selectedControlPoint.isSelected ) return;

		const oldPosition = this.pointerDownAt.clone();

		const newPosition = this.selectedControlPoint.position.clone();

		const updateCommand = new UpdatePositionCommand( this.selectedControlPoint, newPosition, oldPosition );

		CommandHistory.execute( updateCommand );

		this.controlPointMoved = false;

	}

	onDeleteKeyDown (): void {

		// if ( this.selectedSurface && this.selectedControlPoint ) {

		// 	this.executeRemoveObject( this.selectedControlPoint );

		// } else if ( this.selectedSurface ) {

		// 	this.executeRemoveObject( this.selectedSurface );

		// }

	}

	addConrolPoint ( position: Vector3 ) {

		const point = this.tool.createControlPoint( this.selectedSurface, position );

		const addCommand = new AddObjectCommand( point );

		const selectCommand = new SelectObjectCommand( point, this.selectedControlPoint );

		CommandHistory.executeMany( addCommand, selectCommand );

	}

	createSurface ( position: Vector3 ) {

		const surface = this.tool.createSurface( 'grass', position );

		const point = this.tool.createControlPoint( surface, position );

		surface.addControlPoint( point );

		const addSurfaceCommand = new AddObjectCommand( surface );

		const selectCommand = new SelectObjectCommand( surface, this.selectedSurface );

		CommandHistory.executeMany( addSurfaceCommand, selectCommand );

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof TvSurface ) {

			this.onSurfaceSelected( object );

		} else if ( object instanceof SimpleControlPoint ) {

			this.onControlPointSelected( object );

		}

	}

	onSurfaceSelected ( object: TvSurface ) {

		this.tool.onSelect( object );

		this.showInspector( object );

	}

	showInspector ( surface: TvSurface, controlPoint?: AbstractControlPoint ): void {

		const mesh = this.tool.getSurfaceMesh( surface );

		AppInspector.setDynamicInspector( new TvSurfaceInspector( surface, mesh, this.tool, controlPoint ) );

	}

	onSufaceUnselected ( object: TvSurface ) {

		this.tool.onUnselect( object );

		AppInspector.clear();

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof TvSurface ) {

			this.onSufaceUnselected( object );

		} else if ( object instanceof AbstractControlPoint ) {

			this.onControlPointUnselected( object );

		}

	}

	onControlPointUnselected ( controlPoint: AbstractControlPoint ) {

		controlPoint.unselect();

		this.showInspector( controlPoint.mainObject );

	}

	onControlPointSelected ( controlPoint: SimpleControlPoint<TvSurface> ): void {

		controlPoint.select();

		this.showInspector( controlPoint.mainObject, controlPoint );

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvSurface ) {

			this.tool.addSurface( object );

			this.onSurfaceSelected( object );

		} else if ( object instanceof AbstractControlPoint ) {

			this.tool.addControlPoint( this.selectedSurface, object );

		}

	}

	onAssetDropped ( asset: AssetNode, position: Vector3 ): void {

		const surface = this.tool.createFromAsset( asset, position );

		if ( !surface ) return;

		this.executeAddObject( surface );

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvSurface ) {

			this.tool.removeSurface( object );

			AppInspector.clear();

		} else if ( object instanceof SimpleControlPoint ) {

			this.tool.removeControlPoint( this.selectedSurface, object );

			this.showInspector( object.mainObject );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof TvSurface ) {

			this.tool.updateSurface( object );

		} else if ( object instanceof SimpleControlPoint ) {

			this.onObjectUpdated( object.mainObject );

		} else if ( object instanceof TvSurfaceInspector ) {

			this.tool.updateSurface( object.surface );

		}

	}
}

