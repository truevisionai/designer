/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import {
	AfterViewInit,
	Component,
	ComponentFactoryResolver,
	ComponentRef,
	Directive,
	Input,
	OnDestroy,
	OnInit,
	QueryList,
	ViewChildren,
	ViewContainerRef
} from '@angular/core';
import { AbstractFieldComponent } from 'app/views/shared/fields/abstract-field.component';
import { getSerializableActions, getSerializableFields, ISerializedActionSetting, ISerializedFieldSetting } from 'app/core/components/serialization';
import { IComponent } from 'app/objects/game-object';
import { SetValueCommand } from 'app/commands/set-value-command';
import { CommandHistory } from 'app/services/command-history';
import { BooleanFieldComponent } from 'app/views/shared/fields/boolean-field/boolean-field.component';
import { ColorFieldComponent } from 'app/views/shared/fields/color-field/color-field.component';
import { DoubleFieldComponent } from 'app/views/shared/fields/double-field/double-field.component';
import { EnumFieldComponent } from 'app/views/shared/fields/enum-field/enum-field.component';
import { RoadIdFieldComponent } from 'app/views/shared/fields/road-id-field/road-id-field.component';
import { SelectEntityFieldComponent } from 'app/views/shared/fields/select-entity-field/select-entity-field.component';
import { StringFieldComponent } from 'app/views/shared/fields/string-field/string-field.component';
import { Vector2FieldComponent } from 'app/views/shared/fields/vector2-field/vector2-field.component';
import { Vector3FieldComponent } from 'app/views/shared/fields/vector3-field/vector3-field.component';
import { GameObjectFieldComponent } from 'app/views/fields/game-object-field/game-object-field.component';
import { MaterialFieldComponent } from 'app/views/fields/material-field/material-field.component';
import { TextureFieldComponent } from 'app/views/fields/texture-field/texture-field.component';
import { Subscription } from 'rxjs';


@Directive( {
	selector: '[app-field-host]',
} )
export class FieldHostDirective {
	constructor ( public viewContainerRef: ViewContainerRef ) {
	}
}

@Component( {
	selector: 'app-dynamic-inspector',
	templateUrl: './dynamic-inspector.component.html',
	styleUrls: [ './dynamic-inspector.component.scss' ]
} )
export class DynamicInspectorComponent implements OnInit, AfterViewInit, IComponent, OnDestroy {

	@Input() data: any;

	@Input() label: string = 'Inspector';

	@Input() showToolbar = true;

	@Input() showProperties = true;

	serializableFields: { field: string, settings: ISerializedFieldSetting }[] = [];

	serializableActions: ISerializedActionSetting[];

	@ViewChildren( FieldHostDirective ) fieldHosts: QueryList<FieldHostDirective>;

	fieldComponents = new Map<string, ComponentRef<AbstractFieldComponent>>();

	updateSub?: Subscription;

	COMPONENTS = {
		'float': DoubleFieldComponent,
		'int': DoubleFieldComponent,
		'number': DoubleFieldComponent,
		'string': StringFieldComponent,
		'boolean': BooleanFieldComponent,
		'enum': EnumFieldComponent,
		'vector2': Vector2FieldComponent,
		'vector3': Vector3FieldComponent,
		'road': RoadIdFieldComponent,
		'entity': SelectEntityFieldComponent,
		'gameobject': GameObjectFieldComponent,
		'color': ColorFieldComponent,
		'texture': TextureFieldComponent,
		'object': DynamicInspectorComponent,
		'material': MaterialFieldComponent,
	};

	set value ( value: any ) {

		this.data = value;

	}

	constructor ( private componentFactoryResolver: ComponentFactoryResolver ) { }

	ngOnDestroy (): void {

		this.updateSub?.unsubscribe();

	}

	ngOnInit () {

		if ( this.data ) this.serializableFields = getSerializableFields( this.data );

		if ( this.data ) this.serializableActions = getSerializableActions( this.data );

	}

	ngAfterViewInit () {

		if ( this.data ) this.loadFields( this.data );

	}

	reloadData () {

		for ( const [ field, componentRef ] of this.fieldComponents ) {

			componentRef.instance.value = this.data[ field ];

		}

	}

	toggleProperties () {

		this.showProperties = !this.showProperties;

		if ( this.showProperties ) {

			if ( this.data ) this.serializableFields = getSerializableFields( this.data );

			if ( this.data ) this.serializableActions = getSerializableActions( this.data );

			if ( this.data ) setTimeout( () => this.loadFields( this.data ), 10 );

		} else {

			this.fieldHosts.forEach( ( host ) => {

				host.viewContainerRef.clear();

			} );

		}

	}

	loadFields ( data: any ) {

		this.serializableFields.forEach( ( item, index ) => {

			this.loadField( data, item, index );

		} );
	}

	loadField ( data: any, item: { field: string; settings: ISerializedFieldSetting; }, index: number ) {

		const fieldHost = this.fieldHosts.toArray()[ index ];

		const fieldType = item.settings.type;

		const fieldValue = data[ item.field ];

		if ( fieldValue === undefined ) return;

		const component = this.COMPONENTS[ fieldType ];

		const componentFactory = this.componentFactoryResolver.resolveComponentFactory<AbstractFieldComponent>( component );

		const componentRef = fieldHost.viewContainerRef.createComponent( componentFactory );

		componentRef.instance.value = fieldValue;

		componentRef.instance.label = item.settings?.label || item.field;

		componentRef.instance.disabled = item.settings.disabled ?? false;

		this.applyComponentSettings( componentRef.instance, item.settings );

		componentRef.instance.changed?.subscribe( ( value ) => {

			CommandHistory.execute( new SetValueCommand( data, item.field, value ) );

			this.reloadData();

		} );

		componentRef.instance.clicked?.subscribe( ( value ) => {

			CommandHistory.execute( new SetValueCommand( data, item.field, value ) );

		} );

		componentRef.changeDetectorRef.detectChanges();

		this.updateSub = data?.updated?.subscribe( () => componentRef.instance.value = data[ item.field ] );

		this.fieldComponents.set( item.field, componentRef );

	}

	applyComponentSettings ( component: AbstractFieldComponent, settings: ISerializedFieldSetting ) {

		if ( component instanceof DoubleFieldComponent ) {

			component.min = settings?.min ?? -Infinity;

			component.max = settings?.max ?? Infinity;

			component.step = settings?.step ?? 0.1;

		} else if ( component instanceof EnumFieldComponent ) {

			component.enum = settings?.enum;

		} else if ( component instanceof DynamicInspectorComponent ) {

			component.showToolbar = false;

		}

	}

}


@Component( {
	selector: 'app-dynamic-array-inspector',
	template: `<div *ngFor="let item of data">
	<ng-container app-field-host></ng-container>
</div>`,
	styleUrls: [ './dynamic-inspector.component.scss' ]
} )
export class DynamicArrayInspectorComponent implements OnInit, AfterViewInit {

	@Input() data: any[] = [];

	@ViewChildren( FieldHostDirective ) fieldHosts: QueryList<FieldHostDirective>;

	constructor ( private componentFactoryResolver: ComponentFactoryResolver ) {
	}

	ngOnInit (): void {

		// console.log( 'ngOnInit', this.data );

	}

	ngAfterViewInit (): void {

		// console.log( 'ngAfterViewInit', this.data );

		this.data.forEach( ( element: Object, index ) => {

			const component = DynamicInspectorComponent;

			const fieldHost = this.fieldHosts.toArray()[ index ];

			const componentFactory = this.componentFactoryResolver.resolveComponentFactory<DynamicInspectorComponent>( component );

			const componentRef = fieldHost.viewContainerRef.createComponent( componentFactory );

			componentRef.instance.data = element;

			componentRef.instance.label = element.constructor.name;

			componentRef.changeDetectorRef.detectChanges();

		} );
	}

}
