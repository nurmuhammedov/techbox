enum ROLE_LIST {
	ADMIN = 'admin',
	USER = 'user'
}

const ROLE_LABEL: Record<ROLE_LIST, string> = {
	[ROLE_LIST.USER]: 'User',
	[ROLE_LIST.ADMIN]: 'Admin'
}


export {
	ROLE_LIST,
	ROLE_LABEL
}