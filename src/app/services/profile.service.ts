import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { User } from '@sentry/angular';

@Injectable( {
	providedIn: 'root'
} )
export class ProfileService {

	constructor (
		private api: ApiService
	) { }

	updateProfile ( profile: any ) {
		this.api.post( '/profile', profile ).subscribe( ( response ) => {
			console.log( response );
		} );
	}

	fetchUser (): Observable<User> {
		return this.api.get( '/profile' );
	}
}
