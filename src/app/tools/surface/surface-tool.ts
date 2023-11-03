/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData, PointerMoveData } from 'app/events/pointer-event-data';
import { ISelectable } from 'app/modules/three-js/objects/i-selectable';
import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';
import { CommandHistory } from 'app/services/command-history';
import { DynamicControlPoint } from '../../modules/three-js/objects/dynamic-control-point';
import { IToolWithMainObject, IToolWithPoint, SelectMainObjectCommand, SelectPointCommand } from '../../commands/select-point-command';
import { KeyboardEvents } from '../../events/keyboard-events';
import { ToolType } from '../tool-types.enum';
import { PickingHelper } from '../../services/picking-helper.service';
import { BaseTool } from '../base-tool';
import { AddSurfacePointCommand } from './add-surface-point-command';
import { CreateSurfaceCommand } from './create-surface-command';
import { SelectSurfaceCommand } from './select-surface-command';
import { SelectSurfacePointCommand } from './select-surface-point-command';
import { UnselectSurfaceCommand } from './unselect-surface-command';
import { UpdateSurfacePointCommand } from './update-surface-point-command';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { ObjectUserDataStrategy } from 'app/core/snapping/select-strategies/object-tag-strategy';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { UpdatePositionCommand } from 'app/commands/copy-position-command';

export class SurfaceTool extends BaseTool implements IToolWithPoint, IToolWithMainObject {

	public name: string = 'SurfaceTool';

	public toolType = ToolType.Surface;

	public surface: TvSurface;

	public point: DynamicControlPoint<TvSurface>;

	private pointUpdated: boolean;

	private selectStrategy: SelectStrategy<TvSurface>;

	private pointStrategy: SelectStrategy<DynamicControlPoint<TvSurface>>;

	constructor () {

		super();

		this.selectStrategy = new ObjectUserDataStrategy( TvSurface.tag, 'surface' );

		this.pointStrategy = new ControlPointStrategy();
	}

	setMainObject ( value: ISelectable ): void {

		this.surface = value as TvSurface;

	}

	getMainObject (): ISelectable {

		return this.surface;

	}

	setPoint ( value: ISelectable ): void {

		this.point = value as any;

	}

	getPoint (): ISelectable {

		return this.point;

	}

	public init () {

		super.init();

	}

	public enable () {

		super.enable();

		this.map.showSurfaceHelpers();

        this.roadService.showAllCornerPoints();
	}

	public disable (): void {

		super.disable();

		this.map.hideSurfaceHelpers();

        this.roadService.hideAllCornerPoints();

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( this.surface ) {

			CommandHistory.execute( new AddSurfacePointCommand( this, this.surface, e.point ) );

		} else {

			CommandHistory.execute( new CreateSurfaceCommand( this, e.point ) );
		}

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		const point = this.pointStrategy.onPointerDown( e );

		if ( point ) {

			if ( !this.point || this.point.uuid !== point.uuid ) {

				CommandHistory.execute( new SelectPointCommand( this, point, DynamicInspectorComponent, point.mainObject ) );

			}

			return;
		}

		const surface = this.selectStrategy.onPointerDown( e );

		if ( surface ) {

			if ( !this.surface || this.surface.id !== surface.id ) {

				const command = new SelectMainObjectCommand( this, surface, DynamicInspectorComponent, surface );

				CommandHistory.execute( command );

			}

			return;

		}

		CommandHistory.execute( new UnselectSurfaceCommand( this ) );

	}

	public onPointerMoved ( e: PointerEventData ) {

		this.pointStrategy.onPointerMoved( e );

		if ( this.isPointerDown && this.point && this.point.isSelected ) {

			this.point.copyPosition( e.point );

			this.point.mainObject.spline.update();

			this.pointUpdated = true;

		}

	}

	public onPointerUp ( e: PointerEventData ) {

		// const point = this.pointStrategy.onPointerMoved( e );

		if ( this.point?.position && this.point.isSelected && this.pointUpdated && this.pointerDownAt ) {

			const oldPosition = this.pointerDownAt.clone();
			const newPosition = this.point.position.clone();

			CommandHistory.execute( new UpdatePositionCommand( this.point, newPosition, oldPosition ) );

		}

		this.pointUpdated = false;

	}


	// surfaceIsSelected ( e: PointerEventData ) {

	// 	const results = PickingHelper.findAllByTag( TvSurface.tag, e, this.map.gameObject.children, false );

	// 	if ( results.length == 0 ) return false;

	// 	const surface = results[ 0 ].userData.surface as TvSurface;

	// 	if ( !this.surface || this.surface.mesh.id !== surface.mesh.id ) {

	// 		CommandHistory.execute( new SelectSurfaceCommand( this, surface ) );

	// 	}

	// 	return true;

	// }

	// controlPointIsSelected ( e: PointerEventData ) {

	// 	// const points = this.map.surfaces.flatMap(s => s.spline.controlPoints);
	// 	const points = this.map.surfaces.reduce( ( acc, s ) => acc.concat( s.spline.controlPoints ), [] );

	// 	const point = PickingHelper.findByObjectType( 'Points', e, points, true );

	// 	if ( !point ) return false;

	// 	if ( !this.point || this.point.uuid !== point.uuid ) {

	// 		CommandHistory.execute( new SelectSurfacePointCommand( this, point as DynamicControlPoint<TvSurface> ) );

	// 	}

	// 	return true;

	// }

}
