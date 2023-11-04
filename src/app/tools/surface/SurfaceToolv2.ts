import { PointerEventData } from 'app/events/pointer-event-data';
import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';
import { CommandHistory } from 'app/services/command-history';
import { SelectObjectCommandv2, UnselectObjectCommandv2 } from '../../commands/select-point-command';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { SurfaceToolService } from './surface-tool.service';
import { MapEvents } from 'app/events/map-events';
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';

export class SurfaceToolv2 extends BaseTool {

	name: string;

	toolType: ToolType = ToolType.Surface;

	selectedSurface: TvSurface;

	selectedControlPoint: AbstractControlPoint;

	constructor ( private surfaceToolService: SurfaceToolService ) {

		super();

	}

	init (): void {
	}

	enable (): void {

		super.enable();

		this.surfaceToolService.showSurfaceHelpers();

	}

	disable (): void {

		super.disable();

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( this.selectedSurface ) {

			// CommandHistory.execute( new AddSurfacePointCommand( this, this.surface, e.point ) );
			// this.surface.addControlPoint( e.point );
			this.surfaceToolService.addControlPoint( this.selectedSurface, e.point );

			MapEvents.objectSelected.emit( this.selectedSurface );

		} else {

			const surface = this.surfaceToolService.createSurface( e.point );

			MapEvents.objectAdded.emit( surface );

			MapEvents.objectSelected.emit( this.selectedSurface );

		}

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		const point = this.surfaceToolService.pointStrategy.onPointerDown( e );
		const surface = this.surfaceToolService.nodeStrategy.onPointerDown( e );

		// If a point is selected, select this point and return immediately.
		if ( point && point !== this.selectedControlPoint ) {
			CommandHistory.execute( new SelectObjectCommandv2( point, this.selectedControlPoint ) );
			return;
		}

		// If a node is selected, select this node and return immediately.
		if ( surface && surface !== this.selectedSurface ) {
			CommandHistory.execute( new SelectObjectCommandv2( surface, this.selectedSurface ) );
			return;
		}

		// If nothing is found, and there's a previously selected point, node, or road, unselect it.
		if ( !point && !surface ) {
			if ( this.selectedControlPoint ) {
				CommandHistory.execute( new SelectObjectCommandv2( null, this.selectedControlPoint ) );
			} else if ( this.selectedSurface ) {
				CommandHistory.execute( new UnselectObjectCommandv2( this.selectedSurface ) );
			}
		}

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof TvSurface ) {

			this.onSurfaceSelected( object );

		} else if ( object instanceof AbstractControlPoint ) {

			this.selectedControlPoint = object;

		}

	}

	onSurfaceSelected ( object: TvSurface ) {

		if ( this.selectedSurface ) this.onSufaceUnselected( this.selectedSurface );

		this.selectedSurface = object;

		this.surfaceToolService.show( object );

	}

	onSufaceUnselected ( object: TvSurface ) {

		this.surfaceToolService.hide( object );

		this.selectedSurface = null;

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof TvSurface ) {

			this.onSufaceUnselected( object );

		} else if ( object instanceof AbstractControlPoint ) {

			this.onControlPointUnselected( object );

		}

	}

	onControlPointUnselected ( object: AbstractControlPoint ) {

		this.selectedControlPoint = null;

	}

	onControlPointSelected ( controlPoint: AbstractControlPoint ): void {

		this.selectedControlPoint?.unselect();

		this.selectedControlPoint = controlPoint;

		this.selectedControlPoint.select();

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvSurface ) {

			this.selectedSurface = object;

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvSurface ) {

			this.selectedSurface = null;

		}

	}
}
