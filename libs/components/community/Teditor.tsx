import React, { useEffect, useRef, useState } from 'react';
import { Box, FormControl, MenuItem, Stack, Typography, Select, TextField } from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Editor } from '@toast-ui/react-editor';
import { getJwtToken } from '../../auth';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_BOARD_ARTICLE, UPDATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { GET_BOARD_ARTICLE } from '../../../apollo/user/query';
import { Message } from '../../enums/common.enum';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../sweetAlert';
import '@toast-ui/editor/dist/toastui-editor.css';

/** Backend limits (BoardArticleInput / BoardArticleUpdate DTOs). */
const TITLE_MIN = 3;
const TITLE_MAX = 50;
const CONTENT_MIN = 3;
const CONTENT_MAX = 250;

const TuiEditor = () => {
	const editorRef = useRef<Editor>(null),
		coverInputRef = useRef<HTMLInputElement>(null),
		// What the editor should show: '' for a new article, the saved HTML in edit mode.
		contentRef = useRef<string>(''),
		token = getJwtToken(),
		router = useRouter();
	const articleId = (router.query?.articleId as string) || '';
	const isEdit = Boolean(articleId);

	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(BoardArticleCategory.FREE);
	const [articleTitle, setArticleTitle] = useState<string>('');
	const [articleImage, setArticleImage] = useState<string>('');
	const [coverUploading, setCoverUploading] = useState<boolean>(false);
	const [submitting, setSubmitting] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [createboardArticle] = useMutation(CREATE_BOARD_ARTICLE);
	const [updateBoardArticle] = useMutation(UPDATE_BOARD_ARTICLE);

	const { data: articleData } = useQuery(GET_BOARD_ARTICLE, {
		skip: !isEdit,
		fetchPolicy: 'network-only',
		variables: { input: articleId },
	});

	/** LIFECYCLES **/
	// Edit mode: prefill the form once the article arrives.
	useEffect(() => {
		const article = articleData?.getBoardArticle;
		if (!article) return;
		setArticleCategory(article.articleCategory);
		setArticleTitle(article.articleTitle ?? '');
		setArticleImage(article.articleImage ?? '');
		contentRef.current = article.articleContent ?? '';
		editorRef.current?.getInstance().setHTML(contentRef.current);
	}, [articleData]);

	/** HANDLERS **/
	const uploadImage = async (image: any): Promise<string | undefined> => {
		try {
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
				  }`,
					variables: {
						file: null,
						target: 'article',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image);

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			return response.data.data.imageUploader;
		} catch (err) {
			console.log('Error, uploadImage:', err);
		}
	};

	const coverChangeHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file) return;
		setCoverUploading(true);
		const uploaded = await uploadImage(file);
		setCoverUploading(false);
		if (uploaded) setArticleImage(uploaded);
		else sweetMixinErrorAlert('Image upload failed, please try again.').then();
	};

	const changeCategoryHandler = (e: any) => {
		setArticleCategory(e.target.value);
	};

	const handleSubmit = async () => {
		const articleContent = (editorRef.current?.getInstance().getHTML() as string) ?? '';
		const title = articleTitle.trim();

		if (!title || !articleContent) return sweetErrorHandling(new Error(Message.INSERT_ALL_INPUTS)).then();
		if (title.length < TITLE_MIN || title.length > TITLE_MAX)
			return sweetMixinErrorAlert(`Title must be ${TITLE_MIN}–${TITLE_MAX} characters.`).then();
		if (articleContent.length < CONTENT_MIN || articleContent.length > CONTENT_MAX)
			return sweetMixinErrorAlert(
				`Content is too long (${articleContent.length}/${CONTENT_MAX} characters incl. formatting).`,
			).then();

		try {
			setSubmitting(true);
			if (isEdit) {
				await updateBoardArticle({
					variables: {
						input: { _id: articleId, articleTitle: title, articleContent, articleImage },
					},
				});
				await sweetTopSuccessAlert('Article is updated successfully', 700);
				await router.push({ pathname: '/community/detail', query: { articleCategory, id: articleId } });
			} else {
				await createboardArticle({
					variables: {
						input: { articleTitle: title, articleContent, articleImage, articleCategory },
					},
				});
				await sweetTopSuccessAlert('Article is created successfully', 700);
				await router.push({ pathname: '/mypage', query: { category: 'myArticles' } });
			}
		} catch (err: any) {
			console.log(err);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Stack className="sx-teditor">
			<Stack
				direction="row"
				className={'teditor-fields'}
				style={{ margin: '16px 40px 8px' }}
				justifyContent="space-evenly"
			>
				<Box component={'div'} className={'form_row teditor-field'} style={{ width: '300px' }}>
					<Typography style={{ color: '#7f838d', margin: '10px' }} variant="h3">
						Category
					</Typography>
					<FormControl sx={{ width: '100%', background: 'white' }}>
						<Select
							value={articleCategory}
							onChange={changeCategoryHandler}
							displayEmpty
							disabled={isEdit}
							inputProps={{ 'aria-label': 'Without label' }}
						>
							<MenuItem value={BoardArticleCategory.FREE}>
								<span>Free</span>
							</MenuItem>
							<MenuItem value={BoardArticleCategory.HUMOR}>Humor</MenuItem>
							<MenuItem value={BoardArticleCategory.NEWS}>News</MenuItem>
							<MenuItem value={BoardArticleCategory.RECOMMEND}>Recommendation</MenuItem>
						</Select>
					</FormControl>
				</Box>
				<Box component={'div'} className={'teditor-field'} style={{ width: '300px', flexDirection: 'column' }}>
					<Typography style={{ color: '#7f838d', margin: '10px' }} variant="h3">
						Title
					</Typography>
					<TextField
						value={articleTitle}
						onChange={(e) => setArticleTitle(e.target.value.slice(0, TITLE_MAX))}
						id="filled-basic"
						helperText={`${articleTitle.length}/${TITLE_MAX}`}
						sx={{ width: '100%', '& .MuiInputBase-root': { background: 'white' } }}
					/>
				</Box>
			</Stack>

			<div className="sx-cover-field">
				<Typography className="sx-cover-label">Cover image</Typography>
				{articleImage ? (
					<div className="sx-cover-preview">
						<img src={`${REACT_APP_API_URL}/${articleImage}`} alt="Cover" />
						<div className="sx-cover-actions">
							<button type="button" onClick={() => coverInputRef.current?.click()} disabled={coverUploading}>
								Change
							</button>
							<button type="button" aria-label="Remove cover image" onClick={() => setArticleImage('')}>
								<CloseRoundedIcon />
							</button>
						</div>
					</div>
				) : (
					<button
						type="button"
						className="sx-cover-empty"
						onClick={() => coverInputRef.current?.click()}
						disabled={coverUploading}
					>
						<AddPhotoAlternateOutlinedIcon />
						{coverUploading ? 'Uploading…' : 'Add a cover photo (shown on the article card)'}
					</button>
				)}
				<input ref={coverInputRef} type="file" accept="image/png,image/jpeg,image/jpg" hidden onChange={coverChangeHandler} />
			</div>

			<div className="sx-editor-wrap">
				<Editor
					initialValue={''}
					placeholder={'Write here'}
					previewStyle={'vertical'}
					height={'100%'}
					initialEditType={'wysiwyg'}
					hideModeSwitch={true}
					// Toast UI loads its host element's HTML when initialValue is empty, and in dev StrictMode mounts the
					// editor twice into the same element, so that HTML is the first instance's UI ("Write", "Preview", …).
					// 'load' fires at the end of every instance's setup: reset the content there.
					onLoad={(instance: any) => instance.setHTML(contentRef.current)}
					toolbarItems={[
						['heading', 'bold', 'italic', 'strike'],
						['image', 'table', 'link'],
						['ul', 'ol', 'task'],
					]}
					ref={editorRef}
					hooks={{
						addImageBlobHook: async (image: any, callback: any) => {
							const uploaded = await uploadImage(image);
							if (!uploaded) return false;
							// The first body image doubles as the cover when none is chosen.
							setArticleImage((prev) => prev || uploaded);
							callback(`${REACT_APP_API_URL}/${uploaded}`);
							return false;
						},
					}}
				/>
			</div>

			<div className="sx-editor-actions">
				{isEdit && (
					<button type="button" className="is-ghost" onClick={() => router.back()}>
						Cancel
					</button>
				)}
				<button type="button" disabled={submitting || coverUploading} onClick={handleSubmit}>
					{submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Publish article'}
				</button>
			</div>
		</Stack>
	);
};

export default TuiEditor;
