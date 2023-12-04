/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { InspectorFactoryService } from 'app/factories/inspector-factory.service';
import { Metadata } from 'app/core/asset/metadata.model';
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
import { StorageService } from 'app/io/storage.service';

@Component( {
	selector: 'app-file',
	templateUrl: './file.component.html',
	styleUrls: [ './file.component.css' ]
} )
export class FileComponent implements OnInit {

	@ViewChild( 'nameInput' ) nameInputRef: ElementRef;

	@Output() deleted = new EventEmitter<AssetNode>();

	@Output() renamed = new EventEmitter<AssetNode>();

	@Input() asset: AssetNode;

	public showRenaming: boolean;

	get isDraggable (): boolean {
		return this.asset?.type != AssetType.DIRECTORY;
	}

	get filename () {
		return this.asset?.assetName;
	}

	get thumbnail () {
		return this.asset?.thumbnail;
	}

	constructor (
		private electron: TvElectronService,
		private menuService: MenuService,
		private previewService: PreviewService,
		private projectBrowserService: ProjectBrowserService,
		private importer: ImporterService,
		private dragDropService: DragDropService,
		private inspectorFactory: InspectorFactoryService,
		private assetService: AssetService,
		private storageService: StorageService,
	) {

	}

	ngOnInit () {

		try {

			this.initPreview( this.asset );

		} catch ( error ) {

			console.error( 'error in preview', error, this.asset );

		}
	}

	@HostListener( 'click', [ '$event' ] )
	onClick ( $event ) {

		$event.preventDefault();
		$event.stopPropagation();

		if ( this.asset.isDirectory ) return;

		if ( this.asset.type == AssetType.SCENE ) return;

		try {

			this.inspectorFactory.setAssetInspector( this.asset );

			MapEvents.assetSelected.emit( this.asset );

		} catch ( error ) {

			SnackBar.error( error );

		}

	}

	@HostListener( 'dblclick', [ '$event' ] )
	onDoubleClick ( $event ) {

		if ( this.asset.isDirectory ) {

			this.projectBrowserService.folderChanged.emit( this.asset );

		} else {

			switch ( this.asset.type ) {

				case AssetType.SCENE:
					this.importer.importScene( this.asset.path );
					SnackBar.success( 'Importing Scene ' + this.asset.name );
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

		this.assetService.copyAsset( this.asset );

	}

	canDuplicate (): boolean {

		return this.asset.type == AssetType.MATERIAL;

	}

	deleteNode () {

		try {

			this.assetService.deleteAsset( this.asset );

			this.deleted.emit( this.asset );

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

			this.electron.shell.showItemInFolder( this.asset.path );

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

		this.dragDropService.setData( this.asset );

		$event.dataTransfer.setData( 'path', this.asset.path );

		$event.dataTransfer.setData( 'guid', this.asset.guid );
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

		if ( !this.asset ) return;

		if ( $event.keyCode === 13 && this.nameInputRef ) {

			let newName: string;

			if ( this.asset.isDirectory ) {

				newName = this.nameInputRef.nativeElement.value;

			} else {

				newName = this.nameInputRef.nativeElement.value + '.' + this.asset.extension;

			}

			// const oldPath = this.file.path;

			// const currentFolder = FileUtils.getDirectoryFromPath( this.file.path );

			// const newPath = this.storageService.join( currentFolder, assetName );

			this.assetService.renameAsset( this.asset, newName );

			// this.asset.name = newName;

			// if ( !this.metadata ) {

			// 	if ( this.isDirectory ) {

			// 		// this.metadata = MetadataFactory.createFolderMetadata( this.file.path );

			// 	} else {

			// 		// this.metadata = MetadataFactory.createMetadata( assetName, this.extension, this.file.path );
			// 	}

			// }

			// this.metadata.path = newPath;

			// this.metadata.preview = null;

			// try {

			// 	// MetadataFactory.saveMetadataFile( oldPath + '.meta', this.metadata );

			// 	// this.fileService.fs.renameSync( oldPath, newPath );

			// 	// this.fileService.fs.renameSync( oldPath + '.meta', newPath + '.meta' );

			// 	// this.renamed.emit( this.file );

			// } catch ( error ) {

			// 	console.error( 'error in renaming', error, oldPath, newPath );

			// }

			this.showRenaming = false;

		}

	}

	private initPreview ( asset: AssetNode ) {

		if ( asset.type == AssetType.SCENE ) return;

		this.previewService.updatePreview( asset );
	}
}
