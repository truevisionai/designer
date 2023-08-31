/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import * as THREE from 'three';
import { Mesh, Object3D, PlaneGeometry, Vector2, Vector3 } from 'three';
import { SceneService } from '../../core/services/scene.service';
import { COLOR } from '../../shared/utils/colors.service';

export enum PrimitiveType {
	CUBE = 1,
	PLANE = 2,
}

export class BoundingBoxObject {

	public width: number = 10;
	public height: number = 10;
	public geometry = new PlaneGeometry( this.width, this.height );
	private color = COLOR.DARKGRAY;
	private opacity = 0.4;
	private material = new THREE.MeshBasicMaterial( {
		color: this.color,
		opacity: this.opacity,
		transparent: true
	} );
	public mesh = new Mesh( this.geometry, this.material );

	// BORDER
	private borderGeometry = new THREE.EdgesGeometry( this.geometry );
	private borderMaterial = new THREE.LineBasicMaterial( { color: this.color } );
	private border = new THREE.LineSegments( this.borderGeometry, this.borderMaterial );
	private borderAdded = false;

	constructor ( start?: Vector3, end?: Vector3 ) {

		this.mesh.userData.is_annotation = true;
		this.mesh.userData.uuid = this.mesh.uuid;

		SceneService.add( this.mesh, true );

		if ( start && end ) this.updateGeometry( start, end );
	}

	static addBoxInfo ( box: Object3D, start: Vector3, end: THREE.Vector3, size: Vector2 ): any {

		box.userData.is_annotation = true;
		box.userData.type = 'box';

		box.userData.width = size.x;
		box.userData.height = size.y;

		box.userData.startX = start.x;
		box.userData.startY = start.y;

		box.userData.endX = end.x;
		box.userData.endY = end.y;
	}

	static getDimensions ( p1: Vector3, p2: Vector3 ): Vector2 {

		let width = Math.abs( p1.x - p2.x );
		let height = Math.abs( p1.y - p2.y );

		width = Math.round( Math.max( width, 10 ) );
		height = Math.round( Math.max( height, 10 ) );

		return new Vector2(
			width,
			height
		);
	}

	setColor ( hexColorString: string ): any {
		this.material.color.set( hexColorString );
		this.borderMaterial.color.set( hexColorString );
	}

	updateGeometry ( start: Vector3, end: Vector3 ) {

		let size = BoundingBoxObject.getDimensions( start, end );

		this.width = size.x;
		this.height = size.y;

		this.geometry = new PlaneGeometry( size.x, size.y, 1, 1 );

		this.mesh.geometry.dispose();

		this.mesh.geometry = this.geometry;

		this.setPosition( this.mesh, start, end, size );

		this.updateBorderGeometry( start, end, size );

		BoundingBoxObject.addBoxInfo( this.mesh, start, end, size );
	}

	updateBorderGeometry ( start, end, size ) {

		this.borderGeometry = new THREE.EdgesGeometry( this.geometry );

		this.border.geometry.dispose();
		this.border.geometry = this.borderGeometry;

		if ( !this.borderAdded ) {
			this.mesh.add( this.border );
			this.borderAdded = true;
		}
	}

	setPosition ( object: Object3D, start: Vector3, end: Vector3, dimensions: Vector2 ) {

		if ( end.x < start.x ) dimensions.x *= -1;
		if ( end.y < start.y ) dimensions.y *= -1;

		object.position.set( start.x + ( dimensions.x / 2 ), start.y + ( dimensions.y / 2 ), 0.1 );
	}

	destroy () {
		SceneService.remove( this.mesh, true );
	}

}
