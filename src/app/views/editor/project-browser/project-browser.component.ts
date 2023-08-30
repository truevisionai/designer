/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { FlatTreeControl, NestedTreeControl } from '@angular/cdk/tree';
import { ApplicationRef, Component, HostListener, Injectable, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { AssetLoaderService } from 'app/services/asset-loader.service';
import { FileExtension, FileService } from 'app/core/io/file.service';
import { ImporterService } from 'app/services/importer.service';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogFactory } from '../../../core/factories/dialog.factory';
import { MetadataFactory } from '../../../core/factories/metadata-factory.service';
import { TvConsole } from '../../../core/utils/console';
import { SnackBar } from '../../../services/snack-bar.service';
import { FileNode } from './file-node.model';
import { ProjectBrowserService } from './project-browser.service';

// const DOCUMENT_PATH = '/home/himanshu/Documents/Truevision/';

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
export class DynamicDatabase {

	rootLevelNodes: string[] = [ 'Fruits', 'Vegetables' ];
	private init: FileNode[];

	constructor ( private fileService: FileService ) {

		this.init = this.getFolderInPath( this.projectDir, 0 );

	}

	// private projectDir = '/home/himanshu/Documents/Truevision';
	private get projectDir () {
		return this.fileService.projectFolder;
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

	get data (): FileNode[] {
		return this.dataChange.value;
	}

	set data ( value: FileNode[] ) {
		this.treeControl.dataNodes = value;
		this.dataChange.next( value );
	}

	connect ( collectionViewer: CollectionViewer ): Observable<FileNode[]> {

		this.treeControl.expansionModel.changed.subscribe( change => {
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
		if ( node.type === 'directory' ) {
			return node.sub_folders( this.fileService );
		} else {
			return [];
		}
	} );

	dataSource = new MatTreeNestedDataSource<any>();

	files: FileNode[] = [];

	constructor (
		private fileService: FileService,
		private assets: AssetLoaderService,
		private projectBrowser: ProjectBrowserService,
		private importer: ImporterService,
		private appRef: ApplicationRef,
		private dialogFactory: DialogFactory		// dont remove, needed to load dialog components
	) {

		const db = new DynamicDatabase( fileService );

		this.dataSource.data = [];

	}

	ngOnInit () {

		this.assets.init();

		this.loadFilesInFolder();

		this.projectBrowser.folderChanged.subscribe( node => this.onFolderChanged( node ) );

	}

	onFolderChanged ( node: FileNode ) {

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

		this.selectedFolder = node;

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
	async onDrop ( $event: DragEvent ) {

		$event.preventDefault();
		$event.stopPropagation();

		const folderPath = this.selectedFolder ?
			this.selectedFolder.path :
			this.fileService.projectFolder;

		for ( let i = 0; i < $event.dataTransfer.files.length; i++ ) {

			const file = $event.dataTransfer.files[ i ];

			await this.onFileDropped( file, folderPath );

		}

		if ( this.selectedFolder ) {

			this.files = this.selectedFolder.sub_files( this.fileService );

			this.appRef.tick();

		}
	}

	async onFileDropped ( file: File, folderPath: string ) {

		if ( !file ) SnackBar.error( 'Incorrect file. Cannot import' );
		if ( !file ) return;

		const extension = FileService.getExtension( file.name );

		const destinationPath = this.fileService.join( folderPath, file.name );

		let copied = false;

		switch ( extension ) {

			case FileExtension.GLTF:
				copied = this.copyFile( file.path, destinationPath );
				break;

			case FileExtension.GLB:
				copied = this.copyFile( file.path, destinationPath );
				break;

			case FileExtension.OBJ:
				copied = this.copyFile( file.path, destinationPath );
				break;

			case FileExtension.FBX:
				DialogFactory.showImportFBXDialog( file.path, destinationPath, extension )
					?.afterClosed()
					.subscribe( () => {
						this.onFolderChanged( this.selectedFolder );
					} );
				break;

			case FileExtension.JPG:
				copied = this.copyFile( file.path, destinationPath );
				break;

			case FileExtension.JPEG:
				copied = this.copyFile( file.path, destinationPath );
				break;

			case 'png':
				copied = this.copyFile( file.path, destinationPath );
				break;

			case 'tga':
				copied = this.copyFile( file.path, destinationPath );
				break;

			case 'svg':
				copied = this.copyFile( file.path, destinationPath );
				break;

			case FileExtension.OPENSCENARIO:
				DialogFactory.showImportOpenScenarioDialog( file.path, destinationPath, extension )
					?.afterClosed()
					.subscribe( () => {
						this.onFolderChanged( this.selectedFolder );
					} )
				break;

			case FileExtension.OPENDRIVE:
				copied = this.copyFile( file.path, destinationPath );
				break;

			default:
				SnackBar.error( `${ extension } file cannot be imported` );
				break;
		}

		if ( copied ) {

			MetadataFactory.createMetadata( file.name, extension, destinationPath );

			this.onFolderChanged( this.selectedFolder );

		}

	}

	copyFile ( sourcePath: string, destinationPath: string ): boolean {

		if ( !destinationPath ) TvConsole.error( 'destinationPath incorrect' );
		if ( !destinationPath ) SnackBar.error( 'destinationPath incorrect' );
		if ( !destinationPath ) return;

		try {

			this.fileService.fs.copyFileSync( sourcePath, destinationPath );

			return true;

		} catch ( error ) {

			TvConsole.error( error );
			SnackBar.error( error );

		}
	}
}
