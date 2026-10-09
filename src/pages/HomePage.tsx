import SaleHeroEntrance from '../components/SaleHeroEntrance'
import HeroBanner from '../components/HeroBanner'
import CategoryIcons from '../components/CategoryIcons'
import FlashSale from '../components/FlashSale'
import FeaturedSections from '../components/FeaturedSections'
import RecentlyViewed from '../components/RecentlyViewed'
import HomeSections from '../components/HomeSections'
import TrustSection from '../components/TrustSection'
import Footer from '../components/Footer'

export default function HomePage() {
  const handleOpenSaleEntrance = () => {
    window.dispatchEvent(new CustomEvent('open-sale-entrance'))
  }

  return (
    <>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <SaleHeroEntrance onOpenModal={handleOpenSaleEntrance} />
        <HeroBanner />
        <CategoryIcons />
        <FlashSale />
      </div>
      <HomeSections />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <FeaturedSections />
        <RecentlyViewed />
        <TrustSection />
      </div>
      <Footer />
    </>
  )
}
