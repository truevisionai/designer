/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { MathUtils, Object3D, Vector2, Vector3 } from 'three';

export class Surface {

	public static readonly tag = 'surface';

	public uuid: string;

	private _textureGuid: string;
	private _transparent: boolean = true;
	private _opacity: number = 1.0;
	private _mesh: Object3D;

	constructor (
		private _materialGuid: string,
		private _spline: AbstractSpline,
		private _offset: Vector2 = new Vector2( 0, 0 ),
		private _repeat: Vector2 = new Vector2( 1, 1 ),
		private _rotation: number = 0.0,
	) {
		this.uuid = MathUtils.generateUUID();
	}

	get spline (): AbstractSpline {
		return this._spline;
	}

	set spline ( value: AbstractSpline ) {
		this._spline = value;
	}

	get materialGuid (): string {
		return this._materialGuid;
	}

	set materialGuid ( value: string ) {
		this._materialGuid = value;
	}

	get offset (): Vector2 {
		return this._offset;
	}

	set offset ( value: Vector2 ) {
		this._offset = value;
	}

	get repeat (): Vector2 {
		return this._repeat;
	}

	set repeat ( value: Vector2 ) {
		this._repeat = value;
	}

	get rotation (): number {
		return this._rotation;
	}

	set rotation ( value: number ) {
		this._rotation = value;
	}

	get textureGuid (): string {
		return this._textureGuid;
	}

	set textureGuid ( value: string ) {
		this._textureGuid = value;
	}

	get transparent (): boolean {
		return this._transparent;
	}

	set transparent ( value: boolean ) {
		this._transparent = value;
	}

	get opacity (): number {
		return this._opacity;
	}

	set opacity ( value: number ) {
		this._opacity = value;
	}

	get mesh (): Object3D {
		return this._mesh;
	}

	set mesh ( value: Object3D ) {
		this._mesh = value;
	}

	addControlPoint ( point: AbstractControlPoint ): void {
		this.spline.addControlPoint( point );
	}

	setDimensions ( width: number, height: number ): void {

		this.repeat.set( 1 / width, 1 / height );

		const position = this.spline.controlPointPositions[ 0 ];

		const positions = [
			position.clone().add( new Vector3( 0, 0, 0 ) ),
			position.clone().add( new Vector3( width, 0, 0 ) ),
			position.clone().add( new Vector3( width, height, 0 ) ),
			position.clone().add( new Vector3( 0, height, 0 ) ),
		];

		this.spline.getControlPoints().forEach( ( point, index ) => {
			if ( index >= positions.length ) return;
			point.position.copy( positions[ index ] );
		} );

	}

	toJson (): any {

		return {
			attr_uuid: this.uuid,
			attr_rotation: this.rotation,
			material: {
				attr_guid: this.materialGuid,
				attr_opacity: this.opacity,
				attr_transparent: this.transparent,
			},
			texture: {
				attr_guid: this.textureGuid
			},
			offset: {
				attr_x: this.offset.x,
				attr_y: this.offset.y,
			},
			scale: {
				attr_x: this.repeat.x,
				attr_y: this.repeat.y,
			},
			spline: {
				attr_type: this.spline.type,
				attr_closed: this.spline.closed,
				attr_tension: this.spline.tension,
				point: this.spline.controlPointPositions.map( p => ( {
					attr_x: p.x,
					attr_y: p.y,
					attr_z: p.z,
				} ) )
			}
		};

	}
}
