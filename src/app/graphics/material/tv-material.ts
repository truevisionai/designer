/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AssetDatabase } from 'app/core/asset/asset-database';
import { MathUtils, MeshStandardMaterial, MeshStandardMaterialParameters, Texture } from 'three';
import { SerializedField } from "../../core/components/serialization";

export class TvMaterial extends MeshStandardMaterial {

	@SerializedField( { 'type': 'texture' } )
	get alphaMapGuid (): string {
		return this._alphaMapGuid;
	}

	set alphaMapGuid ( value: string ) {
		this._alphaMapGuid = value;
	}

	@SerializedField( { 'type': 'texture' } )
	get displacementMapGuid (): string {
		return this._displacementMapGuid;
	}

	set displacementMapGuid ( value: string ) {
		this._displacementMapGuid = value;
	}

	@SerializedField( { 'type': 'texture' } )
	get aoMapGuid (): string {
		return this._aoMapGuid;
	}

	set aoMapGuid ( value: string ) {
		this._aoMapGuid = value;
	}

	@SerializedField( { 'type': 'texture' } )
	get normalMapGuid (): string {
		return this._normalMapGuid;
	}

	set normalMapGuid ( value: string ) {
		this._normalMapGuid = value;
	}

	@SerializedField( { 'type': 'texture' } )
	get roughnessMapGuid (): string {
		return this._roughnessMapGuid;
	}

	set roughnessMapGuid ( value: string ) {
		this._roughnessMapGuid = value;
	}

	@SerializedField( { 'type': 'texture' } )
	get mapGuid (): string {
		return this._mapGuid;
	}

	set mapGuid ( value: string ) {
		this._mapGuid = value;
	}

	private _mapGuid: string;

	private _roughnessMapGuid: string;

	private _normalMapGuid: string;

	private _aoMapGuid: string;

	private _displacementMapGuid: string;

	private _alphaMapGuid: string;

	constructor ( public guid: string = MathUtils.generateUUID(), parameters?: MeshStandardMaterialParameters ) {
		super( parameters );
	}

	clone () {

		const result = super.clone();

		result.guid = result.uuid = MathUtils.generateUUID();

		if ( this._mapGuid !== undefined ) {
			result.mapGuid = this._mapGuid;
			result.map = AssetDatabase.getInstance<Texture>( this._mapGuid );
		}

		if ( this._roughnessMapGuid !== undefined ) {
			result.roughnessMapGuid = this._roughnessMapGuid;
			result.roughnessMap = AssetDatabase.getInstance<Texture>( this._roughnessMapGuid );
		}

		if ( this._normalMapGuid !== undefined ) {
			result.normalMapGuid = this._normalMapGuid;
			result.normalMap = AssetDatabase.getInstance<Texture>( this._normalMapGuid );
		}

		if ( this._aoMapGuid !== undefined ) {
			result.aoMapGuid = this._aoMapGuid;
			result.aoMap = AssetDatabase.getInstance<Texture>( this._aoMapGuid );
		}

		if ( this._displacementMapGuid !== undefined ) {
			result.displacementMapGuid = this._displacementMapGuid;
			result.displacementMap = AssetDatabase.getInstance<Texture>( this._displacementMapGuid );
		}

		if ( this._alphaMapGuid !== undefined ) {
			result.alphaMapGuid = this._alphaMapGuid;
			result.alphaMap = AssetDatabase.getInstance<Texture>( this._alphaMapGuid );
		}

		return result;

	}
}
