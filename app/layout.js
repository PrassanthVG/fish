import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ConsentBanner from "./components/ConsentBanner";
import AnalyticsRecorder from "./components/AnalyticsRecorder";

export const metadata = {
  title: "Signal/Noise — an independent demo blog",
  description:
    "An original developer blog used to demonstrate transparent, consent-based visitor analytics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AnalyticsRecorder />
        <Header />
        {children}
        <Footer />
        <ConsentBanner />
      </body>
    </html>
  );
}
