/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { NestedTreeControl } from '@angular/cdk/tree';
import { ApplicationRef, Component, HostListener, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { FileService } from 'app/io/file.service';
import { FileExtension } from 'app/io/FileExtension';
import { DialogFactory } from '../../../factories/dialog.factory';
import { MetadataFactory } from '../../../factories/metadata-factory.service';
import { TvConsole } from '../../../core/utils/console';
import { SnackBar } from '../../../services/snack-bar.service';
import { AssetNode, AssetType } from './file-node.model';
import { ProjectBrowserService } from './project-browser.service';
import { ContextMenuType, MenuService } from 'app/services/menu.service';
import { TvElectronService } from 'app/services/tv-electron.service';
import { VehicleCategory } from 'app/modules/scenario/models/tv-enums';
import { ProjectService } from "../../../services/project.service";
import { AssetService } from 'app/core/asset/asset.service';

@Component( {
	selector: 'app-project-browser',
	templateUrl: './project-browser.component.html',
	styleUrls: [ './project-browser.component.css' ],
} )
export class ProjectBrowserComponent implements OnInit {

	currentFolder: AssetNode;

	folderTree = new NestedTreeControl<AssetNode>( ( node: AssetNode ) => {
		if ( node.type === AssetType.DIRECTORY ) {
			return this.projectBrowser.getFolders( node.path )
		} else {
			return [];
		}
	} );

	dataSource: MatTreeNestedDataSource<AssetNode> = new MatTreeNestedDataSource<AssetNode>();

	constructor (
		private projectService: ProjectService,
		private fileService: FileService,
		private projectBrowser: ProjectBrowserService,
		private appRef: ApplicationRef,
		private menuService: MenuService,
		private electron: TvElectronService,
		private dialogFactory: DialogFactory,		// dont remove, needed to load dialog components,
		private assetService: AssetService,
		private snackBar: SnackBar
	) {
	}

	ngOnInit () {

		this.dataSource.data = [];

		this.currentFolder = new AssetNode( AssetType.DIRECTORY, 'root', this.projectService.projectPath );

		this.loadFilesInFolder();

		this.projectBrowser.folderChanged.subscribe( node => this.onFolderChanged( node ) );

	}

	onFolderChanged ( node: AssetNode ) {

		this.currentFolder = node;

	}

	loadFilesInFolder () {

		this.dataSource.data = this.projectBrowser.getFolders( this.projectService.projectPath );

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

		const folderPath = this.currentFolder ?
			this.currentFolder.path :
			this.fileService.projectFolder;

		for ( let i = 0; i < $event.dataTransfer.files.length; i++ ) {

			const file = $event.dataTransfer.files[ i ];

			await this.onFileDropped( file, folderPath );

		}

		if ( this.currentFolder ) {

			this.appRef.tick();

		}
	}

	async onFileDropped ( file: File, folderPath: string ) {

		if ( !file ) this.snackBar.error( 'Incorrect file. Cannot import' );
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
						this.onFolderChanged( this.currentFolder );
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
						this.onFolderChanged( this.currentFolder );
					} );
				break;

			case FileExtension.OPENDRIVE:
				copied = this.copyFile( file.path, destinationPath );
				break;

			default:
				this.snackBar.error( `${ extension } file cannot be imported` );
				break;
		}

		if ( copied ) {

			MetadataFactory.createMetadata( file.name, extension, destinationPath );

			this.refreshFolder();
		}

	}

	copyFile ( sourcePath: string, destinationPath: string ): boolean {

		if ( !destinationPath ) TvConsole.error( 'destinationPath incorrect' );
		if ( !destinationPath ) this.snackBar.error( 'destinationPath incorrect' );
		if ( !destinationPath ) return;

		try {

			this.fileService.fs.copyFileSync( sourcePath, destinationPath );

			return true;

		} catch ( error ) {

			TvConsole.error( error );
			this.snackBar.error( error );

		}
	}

	onContextMenu ( $event, selectedNode?: AssetNode ) {

		$event.preventDefault();
		$event.stopPropagation();

		this.menuService.registerContextMenu( ContextMenuType.HIERARCHY, [ {
			label: 'New',
			submenu: [
				{
					label: 'Scene',
					click: () => this.assetService.createSceneAsset( this.currentFolder.path )
				},
				{
					label: 'Folder',
					click: () => this.assetService.createFolderAsset( this.currentFolder.path )
				},
				{
					label: 'Material',
					click: () => this.assetService.createMaterialAsset( this.currentFolder.path )
				},
				{
					label: 'Entity',
					submenu: [
						{
							label: 'Vehicle',
							submenu: [
								{
									label: 'Car',
									click: () => this.assetService.createEntityAsset( this.currentFolder.path, VehicleCategory.car )
								},
								{
									label: 'Truck',
									click: () => this.assetService.createEntityAsset( this.currentFolder.path, VehicleCategory.truck )
								},
							]
						}
					]
				},
			]
		},
		{
			label: 'Show In Explorer',
			click: () => this.showInExplorer()
		},
		] );

		this.menuService.showContextMenu( ContextMenuType.HIERARCHY );
	}


	refreshFolder () {

		this.projectBrowser.folderChanged.emit( this.currentFolder );

		this.appRef.tick();

	}

	showInExplorer (): void {

		if ( !this.currentFolder ) return;

		try {

			this.electron.shell.openPath( this.currentFolder.path );

		} catch ( e ) {

			TvConsole.error( e );

			this.snackBar.error( e );

		}

	}
}
