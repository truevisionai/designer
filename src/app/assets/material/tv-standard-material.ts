/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { FrontSide, MeshStandardMaterial, NormalBlending } from 'three';

export class TvStandardMaterial extends MeshStandardMaterial {

	public mapGuid: string;

	public roughnessMapGuid: string;

	public normalMapGuid: string;

	public aoMapGuid: string;

	public displacementMapGuid: string;

	public alphaMapGuid: string;

	constructor ( public guid: string ) {

		super();

	}

	clone (): this {

		const material = super.clone();

		material.guid = this.guid;

		material.mapGuid = this.mapGuid;

		material.roughnessMapGuid = this.roughnessMapGuid;

		material.normalMapGuid = this.normalMapGuid;

		material.aoMapGuid = this.aoMapGuid;

		material.displacementMapGuid = this.displacementMapGuid;

		material.alphaMapGuid = this.alphaMapGuid;

		return material as this;

	}

	toJSON ( meta?: any ): any {

		const isRootObject = ( meta === undefined || typeof meta === 'string' );

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

		const material = this as any;

		// standard Material serialization
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

			data.clearcoatMap = material.clearcoatMap?.guid;

		}

		if ( material.clearcoatRoughnessMap && material.clearcoatRoughnessMap.isTexture ) {

			data.clearcoatRoughnessMap = material.clearcoatRoughnessMap?.guid;

		}

		if ( material.clearcoatNormalMap && material.clearcoatNormalMap.isTexture ) {

			data.clearcoatNormalMap = material.clearcoatNormalMap?.guid;
			data.clearcoatNormalScale = material.clearcoatNormalScale.toArray();

		}

		if ( material.iridescence !== undefined ) data.iridescence = material.iridescence;
		if ( material.iridescenceIOR !== undefined ) data.iridescenceIOR = material.iridescenceIOR;
		if ( material.iridescenceThicknessRange !== undefined ) data.iridescenceThicknessRange = material.iridescenceThicknessRange;

		if ( material.iridescenceMap && material.iridescenceMap.isTexture ) {

			data.iridescenceMap = material.iridescenceMap?.guid;

		}

		if ( material.iridescenceThicknessMap && material.iridescenceThicknessMap.isTexture ) {

			data.iridescenceThicknessMap = material.iridescenceThicknessMap?.guid;

		}

		if ( material.anisotropy !== undefined ) data.anisotropy = material.anisotropy;
		if ( material.anisotropyRotation !== undefined ) data.anisotropyRotation = material.anisotropyRotation;

		if ( material.anisotropyMap && material.anisotropyMap.isTexture ) {

			data.anisotropyMap = material.anisotropyMap?.guid;

		}

		if ( material.map && material.map.isTexture ) data.map = material.map?.guid;
		if ( material.matcap && material.matcap.isTexture ) data.matcap = material.matcap?.guid;
		if ( material.alphaMap && material.alphaMap.isTexture ) data.alphaMap = material.alphaMap?.guid;

		if ( material.lightMap && material.lightMap.isTexture ) {

			data.lightMap = material.lightMap?.guid;
			data.lightMapIntensity = material.lightMapIntensity;

		}

		if ( material.aoMap && material.aoMap.isTexture ) {

			data.aoMap = material.aoMap?.guid;
			data.aoMapIntensity = material.aoMapIntensity;

		}

		if ( material.bumpMap && material.bumpMap.isTexture ) {

			data.bumpMap = material.bumpMap?.guid;
			data.bumpScale = material.bumpScale;

		}

		if ( material.normalMap && material.normalMap.isTexture ) {

			data.normalMap = material.normalMap?.guid;
			data.normalMapType = material.normalMapType;
			data.normalScale = material.normalScale.toArray();

		}

		if ( material.displacementMap && material.displacementMap.isTexture ) {

			data.displacementMap = material.displacementMap?.guid;
			data.displacementScale = material.displacementScale;
			data.displacementBias = material.displacementBias;

		}

		if ( material.roughnessMap && material.roughnessMap.isTexture ) data.roughnessMap = material.roughnessMap?.guid;
		if ( material.metalnessMap && material.metalnessMap.isTexture ) data.metalnessMap = material.metalnessMap?.guid;

		if ( material.emissiveMap && material.emissiveMap.isTexture ) data.emissiveMap = material.emissiveMap?.guid;
		if ( material.specularMap && material.specularMap.isTexture ) data.specularMap = material.specularMap?.guid;
		if ( material.specularIntensityMap && material.specularIntensityMap.isTexture ) data.specularIntensityMap = material.specularIntensityMap?.guid;
		if ( material.specularColorMap && material.specularColorMap.isTexture ) data.specularColorMap = material.specularColorMap?.guid;

		if ( material.envMap && material.envMap.isTexture ) {

			data.envMap = material.envMap?.guid;

			if ( material.combine !== undefined ) data.combine = material.combine;

		}

		if ( material.envMapIntensity !== undefined ) data.envMapIntensity = material.envMapIntensity;
		if ( material.reflectivity !== undefined ) data.reflectivity = material.reflectivity;
		if ( material.refractionRatio !== undefined ) data.refractionRatio = material.refractionRatio;

		if ( material.gradientMap && material.gradientMap.isTexture ) {

			data.gradientMap = material.gradientMap?.guid;

		}

		if ( material.transmission !== undefined ) data.transmission = material.transmission;
		if ( material.transmissionMap && material.transmissionMap.isTexture ) data.transmissionMap = material.transmissionMap?.guid;
		if ( material.thickness !== undefined ) data.thickness = material.thickness;
		if ( material.thicknessMap && material.thicknessMap.isTexture ) data.thicknessMap = material.thicknessMap?.guid;
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

		// TODO: Copied from Object3D.toJSON

		function extractFromCache ( cache: any ): any[] {

			const values = [];

			for ( const key in cache ) {

				const data = cache[ key ];
				delete data.metadata;
				values.push( data );

			}

			return values;

		}

		if ( isRootObject ) {

			const textures = extractFromCache( meta.textures );
			const images = extractFromCache( meta.images );

			if ( textures.length > 0 ) data.textures = textures;
			if ( images.length > 0 ) data.images = images;

		}

		return data;

	}
}
