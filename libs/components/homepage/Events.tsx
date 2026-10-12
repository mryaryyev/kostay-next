import SectionHeader from './SectionHeader';
import React from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface EventData {
	eventTitle: string;
	city: string;
	description: string;
	imageSrc: string;
}
const eventsData: EventData[] = [
	{
		eventTitle: 'Busan Fireworks Festival',
		city: 'Busan',
		description: 'Watch fireworks light up Gwangan Bridge over the sea, Korea’s biggest fireworks show every autumn.',
		imageSrc: '/img/events/BUSAN_FIREWORKS.webp',
	},
	{
		eventTitle: 'Seoul Lantern Festival',
		city: 'Seoul',
		description: 'Walk along Cheonggyecheon Stream as thousands of glowing lanterns tell stories of Korea after dark.',
		imageSrc: '/img/events/SEOUL_LANTERN.webp',
	},
	{
		eventTitle: 'Jeju Canola Flower Festival',
		city: 'Jeju',
		description: 'Golden canola fields bloom beside the ocean, making spring the perfect time for a coastal Jeju stay.',
		imageSrc: '/img/events/JEJU_CANOLA.webp',
	},
	{
		eventTitle: 'Jeonju Hanok Village',
		city: 'Jeonju',
		description: 'Explore 700+ traditional hanok houses, local food streets and Korea’s classic culture in one village.',
		imageSrc: '/img/events/JEONJU_HANOK.webp',
	},
];

const EventCard = ({ event }: { event: EventData }) => {
	return (
		<article className="home-event-card">
			<img src={event?.imageSrc} alt={event?.eventTitle} loading="lazy" />
			<div className={'event-copy'}>
				<span className={'event-city'}>{event?.city}</span>
				<strong>{event?.eventTitle}</strong>
				<p>{event?.description}</p>
			</div>
		</article>
	);
};

const Events = () => {

	return (
		<section className={'events'}>
			<div className={'container'}>
				<SectionHeader
					eyebrow={'Happening now'}
					title={'Events & Festivals'}
					subtitle={'Festivals worth planning an authentic seasonal stay around'}
					action={
						<div className={'home-pager'}>
							<button type={'button'} aria-label={'Previous festival'} disabled>
								<ChevronLeftIcon />
							</button>
							<button type={'button'} aria-label={'Next festival'} disabled>
								<ChevronRightIcon />
							</button>
						</div>
					}
				/>
				<div className={'events-grid'}>
					{eventsData.map((event: EventData) => {
						return <EventCard event={event} key={event?.eventTitle} />;
					})}
				</div>
			</div>
		</section>
	);
};

export default Events;
