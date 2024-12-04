/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { NestedTreeControl } from '@angular/cdk/tree';
import { ApplicationRef, Component, HostListener, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { TvConsole } from '../../../core/utils/console';
import { SnackBar } from '../../../services/snack-bar.service';
import { Asset, AssetType } from '../../../assets/asset.model';
import { ProjectBrowserService } from './project-browser.service';
import { ContextMenuType, MenuService } from 'app/services/menu.service';
import { TvElectronService } from 'app/services/tv-electron.service';
import { VehicleCategory } from 'app/scenario/models/tv-enums';
import { ProjectService } from "../../../services/editor/project.service";
import { AssetService } from 'app/assets/asset.service';
import { AssetImporter } from "../../../assets/asset.importer";
import { FileUtils } from 'app/io/file-utils';
import { TvMaterialFactory } from "../../../assets/material/tv-material.factory";
import { Log } from "../../../core/utils/log";

@Component( {
	selector: 'app-project-browser',
	templateUrl: './project-browser.component.html',
	styleUrls: [ './project-browser.component.css' ],
} )
export class ProjectBrowserComponent implements OnInit {

	currentFolder: Asset;

	folderTree = new NestedTreeControl<Asset>( ( node: Asset ) => {
		if ( node.type === AssetType.DIRECTORY ) {
			return this.projectBrowser.getFolders( node.path )
		} else {
			return [];
		}
	} );

	dataSource: MatTreeNestedDataSource<Asset> = new MatTreeNestedDataSource<Asset>();

	constructor (
		private projectService: ProjectService,
		private projectBrowser: ProjectBrowserService,
		private appRef: ApplicationRef,
		private menuService: MenuService,
		private electron: TvElectronService,
		private assetService: AssetService,
		private snackBar: SnackBar,
		private assetImporter: AssetImporter,
	) {
	}

	ngOnInit (): void {

		this.dataSource.data = [];

		this.currentFolder = new Asset( AssetType.DIRECTORY, 'root', this.projectService.projectPath );

		this.loadFilesInFolder();

		this.projectBrowser.folderChanged.subscribe( node => this.onFolderChanged( node ) );

	}

	onFolderChanged ( node: Asset ): void {

		this.currentFolder = node;

	}

	loadFilesInFolder (): void {

		this.dataSource.data = this.projectBrowser.getFolders( this.projectService.projectPath );

	}

	@HostListener( 'dragover', [ '$event' ] )
	onDragOver ( evt: any ): void {

		evt.preventDefault();
		evt.stopPropagation();
	}

	@HostListener( 'dragleave', [ '$event' ] )
	onDragLeave ( evt: any ): void {

		evt.preventDefault();
		evt.stopPropagation();

	}

	@HostListener( 'drop', [ '$event' ] )
	async onDrop ( $event: DragEvent ): Promise<void> {

		$event.preventDefault();
		$event.stopPropagation();

		const folderPath = this.currentFolder ?
			this.currentFolder.path :
			this.projectService.projectPath;

		for ( let i = 0; i < $event.dataTransfer.files.length; i++ ) {

			const file = $event.dataTransfer.files[ i ];

			await this.handleDroppedFile( file, folderPath );

		}

		if ( this.currentFolder ) {

			this.appRef.tick();

		}
	}

	async handleDroppedFile ( file: File, folderPath: string ): Promise<void> {

		if ( !file ) {
			this.snackBar.error( 'Incorrect file. Cannot import' );
			Log.error( 'Incorrect file. Cannot import' );
			return;
		}

		if ( !file.path ) {
			this.snackBar.error( 'Incorrect file path. Cannot import' );
			Log.error( 'Incorrect file path. Cannot import', file, folderPath );
			return;
		}

		const extension = FileUtils.getExtensionFromPath( file.path );

		if ( !extension ) {
			this.snackBar.error( 'Incorrect file extension. Cannot import' );
			Log.error( 'Incorrect file extension. Cannot import', file, folderPath );
			return;
		}

		await this.assetImporter.import( file.path, folderPath );

	}

	onContextMenu ( $event: any, selectedNode?: Asset ): void {

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
					click: () => this.assetService.createMaterialAsset(
						this.currentFolder.path, 'Material.material', TvMaterialFactory.createNew()
					)
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

	refreshFolder (): void {

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
