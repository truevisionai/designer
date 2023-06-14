/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SceneService } from '../../../core/services/scene.service';
import { OpenScenario } from '../models/tv-scenario';

export class ClearHelper {

	constructor () {

	}

	clear ( openScenario: OpenScenario ) {

		if ( openScenario == null ) return;

		openScenario.objects.forEach( entity => {

			SceneService.remove( entity.gameObject );

			entity.initActions.splice( 0, entity.initActions.length );

		} );

		openScenario.storyboard.stories.forEach( story => {

			story.acts.splice( 0, story.acts.length );

		} );

		openScenario.storyboard.stories.clear();

	}

}
