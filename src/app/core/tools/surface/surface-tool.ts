/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData, PointerMoveData } from 'app/events/pointer-event-data';
import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';
import { CommandHistory } from 'app/services/command-history';
import { DynamicControlPoint } from '../../../modules/three-js/objects/dynamic-control-point';
import { KeyboardInput } from '../../input';
import { ToolType } from '../../models/tool-types.enum';
import { PickingHelper } from '../../services/picking-helper.service';
import { BaseTool } from '../base-tool';
import { AddSurfacePointCommand } from './add-surface-point-command';
import { CreateSurfaceCommand } from './create-surface-command';
import { SelectSurfaceCommand } from './select-surface-command';
import { SelectSurfacePointCommand } from './select-surface-point-command';
import { UnselectSurfaceCommand } from './unselect-surface-command';
import { UpdateSurfacePointCommand } from './update-surface-point-command';

export class SurfaceTool extends BaseTool {

	public name: string = 'SurfaceTool';
	public toolType = ToolType.Surface;

	public point: DynamicControlPoint<TvSurface>;
	public _surface: TvSurface;
	private pointUpdated: boolean;

	public get surface (): TvSurface {
		return this._surface;
	}

	public set surface ( value: TvSurface ) {
		this._surface = value;
	}

	constructor () {

		super();

	}

	public init () {

		super.init();

	}

	public enable () {

		super.enable();

		this.map.showSurfaceHelpers();
	}

	public disable (): void {

		super.disable();

		this.map.hideSurfaceHelpers();

	}

	public onPointerDown ( e: PointerEventData ) {

		if ( !e.point || e.button != MouseButton.LEFT ) return;

		if ( KeyboardInput.isShiftKeyDown ) {

			if ( this.surface ) {

				CommandHistory.execute( new AddSurfacePointCommand( this, this.surface, e.point ) );

			} else {

				CommandHistory.execute( new CreateSurfaceCommand( this, e.point ) );
			}

		} else {

			if ( this.controlPointIsSelected( e ) ) return;

			if ( this.surfaceIsSelected( e ) ) return;

			if ( this.surface || this.point ) {

				CommandHistory.execute( new UnselectSurfaceCommand( this ) );

			}
		}
	}

	public onPointerMoved ( e: PointerMoveData ) {

		if ( e.point && this.isPointerDown && this.point && this.point.isSelected ) {

			this.point.copyPosition( e.point );

			this.point.mainObject.spline.update();

			this.pointUpdated = true;

		}

	}

	public onPointerUp ( e: PointerEventData ) {

		if ( this.point && this.point.isSelected && this.pointUpdated ) {

			const oldPosition = this.pointerDownAt;
			const newPosition = this.point.position;

			CommandHistory.execute( new UpdateSurfacePointCommand( this.point, newPosition, oldPosition ) );

		}

		this.pointUpdated = false;

	}


	surfaceIsSelected ( e: PointerEventData ) {

		const results = PickingHelper.findAllByTag( TvSurface.tag, e, this.map.gameObject.children, false );

		if ( results.length == 0 ) return false;

		const surface = results[ 0 ].userData.surface as TvSurface;

		if ( !this.surface || this.surface.mesh.id !== surface.mesh.id ) {

			CommandHistory.execute( new SelectSurfaceCommand( this, surface ) );

		}

		return true;

	}

	controlPointIsSelected ( e: PointerEventData ) {

		// const points = this.map.surfaces.flatMap(s => s.spline.controlPoints);
		const points = this.map.surfaces.reduce( ( acc, s ) => acc.concat( s.spline.controlPoints ), [] );

		const point = PickingHelper.findByObjectType( 'Points', e, points, true );

		if ( !point ) return false;

		if ( !this.point || this.point.uuid !== point.uuid ) {

			CommandHistory.execute( new SelectSurfacePointCommand( this, point as DynamicControlPoint<TvSurface> ) );

		}

		return true;

	}

}
