import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import LuggageOutlinedIcon from '@mui/icons-material/LuggageOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const accountTypes = [
	{ key: 'USER', label: 'Guest', desc: 'Find and book stays', icon: <LuggageOutlinedIcon /> },
	{ key: 'AGENT', label: 'Host', desc: 'List my place and get bookings', icon: <HomeWorkOutlinedIcon /> },
];

const perks = [
	'Instant Book with a full refund until your stay ends',
	'Stays and hanoks in 9 cities',
	'Message hosts directly',
];

/** Login / Register: same logIn / signUp calls as before (libs/auth), Kostay design. */
const Join: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' });
	const [loginView, setLoginView] = useState<boolean>(router.query.mode !== 'signup');
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [submitting, setSubmitting] = useState<boolean>(false);

	/** CHECKS **/
	const nickError = !loginView && input.nick !== '' && input.nick.trim().length < 3 ? 'At least 3 characters' : '';
	const passwordError = !loginView && input.password !== '' && input.password.length < 5 ? 'At least 5 characters' : '';
	const phoneError =
		!loginView && input.phone !== '' && !/^\d{9,12}$/.test(input.phone) ? 'Digits only, 9 to 12 numbers' : '';
	const canSubmit = loginView
		? input.nick !== '' && input.password !== ''
		: input.nick.trim().length >= 3 && input.password.length >= 5 && /^\d{9,12}$/.test(input.phone);

	/** HANDLERS **/
	const handleInput = (name: keyof typeof input, value: string) => setInput((prev) => ({ ...prev, [name]: value }));

	const switchView = (login: boolean) => {
		setLoginView(login);
		setShowPassword(false);
	};

	const submitHandler = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!canSubmit || submitting) return;
		try {
			setSubmitting(true);
			if (loginView) await logIn(input.nick.trim(), input.password);
			else await signUp(input.nick.trim(), input.password, input.phone, input.type);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		} finally {
			setSubmitting(false);
		}
	};

	if (device === 'mobile') {
		return <div>LOGIN MOBILE</div>;
	}

	return (
		<div id="join-page">
			<div className="sx-join">
				<aside className="sx-join-side">
					<span className="sx-join-side-bg" aria-hidden="true" />
					<div className="sx-join-side-content">
						<span className="sx-join-kicker">Kostay</span>
						<h1>{loginView ? 'Welcome back' : 'Your stay in Korea starts here'}</h1>
						<p>Apartments, villas, houses and hanoks from Seoul to Jeju, booked in a few steps.</p>
						<ul>
							{perks.map((perk) => (
								<li key={perk}>
									<CheckCircleRoundedIcon aria-hidden="true" />
									{perk}
								</li>
							))}
						</ul>
					</div>
				</aside>

				<section className="sx-join-card">
					<div className="sx-join-switch" role="tablist" aria-label="Login or register">
						<button
							type="button"
							role="tab"
							aria-selected={loginView}
							className={loginView ? 'active' : ''}
							onClick={() => switchView(true)}
						>
							Log in
						</button>
						<button
							type="button"
							role="tab"
							aria-selected={!loginView}
							className={!loginView ? 'active' : ''}
							onClick={() => switchView(false)}
						>
							Register
						</button>
					</div>

					<header>
						<h2>{loginView ? 'Log in to Kostay' : 'Create your account'}</h2>
						<p>{loginView ? 'Use your nickname and password.' : 'It takes less than a minute.'}</p>
					</header>

					<form onSubmit={submitHandler} noValidate>
						{!loginView && (
							<div className="sx-join-types" role="radiogroup" aria-label="Account type">
								{accountTypes.map((type) => (
									<button
										type="button"
										role="radio"
										key={type.key}
										aria-checked={input.type === type.key}
										className={input.type === type.key ? 'active' : ''}
										onClick={() => handleInput('type', type.key)}
									>
										{type.icon}
										<strong>{type.label}</strong>
										<small>{type.desc}</small>
									</button>
								))}
							</div>
						)}

						<label className={`sx-join-field ${nickError ? 'has-error' : ''}`}>
							<span>Nickname</span>
							<input
								type="text"
								autoComplete="username"
								value={input.nick}
								placeholder="e.g. traveler_kim"
								onChange={(e) => handleInput('nick', e.target.value)}
							/>
							{nickError && <small>{nickError}</small>}
						</label>

						{!loginView && (
							<label className={`sx-join-field ${phoneError ? 'has-error' : ''}`}>
								<span>Phone</span>
								<input
									type="tel"
									inputMode="numeric"
									autoComplete="tel"
									value={input.phone}
									placeholder="01012345678"
									onChange={(e) => handleInput('phone', e.target.value.replace(/\D/g, ''))}
								/>
								{phoneError && <small>{phoneError}</small>}
							</label>
						)}

						<label className={`sx-join-field ${passwordError ? 'has-error' : ''}`}>
							<span>Password</span>
							<div className="sx-join-password">
								<input
									type={showPassword ? 'text' : 'password'}
									autoComplete={loginView ? 'current-password' : 'new-password'}
									value={input.password}
									placeholder={loginView ? 'Your password' : 'At least 5 characters'}
									onChange={(e) => handleInput('password', e.target.value)}
								/>
								<button
									type="button"
									aria-label={showPassword ? 'Hide password' : 'Show password'}
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
								</button>
							</div>
							{passwordError && <small>{passwordError}</small>}
						</label>

						<button type="submit" className="sx-join-submit" disabled={!canSubmit || submitting}>
							{submitting
								? 'Please wait…'
								: loginView
								? 'Log in'
								: `Create ${input.type === 'AGENT' ? 'host' : 'guest'} account`}
							<ArrowForwardRoundedIcon aria-hidden="true" />
						</button>
					</form>

					<p className="sx-join-alt">
						{loginView ? 'New to Kostay?' : 'Already have an account?'}{' '}
						<button type="button" onClick={() => switchView(!loginView)}>
							{loginView ? 'Create an account' : 'Log in'}
						</button>
					</p>
					<p className="sx-join-help">
						Trouble signing in? <Link href={{ pathname: '/cs', query: { tab: 'faq' } }}>Visit the Help Center</Link>
					</p>
				</section>
			</div>
		</div>
	);
};

export default withLayoutBasic(Join);
