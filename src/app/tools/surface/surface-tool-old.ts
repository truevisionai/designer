// /*
//  * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
//  */

// import { PointerEventData } from 'app/events/pointer-event-data';
// import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';
// import { CommandHistory } from 'app/services/command-history';
// import { DynamicControlPoint } from '../../modules/three-js/objects/dynamic-control-point';
// import { ToolType } from '../tool-types.enum';
// import { BaseTool } from '../base-tool';
// import { AddSurfacePointCommand } from './add-surface-point-command';
// import { CreateSurfaceCommand } from './create-surface-command';
// import { SurfaceToolService } from './surface-tool.service';
// import { NodeStrategy } from 'app/core/snapping/select-strategies/node-strategy';
// import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
// import { FreeMovingStrategy } from 'app/core/snapping/move-strategies/free-moving-strategy';

// export class SurfaceTool extends BaseTool {

// 	public name: string = 'SurfaceTool';

// 	public toolType = ToolType.Surface;

// 	public surface: TvSurface;

// 	public point: DynamicControlPoint<TvSurface>;

// 	private pointUpdated: boolean;

// 	constructor (
// 		private tool: SurfaceToolService
// 	) {

// 		super();

// 	}

// 	public init () {

// 		super.init();

// 		// this.selectStrategy = new ObjectUserDataStrategy( TvSurface.tag, 'surface' );
// 		// this.pointStrategy = new ControlPointStrategy();

// 		// this.pointStrategy = new ControlPointStrategy();
// 		// this.nodeStrategy = new NodeStrategy<TvSurface>( TvSurface.tag );

// 		this.tool.base.init();

// 		// this.tool.base.addCreationStrategy( new FreeMovingStrategy() );
// 		this.tool.base.addMovingStrategy( new FreeMovingStrategy() );

// 		this.tool.base.addSelectionStrategy( new ControlPointStrategy() );
// 		this.tool.base.addSelectionStrategy( new NodeStrategy<TvSurface>( TvSurface.tag ) );

// 	}

// 	public enable () {

// 		super.enable();

// 		// this.surfaceService.showSurfaceHelpers();

// 		// this.roadService.showAllCornerPoints();
// 	}

// 	public disable (): void {

// 		super.disable();

// 		// this.surfaceService.hideSurfaceHelpers();

// 		// this.roadService.hideAllCornerPoints();

// 	}

// 	onPointerDownCreate ( e: PointerEventData ): void {

// 		this.tool.base.handleMovement( e, ( position ) => {

// 			console.log( position );

// 		} );

// 		// if ( this.surface ) {

// 		// 	CommandHistory.execute( new AddSurfacePointCommand( this, this.surface, e.point ) );

// 		// } else {

// 		// 	CommandHistory.execute( new CreateSurfaceCommand( this, e.point ) );
// 		// }

// 	}

// 	onPointerDownSelect ( e: PointerEventData ): void {

// 		// const point = this.pointStrategy.onPointerDown( e );

// 		// if ( point ) {

// 		// 	if ( !this.point || this.point.uuid !== point.uuid ) {

// 		// 		CommandHistory.execute( new SelectPointCommand( this, point, DynamicInspectorComponent, point.mainObject ) );

// 		// 	}

// 		// 	return;
// 		// }

// 		// const surface = this.selectStrategy.onPointerDown( e );

// 		// if ( surface ) {

// 		// 	if ( !this.surface || this.surface.id !== surface.id ) {

// 		// 		const command = new SelectMainObjectCommand( this, surface, DynamicInspectorComponent, surface );

// 		// 		CommandHistory.execute( command );

// 		// 	}

// 		// 	return;

// 		// }

// 		// CommandHistory.execute( new UnselectSurfaceCommand( this ) );

// 	}

// 	public onPointerMoved ( e: PointerEventData ) {

// 		// this.pointStrategy.onPointerMoved( e );

// 		// if ( this.isPointerDown && this.point && this.point.isSelected ) {

// 		// 	this.point.copyPosition( e.point );

// 		// 	this.point.mainObject.spline.update();

// 		// 	this.pointUpdated = true;

// 		// }

// 	}

// 	public onPointerUp ( e: PointerEventData ) {

// 		// // const point = this.pointStrategy.onPointerMoved( e );

// 		// if ( this.point?.position && this.point.isSelected && this.pointUpdated && this.pointerDownAt ) {

// 		// 	const oldPosition = this.pointerDownAt.clone();
// 		// 	const newPosition = this.point.position.clone();

// 		// 	CommandHistory.execute( new UpdatePositionCommand( this.point, newPosition, oldPosition ) );

// 		// }

// 		// this.pointUpdated = false;

// 	}


// 	// surfaceIsSelected ( e: PointerEventData ) {

// 	// 	const results = PickingHelper.findAllByTag( TvSurface.tag, e, this.map.gameObject.children, false );

// 	// 	if ( results.length == 0 ) return false;

// 	// 	const surface = results[ 0 ].userData.surface as TvSurface;

// 	// 	if ( !this.surface || this.surface.mesh.id !== surface.mesh.id ) {

// 	// 		CommandHistory.execute( new SelectSurfaceCommand( this, surface ) );

// 	// 	}

// 	// 	return true;

// 	// }

// 	// controlPointIsSelected ( e: PointerEventData ) {

// 	// 	// const points = this.map.surfaces.flatMap(s => s.spline.controlPoints);
// 	// 	const points = this.map.surfaces.reduce( ( acc, s ) => acc.concat( s.spline.controlPoints ), [] );

// 	// 	const point = PickingHelper.findByObjectType( 'Points', e, points, true );

// 	// 	if ( !point ) return false;

// 	// 	if ( !this.point || this.point.uuid !== point.uuid ) {

// 	// 		CommandHistory.execute( new SelectSurfacePointCommand( this, point as DynamicControlPoint<TvSurface> ) );

// 	// 	}

// 	// 	return true;

// 	// }

// }
