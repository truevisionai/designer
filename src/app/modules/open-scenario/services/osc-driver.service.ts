import { Injectable } from '@angular/core';

@Injectable( {
    providedIn: 'root'
} )
export class OscDriverService {

    constructor () { }

    get vehicleDrivers (): string[] {

        return [
            'DefaultDriver',
        ];

    }

}
