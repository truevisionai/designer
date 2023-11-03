/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AssetDatabase } from 'app/core/asset/asset-database';
// import { AppService } from 'app/services/app.service';
import { Material, MathUtils, MeshStandardMaterial, MeshStandardMaterialParameters, Texture } from 'three';

export class TvMaterial extends MeshStandardMaterial {

	public mapGuid: string;
	public roughnessMapGuid: string;
	public normalMapGuid: string;
	public aoMapGuid: string;
	public displacementMapGuid: string;
	public alphaMapGuid: string;

	constructor ( public guid: string = MathUtils.generateUUID(), parameters?: MeshStandardMaterialParameters ) {
		super( parameters );
	}

	static new ( name = 'NewMaterial' ) {

		return new TvMaterial( MathUtils.generateUUID(), { name: name } );

	}

	static fromMaterial ( guid: string, material: Material ): TvMaterial {

		return new TvMaterial( guid, material );

	}

	clone () {

		const result = super.clone();

		result.guid = result.uuid = MathUtils.generateUUID();

		if ( this.mapGuid !== undefined ) {
			result.mapGuid = this.mapGuid;
			result.map = AssetDatabase.getInstance<Texture>( this.mapGuid );
		}

		if ( this.roughnessMapGuid !== undefined ) {
			result.roughnessMapGuid = this.roughnessMapGuid;
			result.roughnessMap = AssetDatabase.getInstance<Texture>( this.roughnessMapGuid );
		}

		if ( this.normalMapGuid !== undefined ) {
			result.normalMapGuid = this.normalMapGuid;
			result.normalMap = AssetDatabase.getInstance<Texture>( this.normalMapGuid );
		}

		if ( this.aoMapGuid !== undefined ) {
			result.aoMapGuid = this.aoMapGuid;
			result.aoMap = AssetDatabase.getInstance<Texture>( this.aoMapGuid );
		}

		if ( this.displacementMapGuid !== undefined ) {
			result.displacementMapGuid = this.displacementMapGuid;
			result.displacementMap = AssetDatabase.getInstance<Texture>( this.displacementMapGuid );
		}

		if ( this.alphaMapGuid !== undefined ) {
			result.alphaMapGuid = this.alphaMapGuid;
			result.alphaMap = AssetDatabase.getInstance<Texture>( this.alphaMapGuid );
		}

		return result;

	}

	// toJSON () {

	// 	const meta = {
	// 		textures: {},
	// 		images: {}
	// 	};

	// 	// unset maps to prevent serialization
	// 	if ( this.mapGuid ) this.map = null;
	// 	if ( this.roughnessMapGuid ) this.roughnessMap = null;
	// 	if ( this.normalMapGuid ) this.normalMap = null;
	// 	if ( this.aoMapGuid ) this.aoMap = null;
	// 	if ( this.displacementMapGuid ) this.displacementMap = null;
	// 	if ( this.alphaMapGuid ) this.alphaMap = null;

	// 	const data = super.toJSON( meta );

	// 	// standard Material serialization
	// 	if ( this.guid ) data.guid = this.guid;
	// 	if ( this.mapGuid ) data.mapGuid = this.mapGuid;
	// 	if ( this.roughnessMapGuid ) data.roughnessMapGuid = this.roughnessMapGuid;
	// 	if ( this.normalMapGuid ) data.normalMapGuid = this.normalMapGuid;
	// 	if ( this.aoMapGuid ) data.aoMapGuid = this.aoMapGuid;
	// 	if ( this.displacementMapGuid ) data.displacementMapGuid = this.displacementMapGuid;
	// 	if ( this.alphaMapGuid ) data.alphaMapGuid = this.alphaMapGuid;

	// 	// set maps again
	// 	if ( this.mapGuid ) this.map = AppService.assets.getInstance( this.mapGuid ) as Texture;
	// 	if ( this.roughnessMapGuid ) this.roughnessMap = AppService.assets.getInstance( this.roughnessMapGuid ) as Texture;
	// 	if ( this.normalMapGuid ) this.normalMap = AppService.assets.getInstance( this.normalMapGuid ) as Texture;
	// 	if ( this.aoMapGuid ) this.aoMap = AppService.assets.getInstance( this.aoMapGuid ) as Texture;
	// 	if ( this.displacementMapGuid ) this.displacementMap = AppService.assets.getInstance( this.displacementMapGuid ) as Texture;
	// 	if ( this.alphaMapGuid ) this.alphaMap = AppService.assets.getInstance( this.alphaMapGuid ) as Texture;

	// 	return data;

	// }

	toJSONString (): string {

		return JSON.stringify( this.toJSON(), null, 2 );

	}
}
