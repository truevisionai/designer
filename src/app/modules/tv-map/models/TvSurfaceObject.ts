import { Action, SerializedField } from 'app/core/components/serialization';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { Mesh } from 'three';
import { SurfaceToolService } from 'app/tools/surface/surface-tool.service';
import { TvSurface } from './tv-surface.model';
import { CommandHistory } from 'app/services/command-history';
import { RemoveObjectCommand } from 'app/commands/remove-object-command';


export class TvSurfaceObject {

	private _keepAspect: boolean = false;
	private _height: number;
	private _width: number;

	constructor (
		public surface: TvSurface,
		public mesh: Mesh,
		private service: SurfaceToolService
	) {
		mesh.geometry.computeBoundingBox();
		this._width = this.mesh.geometry.boundingBox.max.x - this.mesh.geometry.boundingBox.min.x;
		this._height = this.mesh.geometry.boundingBox.max.y - this.mesh.geometry.boundingBox.min.y;
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
