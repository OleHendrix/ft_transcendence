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
	AI 	= -1,
	ANY = -2,
}

export interface QueueData
{
	player:		PlayerData;
	opponentID:	number | Opponent;
}

export interface MatchHistory
{
	id:			number;
	winner:		string;
	p1:			string;
	p2:			string;
	p1score:	number;
	p2score:	number;
	p1Elo:		number;
	p2Elo:		number;
	p1Diff:		number;
	p2Diff:		number;
	time:		number;
};

export interface PlayerType
{
	id:				number;
	admin:			boolean;
	online:			boolean;
	username:		string;
	email:			string;
	avatar:			string;
	matchesPlayed:	number;
	wins:			number;
	draws:			number;
	losses:			number;
	winRate:		number;
	elo:			number;
	twofa:			boolean;
	matches:		MatchHistory[];
}

export interface AuthenticatedAccount extends PlayerType
{
	accesToken:		string;
	refreshToken:	string;
}

export interface Message
{
	id: 			number;
	content:		string;
	timestamp:		string;
	receiverId:		number;
	chatSessionId:	number;
	senderUsername:	string;
	senderId:		number;
	status:			number;
}

export interface SignUpFormType
{
	username: 			string;
	email: 				string;
	password: 			string;
	confirmPassword: 	string;
};

export interface SignUpValidatonType
{
	'Already logged in': boolean;
	'Username exists': boolean;
	'Email exists': boolean;
	'Password does not match': boolean;
	'Password matches!': boolean;
}

export interface LoginFormType
{
	username: string;
	password: string;
}

export interface LoginValidationType
{
  'Already logged in':	boolean;
  'Username not found':	boolean; 
  'Password incorrect':	boolean;
  '2FA Code incorrect':	boolean;
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

export interface Statics
{
	BOUNCE:		Vec2;
	CARRYOVER:	number,
	VELOCITY:	number,
	FRICTION:	number,
}

export enum Result
{
	PLAYING,
	P1WON,
	P2WON,
	DRAW
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
	timer:		number;
	result:		Result;
}

export interface Match
{
	state:			PongState;
	p1:				PlayerData;
	p2:				PlayerData;
	isLocalGame:	boolean;
	tournamentId:	number;
};

export enum PlayerState
{
	idle,
	playing,
	queueing
}

import type { WebSocket } from 'ws';

export interface TournamentData
{
	tournamentId:	number;
	hostId:			number;
	hostUsername: 	string;
	maxPlayers:		number;
	players:		PlayerData[];
	winners:		PlayerData[][];
	roundIdx:		number;
	rounds:			Match[][] | null;
	sockets:		Set<WebSocket>;
};