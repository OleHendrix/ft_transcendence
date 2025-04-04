// +--------------------------------------------------------------------------+
// |               WARNING: is a duplicate of backend/types.ts                )
// +--------------------------------------------------------------------------+

export interface PlayerData
{
	id:			number;
	username:	string;
}

export enum Opponent
{
	AI = -1,
	ANY = -2,
}

export interface QueueData
{
	player:		PlayerData;
	opponentID:	number | Opponent;
}

export interface PlayerType
{
	id:			number;
	admin:		boolean;
	username:	string;
	email:		string;
	wins:		number;
	draws:		number;
	losses:		number;
	elo:		number;
	twofa:		boolean;
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
	pos:		Vec2;
	size:		Vec2;
	dir:		Vec2;
	colour:		string
	lastBounce:	number;
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

export enum PlayerState
{
	idle,
	playing,
	queueing
}