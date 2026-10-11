import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_ALL_MEMBERS_BY_ADMIN = gql`
	query GetAllMembersByAdmin($input: MembersInquiry!) {
		getAllMembersByAdmin(input: $input) {
			list {
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
				memberWarnings
				memberBlocks
				memberProperties
				memberRank
				memberArticles
				memberPoints
				memberLikes
				memberViews
				deletedAt
				createdAt
				updatedAt
				accessToken
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        PROPERTY        *
 *************************/

export const GET_ALL_PROPERTIES_BY_ADMIN = gql`
	query GetAllPropertiesByAdmin($input: AllPropertiesInquiry!) {
		getAllPropertiesByAdmin(input: $input) {
			list {
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
				memberData {
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
					memberWarnings
					memberBlocks
					memberProperties
					memberRank
					memberPoints
					memberLikes
					memberViews
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_ALL_BOARD_ARTICLES_BY_ADMIN = gql`
	query GetAllBoardArticlesByAdmin($input: AllBoardArticlesInquiry!) {
		getAllBoardArticlesByAdmin(input: $input) {
			list {
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
				memberData {
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
					memberWarnings
					memberBlocks
					memberProperties
					memberRank
					memberPoints
					memberLikes
					memberViews
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
				memberData {
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
					memberWarnings
					memberBlocks
					memberProperties
					memberRank
					memberPoints
					memberLikes
					memberViews
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         NOTICE         *
 *************************/

export const GET_ALL_NOTICES_BY_ADMIN = gql`
	query GetAllNoticesByAdmin($input: AllNoticesInquiry!) {
		getAllNoticesByAdmin(input: $input) {
			list {
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
				memberData {
					_id
					memberNick
					memberImage
				}
			}
			metaCounter {
				total
			}
			statusCounter {
				_id
				count
			}
		}
	}
`;

/**************************
 *        INQUIRY         *
 *************************/

export const GET_ALL_INQUIRIES_BY_ADMIN = gql`
	query GetAllInquiriesByAdmin($input: AllInquiriesInquiry!) {
		getAllInquiriesByAdmin(input: $input) {
			list {
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
				memberData {
					_id
					memberNick
					memberFullName
					memberImage
					memberType
				}
			}
			metaCounter {
				total
			}
			statusCounter {
				_id
				count
			}
		}
	}
`;

/** Admin sidebar badge: how many inquiries wait for an answer. */
export const GET_WAITING_INQUIRY_COUNT = gql`
	query GetWaitingInquiryCount($input: AllInquiriesInquiry!) {
		getAllInquiriesByAdmin(input: $input) {
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        BOOKING         *
 *************************/

export const GET_ALL_BOOKINGS_BY_ADMIN = gql`
	query GetAllBookingsByAdmin($input: AllBookingsInquiry!) {
		getAllBookingsByAdmin(input: $input) {
			list {
				id
				propertyId
				memberId
				checkIn
				checkOut
				guestsCount
				totalPrice
				status
				paymentStatus
				paymentMethod
				createdAt
				updatedAt
				propertyData {
					_id
					propertyTitle
					propertyImage
					propertyLocation
				}
				guestData {
					_id
					memberNick
					memberFullName
					memberImage
					memberPhone
				}
			}
			total
			statusCounter {
				status
				count
			}
			paymentSummary {
				paidTotal
				refundedTotal
			}
		}
	}
`;
