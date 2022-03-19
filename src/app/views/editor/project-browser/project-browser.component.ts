/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, Injectable, OnInit, HostListener, ApplicationRef } from '@angular/core';
import { FlatTreeControl, NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { FileService } from 'app/services/file.service';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { map } from 'rxjs/operators';
import { AssetLoaderService } from 'app/services/asset-loader.service';
import { FileNode } from './file-node.model';
import { ProjectBrowserService } from './project-browser.service';
import { ImporterService } from 'app/services/importer.service';

// const DOCUMENT_PATH = '/home/himanshu/Documents/Truevision/';

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
export class DynamicDatabase {

    rootLevelNodes: string[] = [ 'Fruits', 'Vegetables' ];

    // private projectDir = '/home/himanshu/Documents/Truevision';
    private get projectDir () { return this.fileService.projectFolder; }

    private init: FileNode[];

    constructor ( private fileService: FileService ) {

        this.init = this.getFolderInPath( this.projectDir, 0 );

    }

    /** Initial data from database */
    initialData (): FileNode[] {

        return this.init;

        // return this.init = this.getFolderInPath( this.projectDir, 0 );

        // return this.rootLevelNodes.map( name => new FileNode( name, 0, true ) );
    }

    getChildren ( node: FileNode ): FileNode[] | undefined {

        return this.getFolderInPath( node.path, node.level + 1 );

        // return this.dataMap.get( node );

    }

    getFolderInPath ( path: string, level: number ) {

        const tmp: FileNode[] = [];

        // this.fileService.readPathContents( path ).then( ( files: any[] ) => {

        //     files.forEach( file => {

        //         if ( file.type === 'directory' ) tmp.push( new FileNode( file.name, level, true, false, file.path ) );

        //     } );

        // } );

        return tmp;

    }

    isExpandable ( node: FileNode ): boolean {

        return this.getFolderInPath( node.name, node.level + 1 ).length > 0;

        // return this.dataMap.has( node );

    }
}

/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */
@Injectable()
export class DynamicDataSource {

    dataChange = new BehaviorSubject<FileNode[]>( [] );

    constructor ( private treeControl: FlatTreeControl<FileNode>, private database: DynamicDatabase ) {
    }

    set data ( value: FileNode[] ) {
        this.treeControl.dataNodes = value;
        this.dataChange.next( value );
    }

    get data (): FileNode[] {
        return this.dataChange.value;
    }

    connect ( collectionViewer: CollectionViewer ): Observable<FileNode[]> {

        this.treeControl.expansionModel.onChange.subscribe( change => {
            if ( ( change as SelectionChange<FileNode> ).added ||
                ( change as SelectionChange<FileNode> ).removed ) {
                this.handleTreeControl( change as SelectionChange<FileNode> );
            }
        } );

        return merge( collectionViewer.viewChange, this.dataChange ).pipe( map( () => this.data ) );
    }

    /** Handle expand/collapse behaviors */
    handleTreeControl ( change: SelectionChange<FileNode> ) {
        if ( change.added ) {
            change.added.forEach( node => this.toggleNode( node, true ) );
        }
        if ( change.removed ) {
            change.removed.slice().reverse().forEach( node => this.toggleNode( node, false ) );
        }
    }

    /**
     * Toggle the node, remove from display list
     */
    toggleNode ( node: FileNode, expand: boolean ) {
        const children = this.database.getChildren( node );
        const index = this.data.indexOf( node );
        if ( !children || index < 0 ) { // If no children, or cannot find the node, no op
            return;
        }

        node.isLoading = true;

        setTimeout( () => {
            if ( expand ) {
                const nodes = children.map( child =>
                    new FileNode( child.name, node.level + 1, this.database.isExpandable( child ), false, child.path ) );
                this.data.splice( index + 1, 0, ...nodes );
            } else {
                let count = 0;
                for ( let i = index + 1; i < this.data.length && this.data[ i ].level > node.level; i++, count++ ) {
                }
                this.data.splice( index + 1, count );
            }

            // notify the change
            this.dataChange.next( this.data );
            node.isLoading = false;
        }, 100 );
    }
}

@Component( {
    selector: 'app-project-browser',
    templateUrl: './project-browser.component.html',
    styleUrls: [ './project-browser.component.css' ],
} )
export class ProjectBrowserComponent implements OnInit {

    selectedFolder: FileNode;

    treeControl = new NestedTreeControl<FileNode>( ( node: FileNode ) => {
        if ( node.type === 'directory' ) return node.sub_folders( this.fileService );
        else return [];
    } );

    dataSource = new MatTreeNestedDataSource<any>();

    files: FileNode[] = [];

    constructor (
        private fileService: FileService,
        private assets: AssetLoaderService,
        private projectBrowser: ProjectBrowserService,
        private importer: ImporterService,
        private appRef: ApplicationRef
    ) {

        const db = new DynamicDatabase( fileService );

        this.dataSource.data = [];

    }

    ngOnInit () {

        this.assets.init();

        this.loadFilesInFolder();

        this.projectBrowser.folderChanged.subscribe( node => this.onFolderChanged( node ) );

    }

    // get files () {

    //     if ( !this.selectedFolder ) return [];

    //     return this.selectedFolder.sub_files( this.fileService );

    // }

    onFolderChanged ( node: FileNode ) {

        // console.log( 'folder-changed', e );

        this.selectedFolder = node;

        this.files = this.selectedFolder.sub_files( this.fileService );

    }

    selectFolder ( e: FileNode ) {

        // console.log( 'select-folder', e );

    }

    selectFile ( e: FileNode ) {

        // console.log( 'select-file', e );
    }

    onClick ( node: FileNode ) {

        // console.log( node );

        this.selectedFolder = node;

        const result = node.sub_folders( this.fileService );

        // console.log( result );

        // result.subscribe( files => {

        //     console.log( files );

        // } );

        // this.fileService.readPathContents( DOCUMENT_PATH ).then( ( files: any[] ) => {

        //     const tmp = [];

        //     files.forEach( file => {

        //         if ( file.type === 'directory' ) {

        //             tmp.push( new FileNode( file.name, 0, true, false, file.path, file.type ) );

        //         }

        //     } );

        //     this.dataSource.data = tmp;

        // } );

        // console.log( node );

    }

    loadFilesInFolder () {

        const files = this.fileService.readPathContentsSync( this.fileService.projectFolder );

        const tmp = [];

        files.forEach( file => {

            if ( file.type === 'directory' ) {

                tmp.push( new FileNode( file.name, 0, true, false, file.path, file.type ) );

            }

        } );

        this.dataSource.data = tmp;
    }

    @HostListener( 'dragover', [ '$event' ] )
    onDragOver ( evt ) {

        evt.preventDefault();
        evt.stopPropagation();
    }

    @HostListener( 'dragleave', [ '$event' ] )
    onDragLeave ( evt ) {

        evt.preventDefault();
        evt.stopPropagation();

    }

    @HostListener( 'drop', [ '$event' ] )
    onDrop ( $event: DragEvent ) {

        // console.log( $event );
        // console.log( $event.dataTransfer.files );

        $event.preventDefault();
        $event.stopPropagation();

        const folderPath = this.selectedFolder ?
            this.selectedFolder.path :
            this.fileService.projectFolder;

        for ( let i = 0; i < $event.dataTransfer.files.length; i++ ) {

            const file = $event.dataTransfer.files[ i ];

            this.importer.onFileDropped( file, folderPath );

        }

        if ( this.selectedFolder ) {

            this.files = this.selectedFolder.sub_files( this.fileService );

            this.appRef.tick();

        }
    }
}
