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
import { Mesh, Vector3 } from 'three';
import { AppInspector } from 'app/core/inspector';
import { UpdatePositionCommand } from 'app/commands/copy-position-command';
import { CommandHistory } from 'app/services/command-history';
import { SimpleControlPoint } from 'app/modules/three-js/objects/dynamic-control-point';
import { AddObjectCommand } from "../../commands/add-object-command";
import { SelectObjectCommand } from "../../commands/select-object-command";
import { AssetNode } from 'app/views/editor/project-browser/file-node.model';
import { RemoveObjectCommand } from 'app/commands/remove-object-command';
import { Action, SerializedField } from 'app/core/components/serialization';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';


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

		this.tool.showSurfaceHelpers();

	}

	disable (): void {

		super.disable();

		this.tool.base.reset();

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

		} else if ( object instanceof AbstractControlPoint ) {

			this.onControlPointSelected( object );

		}

	}

	onSurfaceSelected ( object: TvSurface ) {

		if ( this.selectedSurface ) this.onSufaceUnselected( this.selectedSurface );

		this.tool.showSurface( object );

		const mesh = this.tool.getSurfaceMesh( object );

		AppInspector.setDynamicInspector( new TvSurfaceObject( object, mesh, this.tool ) );

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

	onAssetDropped ( asset: AssetNode, position: Vector3 ): void {

		const surface = this.tool.createFromAsset( asset, position );

		if ( !surface ) return;

		this.executeAddObject( surface );

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

			this.tool.updateSurface( object );

		} else if ( object instanceof AbstractControlPoint ) {

			// this.tool.updateControlPoint( object );
			if ( this.selectedSurface ) {

				this.tool.updateSurface( this.selectedSurface );

			}

		} else if ( object instanceof TvSurfaceObject ) {

			this.tool.updateSurface( object.surface );

		}

	}
}


class TvSurfaceObject {

	private _keepAspect: boolean = false;
	private _height: number;
	private _width: number;

	constructor (
		public surface: TvSurface,
		public mesh: Mesh,
		private service: SurfaceToolService
	) {
		if ( mesh ) {
			mesh.geometry.computeBoundingBox();
			this._width = this.mesh.geometry.boundingBox.max.x - this.mesh.geometry.boundingBox.min.x;
			this._height = this.mesh.geometry.boundingBox.max.y - this.mesh.geometry.boundingBox.min.y;
		}
	}

	updateMesh () {

		this.service.updateSurfaceMeshByDimensions( this.surface, this.width, this.height );

	}

	@SerializedField( { type: 'material' } )
	get materialGuid () {
		return this.surface.materialGuid;
	}

	set materialGuid ( value: string ) {
		this.surface.materialGuid = value;
	}

	get spline (): AbstractSpline {
		return this.surface.spline;
	}

	set spline ( value: any ) {
		this.surface.spline = value;
	}

	@SerializedField( { type: 'vector2' } )
	get offset () {
		return this.surface.offset;
	}

	set offset ( value: any ) {
		this.surface.offset = value;
	}

	@SerializedField( { type: 'vector2' } )
	get repeat () {
		return this.surface.repeat;
	}

	set repeat ( value: any ) {
		this.surface.repeat = value;
	}

	@SerializedField( { type: 'float' } )
	get rotation () {
		return this.surface.rotation;
	}

	set rotation ( value: any ) {
		this.surface.rotation = value;
	}

	@SerializedField( { type: 'boolean' } )
	get transparent () {
		return this.surface.transparent;
	}

	set transparent ( value: any ) {
		this.surface.transparent = value;
	}

	@SerializedField( { type: 'float' } )
	get opacity () {
		return this.surface.opacity;
	}

	set opacity ( value: any ) {
		this.surface.opacity = value;
	}

	@SerializedField( { type: 'boolean' } )
	get keepAspect () {
		return this._keepAspect;
	}

	set keepAspect ( value: any ) {
		this._keepAspect = value;
	}

	@SerializedField( { type: 'float' } )
	get width () {
		return this._width;
	}

	@SerializedField( { type: 'float' } )
	get height () {
		return this._height;
	}

	set width ( value: number ) {

		const aspect = this._width / this._height; // aspect ratio of the old dimensions

		this._width = value;

		if ( this.keepAspect ) {
			this._height = value / aspect; // new height to maintain aspect ratio
		}

		this.updateMesh();
	}

	set height ( value: number ) {

		const aspect = this._width / this._height; // aspect ratio of the old dimensions

		this._height = value;

		if ( this.keepAspect ) {
			this._width = value * aspect; // new width to maintain aspect ratio
		}

		this.updateMesh();
	}

	@Action( { name: 'Delete' } )
	action () {

		CommandHistory.execute( new RemoveObjectCommand( this.surface ) );

	}

}
