import SectionHeader from './SectionHeader';
import Link from 'next/link';
import EastIcon from '@mui/icons-material/East';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Stack, Box } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import TopHostCard from './TopHostCard';
import { Member } from '../../types/member/member';
import { HostsInquiry } from '../../types/member/member.input';
import { useQuery } from '@apollo/client';
import { GET_HOSTS } from '../../../apollo/user/query';
import { T } from '../../types/common';

interface TopHostsProps {
	initialInput: HostsInquiry;
}

const TopHosts = (props: TopHostsProps) => {
	const { initialInput } = props;
	const router = useRouter();
	const [topHosts, setTopHosts] = useState<Member[]>([]);

	/** APOLLO REQUESTS **/
	const {
		loading: getHostsLoading,
		data: getHostsData,
		error: getHostsError,
		refetch: getHostsRefetch,
	} = useQuery(GET_HOSTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopHosts(data?.getHosts?.list);
		},
	});
	/** HANDLERS **/

	return (
		<Stack className={'top-hosts'}>
			<Stack className={'container'}>
				<SectionHeader
					eyebrow={'Hosts'}
					title={'Top Hosts'}
					subtitle={'Our top Hosts are ready to welcome you'}
					action={
						<Link href={'/host'} className={'home-link'}>
							See all Hosts
							<EastIcon aria-hidden="true" />
						</Link>
					}
				/>
				<Stack className={'wrapper sx-hosts-row'}>
					<button type={'button'} className={'sx-host-nav is-prev swiper-hosts-prev'} aria-label={'Previous host'}>
						<ChevronLeftIcon />
					</button>
					<Box component={'div'} className={'card-wrapper'}>
						<Swiper
							className={'top-hosts-swiper'}
							slidesPerView={'auto'}
							spaceBetween={24}
							modules={[Autoplay, Navigation, Pagination]}
							navigation={{
								nextEl: '.swiper-hosts-next',
								prevEl: '.swiper-hosts-prev',
							}}
						>
							{topHosts.map((host: Member) => {
								return (
									<SwiperSlide className={'top-hosts-slide'} key={host?._id}>
										<TopHostCard host={host} key={host?.memberNick} />
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Box>
					<button type={'button'} className={'sx-host-nav is-next swiper-hosts-next'} aria-label={'Next host'}>
						<ChevronRightIcon />
					</button>
				</Stack>
			</Stack>
		</Stack>
	);
};

TopHosts.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'memberRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopHosts;
