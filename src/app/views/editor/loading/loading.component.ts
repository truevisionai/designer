import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'app/io/storage.service';
import { ProjectService } from 'app/services/project.service';
import { LoadingService } from './loading.service';

@Component( {
	selector: 'app-loading',
	templateUrl: './loading.component.html',
	styleUrls: [ './loading.component.scss' ]
} )
export class LoadingComponent implements OnInit, OnDestroy {

	logs = [];

	constructor (
		private router: Router,
		private loader: LoadingService,
		private storage: StorageService,
		private project: ProjectService,
	) { }


	ngOnInit () {

		this.loader.loadProject( this.project.projectPath );

		this.router.navigate( [ '/editor/editor' ] );

	}

	ngOnDestroy (): void {

		// throw new Error( 'Method not implemented.' );

	}

}
