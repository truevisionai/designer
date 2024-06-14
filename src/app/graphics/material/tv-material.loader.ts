/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import {
	Color,
	LineBasicMaterial,
	LineDashedMaterial,
	Material,
	Matrix3,
	Matrix4,
	MeshBasicMaterial,
	MeshDepthMaterial,
	MeshDistanceMaterial,
	MeshLambertMaterial,
	MeshMatcapMaterial,
	MeshNormalMaterial,
	MeshPhongMaterial,
	MeshPhysicalMaterial,
	MeshStandardMaterial,
	MeshToonMaterial,
	PointsMaterial,
	RawShaderMaterial,
	ShaderMaterial,
	ShadowMaterial,
	SpriteMaterial,
	Vector2,
	Vector3,
	Vector4
} from 'three';
import { Asset } from 'app/core/asset/asset.model';
import { StorageService } from 'app/io/storage.service';
import { Injectable } from '@angular/core';
import { MaterialAsset } from "./tv-material.asset";
import { TvTextureService } from "../texture/tv-texture.service";
import { AssetLoader } from "../../core/interfaces/asset.loader";
import { TvTexture } from '../texture/tv-texture.model';
import { AssetService } from "../../core/asset/asset.service";
import { isObject } from "rxjs/internal-compatibility";
import { COLOR } from 'app/views/shared/utils/colors.service';

@Injectable( {
	providedIn: 'root'
} )
export class TvMaterialLoader implements AssetLoader {

	constructor (
		private assetService: AssetService,
		private storageService: StorageService,
		private textureService: TvTextureService,
	) {
	}

	load ( asset: Asset ): MaterialAsset {

		const contents = this.storageService.readSync( asset.path );

		const data = JSON.parse( contents );

		if ( data.version === '0.2' || data.version === 0.2 ) {
			return this.parseVersion02( data );
		}

		if ( data.version == '0.1' || data.version == 0.1 ) {
			return this.parseVersion01( data );
		}

		if ( data.metadata?.generator == 'Material.toJSON' ) {
			return this.parseVersion01( data );
		}

	}

	private parseVersion01 ( data: any ) {

		if ( !data.guid ) data.guid = data.uuid;

		const material = this.parse( data );

		const materialAsset = new MaterialAsset( data.guid, material );

		if ( data.mapGuid ) {
			materialAsset.setMap( 'map', this.getTexture( data.mapGuid ) );
		}

		if ( data.roughnessMapGuid ) {
			materialAsset.setMap( 'roughnessMap', this.getTexture( data.roughnessMapGuid ) );
		}

		if ( data.metalnessMapGuid ) {
			materialAsset.setMap( 'metalnessMap', this.getTexture( data.metalnessMapGuid ) );
		}

		if ( data.normalMapGuid ) {
			materialAsset.setMap( 'normalMap', this.getTexture( data.normalMapGuid ) );
		}

		if ( data.aoMapGuid ) {
			materialAsset.setMap( 'aoMap', this.getTexture( data.aoMapGuid ) );
		}

		if ( data.displacementMapGuid ) {
			materialAsset.setMap( 'displacementMap', this.getTexture( data.displacementMapGuid ) );
		}

		if ( data.alphaMapGuid ) {
			materialAsset.setMap( 'alphaMap', this.getTexture( data.alphaMapGuid ) );
		}

		if ( data.emissiveMapGuid ) {
			materialAsset.setMap( 'emissiveMap', this.getTexture( data.emissiveMapGuid ) );
		}

		if ( data.specularMapGuid ) {
			materialAsset.setMap( 'specularMap', this.getTexture( data.specularMapGuid ) );
		}

		if ( data.envMapGuid ) {
			materialAsset.setMap( 'envMap', this.getTexture( data.envMapGuid ) );
		}

		return materialAsset;
	}

	private parseVersion02 ( data: any ): MaterialAsset {

		const material = this.parse( data );

		const materialAsset = new MaterialAsset( data.guid, material );

		if ( isObject( data.textureGuids ) ) {

			for ( const mapKey of Object.keys( data.textureGuids ) ) {

				const guid = data.textureGuids[ mapKey ];

				const map = this.getTexture( guid );

				if ( map ) {

					materialAsset.setMap( mapKey, map );

				} else {

					console.error( 'Texture map not found', guid );

				}

			}
		}

		return materialAsset;

	}

	private getTexture ( guid: string ): TvTexture {

		if ( guid === undefined ) {

			console.warn( 'TvMaterialLoader: Undefined texture', guid );

		}

		return this.textureService.getTexture( guid )?.texture;

	}

	parse ( json: any ): Material {

		const material = TvMaterialLoader.createMaterialFromType( json.type );

		if ( json.guid !== undefined ) material.guid = json.guid;

		if ( !material.guid ) {
			console.error( 'Material guid not found', json );
			return new MeshBasicMaterial( { color: COLOR.MAGENTA } );
		}

		if ( json.uuid !== undefined ) material.uuid = json.uuid;
		if ( json.name !== undefined ) material.name = json.name;
		if ( json.color !== undefined && material.color !== undefined ) material.color.setHex( json.color );
		if ( json.roughness !== undefined ) material.roughness = json.roughness;
		if ( json.metalness !== undefined ) material.metalness = json.metalness;
		if ( json.sheen !== undefined ) material.sheen = json.sheen;
		if ( json.sheenColor !== undefined ) material.sheenColor = new Color().setHex( json.sheenColor );
		if ( json.sheenRoughness !== undefined ) material.sheenRoughness = json.sheenRoughness;
		if ( json.emissive !== undefined && material.emissive !== undefined ) material.emissive.setHex( json.emissive );
		if ( json.specular !== undefined && material.specular !== undefined ) material.specular.setHex( json.specular );
		if ( json.specularIntensity !== undefined ) material.specularIntensity = json.specularIntensity;
		if ( json.specularColor !== undefined && material.specularColor !== undefined ) material.specularColor.setHex( json.specularColor );
		if ( json.shininess !== undefined ) material.shininess = json.shininess;
		if ( json.clearcoat !== undefined ) material.clearcoat = json.clearcoat;
		if ( json.clearcoatRoughness !== undefined ) material.clearcoatRoughness = json.clearcoatRoughness;
		if ( json.iridescence !== undefined ) material.iridescence = json.iridescence;
		if ( json.iridescenceIOR !== undefined ) material.iridescenceIOR = json.iridescenceIOR;
		if ( json.iridescenceThicknessRange !== undefined ) material.iridescenceThicknessRange = json.iridescenceThicknessRange;
		if ( json.transmission !== undefined ) material.transmission = json.transmission;
		if ( json.thickness !== undefined ) material.thickness = json.thickness;
		if ( json.attenuationDistance !== undefined ) material.attenuationDistance = json.attenuationDistance;
		if ( json.attenuationColor !== undefined && material.attenuationColor !== undefined ) material.attenuationColor.setHex( json.attenuationColor );
		if ( json.anisotropy !== undefined ) material.anisotropy = json.anisotropy;
		if ( json.anisotropyRotation !== undefined ) material.anisotropyRotation = json.anisotropyRotation;
		if ( json.fog !== undefined ) material.fog = json.fog;
		if ( json.flatShading !== undefined ) material.flatShading = json.flatShading;
		if ( json.blending !== undefined ) material.blending = json.blending;
		if ( json.combine !== undefined ) material.combine = json.combine;
		if ( json.side !== undefined ) material.side = json.side;
		if ( json.shadowSide !== undefined ) material.shadowSide = json.shadowSide;
		if ( json.opacity !== undefined ) material.opacity = json.opacity;
		if ( json.transparent !== undefined ) material.transparent = json.transparent;
		if ( json.alphaTest !== undefined ) material.alphaTest = json.alphaTest;
		if ( json.alphaHash !== undefined ) material.alphaHash = json.alphaHash;
		if ( json.depthFunc !== undefined ) material.depthFunc = json.depthFunc;
		if ( json.depthTest !== undefined ) material.depthTest = json.depthTest;
		if ( json.depthWrite !== undefined ) material.depthWrite = json.depthWrite;
		if ( json.colorWrite !== undefined ) material.colorWrite = json.colorWrite;
		if ( json.blendSrc !== undefined ) material.blendSrc = json.blendSrc;
		if ( json.blendDst !== undefined ) material.blendDst = json.blendDst;
		if ( json.blendEquation !== undefined ) material.blendEquation = json.blendEquation;
		if ( json.blendSrcAlpha !== undefined ) material.blendSrcAlpha = json.blendSrcAlpha;
		if ( json.blendDstAlpha !== undefined ) material.blendDstAlpha = json.blendDstAlpha;
		if ( json.blendEquationAlpha !== undefined ) material.blendEquationAlpha = json.blendEquationAlpha;
		if ( json.blendColor !== undefined && material.blendColor !== undefined ) material.blendColor.setHex( json.blendColor );
		if ( json.blendAlpha !== undefined ) material.blendAlpha = json.blendAlpha;
		if ( json.stencilWriteMask !== undefined ) material.stencilWriteMask = json.stencilWriteMask;
		if ( json.stencilFunc !== undefined ) material.stencilFunc = json.stencilFunc;
		if ( json.stencilRef !== undefined ) material.stencilRef = json.stencilRef;
		if ( json.stencilFuncMask !== undefined ) material.stencilFuncMask = json.stencilFuncMask;
		if ( json.stencilFail !== undefined ) material.stencilFail = json.stencilFail;
		if ( json.stencilZFail !== undefined ) material.stencilZFail = json.stencilZFail;
		if ( json.stencilZPass !== undefined ) material.stencilZPass = json.stencilZPass;
		if ( json.stencilWrite !== undefined ) material.stencilWrite = json.stencilWrite;

		if ( json.wireframe !== undefined ) material.wireframe = json.wireframe;
		if ( json.wireframeLinewidth !== undefined ) material.wireframeLinewidth = json.wireframeLinewidth;
		if ( json.wireframeLinecap !== undefined ) material.wireframeLinecap = json.wireframeLinecap;
		if ( json.wireframeLinejoin !== undefined ) material.wireframeLinejoin = json.wireframeLinejoin;

		if ( json.rotation !== undefined ) material.rotation = json.rotation;

		if ( json.linewidth !== undefined ) material.linewidth = json.linewidth;
		if ( json.dashSize !== undefined ) material.dashSize = json.dashSize;
		if ( json.gapSize !== undefined ) material.gapSize = json.gapSize;
		if ( json.scale !== undefined ) material.scale = json.scale;

		if ( json.polygonOffset !== undefined ) material.polygonOffset = json.polygonOffset;
		if ( json.polygonOffsetFactor !== undefined ) material.polygonOffsetFactor = json.polygonOffsetFactor;
		if ( json.polygonOffsetUnits !== undefined ) material.polygonOffsetUnits = json.polygonOffsetUnits;

		if ( json.dithering !== undefined ) material.dithering = json.dithering;

		if ( json.alphaToCoverage !== undefined ) material.alphaToCoverage = json.alphaToCoverage;
		if ( json.premultipliedAlpha !== undefined ) material.premultipliedAlpha = json.premultipliedAlpha;
		if ( json.forceSinglePass !== undefined ) material.forceSinglePass = json.forceSinglePass;

		if ( json.visible !== undefined ) material.visible = json.visible;

		if ( json.toneMapped !== undefined ) material.toneMapped = json.toneMapped;

		if ( json.userData !== undefined ) material.userData = json.userData;

		if ( json.vertexColors !== undefined ) {

			if ( typeof json.vertexColors === 'number' ) {

				material.vertexColors = json.vertexColors > 0 ? true : false;

			} else {

				material.vertexColors = json.vertexColors;

			}

		}

		// Shader Material

		if ( json.uniforms !== undefined ) {

			for ( const name in json.uniforms ) {

				const uniform = json.uniforms[ name ];

				material.uniforms[ name ] = {};

				switch ( uniform.type ) {

					case 't':
						material.uniforms[ name ].value = this.getTexture( uniform.value );
						break;

					case 'c':
						material.uniforms[ name ].value = new Color().setHex( uniform.value );
						break;

					case 'v2':
						material.uniforms[ name ].value = new Vector2().fromArray( uniform.value );
						break;

					case 'v3':
						material.uniforms[ name ].value = new Vector3().fromArray( uniform.value );
						break;

					case 'v4':
						material.uniforms[ name ].value = new Vector4().fromArray( uniform.value );
						break;

					case 'm3':
						material.uniforms[ name ].value = new Matrix3().fromArray( uniform.value );
						break;

					case 'm4':
						material.uniforms[ name ].value = new Matrix4().fromArray( uniform.value );
						break;

					default:
						material.uniforms[ name ].value = uniform.value;

				}

			}

		}

		if ( json.defines !== undefined ) material.defines = json.defines;
		if ( json.vertexShader !== undefined ) material.vertexShader = json.vertexShader;
		if ( json.fragmentShader !== undefined ) material.fragmentShader = json.fragmentShader;
		if ( json.glslVersion !== undefined ) material.glslVersion = json.glslVersion;

		if ( json.extensions !== undefined ) {

			for ( const key in json.extensions ) {

				material.extensions[ key ] = json.extensions[ key ];

			}

		}

		if ( json.lights !== undefined ) material.lights = json.lights;
		if ( json.clipping !== undefined ) material.clipping = json.clipping;

		// for PointsMaterial

		if ( json.size !== undefined ) material.size = json.size;
		if ( json.sizeAttenuation !== undefined ) material.sizeAttenuation = json.sizeAttenuation;

		// maps

		if ( json.map !== undefined ) material.map = this.getTexture( json.map );
		if ( json.matcap !== undefined ) material.matcap = this.getTexture( json.matcap );

		if ( json.alphaMap !== undefined ) material.alphaMap = this.getTexture( json.alphaMap );

		if ( json.bumpMap !== undefined ) material.bumpMap = this.getTexture( json.bumpMap );
		if ( json.bumpScale !== undefined ) material.bumpScale = json.bumpScale;

		if ( json.normalMap !== undefined ) material.normalMap = this.getTexture( json.normalMap );
		if ( json.normalMapType !== undefined ) material.normalMapType = json.normalMapType;
		if ( json.normalScale !== undefined ) {

			let normalScale = json.normalScale;

			if ( Array.isArray( normalScale ) === false ) {

				// Blender exporter used to export a scalar. See #7459

				normalScale = [ normalScale, normalScale ];

			}

			material.normalScale = new Vector2().fromArray( normalScale );

		}

		if ( json.displacementMap !== undefined ) material.displacementMap = this.getTexture( json.displacementMap );
		if ( json.displacementScale !== undefined ) material.displacementScale = json.displacementScale;
		if ( json.displacementBias !== undefined ) material.displacementBias = json.displacementBias;

		if ( json.roughnessMap !== undefined ) material.roughnessMap = this.getTexture( json.roughnessMap );
		if ( json.metalnessMap !== undefined ) material.metalnessMap = this.getTexture( json.metalnessMap );

		if ( json.emissiveMap !== undefined ) material.emissiveMap = this.getTexture( json.emissiveMap );
		if ( json.emissiveIntensity !== undefined ) material.emissiveIntensity = json.emissiveIntensity;

		if ( json.specularMap !== undefined ) material.specularMap = this.getTexture( json.specularMap );
		if ( json.specularIntensityMap !== undefined ) material.specularIntensityMap = this.getTexture( json.specularIntensityMap );
		if ( json.specularColorMap !== undefined ) material.specularColorMap = this.getTexture( json.specularColorMap );

		if ( json.envMap !== undefined ) material.envMap = this.getTexture( json.envMap );
		if ( json.envMapRotation !== undefined ) material.envMapRotation.fromArray( json.envMapRotation );
		if ( json.envMapIntensity !== undefined ) material.envMapIntensity = json.envMapIntensity;

		if ( json.reflectivity !== undefined ) material.reflectivity = json.reflectivity;
		if ( json.refractionRatio !== undefined ) material.refractionRatio = json.refractionRatio;

		if ( json.lightMap !== undefined ) material.lightMap = this.getTexture( json.lightMap );
		if ( json.lightMapIntensity !== undefined ) material.lightMapIntensity = json.lightMapIntensity;

		if ( json.aoMap !== undefined ) material.aoMap = this.getTexture( json.aoMap );
		if ( json.aoMapIntensity !== undefined ) material.aoMapIntensity = json.aoMapIntensity;

		if ( json.gradientMap !== undefined ) material.gradientMap = this.getTexture( json.gradientMap );

		if ( json.clearcoatMap !== undefined ) material.clearcoatMap = this.getTexture( json.clearcoatMap );
		if ( json.clearcoatRoughnessMap !== undefined ) material.clearcoatRoughnessMap = this.getTexture( json.clearcoatRoughnessMap );
		if ( json.clearcoatNormalMap !== undefined ) material.clearcoatNormalMap = this.getTexture( json.clearcoatNormalMap );
		if ( json.clearcoatNormalScale !== undefined ) material.clearcoatNormalScale = new Vector2().fromArray( json.clearcoatNormalScale );

		if ( json.iridescenceMap !== undefined ) material.iridescenceMap = this.getTexture( json.iridescenceMap );
		if ( json.iridescenceThicknessMap !== undefined ) material.iridescenceThicknessMap = this.getTexture( json.iridescenceThicknessMap );

		if ( json.transmissionMap !== undefined ) material.transmissionMap = this.getTexture( json.transmissionMap );
		if ( json.thicknessMap !== undefined ) material.thicknessMap = this.getTexture( json.thicknessMap );

		if ( json.anisotropyMap !== undefined ) material.anisotropyMap = this.getTexture( json.anisotropyMap );

		if ( json.sheenColorMap !== undefined ) material.sheenColorMap = this.getTexture( json.sheenColorMap );
		if ( json.sheenRoughnessMap !== undefined ) material.sheenRoughnessMap = this.getTexture( json.sheenRoughnessMap );

		return material;

	}

	static createMaterialFromType ( type ) {

		const materialLib = {
			ShadowMaterial,
			SpriteMaterial,
			RawShaderMaterial,
			ShaderMaterial,
			PointsMaterial,
			MeshPhysicalMaterial,
			MeshStandardMaterial,
			MeshPhongMaterial,
			MeshToonMaterial,
			MeshNormalMaterial,
			MeshLambertMaterial,
			MeshDepthMaterial,
			MeshDistanceMaterial,
			MeshBasicMaterial,
			MeshMatcapMaterial,
			LineDashedMaterial,
			LineBasicMaterial,
			Material
		};

		return new materialLib[ type ]();

	}
}
