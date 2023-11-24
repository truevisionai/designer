/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { NestedTreeControl } from '@angular/cdk/tree';
import { ApplicationRef, Component, HostListener, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { FileExtension, FileService } from 'app/io/file.service';
import { ImporterService } from 'app/importers/importer.service';
import { DialogFactory } from '../../../factories/dialog.factory';
import { MetadataFactory } from '../../../factories/metadata-factory.service';
import { TvConsole } from '../../../core/utils/console';
import { SnackBar } from '../../../services/snack-bar.service';
import { AssetNode, AssetType } from './file-node.model';
import { ProjectBrowserService } from './project-browser.service';
import { ContextMenuType, MenuService } from 'app/services/menu.service';
import { AssetFactory } from 'app/core/asset/asset-factory.service';
import { TvElectronService } from 'app/services/tv-electron.service';
import { VehicleCategory } from 'app/modules/scenario/models/tv-enums';
import { VehicleFactory } from 'app/factories/vehicle.factory';
import { StorageService } from "../../../io/storage.service";
import { ProjectService } from "../../../services/project.service";

@Component( {
	selector: 'app-project-browser',
	templateUrl: './project-browser.component.html',
	styleUrls: [ './project-browser.component.css' ],
} )
export class ProjectBrowserComponent implements OnInit {

	currentFolder: AssetNode;

	folderTree = new NestedTreeControl<AssetNode>( ( node: AssetNode ) => {
		if ( node.type === 'directory' ) {
			return this.projectBrowser.getFolders( node.path )
		} else {
			return [];
		}
	} );

	dataSource: MatTreeNestedDataSource<AssetNode> = new MatTreeNestedDataSource<AssetNode>();

	constructor (
		private projectService: ProjectService,
		private storage: StorageService,
		private fileService: FileService,
		private projectBrowser: ProjectBrowserService,
		private importer: ImporterService,
		private appRef: ApplicationRef,
		private menuService: MenuService,
		private electron: TvElectronService,
		private dialogFactory: DialogFactory		// dont remove, needed to load dialog components
	) {
		this.dataSource.data = [];
	}

	ngOnInit () {

		// this.assets.init();

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
				SnackBar.error( `${ extension } file cannot be imported` );
				break;
		}

		if ( copied ) {

			MetadataFactory.createMetadata( file.name, extension, destinationPath );

			this.onFolderChanged( this.currentFolder );

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

	onContextMenu ( $event, selectedNode?: AssetNode ) {

		$event.preventDefault();
		$event.stopPropagation();

		this.menuService.registerContextMenu( ContextMenuType.HIERARCHY, [ {
			label: 'New',
			submenu: [
				{ label: 'Scene', click: () => this.createNewScene() },
				{ label: 'Folder', click: () => this.createNewFolder() },
				{ label: 'Material', click: () => this.createNewMaterial() },
				{ label: 'Road Marking', click: () => this.createNewRoadMarking() },
				{
					label: 'Entity', submenu: [
						{
							label: 'Vehicle', submenu: [
								{ label: 'Car', click: () => this.createVehicleEntity( VehicleCategory.car ) },
								// { label: 'Van', click: () => this.createVehicleEntity( VehicleCategory.van ) },
								{ label: 'Truck', click: () => this.createVehicleEntity( VehicleCategory.truck ) },
								// { label: 'Trailer', click: () => this.createVehicleEntity( VehicleCategory.trailer ) },
								// { label: 'Semi Trailer', click: () => this.createVehicleEntity( VehicleCategory.semitrailer ) },
								// { label: 'Bus', click: () => this.createVehicleEntity( VehicleCategory.bus ) },
								// { label: 'Motorbike', click: () => this.createVehicleEntity( VehicleCategory.motorbike ) },
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

	createNewScene () {

		try {

			AssetFactory.createNewScene( this.currentFolder.path );

			this.refershFolder();

		} catch ( error ) {

			SnackBar.error( error );

		}

	}

	createNewFolder () {

		try {

			AssetFactory.createNewFolder( this.currentFolder.path );

			this.refershFolder();

		} catch ( error ) {

			SnackBar.error( error );

		}

	}

	createNewMaterial () {

		try {

			AssetFactory.createNewMaterial( this.currentFolder.path, 'NewMaterial' );

			this.refershFolder();

		} catch ( error ) {

			SnackBar.error( error );

		}

	}

	createNewSign () {

		try {

			AssetFactory.createNewSign( 'NewSign', this.currentFolder.path );

			this.refershFolder();

		} catch ( error ) {

			SnackBar.error( error );

		}

	}

	createNewRoadMarking (): void {

		try {

			AssetFactory.createNewRoadMarking( this.currentFolder.path, 'NewRoadMarking' );

			this.refershFolder();

		} catch ( error ) {

			SnackBar.error( error );

		}

	}

	createVehicleEntity ( category: VehicleCategory = VehicleCategory.car ): void {

		try {

			const vehicle = VehicleFactory.createVehicle( category );

			AssetFactory.createVehicleEntity( this.currentFolder.path, vehicle );

			this.refershFolder();

		} catch ( error ) {

			SnackBar.error( error );

		}

	}

	refershFolder () {

		this.appRef.tick();

	}

	showInExplorer (): void {

		if ( !this.currentFolder ) return;

		try {

			this.electron.shell.openPath( this.currentFolder.path );

		} catch ( e ) {

			TvConsole.error( e );

			SnackBar.error( e );

		}

	}
}
