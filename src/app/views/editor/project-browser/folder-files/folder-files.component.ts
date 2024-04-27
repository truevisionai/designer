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
import { Asset, AssetType } from '../../../../core/asset/asset.model';
import { ProjectBrowserService } from '../project-browser.service';
import { AssetService } from 'app/core/asset/asset.service';

@Component( {
	selector: 'app-folder-files',
	templateUrl: './folder-files.component.html',
	styleUrls: [ './folder-files.component.css' ]
} )
export class FolderFilesComponent implements OnInit, AfterViewInit {

	@ViewChild( 'content' ) contentRef: ElementRef;

	@Input() folder: Asset;

	widthInPercent: string;

	files: Asset[] = [];

	get sortedFiles () {

		let sorted = [];

		this.files.filter( f => f.type == AssetType.DIRECTORY ).forEach( f => sorted.push( f ) );

		this.files.filter( f => f.type != AssetType.DIRECTORY ).forEach( f => sorted.push( f ) );

		return sorted;
	}

	constructor (
		private appRef: ApplicationRef,
		private projectBrowserService: ProjectBrowserService,
		private assetService: AssetService,
	) {
	}

	ngOnInit () {

		this.files = this.folder ? this.projectBrowserService.getAssets( this.folder.path ) : [];

		this.projectBrowserService.folderChanged.subscribe( folder => this.refreshFolder() );

		this.assetService.assetCreated.subscribe( asset => this.refreshFolder() );

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

	onFileDeleted ( $node: Asset ) {

		this.refreshFolder();

	}

	onFileRenamed ( $event ) {

		this.refreshFolder();

	}

	refreshFolder () {

		this.appRef.tick();

		this.files = this.folder ? this.projectBrowserService.getAssets( this.folder.path ) : [];

	}
}
