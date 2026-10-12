import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack } from '@mui/material';
import MemberMenu, { MemberIdentity } from '../../libs/components/member/MemberMenu';
import MemberProperties from '../../libs/components/member/MemberProperties';
import { useRouter } from 'next/router';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import MemberArticles from '../../libs/components/member/MemberArticles';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_MEMBER } from '../../apollo/user/query';
import { Member } from '../../libs/types/member/member';
import { MemberType } from '../../libs/enums/member.enum';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { Messages } from '../../libs/config';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { userVar } from '../../apollo/store';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MemberPage: NextPage = () => {
	const router = useRouter();
	const category: any = router.query?.category;
	const user = useReactiveVar(userVar);
	const memberId = router.query?.memberId as string | undefined;
	const [member, setMember] = useState<Member | null>(null);

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const { refetch: getMemberRefetch } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: memberId },
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setMember(data?.getMember ?? null),
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (!router.isReady || !member) return;
		// Only Hosts have a Stays tab; everyone else opens on Followers.
		const isHost = member.memberType === MemberType.AGENT;
		if (!category || (category === 'properties' && !isHost)) {
			router.replace(
				{
					pathname: router.pathname,
					query: { ...router.query, category: isHost ? 'properties' : 'followers' },
				},
				undefined,
				{ shallow: true },
			);
		}
	}, [category, router, member]);

	/** HANDLERS **/
	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await subscribe({
				variables: {
					input: id,
				},
			});
			await sweetTopSmallSuccessAlert('Followed!', 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await unsubscribe({
				variables: {
					input: id,
				},
			});

			await sweetTopSmallSuccessAlert('Unfollowed!', 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likeMemberHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetMember({
				variables: {
					input: id,
				},
			});
			await sweetTopSmallSuccessAlert('Success!', 800);
			await refetch({ input: query });
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	return (
		<div id="member-page">
			<div className="container">
				<Stack className={'sx-member-page'}>
					<MemberIdentity
						member={member}
						isMe={Boolean(user?._id) && user._id === member?._id}
						onFollow={() => subscribeHandler(member?._id as string, getMemberRefetch, memberId)}
						onUnfollow={() => unsubscribeHandler(member?._id as string, getMemberRefetch, memberId)}
					/>
					<Stack className={'back-frame'}>
						<Stack className={'left-config'}>
							<MemberMenu member={member} />
						</Stack>
						<Stack className="main-config">
							<Stack className={'list-config'}>
								{category === 'properties' && <MemberProperties />}
								{category === 'followers' && (
									<MemberFollowers
										subscribeHandler={subscribeHandler}
										unsubscribeHandler={unsubscribeHandler}
										likeMemberHandler={likeMemberHandler}
										redirectToMemberPageHandler={redirectToMemberPageHandler}
									/>
								)}
								{category === 'followings' && (
									<MemberFollowings
										subscribeHandler={subscribeHandler}
										unsubscribeHandler={unsubscribeHandler}
										likeMemberHandler={likeMemberHandler}
										redirectToMemberPageHandler={redirectToMemberPageHandler}
									/>
								)}
								{category === 'articles' && <MemberArticles />}
							</Stack>
						</Stack>
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

export default withLayoutBasic(MemberPage);
