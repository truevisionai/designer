/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MeshStandardMaterial, MeshStandardMaterialParameters, Math, Texture } from 'three';
import { AppService } from 'app/core/services/app.service';

export class TvMaterial extends MeshStandardMaterial {

    public mapGuid: string;
    public roughnessMapGuid: string;
    public normalMapGuid: string;
    public aoMapGuid: string;
    public displacementMapGuid: string;


    constructor ( public guid: string, parameters?: MeshStandardMaterialParameters ) {
        super( parameters )
    }

    static new ( name = 'NewMaterial' ) {

        return new TvMaterial( Math.generateUUID(), { name: name } );

    }

    static parseString ( value: string ): TvMaterial {

        return this.parseJSON( JSON.parse( value ) );

    }

    static parseJSON ( json: any ): TvMaterial {

        function getTexture ( guid ) {

            return AppService.assets.getInstance( guid ) as Texture;

        }

        var material = new TvMaterial( Math.generateUUID() );

        if ( json.uuid !== undefined ) material.uuid = json.uuid;
        if ( json.name !== undefined ) material.name = json.name;
        if ( json.color !== undefined ) material.color.setHex( json.color );
        if ( json.roughness !== undefined ) material.roughness = json.roughness;
        if ( json.metalness !== undefined ) material.metalness = json.metalness;
        if ( json.emissive !== undefined ) material.emissive.setHex( json.emissive );
        // if ( json.specular !== undefined ) material.specular.setHex( json.specular );
        // if ( json.shininess !== undefined ) material.shininess = json.shininess;
        // if ( json.clearCoat !== undefined ) material.clearCoat = json.clearCoat;
        // if ( json.clearCoatRoughness !== undefined ) material.clearCoatRoughness = json.clearCoatRoughness;
        if ( json.vertexColors !== undefined ) material.vertexColors = json.vertexColors;
        if ( json.fog !== undefined ) material.fog = json.fog;
        if ( json.flatShading !== undefined ) material.flatShading = json.flatShading;
        if ( json.blending !== undefined ) material.blending = json.blending;
        // if ( json.combine !== undefined ) material.combine = json.combine;
        if ( json.side !== undefined ) material.side = json.side;
        if ( json.opacity !== undefined ) material.opacity = json.opacity;
        if ( json.transparent !== undefined ) material.transparent = json.transparent;
        if ( json.alphaTest !== undefined ) material.alphaTest = json.alphaTest;
        if ( json.depthTest !== undefined ) material.depthTest = json.depthTest;
        if ( json.depthWrite !== undefined ) material.depthWrite = json.depthWrite;
        if ( json.colorWrite !== undefined ) material.colorWrite = json.colorWrite;
        if ( json.wireframe !== undefined ) material.wireframe = json.wireframe;
        if ( json.wireframeLinewidth !== undefined ) material.wireframeLinewidth = json.wireframeLinewidth;
        // if ( json.wireframeLinecap !== undefined ) material.wireframeLinecap = json.wireframeLinecap;
        // if ( json.wireframeLinejoin !== undefined ) material.wireframeLinejoin = json.wireframeLinejoin;

        // if ( json.rotation !== undefined ) material.rotation = json.rotation;

        // if ( json.linewidth !== 1 ) material.linewidth = json.linewidth;
        // if ( json.dashSize !== undefined ) material.dashSize = json.dashSize;
        // if ( json.gapSize !== undefined ) material.gapSize = json.gapSize;
        // if ( json.scale !== undefined ) material.scale = json.scale;

        if ( json.polygonOffset !== undefined ) material.polygonOffset = json.polygonOffset;
        if ( json.polygonOffsetFactor !== undefined ) material.polygonOffsetFactor = json.polygonOffsetFactor;
        if ( json.polygonOffsetUnits !== undefined ) material.polygonOffsetUnits = json.polygonOffsetUnits;

        if ( json.skinning !== undefined ) material.skinning = json.skinning;
        if ( json.morphTargets !== undefined ) material.morphTargets = json.morphTargets;
        if ( json.dithering !== undefined ) material.dithering = json.dithering;

        if ( json.visible !== undefined ) material.visible = json.visible;
        if ( json.userData !== undefined ) material.userData = json.userData;

        // maps
        if ( json.mapGuid !== undefined ) {
            material.mapGuid = json.mapGuid;
            material.map = getTexture( json.mapGuid );
        }

        if ( json.roughnessMapGuid !== undefined ) {
            material.roughnessMapGuid = json.roughnessMapGuid;
            material.roughnessMap = getTexture( json.roughnessMapGuid );
        }
        
        if ( json.normalMapGuid !== undefined ) {
            material.normalMapGuid = json.normalMapGuid;
            material.normalMap = getTexture( json.normalMapGuid );
        }

        if ( json.aoMapGuid !== undefined ) {
            material.aoMapGuid = json.aoMapGuid;
            material.aoMap = getTexture( json.aoMapGuid );
        }

        if ( json.displacementMapGuid !== undefined ) {
            material.displacementMapGuid = json.displacementMapGuid;
            material.displacementMap = getTexture( json.displacementMapGuid );
        }


        // if ( json.alphaMap !== undefined ) {

        //     material.alphaMap = getTexture( json.alphaMap );
        //     material.transparent = true;

        // }

        // if ( json.bumpMap !== undefined ) material.bumpMap = getTexture( json.bumpMap );
        // if ( json.bumpScale !== undefined ) material.bumpScale = json.bumpScale;

        // if ( json.normalMap !== undefined ) material.normalMap = getTexture( json.normalMap );

        // if ( json.displacementMap !== undefined ) material.displacementMap = getTexture( json.displacementMap );
        // if ( json.displacementScale !== undefined ) material.displacementScale = json.displacementScale;
        // if ( json.displacementBias !== undefined ) material.displacementBias = json.displacementBias;

        // if ( json.roughnessMap !== undefined ) material.roughnessMap = getTexture( json.roughnessMap );
        // if ( json.metalnessMap !== undefined ) material.metalnessMap = getTexture( json.metalnessMap );

        // if ( json.emissiveMap !== undefined ) material.emissiveMap = getTexture( json.emissiveMap );
        // if ( json.emissiveIntensity !== undefined ) material.emissiveIntensity = json.emissiveIntensity;

        // // if ( json.specularMap !== undefined ) material.specularMap = getTexture( json.specularMap );

        // if ( json.envMap !== undefined ) material.envMap = getTexture( json.envMap );
        // if ( json.envMapIntensity !== undefined ) material.envMapIntensity = json.envMapIntensity;

        // // if ( json.reflectivity !== undefined ) material.reflectivity = json.reflectivity;

        // if ( json.lightMap !== undefined ) material.lightMap = getTexture( json.lightMap );
        // if ( json.lightMapIntensity !== undefined ) material.lightMapIntensity = json.lightMapIntensity;

        // if ( json.aoMap !== undefined ) material.aoMap = getTexture( json.aoMap );
        // if ( json.aoMapIntensity !== undefined ) material.aoMapIntensity = json.aoMapIntensity;

        // // if ( json.gradientMap !== undefined ) material.gradientMap = getTexture( json.gradientMap );

        return material;
    }

    toJSON ( meta?: any ): any {

        var isRoot = ( meta === undefined || typeof meta === 'string' );

        if ( isRoot ) {

            meta = {
                textures: {},
                images: {}
            };

        }

        var data: any = {
            version: 0.1,
        };

        // standard Material serialization
        data.uuid = this.uuid;
        data.type = this.type;

        if ( this.name !== '' ) data.name = this.name;

        if ( this.color ) data.color = this.color.getHex();

        if ( this.roughness !== undefined ) data.roughness = this.roughness;
        if ( this.metalness !== undefined ) data.metalness = this.metalness;

        if ( this.emissive ) data.emissive = this.emissive.getHex();
        if ( this.emissiveIntensity !== 1 ) data.emissiveIntensity = this.emissiveIntensity;

        // if ( this.specular && this.specular.isColor ) data.specular = this.specular.getHex();
        // if ( this.shininess !== undefined ) data.shininess = this.shininess;
        // if ( this.clearCoat !== undefined ) data.clearCoat = this.clearCoat;
        // if ( this.clearCoatRoughness !== undefined ) data.clearCoatRoughness = this.clearCoatRoughness;

        if ( this.mapGuid ) data.mapGuid = this.mapGuid;

        if ( this.roughnessMapGuid ) data.roughnessMapGuid = this.roughnessMapGuid;

        if ( this.normalMapGuid ) data.normalMapGuid = this.normalMapGuid;

        if ( this.aoMapGuid ) data.aoMapGuid = this.aoMapGuid;

        if ( this.displacementMapGuid ) data.displacementMapGuid = this.displacementMapGuid;

        // if ( this.alphaMap && this.alphaMap.isTexture ) data.alphaMap = this.alphaMap.toJSON( meta ).uuid;
        // if ( this.lightMap && this.lightMap.isTexture ) data.lightMap = this.lightMap.toJSON( meta ).uuid;

        // if ( this.aoMap && this.aoMap.isTexture ) {

        //     data.aoMap = this.aoMap.toJSON( meta ).uuid;
        //     data.aoMapIntensity = this.aoMapIntensity;

        // }

        // if ( this.bumpMap && this.bumpMap.isTexture ) {

        //     data.bumpMap = this.bumpMap.toJSON( meta ).uuid;
        //     data.bumpScale = this.bumpScale;

        // }

        // if ( this.normalMap && this.normalMap.isTexture ) {

        //     data.normalMap = this.normalMap.toJSON( meta ).uuid;
        //     data.normalMapType = this.normalMapType;
        //     data.normalScale = this.normalScale.toArray();

        // }

        // if ( this.displacementMap && this.displacementMap.isTexture ) {

        //     data.displacementMap = this.displacementMap.toJSON( meta ).uuid;
        //     data.displacementScale = this.displacementScale;
        //     data.displacementBias = this.displacementBias;

        // }

        // if ( this.roughnessMap && this.roughnessMap.isTexture ) data.roughnessMap = this.roughnessMap.toJSON( meta ).uuid;
        // if ( this.metalnessMap && this.metalnessMap.isTexture ) data.metalnessMap = this.metalnessMap.toJSON( meta ).uuid;

        // if ( this.emissiveMap && this.emissiveMap.isTexture ) data.emissiveMap = this.emissiveMap.toJSON( meta ).uuid;
        // if ( this.specularMap && this.specularMap.isTexture ) data.specularMap = this.specularMap.toJSON( meta ).uuid;

        // if ( this.envMap && this.envMap.isTexture ) {

        //     data.envMap = this.envMap.toJSON( meta ).uuid;
        //     data.reflectivity = this.reflectivity; // Scale behind envMap

        //     if ( this.combine !== undefined ) data.combine = this.combine;
        //     if ( this.envMapIntensity !== undefined ) data.envMapIntensity = this.envMapIntensity;

        // }

        // if ( this.gradientMap && this.gradientMap.isTexture ) {

        //     data.gradientMap = this.gradientMap.toJSON( meta ).uuid;

        // }

        // if ( this.size !== undefined ) data.size = this.size;
        // if ( this.sizeAttenuation !== undefined ) data.sizeAttenuation = this.sizeAttenuation;

        // if ( this.blending !== NormalBlending ) data.blending = this.blending;
        // if ( this.flatShading === true ) data.flatShading = this.flatShading;
        // if ( this.side !== FrontSide ) data.side = this.side;
        // if ( this.vertexColors !== NoColors ) data.vertexColors = this.vertexColors;

        // if ( this.opacity < 1 ) data.opacity = this.opacity;
        // if ( this.transparent === true ) data.transparent = this.transparent;

        data.depthFunc = this.depthFunc;
        data.depthTest = this.depthTest;
        data.depthWrite = this.depthWrite;

        // // rotation (SpriteMaterial)
        // if ( this.rotation !== 0 ) data.rotation = this.rotation;

        // if ( this.polygonOffset === true ) data.polygonOffset = true;
        // if ( this.polygonOffsetFactor !== 0 ) data.polygonOffsetFactor = this.polygonOffsetFactor;
        // if ( this.polygonOffsetUnits !== 0 ) data.polygonOffsetUnits = this.polygonOffsetUnits;

        // if ( this.linewidth !== 1 ) data.linewidth = this.linewidth;
        // if ( this.dashSize !== undefined ) data.dashSize = this.dashSize;
        // if ( this.gapSize !== undefined ) data.gapSize = this.gapSize;
        // if ( this.scale !== undefined ) data.scale = this.scale;

        // if ( this.dithering === true ) data.dithering = true;

        // if ( this.alphaTest > 0 ) data.alphaTest = this.alphaTest;
        // if ( this.premultipliedAlpha === true ) data.premultipliedAlpha = this.premultipliedAlpha;

        // if ( this.wireframe === true ) data.wireframe = this.wireframe;
        // if ( this.wireframeLinewidth > 1 ) data.wireframeLinewidth = this.wireframeLinewidth;
        // if ( this.wireframeLinecap !== 'round' ) data.wireframeLinecap = this.wireframeLinecap;
        // if ( this.wireframeLinejoin !== 'round' ) data.wireframeLinejoin = this.wireframeLinejoin;

        // if ( this.morphTargets === true ) data.morphTargets = true;
        // if ( this.skinning === true ) data.skinning = true;

        // if ( this.visible === false ) data.visible = false;

        if ( JSON.stringify( this.userData ) !== '{}' ) data.userData = this.userData;

        // TODO: Copied from Object3D.toJSON

        function extractFromCache ( cache ) {

            var values = [];

            for ( var key in cache ) {

                var data = cache[ key ];
                delete data.metadata;
                values.push( data );

            }

            return values;

        }

        if ( isRoot ) {

            var textures = extractFromCache( meta.textures );
            var images = extractFromCache( meta.images );

            if ( textures.length > 0 ) data.textures = textures;
            if ( images.length > 0 ) data.images = images;

        }

        return data;

    }

    toJSONString (): string {

        return JSON.stringify( this.toJSON(), null, 2 );

    }
}