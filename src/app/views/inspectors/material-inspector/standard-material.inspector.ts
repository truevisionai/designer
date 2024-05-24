/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvStandardMaterial } from "../../../graphics/material/tv-standard-material";
import { MaterialAsset } from "../../../graphics/material/tv-material.asset";
import { TvMaterialService } from "../../../graphics/material/tv-material.service";
import { SerializedField } from "../../../core/components/serialization";
import { AssetPreviewService } from "../asset-preview/asset-preview.service";

export class StandardMaterialInspector {

	private readonly material: TvStandardMaterial;

	constructor (
		private materialAsset: MaterialAsset,
		private materialService: TvMaterialService,
		private previewService: AssetPreviewService
	) {

		this.material = materialAsset.material as TvStandardMaterial;

	}

	@SerializedField( { type: 'string', disabled: true } )
	get type (): string {
		return this.material.type;
	}

	set type ( value: string ) {
		this.material.type = value;
		this.update();
	}

	@SerializedField( { type: 'string' } )
	get name (): string {
		return this.material.name;
	}

	set name ( value: string ) {
		this.material.name = value;
		this.update();
	}

	@SerializedField( { type: 'float', min: 0, max: 1 } )
	get roughness (): number {
		return this.material[ 'roughness' ];
	}

	set roughness ( value: number ) {
		this.material[ 'roughness' ] = value;
		this.update();
	}

	@SerializedField( { type: 'float', min: 0, max: 1 } )
	get metalness (): number {
		return this.material[ 'metalness' ];
	}

	set metalness ( value: number ) {
		this.material[ 'metalness' ] = value;
		this.update();
	}

	@SerializedField( { type: 'color' } )
	get color (): any {
		return this.material[ 'color' ];
	}

	set color ( value: any ) {
		this.material[ 'color' ] = value;
		this.update();
	}

	@SerializedField( { type: 'color' } )
	get emissiveColor () {
		return this.material[ 'emissive' ];
	}

	set emissiveColor ( value ) {
		this.material[ 'emissive' ] = value;
		this.update();
	}

	@SerializedField( { type: 'float', min: 0, max: 1 } )
	get emissiveIntensity (): number {
		return this.material[ 'emissiveIntensity' ];
	}

	set emissiveIntensity ( value: number ) {
		this.material[ 'emissiveIntensity' ] = value;
		this.update();
	}

	@SerializedField( { type: 'float', min: 0, max: 1 } )
	get opacity (): number {
		return this.material.opacity;
	}

	set opacity ( value: number ) {
		this.material.opacity = value;
		this.update();
	}

	@SerializedField( { type: 'boolean' } )
	get transparent (): boolean {
		return this.material.transparent;
	}

	set transparent ( value: boolean ) {
		this.material.transparent = value;
		this.update();
	}

	@SerializedField( { type: 'texture' } )
	get map () {
		return this.materialAsset.textureGuids[ 'map' ] || '';
	}

	set map ( value ) {
		this.setMap( 'map', value )
		this.update();
	}

	update () {

		const asset = this.materialService.assetService.getAsset( this.materialAsset.guid );

		this.materialService.updateByGuid( this.materialAsset.guid );

		this.material.needsUpdate = true;

		if ( asset ) {

			asset.preview = this.previewService.getPreview( asset );

		}

	}

	setMap ( attributeName: string, guid: string ) {

		if ( guid == null ) {
			this.materialAsset.setMap( attributeName, null );
			return;
		}

		const asset = this.materialService.assetService.getTexture( guid );

		if ( asset == null ) {
			console.error( 'Texture not found' );
			return;
		}

		this.materialAsset.setMap( attributeName, asset.texture );

	}
}
