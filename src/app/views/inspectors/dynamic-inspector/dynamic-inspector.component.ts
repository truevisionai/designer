import {
	AfterViewInit,
	Component,
	ComponentFactoryResolver,
	Directive,
	Input,
	OnDestroy,
	OnInit,
	QueryList,
	ViewChildren,
	ViewContainerRef
} from '@angular/core';
import { AssetFactory } from 'app/core/asset/asset-factory.service';
import { AbstractFieldComponent } from 'app/core/components/abstract-field.component';
import { getSerializableActions, getSerializableFields, ISerializedField } from 'app/core/components/serialization';
import { IComponent } from 'app/core/game-object';
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
import { AssetNode } from 'app/views/editor/project-browser/file-node.model';
import { AssetService } from 'app/core/asset/asset.service';

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

	serializableFields: { field: string, settings: any }[] = [];

	serializableActions: { name: string; method: Function; }[];

	@ViewChildren( FieldHostDirective ) fieldHosts: QueryList<FieldHostDirective>;

	updateSub?: Subscription;

	set value ( value: any ) {

		this.data = value;

	}

	fieldComponents = {
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

	constructor ( private componentFactoryResolver: ComponentFactoryResolver ) {
	}

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

	loadField ( data: any, item: { field: string; settings: any; }, index: number ) {

		const fieldHost = this.fieldHosts.toArray()[ index ];

		const fieldType = item.settings.type;

		const fieldValue = data[ item.field ];

		if ( fieldValue === undefined ) return;

		const component = this.fieldComponents[ fieldType ];

		const componentFactory = this.componentFactoryResolver.resolveComponentFactory<AbstractFieldComponent>( component );

		const componentRef = fieldHost.viewContainerRef.createComponent( componentFactory );

		componentRef.instance.value = fieldValue;

		componentRef.instance.label = item.field;

		componentRef.instance.disabled = item.settings.disabled ?? false;

		this.applyComponentSettings( componentRef.instance, item.settings );

		componentRef.instance.changed?.subscribe( ( value ) => {

			CommandHistory.execute( new SetValueCommand( data, item.field, value ) );

		} );

		componentRef.instance.clicked?.subscribe( ( value ) => {

			CommandHistory.execute( new SetValueCommand( data, item.field, value ) );

		} );

		componentRef.changeDetectorRef.detectChanges();

		this.updateSub = data?.updated?.subscribe( () => componentRef.instance.value = data[ item.field ] );

	}

	applyComponentSettings ( component: AbstractFieldComponent, settings: ISerializedField ) {

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

@Component( {
	selector: 'app-dynamic-file-inspector',
	templateUrl: './dynamic-inspector.component.html',
	styleUrls: [ './dynamic-inspector.component.scss' ]
} )
export class DynamicFileInspectorComponent extends DynamicInspectorComponent implements OnDestroy {

	@Input() data: AssetNode;

	constructor (
		componentFactoryResolver: ComponentFactoryResolver,
		private assetSerice: AssetService,
	) {
		super( componentFactoryResolver );
	}

	ngOnDestroy (): void {

		super.ngOnDestroy();

		this.assetSerice.saveAsset( this.data );

	}

}
