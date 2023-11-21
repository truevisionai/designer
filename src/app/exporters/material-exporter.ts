import { TvMaterial } from "app/modules/three-js/objects/tv-material.model";
import { AppService } from "app/services/app.service";
import { Texture } from "three";

export class MaterialExporter {

	toJSON ( material: TvMaterial ) {

		const meta = {
			textures: {},
			images: {}
		};

		// unset maps to prevent serialization
		if ( material.mapGuid ) material.map = null;
		if ( material.roughnessMapGuid ) material.roughnessMap = null;
		if ( material.normalMapGuid ) material.normalMap = null;
		if ( material.aoMapGuid ) material.aoMap = null;
		if ( material.displacementMapGuid ) material.displacementMap = null;
		if ( material.alphaMapGuid ) material.alphaMap = null;

		const data = material.toJSON( meta );

		// standard Material serialization
		if ( material.guid ) data.guid = material.guid;
		if ( material.mapGuid ) data.mapGuid = material.mapGuid;
		if ( material.roughnessMapGuid ) data.roughnessMapGuid = material.roughnessMapGuid;
		if ( material.normalMapGuid ) data.normalMapGuid = material.normalMapGuid;
		if ( material.aoMapGuid ) data.aoMapGuid = material.aoMapGuid;
		if ( material.displacementMapGuid ) data.displacementMapGuid = material.displacementMapGuid;
		if ( material.alphaMapGuid ) data.alphaMapGuid = material.alphaMapGuid;

		// set maps again
		if ( material.mapGuid ) material.map = AppService.assets.getInstance( material.mapGuid ) as Texture;
		if ( material.roughnessMapGuid ) material.roughnessMap = AppService.assets.getInstance( material.roughnessMapGuid ) as Texture;
		if ( material.normalMapGuid ) material.normalMap = AppService.assets.getInstance( material.normalMapGuid ) as Texture;
		if ( material.aoMapGuid ) material.aoMap = AppService.assets.getInstance( material.aoMapGuid ) as Texture;
		if ( material.displacementMapGuid ) material.displacementMap = AppService.assets.getInstance( material.displacementMapGuid ) as Texture;
		if ( material.alphaMapGuid ) material.alphaMap = AppService.assets.getInstance( material.alphaMapGuid ) as Texture;

		return data;

	}
}
