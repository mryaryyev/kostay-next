import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const AgentList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<any>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [agents, setAgents] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchText, setSearchText] = useState<string>('');

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

	/** HANDLERS **/
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

	const paginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(`/agent?input=${JSON.stringify(searchFilter)}`, `/agent?input=${JSON.stringify(searchFilter)}`, {
			scroll: false,
		});
		setCurrentPage(value);
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

	if (device === 'mobile') {
		return <h1>AGENTS PAGE MOBILE</h1>;
	} else {
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
										if (event.key === 'Enter') {
											setSearchFilter({
												...searchFilter,
												search: { ...searchFilter.search, text: searchText },
											});
										}
									}}
								/>
							</label>
							<label className={'sx-hosts-sort'}>
								<span>Sort by:</span>
								<span className={'sx-hosts-select'}>
									<select value={sortKey} onChange={(e) => sortChangeHandler(e.target.value)}>
										<option value="recent">Recent</option>
										<option value="old">Oldest</option>
										<option value="likes">Most Liked</option>
										<option value="views">Most Viewed</option>
									</select>
									<ExpandMoreIcon aria-hidden="true" />
								</span>
							</label>
						</div>
						<div className={'sx-hosts-chips'}>
							<button type="button" className={'is-active'} aria-pressed={true}>
								All Hosts ({total})
							</button>
						</div>
					</div>

					<div className={'sx-hosts-count'}>
						<i aria-hidden="true" />
						<strong>
							Showing {total} verified Kostay {total === 1 ? 'host' : 'hosts'}
						</strong>
						<span>across Korea</span>
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
							<h2>Have a hanok, villa, or coastal retreat to share?</h2>
							<p>
								Join {total} verified {total === 1 ? 'host' : 'hosts'} across Korea. Earn steady income while introducing global
								travelers to genuine Korean hospitality, design, and serenity.
							</p>
						</div>
						<div className={'sx-hosts-cta-actions'}>
							<Link href={'/account/join'} className={'is-primary'}>
								Become a Host
								<EastIcon aria-hidden="true" />
							</Link>
							<Link href={'/account/join'} className={'is-ghost'}>
								How Hosting Works
							</Link>
						</div>
					</section>
				</div>
			</div>
		);
	}
};

const trustItems = [
	{
		icon: <VerifiedUserOutlinedIcon />,
		title: 'Identity & Property Vetting',
		text:
			'Every host undergoes on-site architectural verification and legal registration compliance under Korean accommodation standards.',
	},
	{
		icon: <TranslateIcon />,
		title: 'Multilingual Hospitality',
		text:
			'Direct host messaging with built-in instant English-Korean translation and round-the-clock Kostay concierge backup.',
	},
	{
		icon: <SecurityIcon />,
		title: 'Host Peace of Mind',
		text:
			'Up to ₩1,000,000,000 property protection and guaranteed direct payouts secured by Korean tier-1 banking escrow.',
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
