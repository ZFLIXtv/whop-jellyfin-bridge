export const metadata = {
  title: "Whop Jellyfin Bridge",
  description: "Bridge Whop vers JFA-go pour Jellyfin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}