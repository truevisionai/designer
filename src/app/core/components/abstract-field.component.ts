/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Input, Output } from '@angular/core';

export abstract class AbstractFieldComponent {

    @Input() disabled: boolean = false;

    @Input() abstract value: any;

    @Input() label: string = '';

    /**
     * @deprecated use changed event instead
     */
    @Output() valueChanged = new EventEmitter<any>();

    @Output() changed = new EventEmitter<any>();

    onModelChanged ( $event: any ) {

        this.value = $event;

        this.valueChanged.emit( this.value );

        this.changed.emit( this.value );

    }

    get isParameter (): boolean {

        return typeof this.value === 'string' && this.value.indexOf( '$' ) !== -1;

    }

    get fieldValue () {

        if ( this.isParameter ) {

            // return OscSourceFile.scenario.findParameter( this.value ).value;

        }

        return this.value;
    }

    set fieldValue ( value ) {

        if ( this.isParameter ) {

            // OscSourceFile.scenario.findParameter( this.value ).value = value;

        } else {

            this.value = value;

        }

    }

    onFieldValueChanged ( $event: any ) {

        this.fieldValue = $event;

        if ( !this.isParameter ) this.valueChanged.emit( this.fieldValue );

        if ( !this.isParameter ) this.changed.emit( this.fieldValue );

    }
}
