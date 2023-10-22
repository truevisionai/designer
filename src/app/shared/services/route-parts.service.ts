/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Params, Router } from '@angular/router';

interface IRoutePart {
	title: string,
	breadcrumb: string,
	params?: Params,
	url: string,
	urlSegments: any[]
}

@Injectable()
export class RoutePartsService {
	public routeParts: IRoutePart[];

	constructor ( private router: Router ) {
	}

	ngOnInit () {
	}

	generateRouteParts ( snapshot: ActivatedRouteSnapshot ): IRoutePart[] {
		var routeParts = <IRoutePart[]>[];
		if ( snapshot ) {
			if ( snapshot.firstChild ) {
				routeParts = routeParts.concat( this.generateRouteParts( snapshot.firstChild ) );
			}
			if ( snapshot.data[ 'title' ] && snapshot.url.length ) {
				routeParts.push( {
					title: snapshot.data[ 'title' ],
					breadcrumb: snapshot.data[ 'breadcrumb' ],
					url: snapshot.url[ 0 ].path,
					urlSegments: snapshot.url,
					params: snapshot.params
				} );
			}
		}
		return routeParts;
	}
}
