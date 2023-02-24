/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { InspectorFactoryService } from 'app/core/factories/inspector-factory.service';
import { MetadataFactory } from 'app/core/factories/metadata-factory.service';
import { AppInspector } from 'app/core/inspector';
import { Metadata } from 'app/core/models/metadata.model';
import { TvRoadSign } from 'app/modules/tv-map/models/tv-road-sign.model';
import { TvRoadMarking } from 'app/modules/tv-map/services/tv-marking.service';
import { AssetDatabase } from 'app/services/asset-database';
import { AssetLoaderService } from 'app/services/asset-loader.service';
import { FileUtils } from 'app/services/file-utils';
import { FileService } from 'app/services/file.service';
import { ImporterService } from 'app/services/importer.service';
import { ContextMenuType, MenuService } from 'app/services/menu.service';
import { RoadStyle, RoadStyleService } from 'app/services/road-style.service';
import { TvRoadMarking } from "app/modules/tv-map/models/tv-road-marking";

@Component( {
    selector: 'app-file',
    templateUrl: './file.component.html',
    styleUrls: [ './file.component.css' ]
} )
export class FileComponent implements OnInit {

    @ViewChild( 'nameInput' ) nameInputRef: ElementRef;

    @Output() deleted = new EventEmitter<FileNode>();
    @Output() renamed = new EventEmitter<FileNode>();

    @Input() file: FileNode;

    public extension: string;

    public metadata: Metadata;

    public showRenaming: boolean;

    constructor (
        private electron: ElectronService,
        private menuService: MenuService,
        private assetService: AssetLoaderService,
        private previewService: PreviewService,
        private fileService: FileService,
        private projectBrowserService: ProjectBrowserService,
        private importer: ImporterService,
    ) {

    }

    // public previewImage;
    public get previewImage () {
        return this.metadata && this.metadata.preview;
    }

    public get isModel (): boolean {
        return this.metadata && this.metadata.importer == 'ModelImporter';
    }

    public get isMaterial (): boolean {
        return this.metadata && this.metadata.importer == 'MaterialImporter';
    }

    public get isTexture (): boolean {
        return this.metadata && this.metadata.importer == 'TextureImporter';
    }

    public get isRoadStyle (): boolean {
        return this.metadata && this.metadata.importer == 'RoadStyleImporter';
    }

    public get isRoadMarking (): boolean {
        return this.metadata && this.metadata.importer == 'RoadMarkingImporter';
    }

    public get isScene (): boolean {
        return this.metadata && this.metadata.importer == 'SceneImporter';
    }

    public get isSign (): boolean {
        return this.metadata && this.metadata.importer == 'SignImporter';
    }

    public get isDirectory (): boolean {
        return this.metadata && this.file.type == 'directory';
    }

    public get isUnknown (): boolean {
        return !this.isDirectory && ( !this.metadata || !this.extension );
    }

    get filename () {
        return this.file.name.split( '.' )[ 0 ];
    }

    // set filename ( value ) { this.file.name = value; }

    // get extension () { return this.file.name.split( '.' )[ 1 ]; }

    get filePath () {

        if ( this.electron.isLinux ) return 'file:///' + this.file.path;

        if ( this.electron.isWindows ) return 'file:///' + this.file.path;

    }

    ngOnInit () {

        try {

            this.extension = this.file.name.split( '.' )[ 1 ];

            if ( !this.assetService.hasMetaFile( this.file ) ) {

                MetadataFactory.createMetadata( this.file.name, this.extension, this.file.path );

            }

            this.metadata = this.assetService.fetchMetaFile( this.file );

        } catch ( error ) {

            console.error( error );

        }

        if ( !this.metadata ) return;

        this.metadata = this.assetService.find( this.metadata.guid );

        try {

            if ( !this.metadata.preview ) {

                if ( this.metadata.importer === 'MaterialImporter' ) {

                    const instance: Material = AssetDatabase.getInstance( this.metadata.guid );

                    this.metadata.preview = this.previewService.getMaterialPreview( instance );

                } else if ( this.metadata.importer === 'SignImporter' ) {

                    const instance: TvRoadSign = AssetDatabase.getInstance( this.metadata.guid );

                    this.metadata.preview = this.previewService.getSignPreview( instance );

                } else if ( this.metadata.importer === 'ModelImporter' ) {

                    // const instance: Object3D = AssetCache.getInstance( this.metadata.guid );

                    this.assetService.modelImporterService.load( this.metadata.path, ( obj ) => {

                        this.metadata.preview = this.previewService.getModelPreview( obj );

                        AssetDatabase.setInstance( this.metadata.guid, obj );

                    }, this.metadata );

                } else if ( this.metadata.importer === 'RoadStyleImporter' ) {

                    const instance: RoadStyle = AssetDatabase.getInstance( this.metadata.guid );

                    this.metadata.preview = this.previewService.getRoadStylePreview( instance );

                } else if ( this.metadata.importer === 'RoadMarkingImporter' ) {

                    const instance: TvRoadMarking = AssetDatabase.getInstance( this.metadata.guid );

                    this.metadata.preview = this.previewService.getRoadMarkingPreview( instance );

                }


            }

        } catch ( error ) {

        }
    }

    @HostListener( 'click', [ '$event' ] )
    onClick ( $event ) {

        $event.preventDefault();
        $event.stopPropagation();

        if ( this.isDirectory ) return;

        if ( this.isScene ) return;

        try {

            const instance = AssetDatabase.getInstance( this.metadata.guid );
            const inspector = InspectorFactoryService.getInspectorByExtension( this.extension );

            if ( this.metadata.importer === 'MaterialImporter' ) {

                AppInspector.setInspector( inspector, {
                    material: instance,
                    guid: this.metadata.guid
                } );

            } else if ( this.metadata.importer === 'TextureImporter' ) {

                AppInspector.setInspector( inspector, {
                    texture: instance,
                    guid: this.metadata.guid
                } );

            } else if ( this.metadata.importer === 'RoadStyleImporter' ) {

                RoadStyleService.setCurrentStyle( instance as RoadStyle );

                AppInspector.setInspector( inspector, {
                    roadStyle: instance,
                    guid: this.metadata.guid
                } );

            } else if ( this.metadata.importer === 'ModelImporter' ) {

                AppInspector.setInspector( inspector, this.metadata );


            } else if ( this.metadata.importer === 'RoadMarkingImporter' ) {

                AppInspector.setInspector( inspector, {
                    roadMarking: instance,
                    guid: this.metadata.guid
                } );

            } else {

                AppInspector.setInspector( inspector, instance );

            }

        } catch ( error ) {

            SnackBar.error( error );

        }

    }

    // getFileInstance ( extension: string, guid: string, path: string ): any {

    //     if ( this.assetService.assetInstances.has( guid ) ) {

    //         return this.assetService.assetInstances.get( guid );

    //     }

    //     let instance = null;

    //     switch ( extension ) {

    //         case 'png': instance = new TextureLoader().load( path ); break;

    //         case 'svg': instance = new TextureLoader().load( path ); break;

    //         case 'jpg': instance = new TextureLoader().load( path ); break;

    //         case 'jpeg': instance = new TextureLoader().load( path ); break;

    //         case 'material': instance = new MaterialLoader().parse( path ); break;

    //         default: break;
    //     }

    //     if ( instance ) this.assetService.assetInstances.set( guid, instance );

    //     return instance;
    // }

    @HostListener( 'dblclick', [ '$event' ] )
    onDoubleClick ( $event ) {

        if ( this.isDirectory ) {

            this.projectBrowserService.folderChanged.emit( this.file );

        } else {

            switch ( this.extension ) {

                case 'scene':
                    this.importer.importScene( this.file.path );
                    SnackBar.success( 'Importing Scene ' + this.file.name );
                    break;

            }

        }
    }

    // @HostListener( 'mousedown', [ '$event' ] )
    // onMouseDown ( $event ) {

    //     $event.preventDefault();
    //     $event.stopPropagation();

    // }

    // @HostListener( 'mouseover', [ '$event' ] )
    // onMouseOver ( $event ) {

    //     $event.preventDefault();
    //     $event.stopPropagation();

    // }

    // @HostListener( 'mouseleave', [ '$event' ] )
    // onMouseLeave ( $event ) {

    //     $event.preventDefault();
    //     $event.stopPropagation();

    // }

    @HostListener( 'contextmenu', [ '$event' ] )
    onContextMenu ( $event ) {

        $event.preventDefault();
        $event.stopPropagation();

        if ( !this.electron.isElectronApp ) return;

        this.menuService.registerContextMenu( ContextMenuType.HIERARCHY, [
            {
                label: 'New',
                enabled: false,
            },
            {
                label: 'Delete',
                click: () => this.deleteNode(),
            },
            {
                label: 'Rename',
                click: () => this.renameNode(),
                enabled: !this.isDirectory,
            },
            {
                label: 'Duplicate',
                click: () => {
                },
                enabled: false,
            },
            {
                label: 'Show In Explorer',
                click: () => this.showInExplorer()
            },
            {
                label: 'Reimport',
                click: () => this.reimport(),
                enabled: false,
            },
            {
                label: 'Reimport All',
                click: () => this.reimportAll(),
                enabled: false,
            },
        ] );

        this.menuService.showContextMenu( ContextMenuType.HIERARCHY );
    }


    deleteNode () {

        try {

            if ( this.isDirectory ) {

                // TODO: need to loop over each file in the folder to delete them
                // from database as well
                this.fileService.deleteFolderSync( this.file.path );
                this.fileService.deleteFileSync( this.file.path + '.meta' );

                this.file.isDeleted = true;

                AssetDatabase.remove( this.metadata.guid );

                SnackBar.success( 'Folder deleted' );

            } else {

                this.fileService.deleteFileSync( this.file.path );
                this.fileService.deleteFileSync( this.file.path + '.meta' );

                this.file.isDeleted = true;

                AssetDatabase.remove( this.metadata.guid );

                SnackBar.success( 'File deleted' );
            }

            this.deleted.emit( this.file );

        } catch ( error ) {

            console.error( error );

        }

    }

    renameNode () {

        this.showRenaming = true;

        setTimeout( () => {

            if ( this.nameInputRef ) this.nameInputRef.nativeElement.focus();
            if ( this.nameInputRef ) this.nameInputRef.nativeElement.select();

        }, 100 );

    }

    showInExplorer () {

        try {

            this.electron.shell.showItemInFolder( this.file.path );

        } catch ( error ) {

            SnackBar.error( error );

        }

    }

    reimport () {

        SnackBar.error( 'Not able to reimport' );

        // console.error( "method not implemented" );
        // this.assetService.reimport( this.file, this.extension );

    }

    reimportAll () {

        SnackBar.error( 'Not able to reimport' );

    }

    // @HostListener( 'dragover', [ '$event' ] )
    // onDragOver ( $event ) {

    //     $event.preventDefault();
    //     $event.stopPropagation();

    // }

    @HostListener( 'dragstart', [ '$event' ] )
    onDragStart ( $event ) {

        // if ( this.extension == "png" || this.extension == "jpg" || this.extension == "svg" ) {
        //     return;
        // }

        // $event.preventDefault();
        // $event.stopPropagation();

        console.log( 'dragstat', $event );

        $event.dataTransfer.setData( 'path', this.file.path );

        if ( this.metadata ) {

            $event.dataTransfer.setData( 'guid', this.metadata.guid );

        }
    }

    onBlur ( $event ) {

        this.showRenaming = false;

    }

    onFocus ( $event ) {

        this.showRenaming = true;

    }

    @HostListener( 'window:keydown', [ '$event' ] )
    onKeyDown ( $event: KeyboardEvent ) {

        if ( !this.showRenaming ) return;

        if ( $event.keyCode === 13 && this.nameInputRef ) {

            this.file.name = this.nameInputRef.nativeElement.value + '.' + this.extension;

            const oldPath = this.file.path;

            const currentFolder = FileUtils.getDirectoryFromPath( this.file.path );

            const newPath = this.fileService.join( currentFolder, this.file.name );

            if ( !this.metadata ) {

                this.metadata = MetadataFactory.createMetadata( this.file.name, this.extension, this.file.path );

            }

            this.metadata.path = newPath;
            this.metadata.preview = null;

            try {

                MetadataFactory.saveMetadataFile( oldPath + '.meta', this.metadata );

                this.fileService.fs.renameSync( oldPath, newPath );

                this.fileService.fs.renameSync( oldPath + '.meta', newPath + '.meta' );

                this.renamed.emit( this.file );

            } catch ( error ) {

                console.error( error );

            }

            this.showRenaming = false;

        }

    }

    // @HostListener( 'dragleave', [ '$event' ] )
    // onDragLeave ( $event ) {

    //     $event.preventDefault();
    //     $event.stopPropagation();

    // }

    // @HostListener( 'drop', [ '$event' ] )
    // onDrop ( $event: DragEvent ) {

    //     //

    // }
}
