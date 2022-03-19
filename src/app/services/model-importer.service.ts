/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Object3D, Vector3, Euler, Scene } from 'three';
import { SnackBar } from './snack-bar.service';
import { AssetImporterService } from 'app/core/asset-importer.service';
import { Metadata } from 'app/core/models/metadata.model';
import { FileService } from './file.service';
import { SceneService } from 'app/core/services/scene.service';

@Injectable( {
    providedIn: 'root'
} )
export class ModelImporterService {

    constructor ( private assetImporter: AssetImporterService ) { }

    public import ( path: string, filename?: string, extension?: string, position?: Vector3, metadata?: Metadata ) {

        // const metadata = this.assetService.fetchMetaFile( path );

        this.load( path, ( object ) => {

            if ( position ) object.position.set( position.x, position.y, position.z );

            SceneService.add( object );

        }, metadata, extension )

    }

    public load ( path: string, callback: ( object: Object3D ) => void, metadata: Metadata, extension?: string ): void {

        // if ( !metadata ) metadata = this.assetService.fetchMetaFile( path );

        if ( !extension ) extension = FileService.getExtension( path );

        switch ( extension ) {

            case 'gltf':
                this.load3DFile( path, callback );
                break;

            case 'glb':
                this.load3DFile( path, callback );
                break;

            case 'obj':
                this.load3DFile( path, callback );
                break;

            case 'fbx':
                this.load3DFile( path, callback );
                break;

            default:
                console.error( 'unknown file type' );
                SnackBar.error( 'Not able to import' );
                break;
        }

    }

    private load3DFile ( path: string, callback: ( object: Object3D ) => void ): void {

        this.assetImporter.import( path, ( object ) => {

            callback( object );

        }, ( e ) => {

            SnackBar.error( e )

        } );

    }

    private onModelImported ( path: string, object: Object3D, position?: Vector3, metadata?: Metadata ) {

        // const rotationVariance = metadata ? metadata.data.rotationVariance : new Vector3( 0, 0, 0 );

        // const scaleVariance = metadata ? metadata.data.scaleVariance : new Vector3( 0, 0, 0 );

        // if ( !( ToolManager.currentTool instanceof PropPointTool ) ) {

        //     ToolManager.currentTool = new PropPointTool( { guid: metadata.guid, object: object } );

        // }

        // const randomRotation = new Vector3(
        //     Maths.randomFloatBetween( -rotationVariance.x, rotationVariance.x ),
        //     Maths.randomFloatBetween( -rotationVariance.y, rotationVariance.y ),
        //     Maths.randomFloatBetween( -rotationVariance.z, rotationVariance.z ),
        // );

        // const randomScale = new Vector3(
        //     object.scale.x + Maths.randomFloatBetween( -scaleVariance.x, scaleVariance.x ),
        //     object.scale.y + Maths.randomFloatBetween( -scaleVariance.y, scaleVariance.y ),
        //     object.scale.z + Maths.randomFloatBetween( -scaleVariance.z, scaleVariance.z ),
        // );

        // // console.log( randomRotation, randomScale );

        // object.rotation.setFromVector3( randomRotation );

        // object.scale.set( randomScale.x, randomScale.y, randomScale.z );

        // if ( position ) ( ToolManager.currentTool as PropPointTool ).shapeEditor.addControlPoint( position );

        // InspectorFactoryService.setByType( InspectorType.prop_instance_inspector, { guid: metadata.guid, object: object } );

        // AppInspector.setInspector( PropInstanceInspectorComponent, { guid: metadata.guid, object: object } );
    }

    private importOBJ ( path: string, filename?: string, extension?: string, position?: Vector3, metadata?: Metadata ) {

        // const meta = this.assetService.fetchMetaFile( path );

        this.assetImporter.import( path, ( object: Object3D ) => {

            this.onModelImported( path, object, position, metadata );

        }, ( e ) => {

            SnackBar.error( e );

        } );

    }

    private importGLTF ( path: string, filename?: string, extension?: string, position?: Vector3 ) {

        this.assetImporter.import( path, ( object ) => {

            this.onModelImported( path, object, position );

        }, ( e ) => {

            SnackBar.error( e )

        } );

    }

    /**
     * @deprecated not working right now
     */
    private importFBX ( path: string, filename?: string, extension?: string, position?: Vector3 ) {

        this.assetImporter.import( path, ( object ) => {

            this.onModelImported( path, object, position );

        }, ( e ) => {

            SnackBar.error( e )

        } );

    }
}
