import { OscGlobalAction } from './actions/osc-global-action';
import { OscUserDefinedAction } from './actions/osc-user-defined-action';
import { OscStory } from './osc-story';
import { AbstractPrivateAction } from './osc-interfaces';
import { OscConditionGroup } from './conditions/osc-condition-group';
import { OscSourceFile } from '../services/osc-source-file';


export class EntityInitAction {

    constructor ( public name: string, public action: AbstractPrivateAction ) {

    }
}

export class OscStoryboard {

    private m_InitActions = new OscInitActions;

    public stories: Map<string, OscStory> = new Map<string, OscStory>();

    public endConditionGroups: OscConditionGroup[] = [];

    public privateInitAction: EntityInitAction[] = [];

    addStory ( story: OscStory ) {

        const hasName = OscSourceFile.names.has_story( story.name );

        if ( hasName ) throw new Error( `Story name '${ story.name }' has already been used` );

        this.stories.set( story.name, story );

        OscSourceFile.names.add_story( story.name, story );

    }

    addNewStory ( name: string, owner?: string ): OscStory {

        const story = new OscStory( name, owner );

        this.addStory( story );

        return story;

    }

    addEndConditionGroup ( group: OscConditionGroup ) {

        this.endConditionGroups.push( group );

    }

    get initActions () {

        return this.m_InitActions;

    }

    addPrivateInitAction ( owner: string, action: AbstractPrivateAction ): any {

        this.privateInitAction.push( new EntityInitAction( owner, action ) );

    }

}


export class OscInitActions {

    private globalActions: OscGlobalAction[] = [];
    private userDefinedActions: OscUserDefinedAction[] = [];
    private privateActions: AbstractPrivateAction[] = [];

    addPrivateAction ( owner: string, action: AbstractPrivateAction ): any {

        this.privateActions.push( action );

    }

}
