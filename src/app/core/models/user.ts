/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class User {
	id: number;
	email: string;
	name: string;
	is_email_verified: string;
	created_at: string;
	updated_at: string;
	onboarding_completed: boolean;
}

export class Profile {
	user_id: number;
	onboarding_responses: any;
}
