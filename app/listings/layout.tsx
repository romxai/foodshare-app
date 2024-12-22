export const metadata = {
  title: 'Food Listings - The Giving Table',
  description: 'Browse available food listings on The Giving Table',
}

export default function ListingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}
