/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Type } from '@angular/core';
import { ComponentItem, IComponent } from '../objects/game-object';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';

export class AppInspector {

	public static inspectorChanged = new EventEmitter<ComponentItem>();

	public static inspectorCleared = new EventEmitter<ComponentItem>();

	/**
	 * fired when new instance of inspector is created
	 */
	public static inspectorCreated = new EventEmitter<IComponent>();

	public static lastInspectorCreated: IComponent;

	public static currentInspector: Type<IComponent>;

	public static currentInspectorData: any;

	private static componentItem: ComponentItem;

	public static setInspector ( component: Type<IComponent>, data: any ): void {

		if ( !component ) this.clear();

		if ( !component ) return;

		this.currentInspector = component;

		this.currentInspectorData = data;

		this.componentItem = new ComponentItem( component, data );

		this.inspectorChanged.emit( this.componentItem );

	}

	public static setDynamicInspector ( data: any ): void {

		this.setInspector( DynamicInspectorComponent, data );

	}

	public static getInspector (): ComponentItem {

		return this.componentItem;

	}

	public static getCurrentInspector (): Type<IComponent> {

		return this.currentInspector;

	}

	public static getCurrentInspectorName (): string {

		return this.currentInspector ? this.currentInspector.name : '';

	}

	public static getInspectorData (): any {

		return this.currentInspectorData;

	}

	static clear (): void {

		this.currentInspector = null;

		this.currentInspectorData = null;

		this.inspectorCleared.emit( null );

	}

}
