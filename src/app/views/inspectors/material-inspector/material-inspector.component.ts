/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CallFunctionCommand } from 'app/core/commands/call-function-command';
import { UpdateMaterialMapCommand } from 'app/core/commands/update-material-map-command';
import { AssetFactory } from 'app/core/factories/asset-factory.service';
import { IComponent } from 'app/core/game-object';
import { Metadata } from 'app/core/models/metadata.model';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { TvMaterial } from 'app/modules/three-js/objects/tv-material.model';
import { AssetDatabase } from 'app/services/asset-database';
import { CommandHistory } from 'app/services/command-history';
import { Color } from 'three';
import { PreviewService } from '../object-preview/object-preview.service';

@Component( {
	selector: 'app-material-inspector',
	templateUrl: './material-inspector.component.html',
	styleUrls: [ './material-inspector.component.css' ]
} )
export class MaterialInspector implements OnInit, IComponent, OnDestroy {

	public data: {
		material: TvMaterial,
		guid: string
	};

	public metadata: Metadata;

	constructor (
		private previewService: PreviewService,
	) {
	}

	get thumbnail () {
		return this.metadata.preview;
	}

	get material () {
		return this.data.material;
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

	ngOnInit () {

		this.metadata = AssetDatabase.getMetadata( this.data.guid );

	}


	ngOnDestroy () {

		AssetFactory.updateMaterial( this.metadata.path, this.material );

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

	onMapChanged ( $guid: string ) {

		console.log( 'map changed', $guid )

		CommandHistory.execute(

			new UpdateMaterialMapCommand( this.previewService, this.material, this.metadata, 'map', $guid )

		)

	}

	onRoughnessMapChanged ( $guid: string ) {

		CommandHistory.execute(

			new UpdateMaterialMapCommand( this.previewService, this.material, this.metadata, 'roughnessMap', $guid )

		)

	}

	onNormalMapChanged ( $guid: string ) {

		CommandHistory.execute(

			new UpdateMaterialMapCommand( this.previewService, this.material, this.metadata, 'normalMap', $guid )

		)

	}

	private updatePreviewCache () {

		this.metadata.preview = this.getFreshPreview();

	}

	private updateMaterialProperty<T, K extends keyof T> ( material: T, propertyName: K, newValue: T[ K ] ) {

		const oldValue = ( typeof material[ propertyName ] === 'number' )
			? material[ propertyName ]
			: ( material[ propertyName ] as any ).clone();

		material[ propertyName ] = newValue;

		CommandHistory.executeMany(

			new SetValueCommand<T, K>( material, propertyName, newValue, oldValue ),

			new SetValueCommand( this.metadata, 'preview', this.getFreshPreview() )
		);
	}
}
