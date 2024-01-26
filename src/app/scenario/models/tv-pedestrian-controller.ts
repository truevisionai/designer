/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractController } from './abstract-controller';
import { ParameterDeclaration } from './tv-parameter-declaration';
import { PersonDescription } from './tv-person-description';

export class PedestrianController extends AbstractController {

	private m_Name: string;
	private m_ParameterDeclaration: ParameterDeclaration;
	private m_PersonDescription: PersonDescription;

}
