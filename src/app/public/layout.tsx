import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingChatbot from '@/components/layout/FloatingChatbot';
import '@/styles/globals.css';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <Footer />

      {/* Floating Chatbot عائم دايمًا */}
      <FloatingChatbot />
    </>
  );
}