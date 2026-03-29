import "./globals.css";

export const metadata = {
  title: "NeuroContent Analyzer",
  description: "Upload videos and review mock cognitive-load analysis."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

