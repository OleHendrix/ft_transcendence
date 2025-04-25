export const defaultSignUpValidation = 
{
  'Already logged in': false,
  'Username exists': false,
  'Email exists': false,
  'Password does not match': false,
  'Password matches!': false
};

export const defaultLoginValidation =
{
	'Already logged in': false, 
	'Username not found': false, 
	'Password incorrect': false,
	'2FA Code incorrect': false
}

export const emptySignUpForm =
{
	username: '', 
	email: '', 
	password: '', 
	confirmPassword: ''
}