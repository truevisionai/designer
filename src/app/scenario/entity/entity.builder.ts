/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, Texture } from 'three';
import { ScenarioEntity } from "../models/entities/scenario-entity";
import { ScenarioObjectType } from "../models/tv-enums";
import { Injectable } from "@angular/core";

@Injectable( {
	providedIn: 'root'
} )
export class EntityBuilder {

	constructor () { }

	build ( entity: ScenarioEntity ): Object3D {

		switch ( entity.scenarioObjectType ) {

			case ScenarioObjectType.pedestrian:
				return this.buildVehicle( entity );
				break;

			case ScenarioObjectType.vehicle:
				return this.buildVehicle( entity );
				break;

			case ScenarioObjectType.miscellaneous:
				break;

		}

	}

	buildController ( entity: ScenarioEntity ) {

		// if ( obj.controller instanceof CatalogReferenceController ) {
		//
		// 	const truevisionCatalog = obj.controller.catalogReference.catalogName === Catalogs.truevisionCatalog;
		// 	const defaultController = obj.controller.catalogReference.entryName === Catalogs.truevisionDefaultController;
		//
		// 	if ( truevisionCatalog && defaultController ) {
		//
		// 		obj.controller = new DefaultVehicleController( this.openDrive, obj );
		//
		// 	} else {
		//
		// 		console.error( 'uknown catalog reference' );
		//
		// 	}
		//
		// } else if ( obj.controller instanceof DefaultVehicleController ) {
		//
		// 	// do nothing
		//
		// } else {
		//
		// 	console.error( 'unknown vehicle controller for entity' );
		//
		// }
	}

	loadVehicleTexture ( entity: ScenarioEntity, callback: ( texture: Texture ) => void ) {

		// const loader = new TextureLoader();
		//
		// const model = obj.catalogReference.entryName;
		//
		// loader.load( `assets/vehicles/${ model }.png`, ( texture ) => {
		//
		// 	callback( texture );
		//
		// }, () => {
		//
		// }, ( event ) => {
		//
		// 	const texture = loader.load( 'assets/vehicles/default.png' );
		//
		// 	callback( texture );
		// } );
	}

	public createVehicleSprite ( entity: ScenarioEntity, texture: Texture ) {

		// // var spriteMaterial = new SpriteMaterial( { models: texture, color: 0xffffff } );
		// // obj.gameObject = new Sprite( spriteMaterial );
		// // obj.gameObject.scale.set( 2, 3, 1 );
		//
		// const geometry = new BoxGeometry( 2, 3.5, 1 );
		// const material = new MeshBasicMaterial( { color: 0x70db88 } );
		//
		// obj.gameObject = new GameObject( obj.name, geometry, material );
		//
		// obj.gameObject.Tag = ObjectTypes.VEHICLE;
		// obj.gameObject.OpenDriveType = TvObjectType.VEHICLE;
		//
		// obj.gameObject.userData.data = obj;
		//
		// this.createVehicleIconLabel( obj.gameObject, 0x70db88 );
		//
		// SceneService.add( obj.gameObject );
	}

	public createVehicleIconLabel ( parent: Object3D, color = 0xffffff ) {

		// const loader = new TextureLoader();
		// const texture = loader.load( 'assets/car-icon-circle.png' );
		//
		// const spriteMaterial = new SpriteMaterial( { models: texture, color: color } );
		// const sprite = new Sprite( spriteMaterial );
		//
		// parent.add( sprite );
		//
		// // set the icon position on top of object
		// sprite.position.set( 0, 0, 2 );
	}

	private buildVehicle ( entity: ScenarioEntity ) {

		// const model = entity.model3d;

		const box = new BoxGeometry(
			entity.boundingBox.dimension.width,
			entity.boundingBox.dimension.length,	// reverse because y is north
			entity.boundingBox.dimension.height // reverse because z is up
		);

		const material = new MeshBasicMaterial( {
			color: 0xffffff,
			transparent: true,
			opacity: 0.6,
		} );

		const mesh = new Mesh( box, material );

		mesh.userData.entity = entity;

		return mesh;
	}

	//addArrow () {
	//
	//	// assuming yourObject is the object you want to show direction for
	//
	//	// get the world direction (forward direction) of the object
	//	var forward = this.getWorldDirection( new Vector3() ).normalize();
	//
	//	// get the 'up' direction of the object
	//	var up = this.up.clone();
	//
	//	// calculate 'right' direction which is the cross product of 'forward' and 'up' vectors
	//	var right = new Vector3();
	//	right.crossVectors( forward, up );
	//
	//	// create origin vectors at your object's current position
	//	var origin = this.position;
	//
	//	// create a length for the arrow (this is up to you)
	//	var length = 1;
	//
	//	// create hex colors for the arrows (these are up to you)
	//	var hex_forward = 0xff0000;  // red for forward direction
	//	var hex_up = 0x00ff00;      // green for up direction
	//	var hex_right = 0x0000ff;   // blue for right direction
	//
	//	// create the arrowHelpers
	//	var arrowHelperForward = new ArrowHelper( forward, origin, length, hex_forward );
	//	var arrowHelperUp = new ArrowHelper( up, origin, length, hex_up );
	//	var arrowHelperRight = new ArrowHelper( right, origin, length, hex_right );
	//
	//	// add the arrowHelpers to your scene
	//	this.add( arrowHelperForward );
	//	this.add( arrowHelperUp );
	//	this.add( arrowHelperRight );
	//
	//}

}
