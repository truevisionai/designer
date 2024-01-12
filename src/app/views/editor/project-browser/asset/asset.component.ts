/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, ElementRef, EventEmitter, HostListener, Input, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { InspectorFactoryService } from 'app/factories/inspector-factory.service';
import { DragDropService } from 'app/services/drag-drop.service';
import { ImporterService } from 'app/importers/importer.service';
import { ContextMenuType, MenuService } from 'app/services/menu.service';
import { SnackBar } from 'app/services/snack-bar.service';
import { TvElectronService } from 'app/services/tv-electron.service';
import { AssetPreviewService } from 'app/views/inspectors/asset-preview/asset-preview.service';
import { TvConsole } from '../../../../core/utils/console';
import { AssetNode, AssetType } from '../file-node.model';
import { ProjectBrowserService } from '../project-browser.service';
import { AssetService } from 'app/core/asset/asset.service';
import { MapEvents } from 'app/events/map-events';
import { StorageService } from 'app/io/storage.service';

@Component( {
	selector: 'app-asset',
	templateUrl: './asset.component.html',
	styleUrls: [ './asset.component.css' ]
} )
export class AssetComponent implements OnInit {

	@ViewChild( 'nameInput' ) nameInputRef: ElementRef<HTMLInputElement>;

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
		private previewService: AssetPreviewService,
		private projectBrowserService: ProjectBrowserService,
		private importer: ImporterService,
		private dragDropService: DragDropService,
		private inspectorFactory: InspectorFactoryService,
		private assetService: AssetService,
		private storageService: StorageService,
		private ngZone: NgZone,
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
				enabled: this.asset.children.length == 0,
			},
			{
				label: 'Rename',
				click: () => this.renameNode(),
				enabled: this.asset.children.length == 0,
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

			if ( !this.assetService.deleteAsset( this.asset ) ) return;

			this.deleted.emit( this.asset );

		} catch ( error ) {

			SnackBar.warn( 'Could Not Delete Item' );

		}

	}

	renameNode () {

		this.showRenaming = true;

		// Use NgZone to ensure the focus logic is aligned with Angular's change detection
		this.ngZone.run( () => {

			setTimeout( () => {

				if ( this.nameInputRef ) {

					this.nameInputRef.nativeElement.focus();
					this.nameInputRef.nativeElement.select();

				}

			}, 300 );

		} );

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
	onDragStart ( $event: DragEvent ) {

		this.dragDropService.setData( this.asset );

		$event.dataTransfer.setData( 'path', this.asset.path );

		$event.dataTransfer.setData( 'guid', this.asset.guid );

		MapEvents.assetDragged.emit( this.asset );

	}

	@HostListener( 'dragend', [ '$event' ] )
	onDragEnd ( $event ) {

		// console.log( $event )

	}


	@HostListener( 'drop', [ '$event' ] )
	onDrop ( $event ) {

		if ( !this.asset.isDirectory ) return;

		// here we can get the path of the folder where the asset is dropped

	}

	@HostListener( 'window:mousedown', [ '$event' ] )
	onMouseDown ( $event: MouseEvent ) {

		if ( !this.showRenaming ) return;

		// if the click is outside the input element
		// then stop renaming
		if ( this.nameInputRef && this.nameInputRef.nativeElement !== $event.target ) {

			this.showRenaming = false;

		}

	}

	@HostListener( 'window:keydown', [ '$event' ] )
	onKeyDown ( $event: KeyboardEvent ) {

		if ( !this.showRenaming ) return;

		if ( !this.asset ) return;

		if ( !this.nameInputRef ) return;

		if ( document.activeElement !== this.nameInputRef.nativeElement ) {

			this.nameInputRef.nativeElement.focus();
			this.nameInputRef.nativeElement.select();

		}

		// if enter key is pressed
		if ( $event.code === 'Enter' && this.nameInputRef ) {

			const isValid = this.isValidFilename( this.nameInputRef.nativeElement.value );

			if ( !isValid.success ) {

				SnackBar.warn( isValid.messsage );

				return;

			}

			let newName: string;



			if ( this.asset.isDirectory ) {

				newName = this.nameInputRef.nativeElement.value;

			} else {

				newName = this.nameInputRef.nativeElement.value + '.' + this.asset.extension;

			}

			this.assetService.renameAsset( this.asset, newName );

			this.renamed.emit( this.asset );

			this.showRenaming = false;

		}

	}

	private initPreview ( asset: AssetNode ) {

		if ( asset.type == AssetType.SCENE ) return;

		this.previewService.updatePreview( asset );
	}

	private isValidFilename ( name: string ): { success: boolean, messsage: string } {

		// Regex for validating filename
		const invalidCharacters = /[<>.,:'"/\\|?*\x00-\x1F]/g;
		const windowsReserved = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i;

		if ( invalidCharacters.test( name ) ) {
			return {
				success: false,
				messsage: 'The following characters are not allowed in file names: ., <, >, \', :, ", /, \, |, ?, *.'
			};
		}

		if ( name.length > 60 ) {
			return {
				success: false,
				messsage: 'File name too long, should not be more than 60 characters.'
			};
		}

		if ( windowsReserved.test( name ) ) {
			return {
				success: false,
				messsage: 'The following names are not allowed for files: CON, PRN, AUX, NUL, COM1, COM2, COM3, COM4, COM5, COM6, COM7, COM8, COM9, LPT1, LPT2, LPT3, LPT4, LPT5, LPT6, LPT7, LPT8, LPT9.'
			};
		}

		if ( name.endsWith( ' ' ) || name.endsWith( '.' ) ) {
			return {
				success: false,
				messsage: 'File name should not end with space or dot.'
			};
		}

		return {
			success: true,
			messsage: ''
		};
	}

}
