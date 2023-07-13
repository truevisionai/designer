import { Component, OnDestroy, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { TvObjectMarking } from 'app/modules/tv-map/models/tv-object-marking';

@Component( {
	selector: 'app-object-marking-inspector',
	templateUrl: './object-marking-inspector.component.html',
	styleUrls: [ './object-marking-inspector.component.scss' ]
} )
export class ObjectMarkingInspectorComponent implements OnInit, IComponent, OnDestroy {

	data: TvObjectMarking;

	constructor () { }

	ngOnDestroy (): void {
	}

	ngOnInit () {
	}

}
