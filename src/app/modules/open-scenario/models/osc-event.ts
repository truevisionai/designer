import { AbstractAction } from './osc-interfaces';
import { OscConditionGroup } from './conditions/osc-condition-group';
import { OscSourceFile } from '../services/osc-source-file';
import { OscUtils } from './osc-utils';
import { StoryEvent } from '../services/osc-player.service';
import { OscStoryElementType } from './osc-enums';
import { EventEmitter } from '@angular/core';
import { OscSpeedCondition } from './conditions/osc-speed-condition';
import { AbstractCondition } from './conditions/osc-condition';

export class OscEvent {

    private static count = 1;

    public startConditionGroups: OscConditionGroup[] = [];
    public isCompleted: boolean;
    public hasStarted: boolean;

    public completed = new EventEmitter<StoryEvent>();

    // public actions: OscEventAction[] = [];
    private actions: Map<string, AbstractAction> = new Map<string, AbstractAction>();

    constructor ( public name?: string, public priority?: string ) {

        OscEvent.count++;

    }

    static getNewName ( name = 'MyEvent' ) {

        return `${ name }${ this.count }`;

    }

    get startConditions () {

        let conditions = [];

        this.startConditionGroups.forEach( group => {
            group.conditions.forEach( condition => {
                conditions.push( condition );
            } );
        } );

        return conditions;
    }

    addNewAction ( name: string, action: AbstractAction ) {

        const hasName = OscSourceFile.db.has_action( name );

        if ( hasName ) throw new Error( `Action name '${ name }' already used` );

        this.actions.set( name, action );

        OscSourceFile.db.add_action( name );

        action.completed.subscribe( e => {
            this.onActionCompleted( { name: name, type: OscStoryElementType.action } );
        } );
    }

    addStartCondition ( condition: AbstractCondition ) {

        const conditionGroup = this.createOrGetGroup();

        conditionGroup.addCondition( condition );

    }

    createOrGetGroup () {

        if ( this.startConditionGroups.length === 0 ) {

            this.startConditionGroups.push( new OscConditionGroup() );

        }

        return this.startConditionGroups[ 0 ];
    }

    hasPassed () {

        return OscUtils.hasGroupsPassed( this.startConditionGroups );

    }

    getActions () {
        return [ ...this.actions.values() ];
    }

    getActionMap () {

        return this.actions;

    }

    private onActionCompleted ( e: StoryEvent ) {

        if ( e.type != OscStoryElementType.action ) return;

        this.actions.forEach( ( action, actionName ) => {

            if ( actionName === e.name ) action.isCompleted = true;

        } );

        let allCompleted = true;

        this.actions.forEach( ( action ) => {

            if ( !action.isCompleted ) allCompleted = false;

        } );

        if ( allCompleted ) {

            this.isCompleted = true;

            this.completed.emit( {
                name: this.name,
                type: OscStoryElementType.event
            } );
        }


    }
}
