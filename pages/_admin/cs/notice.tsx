import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import NoticeAdminPanel from '../../../libs/components/admin/cs/NoticeAdminPanel';
import { NoticeCategory } from '../../../libs/enums/notice.enum';

const AdminNotice: NextPage = () => <NoticeAdminPanel category={NoticeCategory.NOTICE} />;

export default withAdminLayout(AdminNotice);
