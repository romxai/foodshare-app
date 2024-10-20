export const metadata = {
  title: 'Food Listings - FoodShare',
  description: 'Browse available food listings on FoodShare',
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
