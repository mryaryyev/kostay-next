import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Menu, MenuItem } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EastIcon from '@mui/icons-material/East';
import RoofingIcon from '@mui/icons-material/Roofing';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import TranslateIcon from '@mui/icons-material/Translate';
import SecurityIcon from '@mui/icons-material/Security';
import AgentCard from '../../libs/components/common/AgentCard';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Member } from '../../libs/types/member/member';
import { useMutation, useQuery } from '@apollo/client';
import { GET_AGENTS } from '../../apollo/user/query';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Messages } from '../../libs/config';
import { T } from '../../libs/types/common';
import { scrollToListTop } from '../../libs/utils';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const AgentList: NextPage = ({ initialInput, ...props }: any) => {
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<any>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [agents, setAgents] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchText, setSearchText] = useState<string>(searchFilter?.search?.text ?? '');

	/** APOLLO REQUESTS **/
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const {
		loading: getAgentsLoading,
		data: getAgentsData,
		error: getAgentsError,
		refetch: getAgentsRefetch,
	} = useQuery(GET_AGENTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgents(data?.getAgents?.list);
			setTotal(data?.getAgents?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.input) {
			const input_obj = JSON.parse(router?.query?.input as string);
			setSearchFilter(input_obj);
		} else router.replace(`/agent?input=${JSON.stringify(searchFilter)}`, `/agent?input=${JSON.stringify(searchFilter)}`);

		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	// Live search: run ~400ms after typing stops; an empty box brings every host back.
	useEffect(() => {
		const timer = setTimeout(() => applySearch(searchText), 400);
		return () => clearTimeout(timer);
	}, [searchText]);

	/** HANDLERS **/
	const applySearch = (value: string) => {
		const text = value.trim();
		setSearchFilter((prev: any) => {
			if ((prev.search?.text ?? '') === text) return prev;
			const { text: _old, ...rest } = prev.search ?? {};
			return { ...prev, page: 1, search: text ? { ...rest, text } : rest };
		});
	};

	const sortKey =
		searchFilter.sort === 'memberLikes'
			? 'likes'
			: searchFilter.sort === 'memberViews'
			? 'views'
			: searchFilter.direction === 'ASC'
			? 'old'
			: 'recent';

	const sortChangeHandler = (value: string) => {
		switch (value) {
			case 'recent':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'DESC' });
				break;
			case 'old':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'ASC' });
				break;
			case 'likes':
				setSearchFilter({ ...searchFilter, sort: 'memberLikes', direction: 'DESC' });
				break;
			case 'views':
				setSearchFilter({ ...searchFilter, sort: 'memberViews', direction: 'DESC' });
				break;
		}
	};

	const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null);
	const sortOptions = [
		{ value: 'recent', label: 'Recent' },
		{ value: 'old', label: 'Oldest' },
		{ value: 'likes', label: 'Most Liked' },
		{ value: 'views', label: 'Most Viewed' },
	];

	const paginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(`/agent?input=${JSON.stringify(searchFilter)}`, `/agent?input=${JSON.stringify(searchFilter)}`, {
			scroll: false,
		});
		setCurrentPage(value);
		scrollToListTop('.sx-hosts-controls');
	};

	const likeMemberHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetMember({
				variables: {
					input: id,
				},
			});

			await getAgentsRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const pageCount = Math.ceil(total / searchFilter.limit);

	return (
		<div className={'agent-list-page'}>
			<div className={'container sx-hosts'}>
				<div className={'sx-hosts-controls'}>
					<div className={'sx-hosts-controls-row'}>
						<label className={'sx-hosts-search'}>
							<SearchIcon aria-hidden="true" />
							<input
								type="text"
								placeholder={'Search for a host by name, city, or specialty...'}
								aria-label={'Search hosts'}
								value={searchText}
								onChange={(e) => setSearchText(e.target.value)}
								onKeyDown={(event) => {
									if (event.key === 'Enter') applySearch(searchText);
									if (event.key === 'Escape') setSearchText('');
								}}
							/>
							{searchText && (
								<button
									type="button"
									className={'sx-search-clear'}
									aria-label={'Clear search'}
									onClick={() => setSearchText('')}
								>
									<CloseRoundedIcon />
								</button>
							)}
						</label>
						<div className={'sx-hosts-sort'}>
							<span id="sx-hosts-sort-label">Sort by:</span>
							<span className={'sx-hosts-select'}>
								<button
									type="button"
									aria-haspopup="listbox"
									aria-expanded={Boolean(sortAnchor)}
									aria-labelledby="sx-hosts-sort-label"
									onClick={(e) => setSortAnchor(e.currentTarget)}
								>
									{sortOptions.find((option) => option.value === sortKey)?.label}
								</button>
								<ExpandMoreIcon aria-hidden="true" />
							</span>
							<Menu
								anchorEl={sortAnchor}
								open={Boolean(sortAnchor)}
								onClose={() => setSortAnchor(null)}
								anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
								transformOrigin={{ vertical: 'top', horizontal: 'right' }}
								PaperProps={{ className: 'sx-hosts-sort-menu' }}
								disableScrollLock
							>
								{sortOptions.map((option) => (
									<MenuItem
										key={option.value}
										selected={option.value === sortKey}
										onClick={() => {
											setSortAnchor(null);
											sortChangeHandler(option.value);
										}}
									>
										{option.label}
									</MenuItem>
								))}
							</Menu>
						</div>
					</div>
					<div className={'sx-hosts-chips'}>
						<button type="button" className={'is-active'} aria-pressed={true}>
							All Hosts ({total})
						</button>
					</div>
				</div>

				{getAgentsLoading && agents.length === 0 ? (
					<div className={'no-data'} role="status">
						Loading hosts…
					</div>
				) : agents?.length === 0 ? (
					<div className={'no-data'}>
						<img src="/img/icons/icoAlert.svg" alt="" />
						<p>No hosts found!</p>
					</div>
				) : (
					<div className={'sx-hosts-grid'}>
						{agents.map((agent: Member) => (
							<AgentCard agent={agent} key={agent._id} likeMemberHandler={likeMemberHandler} />
						))}
					</div>
				)}

				{agents.length !== 0 && pageCount > 1 && (
					<nav className={'sx-hosts-pagination'} aria-label="Pagination">
						<button
							type="button"
							aria-label="Previous page"
							disabled={currentPage <= 1}
							onClick={() => paginationChangeHandler(null as any, currentPage - 1)}
						>
							<ChevronLeftIcon />
						</button>
						{Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
							<button
								type="button"
								key={page}
								className={page === currentPage ? 'is-active' : ''}
								aria-current={page === currentPage ? 'page' : undefined}
								onClick={() => page !== currentPage && paginationChangeHandler(null as any, page)}
							>
								{page}
							</button>
						))}
						<button
							type="button"
							aria-label="Next page"
							disabled={currentPage >= pageCount}
							onClick={() => paginationChangeHandler(null as any, currentPage + 1)}
						>
							<ChevronRightIcon />
						</button>
					</nav>
				)}

				<div className={'sx-hosts-trust'}>
					{trustItems.map((item) => (
						<div className={'sx-hosts-trust-item'} key={item.title}>
							<span aria-hidden="true">{item.icon}</span>
							<div>
								<h3>{item.title}</h3>
								<p>{item.text}</p>
							</div>
						</div>
					))}
				</div>

				<section className={'sx-hosts-cta'}>
					<span className={'sx-hosts-cta-glow is-a'} aria-hidden="true" />
					<span className={'sx-hosts-cta-glow is-b'} aria-hidden="true" />
					<div className={'sx-hosts-cta-copy'}>
						<span className={'sx-hosts-cta-tag'}>
							<RoofingIcon aria-hidden="true" />
							Open Your Doors with Kostay
						</span>
						<h2>Have an apartment, a villa or a hanok to share?</h2>
						<p>
							Join {total} {total === 1 ? 'Host' : 'Hosts'} across Korea. List your stay, set your nightly price and manage every
							booking and payout from My Page.
						</p>
					</div>
					<div className={'sx-hosts-cta-actions'}>
						<Link href={'/account/join'} className={'is-primary'}>
							Become a Host
							<EastIcon aria-hidden="true" />
						</Link>
						<Link href={'/about#how-it-works'} className={'is-ghost'}>
							How Hosting Works
						</Link>
					</div>
				</section>
			</div>
		</div>
	);
};

const trustItems = [
	{
		icon: <VerifiedUserOutlinedIcon />,
		title: 'Reviewed Hosts & Stays',
		text:
			'Every stay is reviewed by the Kostay team and only active listings appear in search.',
	},
	{
		icon: <TranslateIcon />,
		title: 'Direct Host Messaging',
		text:
			'Message any host from their stay page, and reach the Kostay team anytime through the Help Center.',
	},
	{
		icon: <SecurityIcon />,
		title: 'Clear Bookings & Payouts',
		text:
			'Every booking and payment is recorded securely, and hosts track their earnings in one place.',
	},
];

AgentList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(AgentList);
