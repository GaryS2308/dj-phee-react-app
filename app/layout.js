import ClientShell from '../src/components/ClientShell';
import PrimaryNav from '../src/components/navigation/PrimaryNav';
import Footer from '../src/components/buttons/footer/footer';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://phee.co.za'),
  title: {
    default: 'PHEE | Hire a Professional DJ in Cape Town | Corporate, Clubs, Festivals & Private Events',
    template: '%s | PHEE'
  },
  description:
    'Book DJ PHEE for corporate events, year-end functions, clubs, festivals, weddings and private parties in Cape Town. A professional Afrotech DJ delivering high-energy sets and reliable service.'
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
