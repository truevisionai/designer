/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import {
	AfterViewInit,
	ApplicationRef,
	Component,
	ElementRef,
	HostListener,
	Input,
	OnInit,
	ViewChild
} from '@angular/core';
import { AssetNode, AssetType } from '../file-node.model';
import { ProjectBrowserService } from '../project-browser.service';

@Component( {
	selector: 'app-folder-files',
	templateUrl: './folder-files.component.html',
	styleUrls: [ './folder-files.component.css' ]
} )
export class FolderFilesComponent implements OnInit, AfterViewInit {

	@ViewChild( 'content' ) contentRef: ElementRef;

	@Input() folder: AssetNode;

	widthInPercent: string;

	files: AssetNode[] = [];

	constructor (
		private appRef: ApplicationRef,
		private projectBrowserService: ProjectBrowserService
	) {
	}

	get sortedFiles () {

		let sorted = [];

		this.files.filter( f => f.type == AssetType.DIRECTORY ).forEach( f => sorted.push( f ) );

		this.files.filter( f => f.type != AssetType.DIRECTORY ).forEach( f => sorted.push( f ) );

		return sorted;
	}

	ngOnInit () {

		console.log( 'folder-files.component.ts ngOnInit()', this.folder );

		this.files = this.folder ? this.projectBrowserService.getFiles( this.folder.path ) : [];

		this.projectBrowserService.folderChanged.subscribe( folder => this.refershFolder() );

	}

	ngAfterViewInit () {

		this.updateThumbnailCount( this.contentRef.nativeElement.clientWidth );

	}

	@HostListener( 'window:resize' )
	onWindowResize () {

		this.updateThumbnailCount( this.contentRef.nativeElement.clientWidth );

	}

	updateThumbnailCount ( width: number ) {

		// 125 is the minimum width for the item
		const count = Math.floor( width / 100 );

		this.widthInPercent = ( 100 / count ) + '%';

	}

	onFileDeleted ( $node: AssetNode ) {

		this.refershFolder();

	}

	onFileRenamed ( $event ) {

		this.refershFolder();

	}

	refershFolder () {

		this.appRef.tick();

		this.files = this.folder ? this.projectBrowserService.getFiles( this.folder.path ) : [];

	}
}
