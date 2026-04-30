enum ROLE_LIST {
	ADMIN = 'admin',
	EMPLOYEE = 'employee',
	HEAD_DEPARTMENT = 'hr',
	LEADER = 'leader',
	STOREKEEPER = 'storekeeper',
	OPERATOR = 'operator'
}

const ROLE_LABEL: Record<ROLE_LIST, string> = {
	[ROLE_LIST.EMPLOYEE]: 'Employee',
	[ROLE_LIST.ADMIN]: 'Admin',
	[ROLE_LIST.HEAD_DEPARTMENT]: 'Human resources department',
	[ROLE_LIST.LEADER]: 'Leader',
	[ROLE_LIST.STOREKEEPER]: 'Storekeeper',
	[ROLE_LIST.OPERATOR]: 'Operator'
}

export {
	ROLE_LIST,
	ROLE_LABEL
}