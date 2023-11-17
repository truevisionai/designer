/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import {
	AfterViewInit,
	ApplicationRef,
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	Input,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
import { AssetFactory } from 'app/core/asset/asset-factory.service';
import { FileService } from 'app/io/file.service';
import { ImporterService } from 'app/importers/importer.service';
import { ContextMenuType, MenuService } from 'app/services/menu.service';
import { SnackBar } from 'app/services/snack-bar.service';
import { TvElectronService } from 'app/services/tv-electron.service';

import { FileNode } from '../file-node.model';
import { ProjectBrowserService } from '../project-browser.service';

@Component( {
	selector: 'app-folder-files',
	templateUrl: './folder-files.component.html',
	styleUrls: [ './folder-files.component.css' ]
} )
export class FolderFilesComponent implements OnInit, AfterViewInit {

	@ViewChild( 'content' ) contentRef: ElementRef;

	@Input() folder: FileNode;

	@Input() files: FileNode[] = [];

	@Output() folderChanged = new EventEmitter<FileNode>();

	@Input() selectedNode: FileNode;

	widthInPercent: string;

	constructor (
		private importer: ImporterService,
		private electron: TvElectronService,
		private menuService: MenuService,
		private fileService: FileService,
		private appRef: ApplicationRef,
		private projectBrowserService: ProjectBrowserService
	) {
	}

	get sortedFiles () {

		let sorted = [];

		this.files.filter( f => f.type == 'directory' ).forEach( f => sorted.push( f ) );

		this.files.filter( f => f.type != 'directory' ).forEach( f => sorted.push( f ) );

		return sorted;
	}

	ngOnInit () {

		// Debug.log( 'init-folder-files' );

	}

	ngAfterViewInit () {

		this.updateThumbnailCount( this.contentRef.nativeElement.clientWidth );

	}

	deleteNode ( node: FileNode ): void {


	}

	showInExplorer (): void {

		try {

			const selectedFile = this.files.find( file => file.isSelected === true );

			if ( selectedFile ) {

				this.electron.shell.showItemInFolder( selectedFile.path );

			} else {

				this.electron.shell.openPath( this.folder.path );

			}

		} catch ( error ) {

			SnackBar.error( 'Some error occurred' );

		}

	}

	reimport ( node: FileNode ) {

		console.error( 'method not implemented' );

		// if ( !node ) return;

		// this.assets.reimport( node );

	}

	reimportAll (): void {

		console.error( 'method not implemented' );

		// this.assets.reimportProject();

	}

	renameNode ( node: FileNode ): void {

		if ( !node ) return;

		if ( node.type === 'directory' ) {


		} else {


		}

	}

	doubleClickFolder ( node: FileNode ) {

		if ( node.type === 'directory' ) this.folderChanged.emit( node );

	}

	selectFolder () {

		// Debug.log( 'select-folder', node );

		// if ( node.type === 'directory' ) this.folderChanged.emit( node );

	}

	onMouseDown ( node: FileNode ) {

		// console.log( 'mouse-down', node.name );

		this.selectedNode = node;

		// // unselected all
		// this.files.forEach( file => file.isSelected = false );

		// // select this node
		// node.isSelected = true;

	}

	onMouseOver ( node: FileNode ) {

		// console.log( 'mouse-over', node.name );

		this.selectedNode = node;

	}

	onMouseOut () {

		// console.log( 'mouseout', node.name );

		// if ( !this.selectedNode ) return;

		// this.selectedNode.isSelected = false;

		// this.selectedNode = null;

	}

	// importFile ( file: FileNode ) {
	//
	// 	this.projectBrowserService.fileDoubleClicked.emit( file );
	//
	// 	this.importer.onViewPortFileDropped( file.path, file.name );
	//
	// }
	//
	// onDragStart ( $event: DragEvent, node: FileNode ) {
	//
	// 	$event.dataTransfer.setData( 'path', node.path );
	//
	// }

	@HostListener( 'window:resize' )
	onWindowResize () {

		this.updateThumbnailCount( this.contentRef.nativeElement.clientWidth );

	}

	updateThumbnailCount ( width: number ) {

		// 125 is the minimum width for the item
		const count = Math.floor( width / 100 );

		this.widthInPercent = ( 100 / count ) + '%';

		// console.log( "show ", count, "for", width );
	}

	onFileDeleted ( $node: FileNode ) {

		if ( !$node ) return;

		this.files = this.files.filter( file => !file.isDeleted );

		this.refershFolder();
	}

	onFileRenamed ( $event ) {

		this.refershFolder();

	}

	refershFolder () {

		this.files = this.folder.sub_files( this.fileService );

		this.appRef.tick();

	}
}
