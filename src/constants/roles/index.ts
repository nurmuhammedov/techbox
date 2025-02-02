enum ROLE_LIST {
	ADMIN = 'admin',
	EMPLOYEE = 'employee',
	HEAD_DEPARTMENT = 'hr',
}

enum PERMISSIONS_LIST {
	ROLE = 'role',
	HEAD_DEPARTMENT = 'human_resources'
}

const ROLE_LABEL: Record<ROLE_LIST, string> = {
	[ROLE_LIST.EMPLOYEE]: 'Employee',
	[ROLE_LIST.ADMIN]: 'Admin',
	[ROLE_LIST.HEAD_DEPARTMENT]: 'Human resources department'
}


export {
	ROLE_LIST,
	ROLE_LABEL,
	PERMISSIONS_LIST
}