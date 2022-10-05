/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LayoutService } from '../../../shared/services/layout.service';
import { RoutePartsService } from '../../../shared/services/route-parts.service';

@Component( {
	selector: 'app-breadcrumb',
	templateUrl: './breadcrumb.component.html',
	styleUrls: [ './breadcrumb.component.scss' ]
} )
export class BreadcrumbComponent implements OnInit, OnDestroy {
	routeParts: any[];
	routerEventSub: Subscription;

	// public isEnabled: boolean = true;
	constructor (
		private router: Router,
		private routePartsService: RoutePartsService,
		private activeRoute: ActivatedRoute,
		public layout: LayoutService
	) {
		this.routerEventSub = this.router.events
			.pipe( filter( event => event instanceof NavigationEnd ) )
			.subscribe( ( routeChange ) => {
				this.routeParts = this.routePartsService.generateRouteParts( this.activeRoute.snapshot );
				// generate url from parts
				this.routeParts.reverse().map( ( item, i ) => {
					item.breadcrumb = this.parseText( item );
					item.urlSegments.forEach( ( urlSegment, j ) => {
						if ( j === 0 ) {
							return item.url = `${ urlSegment.path }`;
						}
						item.url += `/${ urlSegment.path }`;
					} );
					if ( i === 0 ) {
						return item;
					}
					// prepend previous part to current part
					item.url = `${ this.routeParts[ i - 1 ].url }/${ item.url }`;
					return item;
				} );
			} );
	}

	ngOnInit () {
	}

	ngOnDestroy () {
		if ( this.routerEventSub ) {
			this.routerEventSub.unsubscribe();
		}
	}

	parseText ( part ) {
		if ( !part.breadcrumb ) {
			return '';
		}
		part.breadcrumb = part.breadcrumb.replace( /{{([^{}]*)}}/g, function ( a, b ) {
			var r = part.params[ b ];
			return typeof r === 'string' ? r : a;
		} );
		return part.breadcrumb;
	}

}
