export interface PlayerType
{
	username: string;
	email: string;
	password: string;
	wins: number;
	draws: number;
	loses: number;
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
}

export interface Vec2
{
	x: number;
	y: number;
}

export interface Paddle
{
	pos: Vec2;
	size: Vec2;
	dir: Vec2;
	colour: string
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
	enabled:		boolean;
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
