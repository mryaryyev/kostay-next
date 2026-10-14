import React from 'react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
const TuiEditor = dynamic(() => import('../community/Teditor'), { ssr: false });

const WriteArticle: NextPage = () => {
	const router = useRouter();
	const isEdit = Boolean(router.query?.articleId);

	return (
		<div id="write-article-page">
			<div className="sx-article-head">
				<h3>{isEdit ? 'Edit article' : 'Write an article'}</h3>
				<p>
					{isEdit
						? 'Update your title, text or cover photo.'
						: 'Share tips, stories and recommendations with the Kostay community.'}
				</p>
			</div>
			<TuiEditor />
		</div>
	);
};

export default WriteArticle;
