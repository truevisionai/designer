/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable, Type } from '@angular/core';
import { Metadata } from '../models/metadata.model';
import { Vector3, Texture, MeshStandardMaterial, RepeatWrapping, UVMapping, ImageLoader, TextureLoader } from 'three';
import { FileService } from 'app/services/file.service';
import { FileNode } from 'app/views/editor/project-browser/file-node.model';
import { SnackBar } from 'app/services/snack-bar.service';
import { AssetDatabase } from 'app/services/asset-database';
import { AppService } from '../services/app.service';
import * as THREE from 'three';
import { TvRoadMarking } from "app/modules/tv-map/models/tv-road-marking";
import { RoadStyle } from 'app/services/road-style.service';

@Injectable( {
    providedIn: 'root'
} )
export class MetadataFactory {

    private static get fileService (): FileService {

        return AppService.file;

    }

    static saveMetadataFile ( file: FileNode | string, metadata: Metadata ): void {

        try {

            let path = null;

            if ( typeof ( file ) === 'string' ) path = file;

            if ( typeof ( file ) === 'object' ) path = file.path;

            if ( !path.includes( '.meta' ) ) path = path + '.meta';

            this.fileService.fs.writeFileSync( path, JSON.stringify( metadata, null, 2 ) );

        } catch ( error ) {

            console.error( error );

            SnackBar.error( "Error in writing .meta file. Please Reimport the asset.", "", 5000 );
        }

    }

    static createMetadata ( fileName: string, ext: string, path: string ): Metadata {

        const extension = ext || FileService.getExtension( path );

        const guid = THREE.Math.generateUUID();

        let metadata: Metadata;

        switch ( extension ) {

            case 'scene': metadata = this.createSceneMetadata( fileName, guid, path ); break;

            case 'obj': metadata = this.createModelMetadata( fileName, guid, path ); break;

            case 'fbx': metadata = this.createModelMetadata( fileName, guid, path ); break;

            case 'gltf': metadata = this.createModelMetadata( fileName, guid, path ); break;

            case 'glb': metadata = this.createModelMetadata( fileName, guid, path ); break;

            case 'xodr': metadata = this.createOpenDriveMetadata( fileName, guid, path ); break;

            case 'png': metadata = this.createTextureMetaInternal( guid, path ); break;
            case 'jpg': metadata = this.createTextureMetaInternal( guid, path ); break;
            case 'jpeg': metadata = this.createTextureMetaInternal( guid, path ); break;
            case 'svg': metadata = this.createTextureMetaInternal( guid, path ); break;

            case 'material': metadata = this.createMaterialMetadata( fileName, guid, path ); break;

            case 'sign': metadata = this.createSignMetadata( fileName, guid, path ); break;

            case TvRoadMarking.extension: metadata = this.createRoadMarkingMetadata( fileName, guid, path ); break;

            case RoadStyle.extension: metadata = this.createRoadStyleMetadata( fileName, guid, path ); break;

        }

        if ( metadata ) this.saveMetadataFile( path, metadata );

        if ( metadata ) AssetDatabase.setMetadata( guid, metadata );

        return metadata;
    }

    static createRoadMarkingMetadata ( name: string, guid: string, path: string ): Metadata {

        return {
            guid: guid,
            importer: "RoadMarkingImporter",
            data: {},
            path: path,
        };

    }

    static createRoadStyleMetadata ( name: string, guid: string, path: string ): Metadata {

        return {
            guid: guid,
            importer: RoadStyle.importer,
            data: {},
            path: path,
        };

    }

    private static createTextureMetaInternal ( guid: string, path: string ): Metadata {

        const texture = this.loadTexture( path );

        const metadata = this.createTextureMetadata( guid, path, texture );

        AssetDatabase.setInstance( metadata.guid, texture );

        return metadata;
    }

    static createFolderMetadata ( name: string, path: string ): Metadata {

        const guid = THREE.Math.generateUUID();

        const metadata = { guid: guid, isFolder: true, path: path, importer: null, data: null };

        this.saveMetadataFile( path, metadata );

        AssetDatabase.setMetadata( guid, metadata );

        return metadata;
    }

    static createSceneMetadata ( name: string, guid: string, path: string ) {

        return {
            guid: guid,
            importer: 'SceneImporter',
            data: {},
            path: path
        };

    }

    static createModelMetadata ( name: string, guid: string, path: string ) {

        return {
            guid: guid,
            importer: 'ModelImporter',
            data: { name: name, rotationVariance: new Vector3( 0, 0, 0 ), scaleVariance: new Vector3( 0, 0, 0 ) },
            path: path
        };

    }

    static createOpenDriveMetadata ( name: string, guid: string, path: string ) {

        return {
            guid: guid,
            importer: "OpenDriveImporter",
            data: {},
            path: path
        };

    }

    static createTextureMetadata ( guid: string, path: string, texture: Texture ) {

        const data = texture.toJSON( undefined );

        const version = data.metadata.version || 4.5;

        data.metadata = null;

        return {
            guid: guid,
            version: version,
            type: "Texture",
            importer: "TextureImporter",
            data: data,
            path: path
        };

    }

    static createMaterialMetadata ( name: string, guid: string, path: string ) {

        return {
            guid: guid,
            importer: "MaterialImporter",
            data: {},
            path: path,
        };

    }

    static createSignMetadata ( name: string, guid: string, path: string ) {

        return {
            guid: guid,
            importer: "SignImporter",
            data: {},
            path: path,
        };

    }

    static loadTexture ( path: string ): Texture {

        try {

            const texture = new TextureLoader().load( path );

            texture.wrapS = RepeatWrapping;
            texture.wrapT = RepeatWrapping;
            texture.mapping = UVMapping;
            texture.repeat.set( 1, 1 );

            return texture;

        } catch ( error ) {

            SnackBar.error( error );

            return null;

        }
    }
}
