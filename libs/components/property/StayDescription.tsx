import React from 'react';
import { SvgIconComponent } from '@mui/icons-material';
import TrainOutlinedIcon from '@mui/icons-material/TrainOutlined';
import WavesOutlinedIcon from '@mui/icons-material/WavesOutlined';
import LocalParkingOutlinedIcon from '@mui/icons-material/LocalParkingOutlined';
import WifiOutlinedIcon from '@mui/icons-material/WifiOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import FlightOutlinedIcon from '@mui/icons-material/FlightOutlined';
import LaptopOutlinedIcon from '@mui/icons-material/LaptopOutlined';
import OutdoorGrillOutlinedIcon from '@mui/icons-material/OutdoorGrillOutlined';
import ParkOutlinedIcon from '@mui/icons-material/ParkOutlined';
import PoolOutlinedIcon from '@mui/icons-material/PoolOutlined';
import LocalLaundryServiceOutlinedIcon from '@mui/icons-material/LocalLaundryServiceOutlined';
import ThermostatOutlinedIcon from '@mui/icons-material/ThermostatOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';

// first match wins, so the specific words come before the general ones
const ICONS: [RegExp, SvgIconComponent][] = [
	[/station|subway|metro/i, TrainOutlinedIcon],
	[/airport/i, FlightOutlinedIcon],
	[/pool/i, PoolOutlinedIcon],
	[/beach|sea|ocean|harbour|lake|river|falls/i, WavesOutlinedIcon],
	[/parking/i, LocalParkingOutlinedIcon],
	[/wi-?fi/i, WifiOutlinedIcon],
	[/pet|dog/i, PetsOutlinedIcon],
	[/desk|workspace/i, LaptopOutlinedIcon],
	[/barbecue|grill/i, OutdoorGrillOutlinedIcon],
	[/washer|washing|laundry/i, LocalLaundryServiceOutlinedIcon],
	[/ondol|heating|heater/i, ThermostatOutlinedIcon],
	[/park|garden|lawn|forest|trail|orchard/i, ParkOutlinedIcon],
	[/near|walk|steps from|inside|next to|close to|drive/i, PlaceOutlinedIcon],
];

const iconFor = (text: string): SvgIconComponent =>
	ICONS.find(([pattern]) => pattern.test(text))?.[1] ?? CheckOutlinedIcon;

/** Description paragraph, plus the lines that start with "- " as a quiet highlights list. */
const StayDescription = ({ description }: { description?: string }) => {
	if (!description?.trim()) {
		return <p className="sx-desc">The host has not added a description yet.</p>;
	}
	const lines = description.split('\n');
	const paragraph = lines.filter((line) => !line.startsWith('- ')).join('\n').trim();
	const highlights = lines.filter((line) => line.startsWith('- ')).map((line) => line.slice(2).trim());

	return (
		<>
			{paragraph && <p className="sx-desc">{paragraph}</p>}
			{highlights.length > 0 && (
				<ul className="sx-highlights">
					{highlights.map((item) => {
						const Icon = iconFor(item);
						return (
							<li key={item}>
								<Icon aria-hidden="true" />
								<span>{item}</span>
							</li>
						);
					})}
				</ul>
			)}
		</>
	);
};

export default StayDescription;
