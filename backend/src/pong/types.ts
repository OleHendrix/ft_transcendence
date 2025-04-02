// +--------------------------------------------------------------------------+
// |               WARNING: is a duplicate of frontend/types.ts               |
// +--------------------------------------------------------------------------+

export interface PlayerData
{
	id:			number;
	username:	string;
}

export interface PlayerType
{
	id:			number;
	username:	string;
	email:		string;
	password:	string;
	wins:		number;
	draws:		number;
	loses:		number;
	totpSecret:	boolean;
}

export interface SignUpFormType
{
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
};

export interface LoginFormType
{
	username: string;
	password: string;
}

export interface LoginValidationType
{
  'Already logged in': boolean;
  'Username not found': boolean; 
  'Password incorrect': boolean;
  '2FA Code incorrect': boolean;
}

export interface Vec2
{
	x: number;
	y: number;
}

export interface Paddle
{
	pos:	Vec2;
	size:	Vec2;
	dir:	Vec2;
	colour:	string
	bounce:	boolean;
}

export interface Ball
{
	pos:		Vec2;
	prevPos:	Vec2;
	size:		Vec2;
	dir:		Vec2;
}

export interface AI
{
	lastActivation:	number;
	desiredY:		number;
}

export interface Statics
{
	BOUNCE:		Vec2;
	CARRYOVER:	number,
	VELOCITY:	number,
	FRICTION:	number,
}

export interface PongState
{
	p1:			Paddle;
	p2:			Paddle;
	p1Score:	number;
	p2Score:	number;
	p1Input:	number;
	p2Input:	number;
	ball:		Ball;
	lastUpdate:	number;
	ai:			AI;
	maxPoints:	number;
	p1Won:		boolean | null;
	p1Data:		PlayerData;
	p2Data:		PlayerData;
}

export interface Match
{
	state:			PongState;
	p1:				PlayerData;
	p2:				PlayerData;
	isLocalGame:	boolean;
};
