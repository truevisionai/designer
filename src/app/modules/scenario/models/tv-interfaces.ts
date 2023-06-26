/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractController } from './abstract-controller';
import { CatalogReference } from './tv-catalogs';

export abstract class IScenarioObject {
}

export class CatalogReferenceController extends AbstractController {

	constructor ( public catalogReference: CatalogReference ) {
		super( catalogReference.entryName );
	}

}

