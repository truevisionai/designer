/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AssetExporter } from "../../core/interfaces/asset-exporter";
import { MaterialAsset } from "./tv-material.asset";
import { FrontSide, NormalBlending } from "three";

@Injectable( {
	providedIn: 'root'
} )
export class TvMaterialExporter implements AssetExporter<MaterialAsset> {

	exportAsString ( material: MaterialAsset ): string {

		const data = this.exportAsJSON( material );

		return JSON.stringify( data, null, 4 );
	}

	exportAsJSON ( material: MaterialAsset ): any {

		if ( material instanceof MaterialAsset ) {

			return this.toJSON( material.material );

		} else {

			throw new Error( 'Old material format is not supported' );

		}

	}

	private toJSON ( material: any, meta?: any ): any {

		const isRootObject = ( meta === undefined || typeof meta === 'string' );

		function getGUID ( material: any, mapName: any ): string {

			const map = material[ mapName ];

			if ( map && map.isTexture ) {

				if ( map.guid === undefined ) {
					console.error( 'Texture has no guid', material, mapName );
				}

				return map.guid;
			}

			return null;

		}

		if ( isRootObject ) {

			meta = {
				textures: {},
				images: {}
			};

		}

		const data: any = {
			metadata: {
				version: 4.6,
				type: 'Material',
				generator: 'Material.toJSON'
			}
		};

		// standard Material serialization
		data.version = 0.2;
		data.guid = material.guid;
		data.uuid = material.uuid;
		data.type = material.type;

		if ( material.name !== '' ) data.name = material.name;

		if ( material.color && material.color.isColor ) data.color = material.color.getHex();

		if ( material.roughness !== undefined ) data.roughness = material.roughness;
		if ( material.metalness !== undefined ) data.metalness = material.metalness;

		if ( material.sheen !== undefined ) data.sheen = material.sheen;
		if ( material.sheenColor && material.sheenColor.isColor ) data.sheenColor = material.sheenColor.getHex();
		if ( material.sheenRoughness !== undefined ) data.sheenRoughness = material.sheenRoughness;
		if ( material.emissive && material.emissive.isColor ) data.emissive = material.emissive.getHex();
		if ( material.emissiveIntensity && material.emissiveIntensity !== 1 ) data.emissiveIntensity = material.emissiveIntensity;

		if ( material.specular && material.specular.isColor ) data.specular = material.specular.getHex();
		if ( material.specularIntensity !== undefined ) data.specularIntensity = material.specularIntensity;
		if ( material.specularColor && material.specularColor.isColor ) data.specularColor = material.specularColor.getHex();
		if ( material.shininess !== undefined ) data.shininess = material.shininess;
		if ( material.clearcoat !== undefined ) data.clearcoat = material.clearcoat;
		if ( material.clearcoatRoughness !== undefined ) data.clearcoatRoughness = material.clearcoatRoughness;

		if ( material.clearcoatMap && material.clearcoatMap.isTexture ) {

			data.clearcoatMap = getGUID( material, 'clearcoatMap' );

		}

		if ( material.clearcoatRoughnessMap && material.clearcoatRoughnessMap.isTexture ) {

			data.clearcoatRoughnessMap = getGUID( material, 'clearcoatRoughnessMap' );

		}

		if ( material.clearcoatNormalMap && material.clearcoatNormalMap.isTexture ) {

			data.clearcoatNormalMap = getGUID( material, 'clearcoatNormalMap' );
			data.clearcoatNormalScale = material.clearcoatNormalScale.toArray();

		}

		if ( material.iridescence !== undefined ) data.iridescence = material.iridescence;
		if ( material.iridescenceIOR !== undefined ) data.iridescenceIOR = material.iridescenceIOR;
		if ( material.iridescenceThicknessRange !== undefined ) data.iridescenceThicknessRange = material.iridescenceThicknessRange;

		if ( material.iridescenceMap && material.iridescenceMap.isTexture ) {

			data.iridescenceMap = getGUID( material, 'iridescenceMap' );

		}

		if ( material.iridescenceThicknessMap && material.iridescenceThicknessMap.isTexture ) {

			data.iridescenceThicknessMap = getGUID( material, 'iridescenceThicknessMap' );

		}

		if ( material.anisotropy !== undefined ) data.anisotropy = material.anisotropy;
		if ( material.anisotropyRotation !== undefined ) data.anisotropyRotation = material.anisotropyRotation;

		if ( material.anisotropyMap && material.anisotropyMap.isTexture ) {

			data.anisotropyMap = getGUID( material, 'anisotropyMap' );

		}

		if ( material.map && material.map.isTexture ) data.map = material.map?.guid;
		if ( material.matcap && material.matcap.isTexture ) data.matcap = material.matcap?.guid;
		if ( material.alphaMap && material.alphaMap.isTexture ) data.alphaMap = getGUID( material, 'alphaMap' );

		if ( material.lightMap && material.lightMap.isTexture ) {

			data.lightMap = getGUID( material, 'lightMap' );
			data.lightMapIntensity = material.lightMapIntensity;

		}

		if ( material.aoMap && material.aoMap.isTexture ) {

			data.aoMap = getGUID( material, 'aoMap' );
			data.aoMapIntensity = material.aoMapIntensity;

		}

		if ( material.bumpMap && material.bumpMap.isTexture ) {

			data.bumpMap = getGUID( material, 'bumpMap' );
			data.bumpScale = material.bumpScale;

		}

		if ( material.normalMap && material.normalMap.isTexture ) {

			data.normalMap = getGUID( material, 'normalMap' );
			data.normalMapType = material.normalMapType;
			data.normalScale = material.normalScale.toArray();

		}

		if ( material.displacementMap && material.displacementMap.isTexture ) {

			data.displacementMap = getGUID( material, 'displacementMap' );
			data.displacementScale = material.displacementScale;
			data.displacementBias = material.displacementBias;

		}

		if ( material.roughnessMap && material.roughnessMap.isTexture ) data.roughnessMap = getGUID( material, 'roughnessMap' );
		if ( material.metalnessMap && material.metalnessMap.isTexture ) data.metalnessMap = getGUID( material, 'metalnessMap' );

		if ( material.emissiveMap && material.emissiveMap.isTexture ) data.emissiveMap = getGUID( material, 'emissiveMap' );
		if ( material.specularMap && material.specularMap.isTexture ) data.specularMap = getGUID( material, 'specularMap' );
		if ( material.specularIntensityMap && material.specularIntensityMap.isTexture ) data.specularIntensityMap = getGUID( material, 'specularIntensityMap' );
		if ( material.specularColorMap && material.specularColorMap.isTexture ) data.specularColorMap = getGUID( material, 'specularColorMap' );

		if ( material.envMap && material.envMap.isTexture ) {

			data.envMap = getGUID( material, 'envMap' );

			if ( material.combine !== undefined ) data.combine = material.combine;

		}

		if ( material.envMapIntensity !== undefined ) data.envMapIntensity = material.envMapIntensity;
		if ( material.reflectivity !== undefined ) data.reflectivity = material.reflectivity;
		if ( material.refractionRatio !== undefined ) data.refractionRatio = material.refractionRatio;

		if ( material.gradientMap && material.gradientMap.isTexture ) {

			data.gradientMap = getGUID( material, 'gradientMap' );

		}

		if ( material.transmission !== undefined ) data.transmission = material.transmission;
		if ( material.transmissionMap && material.transmissionMap.isTexture ) data.transmissionMap = getGUID( material, 'transmissionMap' );
		if ( material.thickness !== undefined ) data.thickness = material.thickness;
		if ( material.thicknessMap && material.thicknessMap.isTexture ) data.thicknessMap = getGUID( material, 'thicknessMap' );
		if ( material.attenuationDistance !== undefined && material.attenuationDistance !== Infinity ) data.attenuationDistance = material.attenuationDistance;
		if ( material.attenuationColor !== undefined ) data.attenuationColor = material.attenuationColor.getHex();

		if ( material.size !== undefined ) data.size = material.size;
		if ( material.shadowSide !== null ) data.shadowSide = material.shadowSide;
		if ( material.sizeAttenuation !== undefined ) data.sizeAttenuation = material.sizeAttenuation;

		if ( material.blending !== NormalBlending ) data.blending = material.blending;
		if ( material.side !== FrontSide ) data.side = material.side;
		if ( material.vertexColors === true ) data.vertexColors = true;

		if ( material.opacity < 1 ) data.opacity = material.opacity;
		if ( material.transparent === true ) data.transparent = true;

		data.depthFunc = material.depthFunc;
		data.depthTest = material.depthTest;
		data.depthWrite = material.depthWrite;
		data.colorWrite = material.colorWrite;

		data.stencilWrite = material.stencilWrite;
		data.stencilWriteMask = material.stencilWriteMask;
		data.stencilFunc = material.stencilFunc;
		data.stencilRef = material.stencilRef;
		data.stencilFuncMask = material.stencilFuncMask;
		data.stencilFail = material.stencilFail;
		data.stencilZFail = material.stencilZFail;
		data.stencilZPass = material.stencilZPass;

		// rotation (SpriteMaterial)
		if ( material.rotation !== undefined && material.rotation !== 0 ) data.rotation = material.rotation;

		if ( material.polygonOffset === true ) data.polygonOffset = true;
		if ( material.polygonOffsetFactor !== 0 ) data.polygonOffsetFactor = material.polygonOffsetFactor;
		if ( material.polygonOffsetUnits !== 0 ) data.polygonOffsetUnits = material.polygonOffsetUnits;

		if ( material.linewidth !== undefined && material.linewidth !== 1 ) data.linewidth = material.linewidth;
		if ( material.dashSize !== undefined ) data.dashSize = material.dashSize;
		if ( material.gapSize !== undefined ) data.gapSize = material.gapSize;
		if ( material.scale !== undefined ) data.scale = material.scale;

		if ( material.dithering === true ) data.dithering = true;

		if ( material.alphaTest > 0 ) data.alphaTest = material.alphaTest;
		if ( material.alphaHash === true ) data.alphaHash = true;
		if ( material.alphaToCoverage === true ) data.alphaToCoverage = true;
		if ( material.premultipliedAlpha === true ) data.premultipliedAlpha = true;
		if ( material.forceSinglePass === true ) data.forceSinglePass = true;

		if ( material.wireframe === true ) data.wireframe = true;
		if ( material.wireframeLinewidth > 1 ) data.wireframeLinewidth = material.wireframeLinewidth;
		if ( material.wireframeLinecap !== 'round' ) data.wireframeLinecap = material.wireframeLinecap;
		if ( material.wireframeLinejoin !== 'round' ) data.wireframeLinejoin = material.wireframeLinejoin;

		if ( material.flatShading === true ) data.flatShading = true;

		if ( material.visible === false ) data.visible = false;

		if ( material.toneMapped === false ) data.toneMapped = false;

		if ( material.fog === false ) data.fog = false;

		if ( Object.keys( material.userData ).length > 0 ) data.userData = material.userData;

		// // TODO: Copied from Object3D.toJSON

		// function extractFromCache ( cache ) {

		// 	const values = [];

		// 	for ( const key in cache ) {

		// 		const data = cache[ key ];
		// 		delete data.metadata;
		// 		values.push( data );

		// 	}

		// 	return values;

		// }

		// if ( isRootObject ) {

		// 	const textures = extractFromCache( meta.textures );
		// 	const images = extractFromCache( meta.images );

		// 	if ( textures.length > 0 ) data.textures = textures;
		// 	if ( images.length > 0 ) data.images = images;

		// }

		return data;

	}
}
