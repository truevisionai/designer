import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { BoxGeometry, MeshBasicMaterial, Object3D, Sprite, SpriteMaterial, Texture, TextureLoader } from 'three';
import { GameObject } from '../../../core/game-object';
import { SceneService } from '../../../core/services/scene.service';
import { TvObjectType } from '../../tv-map/interfaces/i-tv-object';
import { ObjectTypes } from '../../tv-map/models/tv-common';
import { DefaultVehicleController } from '../controllers/vehicle-controller';
import { OscCatalogs } from '../models/osc-catalogs';
import { OscEntityObject } from '../models/osc-entities';
import { CatalogReferenceController } from '../models/osc-interfaces';
import { OscActionBuilder } from './osc-action-builder';

export class OscEntityBuilder {

	static get openDrive () {
		return TvMapInstance.map;
	}

	static build ( obj: OscEntityObject, executeAction = true ) {

		this.buildController( obj );

		this.loadVehicleTexture( obj, ( texture ) => {

			this.createVehicleSprite( obj, texture );

			if ( executeAction ) {

				obj.initActions.forEach( ( privateAction ) => {

					OscActionBuilder.executePrivateAction( obj, privateAction );

				} );
			}

		} );

	}

	static buildController ( obj: OscEntityObject ) {

		if ( obj.controller instanceof CatalogReferenceController ) {

			const truevisionCatalog = obj.controller.catalogReference.catalogName === OscCatalogs.truevisionCatalog;
			const defaultController = obj.controller.catalogReference.entryName === OscCatalogs.truevisionDefaultController;

			if ( truevisionCatalog && defaultController ) {

				obj.controller = new DefaultVehicleController( this.openDrive, obj );

			} else {

				console.error( 'uknown catalog reference' );

			}

		} else if ( obj.controller instanceof DefaultVehicleController ) {

			// do nothing

		} else {

			console.error( 'unknown vehicle controller for entity' );

		}
	}

	static loadVehicleTexture ( obj: OscEntityObject, callback: ( texture: Texture ) => void ) {

		const loader = new TextureLoader();

		const model = obj.catalogReference.entryName;

		loader.load( `assets/vehicles/${ model }.png`, ( texture ) => {

			callback( texture );

		}, () => {

		}, ( event ) => {

			const texture = loader.load( 'assets/vehicles/default.png' );

			callback( texture );
		} );
	}

	public static createVehicleSprite ( obj: OscEntityObject, texture: Texture ) {

		// var spriteMaterial = new SpriteMaterial( { map: texture, color: 0xffffff } );
		// obj.gameObject = new Sprite( spriteMaterial );
		// obj.gameObject.scale.set( 2, 3, 1 );

		const geometry = new BoxGeometry( 2, 3.5, 1 );
		const material = new MeshBasicMaterial( { color: 0x70db88 } );

		obj.gameObject = new GameObject( obj.name, geometry, material );

		obj.gameObject.Tag = ObjectTypes.VEHICLE;
		obj.gameObject.OpenDriveType = TvObjectType.VEHICLE;

		obj.gameObject.userData.data = obj;

		this.createVehicleIconLabel( obj.gameObject, 0x70db88 );

		SceneService.add( obj.gameObject );
	}

	public static createVehicleIconLabel ( parent: Object3D, color = 0xffffff ) {

		const loader = new TextureLoader();
		const texture = loader.load( 'assets/car-icon-circle.png' );

		const spriteMaterial = new SpriteMaterial( { map: texture, color: color } );
		const sprite = new Sprite( spriteMaterial );

		parent.add( sprite );

		// set the icon position on top of object
		sprite.position.set( 0, 0, 2 );
	}

}
