import {IMenuItem} from 'interfaces/configuration.interface'
import {IRole} from 'interfaces/authentication.interface'
import useAppContext from 'hooks/useAppContext'
import {menu} from 'configurations/menu'
import {useMemo} from 'react'


const pickOnlyAllowedMenu = (menuItem: IMenuItem, role: IRole, categories: string[]) => {
	const isAllowedRole = menuItem.allowedRoles?.includes(role)
	const isAllowedPermission = menuItem.id ? categories.includes(menuItem.id) : true
	return isAllowedRole && isAllowedPermission
}
const sortMenu = (a: IMenuItem, b: IMenuItem, role: IRole) => a?.order?.[role] - b?.order?.[role]

export default function useSideMenu() {
	const {user} = useAppContext()

	return useMemo(() => {
			const categories = user?.categories || []
			return user ?
				menu
					.filter((menuItem) => pickOnlyAllowedMenu(menuItem, user.role, categories))
					.sort((a, b) => sortMenu(a, b, user.role)) :
				[]
		},
		[user]
	)
}
