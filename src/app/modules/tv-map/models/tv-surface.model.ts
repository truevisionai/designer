/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/core/game-object';
import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { BufferAttribute, Mesh, MeshStandardMaterial, RepeatWrapping, Shape, ShapeGeometry, Vector2 } from 'three';
import { OdTextures } from '../builders/od.textures';
import { TvMapInstance } from '../services/tv-map-instance';
import { INode, ISelectable } from 'app/modules/three-js/objects/i-selectable';
import { SerializedField } from 'app/core/components/serialization';
import { AssetDatabase } from 'app/core/asset/asset-database';
import { AbstractControlPoint } from "../../three-js/objects/abstract-control-point";
import { AbstractSpline } from 'app/core/shapes/abstract-spline';

export class TvSurface implements ISelectable, INode {

	public static readonly tag = 'surface';

	public static index = 0;

	public mesh: Mesh;

	public id: number;

	isSelected: boolean;

	@SerializedField( { type: 'material' } )
	get materialGuid () { return this._materialGuid; }

	set materialGuid ( value: string ) {
		this._materialGuid = value;
		this.mesh.material = AssetDatabase.getInstance( value );
	}

	get spline (): AbstractSpline { return this._spline; }

	set spline ( value: any ) { this._spline = value; this.update() }

	@SerializedField( { type: 'vector2' } )
	get offset () { return this._offset; }

	set offset ( value: any ) { this._offset = value; this.update() }

	@SerializedField( { type: 'vector2' } )
	get repeat () { return this._repeat; }

	set repeat ( value: any ) { this._repeat = value; this.update() }

	@SerializedField( { type: 'float' } )
	get rotation () { return this._rotation; }

	set rotation ( value: any ) { this._rotation = value; this.update() }

	@SerializedField( { type: 'float' } )
	get height () { return this._height; }

	set height ( value: any ) { this._height = value; this.update() }

	@SerializedField( { type: 'float' } )
	public get textureDensity () {
		return this._textureDensity;
	}

	public set textureDensity ( value ) {
		this._textureDensity = value;
		this.update();
	}

	constructor (
		private _materialGuid: string,
		private _spline: CatmullRomSpline,
		private _offset: Vector2 = new Vector2( 0, 0 ),
		private _repeat: Vector2 = new Vector2( 1, 1 ),
		private _rotation: number = 0.0,
		private _height: number = 0.0,
		private _textureDensity: number = 1
	) {
		this.init();
	}

	onMouseOver () {

		// console.error( 'Method not implemented.' );

	}

	onMouseOut () {

		// console.error( 'Method not implemented.' );

	}


	select (): void {

		// console.error( 'Method not implemented.' );

	}

	unselect (): void {

		// console.error( 'Method not implemented.' );

	}

	init (): void {

		this.id = TvSurface.index++;

		// make a blank shape to avoid any errors
		this.mesh = this.makeMesh( new Shape() );

		// TODO: we can probably avoid doing this here
		// add the surface mesh to opendrive object to make it available
		// for exporting in 3d format easily
		TvMapInstance.map.gameObject.add( this.mesh );

		// add the spline mesh direcly to scene and not opendrive
		// this helps avoid exporting it in the 3d file
		// SceneService.addToMain( this.spline.mesh );

		// set the main object of each control point to this surface
		this.spline.controlPoints.forEach( cp => cp.mainObject = this );

		// update the surface if >=3 points are present
		if ( this.spline.controlPoints.length > 2 ) this.update();

	}

	update (): void {

		this.spline.update();

		// minimum 3 points are required to create a surface
		if ( this.spline.controlPoints.length < 3 ) return;

		const shape = this.createShape();

		this.updateGeometry( shape );
	}

	updateGeometry ( shape: THREE.Shape ) {

		this.mesh.geometry.dispose();

		this.mesh.geometry = new ShapeGeometry( shape );

		const uvAttribute = this.mesh.geometry.attributes.uv as BufferAttribute;

		for ( let i = 0; i < uvAttribute.count; i++ ) {

			const u = uvAttribute.getX( i );
			const v = uvAttribute.getY( i );

			uvAttribute.setXY( i, u * this._textureDensity, v * this._textureDensity );

		}
	}

	createShape (): Shape {

		const points: Vector2[] = this.createPoints();

		const shape = new Shape();

		const first = points.shift();

		shape.moveTo( first.x, first.y );

		shape.splineThru( points );

		return shape;
	}

	createPoints (): THREE.Vector2[] {

		return this.spline.getPoints( 50 ).map(
			point => new Vector2( point.x, point.y )
		);
	}

	makeMesh ( shape: Shape ): Mesh {

		const geometry = new ShapeGeometry( shape );

		let groundMaterial;

		if ( this.materialGuid === undefined || this.materialGuid === 'grass' ) {

			const texture = OdTextures.terrain().clone();
			texture.wrapS = texture.wrapT = RepeatWrapping;
			texture.offset.copy( this.offset );
			texture.repeat.copy( this.repeat );
			texture.anisotropy = 16;

			groundMaterial = new MeshStandardMaterial( { map: texture } );

		} else {

			groundMaterial = AssetDatabase.getInstance( this.materialGuid );

		}

		const mesh = new GameObject( 'Surface', geometry, groundMaterial );

		mesh.position.set( 0, 0, -0.1 );

		mesh.Tag = TvSurface.tag;

		mesh.userData.surface = this;

		return mesh;
	}

	showCurve (): void {

		this.spline.show();

	}

	hideCurve (): void {

		this.spline.hide();

	}

	addControlPoint ( point: AbstractControlPoint ) {

		point.visible = true;

		point.mainObject = this;

		this.spline.addControlPoint( point );

		this.update();

		if ( this.spline.controlPoints.length >= 3 ) {

			this.mesh.visible = true;

		}

	}

	removeControlPoint ( point: AbstractControlPoint ) {

		point.visible = false;

		this.spline.removeControlPoint( point );

		this.update();

	}

	delete (): void {

		this.mesh.visible = false;

	}

	toJson () {

		return {
			attr_height: this.height,
			attr_rotation: this.rotation,
			material: {
				attr_guid: this.materialGuid
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

