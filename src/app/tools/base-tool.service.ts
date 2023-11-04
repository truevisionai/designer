import { Injectable } from '@angular/core';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { PointerEventData } from 'app/events/pointer-event-data';
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';
import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';


@Injectable( {
	providedIn: 'root'
} )
export class BaseToolService {

	select ( e: PointerEventData, nodeStrategy: SelectStrategy<TvSurface>, pointStrategy: SelectStrategy<AbstractControlPoint> ) {

		throw new Error( 'Method not implemented.' );

	}

	constructor () { }

}
