/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AfterViewInit, Component, ComponentFactoryResolver, OnInit, ViewChild } from '@angular/core';
import { ComponentItem, IComponent } from '../../../objects/game-object';
import { AppInspector } from '../../../core/inspector';
import { ComponentContainerDirective } from '../../shared/directives/component-container.directive';

@Component( {
	selector: 'app-object-inspector',
	templateUrl: './object-inspector.component.html',
	styleUrls: [ './object-inspector.component.css' ]
} )
export class ObjectInspectorComponent implements OnInit, AfterViewInit {

	@ViewChild( ComponentContainerDirective ) componentContainer: ComponentContainerDirective;

	constructor (
		private componentFactoryResolver: ComponentFactoryResolver,
	) {

		AppInspector.inspectorChanged.subscribe( ( e: ComponentItem ) => {
			this.loadInspector( e );
		} );

		AppInspector.inspectorCleared.subscribe( () => {
			this.clearInspector();
		} );
	}

	ngAfterViewInit (): void {


	}

	loadInspector ( component: ComponentItem ) {

		const componentFactory = this.componentFactoryResolver.resolveComponentFactory( component.component );

		const viewContainerRef = this.componentContainer.viewContainerRef;

		viewContainerRef.clear();

		const componentRef = viewContainerRef.createComponent( componentFactory );

		const componentInstance = componentRef.instance as IComponent;

		componentInstance.data = component.data;

		AppInspector.inspectorCreated.emit( componentInstance );

		AppInspector.lastInspectorCreated = componentInstance;
	}

	clearInspector () {

		if ( this.componentContainer ) this.componentContainer.viewContainerRef.clear();

	}


	ngOnInit () {


	}

}
