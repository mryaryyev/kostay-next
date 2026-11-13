import type { ComponentType } from 'react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MenuList from '../admin/AdminMenuList';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Menu, MenuItem, useMediaQuery } from '@mui/material';
import Head from 'next/head';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { getJwtToken, logOut, updateUserInfo } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { MemberType } from '../../enums/member.enum';
import KostayLogo from '../common/KostayLogo';
import Link from 'next/link';
const drawerWidth = 248;

/** Breadcrumb names for the top bar ("Admin / Stays"). */
const PAGE_NAMES: Record<string, string> = {
	'/_admin': 'Dashboard',
	'/_admin/users': 'Users',
	'/_admin/stays': 'Stays',
	'/_admin/bookings': 'Bookings',
	'/_admin/community': 'Community',
	'/_admin/cs/faq': 'FAQ',
	'/_admin/cs/notice': 'Notices',
	'/_admin/cs/inquiry': 'Inquiries',
	'/_admin/ai-search': 'AI search',
};

const withAdminLayout = (Component: ComponentType) => {
	return (props: object) => {
		const router = useRouter();
		const compact = useMediaQuery('(max-width:1199px)');
		const user = useReactiveVar(userVar);
		const [settingsState, setSettingsStateState] = useState(false);
		const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
		const [openMenu, setOpenMenu] = useState(false);
		const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
		const [title, setTitle] = useState('admin');
		const [loading, setLoading] = useState(true);

		useEffect(() => setOpenMenu(false), [router.asPath, compact]);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
			setLoading(false);
		}, []);

		// MUI draws menus and dropdowns at the end of <body>, outside #site-wrap; this class lets the
		// admin styles reach them (admin.scss → body.is-admin)
		useEffect(() => {
			document.body.classList.add('is-admin');
			return () => document.body.classList.remove('is-admin');
		}, []);

		useEffect(() => {
			if (!loading && user.memberType !== MemberType.ADMIN) {
				router.push('/').then();
			}
		}, [loading, user, router]);

		/** HANDLERS **/
		const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
			setAnchorElUser(event.currentTarget);
		};

		const handleCloseUserMenu = () => {
			setAnchorElUser(null);
		};

		const logoutHandler = async () => {
			setAnchorElUser(null);
			if (!(await sweetConfirmAlert('Do you want to logout?'))) return;
			logOut();
			router.push('/').then();
		};

		if (!user || user?.memberType !== MemberType.ADMIN) return null;

		return (
			<main id="site-wrap" className="admin">
				<Head>
					<meta name="viewport" content="width=device-width, initial-scale=1" />
				</Head>
				<Box component={'div'} sx={{ display: 'flex' }}>
					<AppBar
						position="fixed"
						sx={{
							width: compact ? '100%' : `calc(100% - ${drawerWidth}px)`,
							ml: compact ? 0 : `${drawerWidth}px`,
							boxShadow: 'rgb(100 116 139 / 12%) 0px 1px 4px',
							background: 'none',
						}}
					>
						<Toolbar sx={{ width: '100%', justifyContent: 'space-between' }}>
							{compact && (
								<IconButton
									aria-label="Open admin menu"
									aria-expanded={openMenu}
									aria-controls={openMenu ? 'admin-navigation' : undefined}
									onClick={() => setOpenMenu(true)}
									sx={{ width: 44, height: 44 }}
								>
									<MenuRoundedIcon />
								</IconButton>
							)}
							<nav className={'adm-crumbs'} aria-label="Breadcrumb">
								<Link href={'/_admin'}>Admin</Link>
								<span aria-hidden="true">/</span>
								<span aria-current="page">{PAGE_NAMES[router.pathname] ?? 'Admin'}</span>
							</nav>
							<div style={{ flexGrow: 1 }} />
							<Tooltip title="Account">
								<button type="button" className={'adm-user'} onClick={handleOpenUserMenu} aria-label="Open account menu">
									<Avatar
										sx={{ width: 32, height: 32 }}
										src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'}
									/>
									<span>{user?.memberNick}</span>
								</button>
							</Tooltip>
							<Menu
								sx={{ mt: '45px' }}
								id="menu-appbar"
								className={'pop-menu'}
								anchorEl={anchorElUser}
								anchorOrigin={{
									vertical: 'top',
									horizontal: 'right',
								}}
								keepMounted
								transformOrigin={{
									vertical: 'top',
									horizontal: 'right',
								}}
								open={Boolean(anchorElUser)}
								onClose={handleCloseUserMenu}
							>
								<Box
									component={'div'}
									onClick={handleCloseUserMenu}
									sx={{
										width: '200px',
									}}
								>
									<Stack sx={{ px: '20px', my: '12px' }}>
										<Typography variant={'h6'} component={'h6'} sx={{ mb: '4px' }}>
											{user?.memberNick}
										</Typography>
										<Typography variant={'subtitle1'} component={'p'} color={'#757575'}>
											{user?.memberPhone}
										</Typography>
									</Stack>
									<Divider />
									<Box component={'div'} sx={{ p: 1, py: '6px' }} onClick={logoutHandler}>
										<MenuItem sx={{ px: '16px', py: '6px' }}>
											<Typography variant={'subtitle1'} component={'span'}>
												Logout
											</Typography>
										</MenuItem>
									</Box>
								</Box>
							</Menu>
						</Toolbar>
					</AppBar>

					<Drawer
						sx={{
							width: compact ? 0 : drawerWidth,
							flexShrink: 0,
							'& .MuiDrawer-paper': {
								width: drawerWidth,
								boxSizing: 'border-box',
							},
						}}
						variant={compact ? 'temporary' : 'permanent'}
						open={compact ? openMenu : true}
						onClose={() => setOpenMenu(false)}
						ModalProps={{ keepMounted: true, disablePortal: true }}
						PaperProps={{
							id: 'admin-navigation',
							component: 'nav',
							'aria-label': 'Admin navigation',
							sx: { maxWidth: 'calc(100vw - 32px)' },
						}}
						anchor="left"
						className="aside"
					>
						{compact && (
							<IconButton
								aria-label="Close admin menu"
								onClick={() => setOpenMenu(false)}
								sx={{ alignSelf: 'flex-end', width: 44, height: 44, m: 1 }}
							>
								<CloseRoundedIcon />
							</IconButton>
						)}
						<div className={'adm-brand'}>
							<Link href={'/'} aria-label="Kostay home">
								<KostayLogo width={110} height={44} />
							</Link>
							<span>Admin</span>
						</div>

						<MenuList />
					</Drawer>

					<Box component={'div'} id="bunker" sx={{ flexGrow: 1 }}>
						{/*@ts-ignore*/}
						<Component {...props} setSnackbar={setSnackbar} setTitle={setTitle} />
					</Box>
				</Box>
			</main>
		);
	};
};

export default withAdminLayout;
