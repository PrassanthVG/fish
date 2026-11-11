import "./globals.css";
import AnalyticsRecorder from "./components/AnalyticsRecorder";

export const metadata = {
  title: "Get the Offer",
  description: "Claim your offer today.",
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
