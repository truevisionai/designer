import { PointerEventData } from 'app/events/pointer-event-data';
import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { SurfaceToolService } from './surface-tool.service';
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';
import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { FreeMovingStrategy } from 'app/core/snapping/move-strategies/free-moving-strategy';
import { WorldPosition } from 'app/modules/scenario/models/positions/tv-world-position';
import { ObjectUserDataStrategy } from 'app/core/snapping/select-strategies/object-tag-strategy';
import { Vector3 } from 'three';
import { AppInspector } from 'app/core/inspector';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { UpdatePositionCommand } from 'app/commands/copy-position-command';
import { CommandHistory } from 'app/services/command-history';
import { DynamicControlPoint } from 'app/modules/three-js/objects/dynamic-control-point';
import { AddObjectCommand } from "../../commands/add-object-command";
import { SelectObjectCommand } from "../../commands/select-object-command";

export class SurfaceTool extends BaseTool {

	name: string = 'Surface Tool';

	toolType: ToolType = ToolType.Surface;

	get selectedSurface (): TvSurface {
		return this.tool.selection.getLastSelected<TvSurface>( TvSurface.name );
	}

	get selectedControlPoint (): DynamicControlPoint<TvSurface> {
		return this.tool.selection.getLastSelected<DynamicControlPoint<TvSurface>>( DynamicControlPoint.name );
	}

	controlPointMoved: boolean;

	constructor ( private tool: SurfaceToolService ) {

		super();

	}

	init (): void {

		this.tool.base.init();

		this.tool.selection.registerStrategy( DynamicControlPoint.name, new ControlPointStrategy() );

		this.tool.selection.registerStrategy( TvSurface.name, new ObjectUserDataStrategy( TvSurface.tag, 'surface' ) );

		this.tool.base.addMovingStrategy( new FreeMovingStrategy() );

	}

	enable (): void {

		super.enable();

		this.tool.showSurfaceHelpers();

	}

	disable (): void {

		super.disable();

		this.tool.hideSurfaceHelpers();

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

		if ( this.selectedSurface && this.selectedControlPoint ) {

			this.executeRemoveObject( this.selectedControlPoint );

		} else if ( this.selectedSurface ) {

			this.executeRemoveObject( this.selectedSurface );

		}

	}

	addConrolPoint ( position: Vector3 ) {

		const point = this.tool.createControlPoint( this.selectedSurface, position );

		const addCommand = new AddObjectCommand( point );

		const selectCommand = new SelectObjectCommand( point, this.selectedControlPoint );

		CommandHistory.executeMany( addCommand, selectCommand );

	}

	createSurface ( position: Vector3 ) {

		const surface = this.tool.createSurface( position );

		const point = this.tool.createControlPoint( surface, position );

		surface.addControlPoint( point );

		const addSurfaceCommand = new AddObjectCommand( surface );

		const selectCommand = new SelectObjectCommand( surface, this.selectedSurface );

		CommandHistory.executeMany( addSurfaceCommand, selectCommand );

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof TvSurface ) {

			this.onSurfaceSelected( object );

		} else if ( object instanceof AbstractControlPoint ) {

			this.onControlPointSelected( object );

		}

	}

	onSurfaceSelected ( object: TvSurface ) {

		if ( this.selectedSurface ) this.onSufaceUnselected( this.selectedSurface );

		this.tool.showSurface( object );

		AppInspector.setInspector( DynamicInspectorComponent, object );

	}

	onSufaceUnselected ( object: TvSurface ) {

		this.tool.hideSurface( object );

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

	}

	onControlPointSelected ( controlPoint: AbstractControlPoint ): void {

		if ( this.selectedControlPoint ) this.onControlPointUnselected( this.selectedControlPoint );

		controlPoint.select();

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvSurface ) {

			this.tool.addSurface( object );

		} else if ( object instanceof AbstractControlPoint ) {

			this.tool.addControlPoint( this.selectedSurface, object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvSurface ) {

			this.tool.removeSurface( object );

			this.onSufaceUnselected( object );

		} else if ( object instanceof AbstractControlPoint ) {

			this.tool.removeControlPoint( this.selectedSurface, object );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof TvSurface ) {

			object.update();

		} else if ( object instanceof AbstractControlPoint ) {

			// this.tool.updateControlPoint( object );
			if ( this.selectedSurface ) {

				this.selectedSurface.update();

			}

		}

	}
}
