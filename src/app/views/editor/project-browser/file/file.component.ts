/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AssetLoaderService } from 'app/core/asset/asset-loader.service';
import { InspectorFactoryService } from 'app/factories/inspector-factory.service';
import { FileUtils } from 'app/io/file-utils';
import { FileService } from 'app/io/file.service';
import { Metadata, MetaImporter } from 'app/core/asset/metadata.model';
import { DragDropService } from 'app/services/drag-drop.service';
import { ImporterService } from 'app/importers/importer.service';
import { ContextMenuType, MenuService } from 'app/services/menu.service';
import { SnackBar } from 'app/services/snack-bar.service';
import { TvElectronService } from 'app/services/tv-electron.service';
import { PreviewService } from 'app/views/inspectors/object-preview/object-preview.service';
import { TvConsole } from '../../../../core/utils/console';
import { AssetNode, AssetType } from '../file-node.model';
import { ProjectBrowserService } from '../project-browser.service';
import { AssetService } from 'app/core/asset/asset.service';
import { MapEvents } from 'app/events/map-events';

@Component( {
	selector: 'app-file',
	templateUrl: './file.component.html',
	styleUrls: [ './file.component.css' ]
} )
export class FileComponent implements OnInit {

	@ViewChild( 'nameInput' ) nameInputRef: ElementRef;

	@Output() deleted = new EventEmitter<AssetNode>();

	@Output() renamed = new EventEmitter<AssetNode>();

	@Input() file: AssetNode;

	public showRenaming: boolean;

	constructor (
		private electron: TvElectronService,
		private menuService: MenuService,
		private assetLoaderService: AssetLoaderService,
		private previewService: PreviewService,
		private fileService: FileService,
		private projectBrowserService: ProjectBrowserService,
		private importer: ImporterService,
		private dragDropService: DragDropService,
		private inspectorFactory: InspectorFactoryService,
		private assetService: AssetService,
	) {

	}

	get metadata (): Metadata {
		return this.file.metadata
	}

	public get previewImage () {
		return this.metadata && this.metadata.preview;
	}

	public get extension () {
		return FileUtils.getExtensionFromPath( this.filePath );
	}

	public get imageSource () {
		if ( this.isDirectory ) {
			return 'assets/folder-icon-blue.png';
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
		if ( !this.previewImage ) {
			return 'assets/unknown-file-icon.png';
		}
		return this.previewImage;
	}

	public get isModel (): boolean {
		return this.file.type == AssetType.MODEL;
	}

	public get isMaterial (): boolean {
		return this.file.type == AssetType.MATERIAL;
	}

	public get isTexture (): boolean {
		return this.file.type == AssetType.TEXTURE;
	}

	public get isRoadStyle (): boolean {
		return this.metadata && this.metadata.importer == MetaImporter.ROAD_STYLE;
	}

	public get isRoadMarking (): boolean {
		return this.metadata && this.metadata.importer == MetaImporter.ROAD_MARKING;
	}

	public get isScene (): boolean {
		return this.file.type == AssetType.SCENE;
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
		return this.file.type == AssetType.DIRECTORY;
	}

	public get isUnknown (): boolean {
		return !this.isDirectory && ( !this.metadata || !this.extension );
	}

	get filename () {
		return this.file.name.split( '.' )[ 0 ];
	}

	get filePath () {
		return FileUtils.pathToFileURL( this.file.path );
	}

	ngOnInit () {

		try {

			this.initPreview( this.file.metadata );

		} catch ( error ) {

			console.error( 'error in preview', error, this.file );

		}
	}

	@HostListener( 'click', [ '$event' ] )
	onClick ( $event ) {

		$event.preventDefault();
		$event.stopPropagation();

		if ( this.isDirectory ) return;

		if ( this.isScene ) return;

		try {

			this.inspectorFactory.setAssetInspector( this.file );

			MapEvents.assetSelected.emit( this.file );

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
				click: () => this.createDuplicate(),
				enabled: this.canDuplicate(),
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

	createDuplicate (): void {

		this.assetService.copyAsset( this.file );

	}

	canDuplicate (): boolean {

		return this.file.type == AssetType.MATERIAL;

	}

	deleteNode () {

		try {

			this.assetService.deleteAsset( this.file );

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
		} );

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

		throw new Error( 'Not implemented' );

		// if ( $event.keyCode === 13 && this.nameInputRef ) {

		// 	let nodeName: string;
		// 	if ( this.isDirectory ) {
		// 		nodeName = this.nameInputRef.nativeElement.value;
		// 	} else {
		// 		nodeName = this.nameInputRef.nativeElement.value + '.' + this.extension;
		// 	}

		// 	const oldPath = this.file.path;

		// 	const currentFolder = FileUtils.getDirectoryFromPath( this.file.path );

		// 	const newPath = this.fileService.join( currentFolder, nodeName );

		// 	if ( !this.metadata ) {

		// 		if ( this.isDirectory ) {

		// 			this.metadata = MetadataFactory.createFolderMetadata( this.file.path );

		// 		} else {

		// 			this.metadata = MetadataFactory.createMetadata( nodeName, this.extension, this.file.path );
		// 		}

		// 	}

		// 	this.metadata.path = newPath;

		// 	this.metadata.preview = null;

		// 	try {

		// 		MetadataFactory.saveMetadataFile( oldPath + '.meta', this.metadata );

		// 		this.fileService.fs.renameSync( oldPath, newPath );

		// 		this.fileService.fs.renameSync( oldPath + '.meta', newPath + '.meta' );

		// 		this.renamed.emit( this.file );

		// 	} catch ( error ) {

		// 		console.error( 'error in renaming', error, oldPath, newPath );

		// 	}

		// 	this.showRenaming = false;

		// }

	}

	private initPreview ( metadata: Metadata ) {

		if ( metadata.importer == MetaImporter.SCENE ) return;

		if ( metadata.preview ) return;

		this.previewService.updatePreview( metadata );
	}
}
