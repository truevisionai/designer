import { Injectable } from '@angular/core';

@Injectable( {
	providedIn: 'root'
} )
export class OscModelsService {

	constructor () { }

	get vehicleModels (): string[] {

		return [
			'vehicle_1',
			'vehicle_2',
			'vehicle_3',
			'vehicle_4',
			'vehicle_5',
			'vehicle_6',
			'vehicle_7',
			'vehicle_8',
			'vehicle_9',
		];

	}

}
