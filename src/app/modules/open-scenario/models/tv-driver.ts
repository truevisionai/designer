/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractController } from './tv-interfaces';
import { ParameterDeclaration } from './tv-parameter-declaration';
import { PersonDescription } from './tv-person-description';

export class Driver extends AbstractController {

	private m_ParameterDeclarations: ParameterDeclaration[];
	private m_Description: PersonDescription;

}
