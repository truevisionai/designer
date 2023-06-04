/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/core/game-object';
import { SceneService } from 'app/core/services/scene.service';
import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { BaseControlPoint } from 'app/modules/three-js/objects/control-point';
import * as THREE from 'three';
import { Mesh, Shape, ShapeGeometry, Vector2 } from 'three';
import { OdTextures } from '../builders/od.textures';
import { TvMapInstance } from '../services/tv-map-source-file';

export class TvSurface {

	public static readonly tag = 'surface';

	public static index = 0;

	public mesh: Mesh;

	public id: number;

	public textureDensity = 100;

	constructor (
		public materialGuid: string,
		public spline: CatmullRomSpline,
		public offset: Vector2 = new Vector2( 0, 0 ),
		public scale: Vector2 = new Vector2( 1, 1 ),
		public rotation: number = 0.0,
		public height: number = 0.0
	) {

		this.init();
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
		SceneService.add( this.spline.mesh );

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

		const uvAttribute = this.mesh.geometry.attributes.uv;

		for ( let i = 0; i < uvAttribute.count; i++ ) {

			const u = uvAttribute.getX( i );
			const v = uvAttribute.getY( i );

			uvAttribute.setXY( i, u * this.textureDensity, v * this.textureDensity );

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

		return this.spline.curve.getPoints( 50 ).map(
			point => new Vector2( point.x, point.y )
		);
	}

	makeMesh ( shape: Shape ): Mesh {

		const geometry = new ShapeGeometry( shape );

		const texture = OdTextures.terrain.clone();
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 0.008, 0.008 );
		texture.anisotropy = 16;
		texture.encoding = THREE.sRGBEncoding;

		const groundMaterial = new THREE.MeshLambertMaterial( { map: texture } );

		const mesh = new GameObject( 'Surface', geometry, groundMaterial );

		mesh.position.set( 0, 0, -0.1 );

		mesh.Tag = TvSurface.tag;

		mesh.userData.surface = this;

		groundMaterial.map.needsUpdate = true;

		return mesh;
	}

	showCurve (): void {

		this.spline.show();

	}

	hideCurve (): void {

		this.spline.hide();

	}

	addControlPoint ( point: BaseControlPoint ) {

		point.visible = true;

		point.mainObject = this;

		this.spline.addControlPoint( point );

		this.update();

		if ( this.spline.controlPoints.length >= 3 ) {

			this.mesh.visible = true;

		}

		if ( this.spline.controlPoints.length >= 2 ) {

			this.spline.mesh.visible = true;

		}
	}

	removeControlPoint ( point: BaseControlPoint ) {

		point.visible = false;

		this.spline.removeControlPoint( point );

		this.update();

		if ( this.spline.controlPoints.length < 3 ) {

			this.mesh.visible = false;

		}

		if ( this.spline.controlPoints.length < 2 ) {

			this.spline.mesh.visible = false;

		}
	}

	showControlPoints (): void {

		this.spline.showcontrolPoints();

	}

	hideControlPoints (): void {

		this.spline.hidecontrolPoints();

	}

	delete (): void {

		this.hideControlPoints();

		this.hideCurve();

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
				attr_x: this.scale.x,
				attr_y: this.scale.y,
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

	showHelpers () {
		this.showCurve();
		this.showControlPoints();
	}

	hideHelpers () {
		this.hideCurve();
		this.hideControlPoints();
	}
}
