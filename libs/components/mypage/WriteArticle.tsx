import React from 'react';
import { NextPage } from 'next';
import { Stack, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
const TuiEditor = dynamic(() => import('../community/Teditor'), { ssr: false });

const WriteArticle: NextPage = () => {
	const router = useRouter();
	const isEdit = Boolean(router.query?.articleId);

	return (
		<div id="write-article-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">{isEdit ? 'Edit Article' : 'Write an Article'}</Typography>
					<Typography className="sub-title">
						{isEdit ? 'Update your title, text or cover photo.' : 'Feel free to write your ideas!'}
					</Typography>
				</Stack>
			</Stack>
			<TuiEditor />
		</div>
	);
};

export default WriteArticle;
