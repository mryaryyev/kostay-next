import React, { useCallback, useEffect, useRef } from 'react';
import { useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack, Box, Drawer } from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import { REACT_APP_API_URL } from '../config';
import KostayLogo from './common/KostayLogo';
import NotificationBell from './common/NotificationBell';

const languages = ['en', 'kr', 'ru'];

const Top = () => {
	const user = useReactiveVar(userVar);
	const { t, i18n } = useTranslation('common');
	const router = useRouter();
	const [lang, setLang] = useState<string | null>('en');
	const [colorChange, setColorChange] = useState(false);
	const [anchorEl, setAnchorEl] = React.useState<any | HTMLElement>(null);
	let open = Boolean(anchorEl);
	const [bgColor, setBgColor] = useState<boolean>(false);
	const [logoutAnchor, setLogoutAnchor] = React.useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);
	const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

	/** Home matches exactly; other links stay active on their sub-pages (e.g. /property/detail). */
	const isActive = (path: string) =>
		path === '/' ? router.pathname === '/' : router.pathname === path || router.pathname.startsWith(`${path}/`);

	const navLinks = [
		{ href: '/', label: t('Home'), path: '/' },
		{ href: '/stay', label: t('Properties'), path: '/stay' },
		{ href: '/agent', label: t('Agents'), path: '/agent' },
		{ href: '/community?articleCategory=FREE', label: t('Community'), path: '/community' },
		...(user?._id ? [{ href: '/mypage', label: t('My Page'), path: '/mypage' }] : []),
		{ href: '/help', label: t('Help'), path: '/help' },
	];

	/** LIFECYCLES **/
	// Close the mobile menu after navigating.
	useEffect(() => setDrawerOpen(false), [router.asPath]);

	useEffect(() => {
		if (localStorage.getItem('locale') === null) {
			localStorage.setItem('locale', 'en');
			setLang('en');
		} else {
			setLang(localStorage.getItem('locale'));
		}
	}, [router]);

	useEffect(() => {
		switch (router.pathname) {
			case '/stay/detail':
				setBgColor(true);
				break;
			default:
				break;
		}
	}, [router]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	/** HANDLERS **/
	// The URL locale is the source of truth; localStorage only remembers the last choice.
	const currentLang = router.locale ?? lang ?? 'en';

	const langChoice = useCallback(
		async (code: string) => {
			if (code === currentLang) return;
			setLang(code);
			localStorage.setItem('locale', code);
			await router.push(router.asPath, router.asPath, { locale: code });
		},
		[router, currentLang],
	);

	const changeNavbarColor = () => {
		if (window.scrollY >= 50) {
			setColorChange(true);
		} else {
			setColorChange(false);
		}
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleHover = (event: any) => {
		if (anchorEl !== event.currentTarget) {
			setAnchorEl(event.currentTarget);
		} else {
			setAnchorEl(null);
		}
	};

	if (typeof window !== 'undefined') {
		window.addEventListener('scroll', changeNavbarColor);
	}

	return (
		<Stack className={'navbar'}>
			<Stack className={`navbar-main ${colorChange ? 'transparent' : ''} ${bgColor ? 'transparent' : ''}`}>
				<Stack className={'container'}>
					<Box component={'div'} className={'logo-box'}>
						<Link href={'/'}>
							<KostayLogo width={150} height={60} />
						</Link>
					</Box>
					<Box component={'div'} className={'router-box'}>
						<Link href={'/'} aria-current={isActive('/') ? 'page' : undefined}>
							<div>{t('Home')}</div>
						</Link>
						<Link href={'/stay'} aria-current={isActive('/stay') ? 'page' : undefined}>
							<div>{t('Properties')}</div>
						</Link>
						<Link href={'/agent'} aria-current={isActive('/agent') ? 'page' : undefined}>
							<div> {t('Agents')} </div>
						</Link>
						<Link href={'/community?articleCategory=FREE'} aria-current={isActive('/community') ? 'page' : undefined}>
							<div> {t('Community')} </div>
						</Link>
						{user?._id && (
							<Link href={'/mypage'} aria-current={isActive('/mypage') ? 'page' : undefined}>
								<div> {t('My Page')} </div>
							</Link>
						)}
						<Link href={'/help'} aria-current={isActive('/help') ? 'page' : undefined}>
							<div> {t('Help')} </div>
						</Link>
					</Box>
					<Box component={'div'} className={'user-box'}>
						{user?._id ? (
							<>
								<div className={'login-user'} onClick={(event: any) => setLogoutAnchor(event.currentTarget)}>
									<img
										src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'}
										alt=""
									/>
								</div>

								<Menu
									id="basic-menu"
									anchorEl={logoutAnchor}
									open={logoutOpen}
									onClose={() => {
										setLogoutAnchor(null);
									}}
									anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
									transformOrigin={{ vertical: 'top', horizontal: 'right' }}
									PaperProps={{ className: 'sx-user-menu' }}
								>
									<div className={'sx-user-menu-head'}>
										<img
											src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'}
											alt=""
										/>
										<div>
											<strong>{user.memberFullName || user.memberNick}</strong>
											<span>@{user.memberNick}</span>
										</div>
									</div>
									<MenuItem className={'sx-user-menu-item is-logout'} onClick={() => logOut()}>
										<Logout fontSize="small" />
										Logout
									</MenuItem>
								</Menu>
							</>
						) : (
							<Link href={'/account/join'}>
								<div className={'join-box'}>
									<span>
										{t('Login')} / {t('Register')}
									</span>
								</div>
							</Link>
						)}

						<div className={'lan-box'}>
							<NotificationBell />
							<div className={'lang-switch'} role={'group'} aria-label={'Language'}>
								{languages.map((code) => (
									<button
										type={'button'}
										key={code}
										className={currentLang === code ? 'is-active' : ''}
										aria-pressed={currentLang === code}
										onClick={() => langChoice(code)}
									>
										{code.toUpperCase()}
									</button>
								))}
							</div>
						</div>
						{/* Phones: the links, language and account move into this drawer (CSS shows the button under 768px). */}
						<button
							type={'button'}
							className={'nav-burger'}
							aria-label={'Open menu'}
							aria-expanded={drawerOpen}
							onClick={() => setDrawerOpen(true)}
						>
							<MenuRoundedIcon />
						</button>
					</Box>
				</Stack>
			</Stack>
			<Drawer
				anchor={'right'}
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				PaperProps={{ className: 'nav-drawer' }}
			>
				<div className={'nav-drawer-head'}>
					<KostayLogo width={110} height={44} />
					<button type={'button'} aria-label={'Close menu'} onClick={() => setDrawerOpen(false)}>
						<CloseRoundedIcon />
					</button>
				</div>
				{user?._id && (
					<div className={'nav-drawer-user'}>
						<img
							src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'}
							alt=""
						/>
						<div>
							<strong>{user.memberFullName || user.memberNick}</strong>
							<span>@{user.memberNick}</span>
						</div>
					</div>
				)}
				<nav className={'nav-drawer-links'}>
					{navLinks.map((link) => (
						<Link key={link.href} href={link.href} aria-current={isActive(link.path) ? 'page' : undefined}>
							{link.label}
						</Link>
					))}
				</nav>
				<div className={'nav-drawer-lang'} role={'group'} aria-label={'Language'}>
					{languages.map((code) => (
						<button
							type={'button'}
							key={code}
							className={currentLang === code ? 'is-active' : ''}
							aria-pressed={currentLang === code}
							onClick={() => langChoice(code)}
						>
							{code.toUpperCase()}
						</button>
					))}
				</div>
				<div className={'nav-drawer-foot'}>
					{user?._id ? (
						<button type={'button'} onClick={() => logOut()}>
							<Logout fontSize="small" />
							Logout
						</button>
					) : (
						<Link href={'/account/join'} className={'nav-drawer-login'}>
							{t('Login')} / {t('Register')}
						</Link>
					)}
				</div>
			</Drawer>
		</Stack>
	);
};

export default withRouter(Top);
