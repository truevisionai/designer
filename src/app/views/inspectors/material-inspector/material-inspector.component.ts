/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { IComponent } from 'app/objects/game-object';
import { SetValueCommand } from 'app/commands/set-value-command';
import { CommandHistory } from 'app/commands/command-history';
import {
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshNormalMaterial,
	MeshPhongMaterial,
	MeshPhysicalMaterial,
	MeshStandardMaterial
} from 'three';
import { AssetPreviewService } from '../asset-preview/asset-preview.service';
import { AssetService } from "../../../assets/asset.service";
import { Asset, AssetType } from 'app/assets/asset.model';
import { MapEvents } from "../../../events/map-events";
import { Subscription } from "rxjs";
import { TvMaterialService } from "../../../assets/material/tv-material.service";
import { TvStandardMaterial } from "../../../assets/material/tv-standard-material";
import { TvTextureService } from "../../../assets/texture/tv-texture.service";

@Component( {
	selector: 'app-material-inspector',
	templateUrl: './material-inspector.component.html',
	styleUrls: [ './material-inspector.component.css' ]
} )
export class MaterialInspector implements OnInit, IComponent, OnDestroy {

	public data: Asset;

	public material: TvStandardMaterial;

	get thumbnail () {
		return this.data?.preview;
	}

	get materialTypes () {
		return [
			'MeshStandardMaterial',
			'MeshPhysicalMaterial',
			'MeshPhongMaterial',
			'MeshLambertMaterial',
		];
	}

	get color (): any {
		return '#' + this.material.color.getHexString();
	}

	set color ( value: any ) {
		this.material.color.setStyle( value );
		this.updatePreviewCache();
	}

	get emissive () {
		return '#' + this.material.emissive.getHexString();
	}

	set emissive ( value ) {
		this.material.emissive.setStyle( value );
		this.updatePreviewCache();
	}

	private subscription: Subscription;

	constructor (
		private previewService: AssetPreviewService,
		private assetService: AssetService,
		private materialService: TvMaterialService,
		private textureService: TvTextureService,
	) {
	}

	ngOnInit () {

		this.material = this.materialService.getMaterial( this.data.guid )?.material as TvStandardMaterial;

		this.subscription = MapEvents.objectUpdated.subscribe( e => this.onObjectUpdated( e ) );

	}

	ngOnDestroy () {

		this.subscription?.unsubscribe();

		this.materialService.updateAsset( this.data );

		this.updatePreviewCache();

	}

	onTypeChanged ( newMaterialType: string ) {

		// You need to ensure the new material type is a valid one
		if ( !this.materialTypes.includes( newMaterialType ) ) {
			console.error( `Invalid material type: ${ newMaterialType }` );
			return;
		}

		let newMaterial: any;

		// Create new material of the chosen type
		switch ( newMaterialType ) {
			case 'MeshStandardMaterial':
				newMaterial = new MeshStandardMaterial();
				break;
			case 'MeshBasicMaterial':
				newMaterial = new MeshBasicMaterial();
				break;
			case 'MeshPhysicalMaterial':
				newMaterial = new MeshPhysicalMaterial();
				break;
			case 'MeshNormalMaterial':
				newMaterial = new MeshNormalMaterial();
				break;
			case 'MeshPhongMaterial':
				newMaterial = new MeshPhongMaterial();
				break;
			case 'MeshLambertMaterial':
				newMaterial = new MeshLambertMaterial();
				break;
			default:
				console.error( `Unknown material type: ${ newMaterialType }` );
				return;
		}

		try {
			this.material = this.material.copy( newMaterial );
		} catch ( error ) {
			console.error( error );
		}

		this.assetService.saveAssetByGuid( AssetType.MATERIAL, this.data.guid, this.material );

		this.updatePreviewCache();

	}

	getFreshPreview () {

		return this.previewService.getMaterialPreview( this.material );

	}

	onColorChanged ( $value ) {

		this.updateMaterialProperty( this.material, 'color', $value );

	}

	// not being used
	onEmissiveColorChanged ( $value ) {

		this.updateMaterialProperty( this.material, 'emissive', $value );

	}

	onRoughnessChanged ( $value ) {

		this.updateMaterialProperty( this.material, 'roughness', $value );

	}

	onMetalnessChanged ( $value ) {

		this.updateMaterialProperty( this.material, 'metalness', $value );

	}

	onEmissiveChanged ( $value ) {

		this.updateMaterialProperty( this.material, 'emissive', $value );

	}

	onEmissiveIntensityChanged ( $value ) {

		this.updateMaterialProperty( this.material, 'emissiveIntensity', $value );

	}

	onTransparentChanged ( $value ) {

		this.updateMaterialProperty( this.material, 'transparent', $value );

	}

	onOpacityChanged ( $value ) {

		this.updateMaterialProperty( this.material, 'opacity', $value );

	}

	onMapChanged ( $guid: string ) {

		const texture = this.textureService.getTexture( $guid )?.texture;

		this.updateGuid( this.material, 'map', texture );

	}

	onRoughnessMapChanged ( $guid: string ) {

		const texture = this.textureService.getTexture( $guid )?.texture;

		this.updateGuid( this.material, 'roughnessMap', texture );

	}

	onMetalnessMapChanged ( $guid: string ) {

		const texture = this.textureService.getTexture( $guid )?.texture;

		this.updateGuid( this.material, 'metalnessMap', texture );

	}

	onNormalMapChanged ( $guid: string ) {

		const texture = this.textureService.getTexture( $guid )?.texture;

		this.updateGuid( this.material, 'normalMap', texture );

	}

	onAOMapChanged ( $guid: string ) {

		const texture = this.textureService.getTexture( $guid )?.texture;

		this.updateGuid( this.material, 'aoMap', texture );

	}

	onDisplacementMapChanged ( $guid: string ) {

		const texture = this.textureService.getTexture( $guid )?.texture;

		this.updateGuid( this.material, 'displacementMap', texture );

	}

	onAlphaMapChanged ( $guid: string ) {

		const texture = this.textureService.getTexture( $guid )?.texture;

		this.updateGuid( this.material, 'alphaMap', texture );
	}

	private updatePreviewCache () {

		this.data.preview = this.getFreshPreview();

	}

	updateMaterialProperty<T, K extends keyof T> ( material: T, propertyName: K, newValue: T[ K ] ) {

		const oldValue = ( typeof material[ propertyName ] === 'number' || typeof material[ propertyName ] === 'boolean' )
			? material[ propertyName ]
			: ( material[ propertyName ] as any ).clone();

		material[ propertyName ] = newValue;

		CommandHistory.execute( new SetValueCommand<T, K>( material, propertyName, newValue, oldValue ) );
	}

	updateGuid<T, K extends keyof T> ( material: T, propertyName: K, newValue: T[ K ] ) {

		const setValueCommand = new SetValueCommand<T, K>( material, propertyName, newValue );

		CommandHistory.execute( setValueCommand );

	}

	private onObjectUpdated ( object: Object ) {

		if ( object == this.material ) {

			this.updatePreviewCache();

		} else {

			console.log( 'Object updated is not the material', object );

		}

	}
}
