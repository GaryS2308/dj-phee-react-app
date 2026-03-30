import ClientShell from '../src/components/ClientShell';
import PrimaryNav from '../src/components/navigation/PrimaryNav';
import Footer from '../src/components/buttons/footer/footer';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://phee.co.za'),
  title: {
    default: 'Book DJ PHEE in Cape Town | Weddings, Events, Clubs and Festivals',
    template: '%s | PHEE'
  },
  description:
    'Hire DJ PHEE for private events, brand launches, parties, weddings, clubs and festivals in Cape Town. Afrotech specialist with all-genre sets and travel by arrangement.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PrimaryNav />
        {children}
        <Footer />
        <ClientShell />
      </body>
    </html>
  );
}
