import { Component, OnInit } from '@angular/core';
import { IComponent } from 'app/core/game-object';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';

@Component( {
	selector: 'app-xodr-file-inspector',
	templateUrl: './xodr-file-inspector.component.html',
	styleUrls: [ './xodr-file-inspector.component.scss' ]
} )
export class XodrFileInspectorComponent implements OnInit, IComponent {

	data: TvMap;

	constructor () { }

	ngOnInit () { }

}
