/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import {
	AfterViewInit,
	ApplicationRef, ChangeDetectorRef,
	Component,
	ElementRef,
	HostListener,
	Input,
	OnInit,
	ViewChild
} from '@angular/core';
import { Asset, AssetType } from '../../../../assets/asset.model';
import { ProjectBrowserService } from '../project-browser.service';
import { AssetService } from 'app/assets/asset.service';

@Component( {
	selector: 'app-folder-files',
	templateUrl: './folder-files.component.html',
	styleUrls: [ './folder-files.component.css' ]
} )
export class FolderFilesComponent implements OnInit, AfterViewInit {

	@ViewChild( 'content' ) contentRef: ElementRef;

	@Input() folder: Asset;

	widthInPercent: string = '0%';

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
		private cdr: ChangeDetectorRef,
	) {
	}

	ngOnInit (): void {

		this.files = this.folder ? this.projectBrowserService.getAssets( this.folder.path ) : [];

		this.projectBrowserService.folderChanged.subscribe( folder => this.refreshFolder() );

		this.assetService.assetCreated.subscribe( asset => this.refreshFolder() );

	}

	ngAfterViewInit (): void {

		this.updateThumbnailCount( this.contentRef.nativeElement.clientWidth );

	}

	@HostListener( 'window:resize' )
	onWindowResize (): void {

		this.updateThumbnailCount( this.contentRef.nativeElement.clientWidth );

	}

	updateThumbnailCount ( width: number ): void {

		// 125 is the minimum width for the item
		const count = Math.floor( width / 100 );

		// defer to next microtask so it doesn't change during current check
		Promise.resolve().then( () => {
			this.widthInPercent = `${ 100 / count }%`;
			this.cdr.detectChanges(); // or markForCheck() if OnPush
		} );

	}

	onFileDeleted ( $node: Asset ): void {

		this.refreshFolder();

	}

	onFileRenamed ( $event: any ): void {

		this.refreshFolder();

	}

	refreshFolder (): void {

		this.appRef.tick();

		this.files = this.folder ? this.projectBrowserService.getAssets( this.folder.path ) : [];

	}
}
