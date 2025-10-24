import { redirect } from 'next/navigation';
import DashboardNavbar from '@/components/dashboard/navbar';
import { getCurrentUser } from '@/app/utils/auth';
import SubjectManagement from '@/components/dashboard/SubjectManagement';

export default async function SubjectsPage() {
  const userResult = await getCurrentUser();

  if (!userResult.success) {
    redirect('/login');
  }

  const user = userResult.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar user={user} />
      
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subject Management</h1>
          <p className="text-gray-600 mt-2">Manage subjects and assign faculty members</p>
        </div>

        <SubjectManagement userId={user.id} />
      </div>
    </div>
  );
}
