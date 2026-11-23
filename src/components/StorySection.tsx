import { motion } from 'motion/react';
import { STORY_CONTENT, type Language } from '../data/catalog';

interface StorySectionProps {
  lang: Language;
  embedded?: boolean;
}

export function StorySection({ lang, embedded = false }: StorySectionProps) {
  const isEn = lang === 'en';

  return (
    <section
      id="cau-chuyen"
      className={`pdf-paper-surface relative scroll-mt-14 ${
        embedded
          ? 'flex h-full flex-col justify-center px-5 py-5 sm:px-7 sm:py-6 lg:px-8'
          : 'border-b border-[#CEC7B7] py-16 sm:py-24'
      }`}
      style={{ backgroundImage: "url('images/brand/paper-texture.jpg')" }}
    >
      <div
        className={`relative z-10 ${
          embedded ? 'mx-auto max-w-[540px]' : 'mx-auto max-w-[820px] px-5 sm:px-8'
        }`}
      >
        {/* Phần đầu trang giống mẫu PDF: Người giã gạo float-right để chữ ôm quanh tự nhiên và tràn hết chiều ngang bên dưới */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: 'easeOut' }}
          className="flow-root"
        >
          <img
            src="images/brand/illust-dancers.png"
            alt={
              isEn
                ? 'Dong Son festival rice-pounding dancers'
                : 'Hoa văn người giã gạo Đông Sơn'
            }
            className={`float-right ml-3 mb-1 w-auto object-contain sm:ml-4 ${
              embedded ? 'h-24 sm:h-32' : 'h-32 sm:h-40'
            }`}
          />

          <h2 className="sr-only">
            {isEn ? STORY_CONTENT.titleEn : STORY_CONTENT.titleVi}
          </h2>
          <img
            src="images/brand/title-van-minh-dong-son.png"
            alt="Văn Minh Đông Sơn — Dong Son Civilization"
            className={`h-auto max-w-full object-contain ${
              embedded ? 'w-[215px] sm:w-[275px]' : 'w-[270px] sm:w-[390px] lg:w-[430px]'
            }`}
          />

          <p
            className={`text-justify text-[#5A5345] tracking-[0.004em] ${
              embedded
                ? 'mt-3 text-[12px] leading-[1.58] sm:text-[12.5px]'
                : 'mt-5 text-[14px] leading-[1.62] sm:text-[14.5px]'
            } ${isEn ? 'italic' : ''}`}
          >
            {isEn ? STORY_CONTENT.leadEn : STORY_CONTENT.leadVi}
          </p>
        </motion.div>

        {/* Chim Lạc bên trái + đoạn giá trị di sản bên phải */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className={`grid items-center md:grid-cols-12 ${
            embedded ? 'mt-4 gap-4' : 'mt-8 gap-7 md:gap-9'
          }`}
        >
          <div className="flex justify-center md:col-span-5 md:justify-start">
            <img
              src="images/brand/illust-chim-lac.png"
              alt={isEn ? 'Dong Son Lac bird illustration' : 'Hoa văn Chim Lạc Đông Sơn'}
              className={`w-auto object-contain ${
                embedded ? 'max-h-22 sm:max-h-24' : 'max-h-32 sm:max-h-36'
              }`}
            />
          </div>

          <div className="md:col-span-7">
            <p
              className={`text-justify text-[#5A5345] tracking-[0.004em] ${
                embedded
                  ? 'text-[12px] leading-[1.58] sm:text-[12.5px]'
                  : 'text-[14px] leading-[1.62] sm:text-[14.5px]'
              } ${isEn ? 'italic' : ''}`}
            >
              {isEn ? STORY_CONTENT.heritageEn : STORY_CONTENT.heritageVi}
            </p>
          </div>
        </motion.div>

        {/* Dải vòng tròn tiếp tuyến Đông Sơn nguyên nét */}
        <div className={embedded ? 'my-4' : 'my-9 sm:my-11'}>
          <img
            src="images/brand/illust-divider.png"
            alt=""
            aria-hidden="true"
            className="h-3.5 w-full object-contain opacity-90 sm:h-4"
          />
        </div>

        {/* Trống Đồng nguyên nét cọ bên trái + mô tả Trống Đồng bên phải */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16, ease: 'easeOut' }}
          className={`grid items-center md:grid-cols-12 ${
            embedded ? 'gap-4' : 'gap-7 md:gap-9'
          }`}
        >
          <div className="flex justify-center md:col-span-5">
            <img
              src="images/brand/illust-drum-line.png"
              alt={
                isEn
                  ? 'Dong Son bronze drum illustration'
                  : 'Minh họa Trống Đồng Đông Sơn'
              }
              className={`w-auto object-contain ${
                embedded ? 'h-32 sm:h-36' : 'h-48 sm:h-56'
              }`}
            />
          </div>

          <div className="md:col-span-7">
            <p
              className={`text-justify text-[#5A5345] tracking-[0.004em] ${
                embedded
                  ? 'text-[12px] leading-[1.58] sm:text-[12.5px]'
                  : 'text-[14px] leading-[1.62] sm:text-[14.5px]'
              } ${isEn ? 'italic' : ''}`}
            >
              {isEn ? STORY_CONTENT.drumEn : STORY_CONTENT.drumVi}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
