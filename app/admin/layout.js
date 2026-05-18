import '../../src/components/admin/admin.css';

export const metadata = {
  title: 'Admin Dashboard | PHEE',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false
    }
  }
};

export default function AdminLayout({ children }) {
  return children;
}
