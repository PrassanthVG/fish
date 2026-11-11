import "./globals.css";
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
        {children}
      </body>
    </html>
  );
}
