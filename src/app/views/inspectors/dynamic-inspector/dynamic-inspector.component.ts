import { AfterViewInit, Component, ComponentFactoryResolver, Directive, OnInit, QueryList, ViewChildren, ViewContainerRef } from '@angular/core';
import { NgModel } from '@angular/forms';
import { AbstractFieldComponent } from 'app/core/components/abstract-field.component';
import { getSerializableActions, getSerializableFields } from 'app/core/components/serialization';
import { IComponent } from 'app/core/game-object';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { CommandHistory } from 'app/services/command-history';
import { BooleanFieldComponent } from 'app/shared/fields/boolean-field/boolean-field.component';
import { DoubleFieldComponent } from 'app/shared/fields/double-field/double-field.component';
import { EnumFieldComponent } from 'app/shared/fields/enum-field/enum-field.component';
import { StringFieldComponent } from 'app/shared/fields/string-field/string-field.component';


@Directive( {
	selector: '[app-field-host]',
} )
export class FieldHostDirective {
	constructor ( public viewContainerRef: ViewContainerRef ) { }
}

const fieldComponents = {
	'int': DoubleFieldComponent,
	'number': DoubleFieldComponent,
	'string': StringFieldComponent,
	'boolean': BooleanFieldComponent,
	'enum': EnumFieldComponent,
};

@Component( {
	selector: 'app-dynamic-inspector',
	templateUrl: './dynamic-inspector.component.html',
	styleUrls: [ './dynamic-inspector.component.scss' ]
} )
export class DynamicInspectorComponent implements OnInit, AfterViewInit, IComponent {

	data: any;

	serializableFields: { field: string, settings: any }[] = [];

	serializableActions: { name: string; method: Function; }[];

	@ViewChildren( FieldHostDirective ) fieldHosts: QueryList<FieldHostDirective>;


	constructor ( private componentFactoryResolver: ComponentFactoryResolver ) { }

	ngOnInit () {

		this.serializableFields = getSerializableFields( this.data );

		this.serializableActions = getSerializableActions( this.data );

	}

	ngAfterViewInit () {

		this.loadFields();

	}

	loadFields () {

		this.serializableFields.forEach( ( item, index ) => {

			const fieldHost = this.fieldHosts.toArray()[ index ];

			const fieldType = item.settings.type;

			const component = fieldComponents[ fieldType ];

			const componentFactory = this.componentFactoryResolver.resolveComponentFactory<AbstractFieldComponent>( component );

			const componentRef = fieldHost.viewContainerRef.createComponent( componentFactory );

			componentRef.instance.value = this.data[ item.field ];

			componentRef.instance.label = item.field;

			componentRef.instance.changed?.subscribe( ( value ) => {

				CommandHistory.execute( new SetValueCommand( this.data, item.field, value ) );

			} )

			componentRef.instance.clicked?.subscribe( ( value ) => {

				CommandHistory.execute( new SetValueCommand( this.data, item.field, value ) );

			} )

		} );
	}

}
