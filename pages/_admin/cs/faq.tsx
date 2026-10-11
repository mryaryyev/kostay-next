import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import NoticeAdminPanel from '../../../libs/components/admin/cs/NoticeAdminPanel';
import { NoticeCategory } from '../../../libs/enums/notice.enum';

const AdminFaq: NextPage = () => <NoticeAdminPanel category={NoticeCategory.FAQ} />;

export default withAdminLayout(AdminFaq);
