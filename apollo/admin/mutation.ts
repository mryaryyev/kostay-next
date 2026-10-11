import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdate!) {
		updateMembersByAdmin(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberProperties
			memberRank
			memberArticles
			memberPoints
			memberLikes
			memberViews
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

/**************************
 *        PROPERTY        *
 *************************/

export const UPDATE_PROPERTY_BY_ADMIN = gql`
	mutation UpdatePropertyByAdmin($input: PropertyUpdate!) {
		updatePropertyByAdmin(input: $input) {
			_id
			propertyType
			propertyStatus
			propertyLocation
			propertyAddress
			propertyTitle
			pricePerNight
			maxGuests
			propertySquare
			propertyBeds
			propertyRooms
			propertyViews
			propertyLikes
			propertyImages
			propertyDesc
			memberId
			deletedAt
			constructedAt
			createdAt
			updatedAt
		}
	}
`;

export const REMOVE_PROPERTY_BY_ADMIN = gql`
	mutation RemovePropertyByAdmin($input: String!) {
		removePropertyByAdmin(propertyId: $input) {
			_id
			propertyType
			propertyStatus
			propertyLocation
			propertyAddress
			propertyTitle
			pricePerNight
			maxGuests
			propertySquare
			propertyBeds
			propertyRooms
			propertyViews
			propertyLikes
			propertyImages
			propertyDesc
			memberId
			deletedAt
			constructedAt
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdate!) {
		updateBoardArticleByAdmin(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation RemoveBoardArticleByAdmin($input: String!) {
		removeBoardArticleByAdmin(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const REMOVE_COMMENT_BY_ADMIN = gql`
	mutation RemoveCommentByAdmin($input: String!) {
		removeCommentByAdmin(commentId: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         NOTICE         *
 *************************/

export const CREATE_NOTICE = gql`
	mutation CreateNotice($input: NoticeInput!) {
		createNotice(input: $input) {
			_id
			noticeCategory
			noticeStatus
			faqGroup
			noticeEvent
			noticeTitle
			noticeContent
			noticeViews
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_NOTICE = gql`
	mutation UpdateNotice($input: NoticeUpdate!) {
		updateNotice(input: $input) {
			_id
			noticeCategory
			noticeStatus
			faqGroup
			noticeEvent
			noticeTitle
			noticeContent
			noticeViews
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const REMOVE_NOTICE = gql`
	mutation RemoveNotice($input: String!) {
		removeNotice(noticeId: $input) {
			_id
		}
	}
`;

/**************************
 *        INQUIRY         *
 *************************/

export const ANSWER_INQUIRY = gql`
	mutation AnswerInquiry($input: AnswerInquiryInput!) {
		answerInquiry(input: $input) {
			_id
			inquiryTopic
			inquiryStatus
			inquiryTitle
			inquiryContent
			memberId
			answerContent
			answeredAt
			createdAt
			updatedAt
		}
	}
`;

export const UPDATE_INQUIRY_BY_ADMIN = gql`
	mutation UpdateInquiryByAdmin($input: InquiryUpdate!) {
		updateInquiryByAdmin(input: $input) {
			_id
			inquiryTopic
			inquiryStatus
			inquiryTitle
			inquiryContent
			memberId
			answerContent
			answeredAt
			createdAt
			updatedAt
		}
	}
`;
