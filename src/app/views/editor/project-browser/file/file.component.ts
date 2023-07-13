/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SetInspectorCommand } from 'app/core/commands/set-inspector-command';
import { InspectorFactoryService } from 'app/core/factories/inspector-factory.service';
import { MetadataFactory } from 'app/core/factories/metadata-factory.service';
import { Metadata, MetaImporter } from 'app/core/models/metadata.model';
import { AssetDatabase } from 'app/services/asset-database';
import { AssetLoaderService } from 'app/services/asset-loader.service';
import { CommandHistory } from 'app/services/command-history';
import { FileUtils } from 'app/services/file-utils';
import { FileService } from 'app/services/file.service';
import { ImporterService } from 'app/services/importer.service';
import { ContextMenuType, MenuService } from 'app/services/menu.service';
import { SnackBar } from 'app/services/snack-bar.service';
import { TvElectronService } from 'app/services/tv-electron.service';
import { PreviewService } from 'app/views/inspectors/object-preview/object-preview.service';
import { TvConsole } from '../../../../core/utils/console';
import { FileNode } from '../file-node.model';
import { ProjectBrowserService } from '../project-browser.service';
import { DragDropService } from 'app/core/services/drag-drop.service';

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
		private electron: TvElectronService,
		private menuService: MenuService,
		private assetService: AssetLoaderService,
		private previewService: PreviewService,
		private fileService: FileService,
		private projectBrowserService: ProjectBrowserService,
		private importer: ImporterService,
		private dragDropService: DragDropService,
	) {

	}

	// public previewImage;
	public get previewImage () {
		return this.metadata && this.metadata.preview;
	}

	public get imageSource () {
		if ( this.isDirectory ) {
			return 'assets/folder-icon.png';
		}
		if ( this.isScene ) {
			return 'assets/scene-icon.png';
		}
		if ( this.isOpenDrive || this.isOpenScenario ) {
			return 'assets/unknown-file-icon.png';
		}
		if ( this.isUnknown ) {
			return 'assets/unknown-file-icon.png';
		}
		return this.previewImage;
	}

	public get isModel (): boolean {
		return this.metadata && this.metadata.importer == MetaImporter.MODEL;
	}

	public get isMaterial (): boolean {
		return this.metadata && this.metadata.importer == MetaImporter.MATERIAL;
	}

	public get isTexture (): boolean {
		return this.metadata && this.metadata.importer == MetaImporter.TEXTURE;
	}

	public get isRoadStyle (): boolean {
		return this.metadata && this.metadata.importer == MetaImporter.ROAD_STYLE;
	}

	public get isRoadMarking (): boolean {
		return this.metadata && this.metadata.importer == MetaImporter.ROAD_MARKING;
	}

	public get isScene (): boolean {
		return this.metadata && this.metadata.importer == MetaImporter.SCENE;
	}

	public get isSign (): boolean {
		return this.metadata && this.metadata.importer == MetaImporter.SIGN;
	}

	public get isOpenDrive (): boolean {
		return this.metadata && this.metadata.importer == MetaImporter.OPENDRIVE;
	}

	public get isOpenScenario (): boolean {
		return this.metadata && this.metadata.importer == MetaImporter.OPENSCENARIO;
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

		return FileUtils.pathToFileURL( this.file.path );
	}

	ngOnInit () {

		try {

			this.extension = this.file.name.split( '.' )[ 1 ];

			if ( !this.assetService.hasMetaFile( this.file ) ) {

				MetadataFactory.createMetadata( this.file.name, this.extension, this.file.path );

			}

			this.metadata = this.assetService.fetchMetaFile( this.file );

		} catch ( error ) {

			console.error( 'error in getting meta', error, this.file );

		}

		if ( !this.metadata ) return;

		this.metadata = this.assetService.find( this.metadata.guid );

		try {

			this.initPreview( this.metadata );

		} catch ( error ) {

			console.error( 'error in preview', error, this.file );

		}
	}

	private initPreview ( metadata: Metadata ) {

		if ( metadata.importer == MetaImporter.SCENE ) return;

		if ( metadata.preview ) return;

		this.previewService.updatePreview( metadata );
	}

	@HostListener( 'click', [ '$event' ] )
	onClick ( $event ) {

		$event.preventDefault();
		$event.stopPropagation();

		if ( this.isDirectory ) return;

		if ( this.isScene ) return;

		try {

			const inspector = InspectorFactoryService.getInspectorByExtension( this.extension );

			const inspectorData = InspectorFactoryService.getInspectorData( this.metadata );

			CommandHistory.execute( new SetInspectorCommand( inspector, inspectorData ) );

		} catch ( error ) {

			SnackBar.error( error );

		}

	}

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

	@HostListener( 'contextmenu', [ '$event' ] )
	onContextMenu ( $event ) {

		$event.preventDefault();
		$event.stopPropagation();

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
				// enabled: !this.isDirectory,
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

				// Delete the folder recursively
				this.fileService.deleteFolderRecursive( this.file.path );

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

			SnackBar.warn( 'Could Not Delete Item' );
			TvConsole.error( 'Could Not Delete Item' );

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

	}

	reimportAll () {

		SnackBar.error( 'Not able to reimport' );

	}

	@HostListener( 'dragstart', [ '$event' ] )
	onDragStart ( $event ) {

		this.dragDropService.setData( {
			path: this.file.path,
			extension: this.extension,
			guid: this.metadata?.guid,
		} )

		$event.dataTransfer.setData( 'path', this.file.path );
		if ( this.metadata ) $event.dataTransfer.setData( 'guid', this.metadata.guid );
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

			let nodeName: string;
			if ( this.isDirectory ) {
				nodeName = this.nameInputRef.nativeElement.value
			} else {
				nodeName = this.nameInputRef.nativeElement.value + '.' + this.extension;
			}

			const oldPath = this.file.path;

			const currentFolder = FileUtils.getDirectoryFromPath( this.file.path );

			const newPath = this.fileService.join( currentFolder, nodeName );

			if ( !this.metadata ) {

				if ( this.isDirectory ) {

					this.metadata = MetadataFactory.createFolderMetadata( this.file.path );

				} else {

					this.metadata = MetadataFactory.createMetadata( nodeName, this.extension, this.file.path );
				}


			}

			this.metadata.path = newPath;
			this.metadata.preview = null;

			try {

				MetadataFactory.saveMetadataFile( oldPath + '.meta', this.metadata );

				this.fileService.fs.renameSync( oldPath, newPath );

				this.fileService.fs.renameSync( oldPath + '.meta', newPath + '.meta' );

				this.renamed.emit( this.file );

			} catch ( error ) {

				console.error( 'error in renaming', error, oldPath, newPath );

			}

			this.showRenaming = false;

		}

	}
}
