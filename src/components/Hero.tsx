import { motion } from 'motion/react';
import { BookOpen } from 'lucide-react';
import { CONTACT_CONFIG, type Language } from '../data/catalog';
import { GlossyLogo, ShimmerButton, TiltCard } from './ui/aceternity';

interface HeroProps {
  lang: Language;
  onOpenBrochure: () => void;
}

export function Hero({ lang, onOpenBrochure }: HeroProps) {
  const isVi = lang === 'vi';

  return (
    <section className="relative flex flex-1 min-h-full flex-col justify-between overflow-hidden bg-[#0B5268] text-center text-[#D1D3D4]">
      {/* Mặt Trống Đồng Đông Sơn — Chiếm trọn phần trên bìa giống hệt mẫu PDF */}
      <div className="relative z-10 w-full shrink-0">
        <TiltCard maxTilt={3} className="w-full overflow-hidden">
          <img
            src="images/brand/hero-drum-art.png"
            alt={
              isVi
                ? 'Ấn phẩm bìa Mặt Trống Đồng Đông Sơn — Một Lát Đông Sơn'
                : 'Dong Son Bronze Drum Cover Artwork — A Slice of Dong Son Civilization'
            }
            className="block h-[clamp(330px,56vh,460px)] w-full object-cover object-bottom"
          />
        </TiltCard>
      </div>

      {/* Khóa tiêu đề Một Lát Đông Sơn + Nút Mở ấn phẩm trắng + Logo chân bìa */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-between px-6 pb-4 pt-2 sm:px-9 sm:pb-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          <h1 className="sr-only">
            {CONTACT_CONFIG.collectionNameVi} — {CONTACT_CONFIG.collectionNameEn}
          </h1>
          <img
            src="images/brand/title-mot-lat-dong-son.png"
            alt="Một Lát Đông Sơn — A Slice of Dong Son Civilization"
            className="h-auto w-[235px] max-w-full object-contain sm:w-[295px]"
          />

          <div className="mt-3 flex justify-center">
            <ShimmerButton
              type="button"
              onClick={onOpenBrochure}
              variant="gold"
              shimmer={false}
              className="px-5 py-1.5 text-xs sm:text-sm"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>{isVi ? 'Mở ấn phẩm' : 'Open Brochure'}</span>
            </ShimmerButton>
          </div>
        </motion.div>

        <div className="relative mt-2 flex flex-col items-center">
          <GlossyLogo
            src="images/brand/logo-stacked.png"
            alt="Khoi Minh Gifts"
            className="h-9 w-auto object-contain sm:h-11"
          />
        </div>
      </div>
    </section>
  );
}
