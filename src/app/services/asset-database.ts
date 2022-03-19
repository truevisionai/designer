/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Metadata } from 'app/core/models/metadata.model';
import { FileUtils } from './file-utils';
import { FileNode } from 'app/views/editor/project-browser/file-node.model';

export class AssetDatabase {

    private static metadata: Map<string, Metadata> = new Map<string, Metadata>();

    // private static previewCache: Map<string, string> = new Map<string, string>();

    private static instances: Map<string, any> = new Map<string, any>();

    static setMetadata ( guid: string, metadata: Metadata ) {

        this.metadata.set( guid, metadata );

    }

    static getMetadata ( guid: string ): Metadata {

        return this.metadata.get( guid );

    }

    static getAssetNameByGuid ( guid: string ): string {

        if ( !guid ) return;

        const metadata = this.getMetadata( guid )

        if ( metadata )
            return FileUtils.getFilenameFromPath( metadata.path );
    }

    static deleteFile ( file: FileNode ) {

        if ( file.type == 'directory' ) {



        } else {

        }

    }

    static deleteAssetByGuid ( guid: string ) {

        const metadata = this.getMetadata( guid );

        // file or folder
        if ( metadata.isFolder ) {

            // if folder remove all files under the folder

        } else {

            // remove metadata from memory
            // remove meta file
            // remove instance from memory
            // remove instance file

        }
    }

    static getMetadataAll () {

        return this.metadata;

    }

    static removeMetadata ( guid: string ) {

        return this.metadata.delete( guid );

    }

    static setInstance ( guid: string, instance: any ) {

        this.instances.set( guid, instance );

    }

    static getInstance<T> ( guid: string ): T {

        if ( guid != null && this.instances.has( guid ) ) {

            return this.instances.get( guid );

        } else {

            console.error( `requested ${ guid } instance does not exist` );
        }
    }

    static getInstanceType<T> ( guid: string ): T {

        return this.getInstance( guid );

    }

    static removeInstance ( guid: string ) {

        this.instances.delete( guid );

    }

    static setPreview ( guid: string, preview: string ) {

    }

    static remove ( guid: string ) {

        try {

            this.metadata.delete( guid );

            this.instances.delete( guid );


        } catch ( error ) {

            console.error( error );

        }

    }
}