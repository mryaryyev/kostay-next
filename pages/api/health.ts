import type { NextApiRequest, NextApiResponse } from 'next';

export default function health(_req: NextApiRequest, res: NextApiResponse) {
	res.setHeader('Cache-Control', 'no-store');
	res.status(200).json({ status: 'ok' });
}
