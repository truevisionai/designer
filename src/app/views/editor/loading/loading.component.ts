/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from 'app/services/editor/project.service';
import { LoadingService } from './loading.service';

@Component( {
	selector: 'app-loading',
	templateUrl: './loading.component.html',
	styleUrls: [ './loading.component.scss' ]
} )
export class LoadingComponent implements AfterViewInit {

	get logs (): string[] {
		return this.loader.logs;
	}

	constructor (
		private router: Router,
		private loader: LoadingService,
		private project: ProjectService,
	) {
	}

	ngAfterViewInit (): void {

		this.project.setupDefaultAssets();

		this.loader.loadProject( this.project.projectPath );

		setTimeout( () => {

			this.router.navigate( [ '/editor/editor' ] );

		}, 1000 )

	}

}
