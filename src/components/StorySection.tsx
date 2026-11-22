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
      className={`pdf-paper-surface scroll-mt-14 ${
        embedded ? 'h-full px-5 py-6 sm:px-7 sm:py-7 lg:px-8' : 'border-b border-[#CEC7B7] py-16 sm:py-24'
      }`}
      style={{ backgroundImage: "url('images/brand/paper-texture.jpg')" }}
    >
      <div className={embedded ? 'mx-auto max-w-[540px]' : 'mx-auto max-w-[820px] px-5 sm:px-8'}>
        {/* Phần đầu trang trung thành Trang 2 Trái PDF: Khóa tiêu đề PP Migra + Người giã gạo vector thuần */}
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="sr-only">
              {isEn ? STORY_CONTENT.titleEn : STORY_CONTENT.titleVi}
            </h2>
            <img
              src="images/brand/title-van-minh-dong-son.png"
              alt="Văn Minh Đông Sơn — Dong Son Civilization"
              className={`h-auto max-w-full object-contain ${
                embedded ? 'w-[220px] sm:w-[285px]' : 'w-[270px] sm:w-[390px] lg:w-[430px]'
              }`}
            />
          </div>

          <img
            src="images/brand/illust-dancers.png"
            alt={
              isEn
                ? 'Dong Son festival rice-pounding dancers'
                : 'Hoa văn người giã gạo Đông Sơn'
            }
            className={`w-auto self-end object-contain ${
              embedded ? 'h-16 sm:h-20' : 'h-24 sm:h-32'
            }`}
          />
        </div>

        {/* Chính văn Be Vietnam Pro theo đúng tỷ lệ, màu đá ấm (#645D4E) và giãn dòng của bản in PDF */}
        <p
          className={`text-justify text-[#645D4E] tracking-[0.004em] ${
            embedded
              ? 'mt-4 text-[12.5px] leading-[1.58] sm:text-[13px]'
              : 'mt-7 text-[14px] leading-[1.6] sm:text-[14.5px] sm:leading-[1.62]'
          } ${isEn ? 'italic' : ''}`}
        >
          {isEn ? STORY_CONTENT.leadEn : STORY_CONTENT.leadVi}
        </p>

        {/* Chim Lạc bên trái + đoạn giá trị di sản bên phải */}
        <div className={`grid items-center md:grid-cols-12 ${embedded ? 'mt-5 gap-4' : 'mt-8 gap-7 md:gap-9'}`}>
          <div className="flex justify-center md:col-span-5 md:justify-start">
            <img
              src="images/brand/illust-chim-lac.png"
              alt={isEn ? 'Dong Son Lac bird illustration' : 'Hoa văn Chim Lạc Đông Sơn'}
              className={`w-auto object-contain ${embedded ? 'max-h-22 sm:max-h-24' : 'max-h-32 sm:max-h-36'}`}
            />
          </div>

          <div className="md:col-span-7">
            <p
              className={`text-justify text-[#645D4E] tracking-[0.004em] ${
                embedded
                  ? 'text-[12.5px] leading-[1.58] sm:text-[13px]'
                  : 'text-[14px] leading-[1.6] sm:text-[14.5px] sm:leading-[1.62]'
              } ${isEn ? 'italic' : ''}`}
            >
              {isEn ? STORY_CONTENT.heritageEn : STORY_CONTENT.heritageVi}
            </p>
          </div>
        </div>

        {/* Dải vòng tròn tiếp tuyến Đông Sơn nguyên nét */}
        <div className={embedded ? 'my-5' : 'my-9 sm:my-11'}>
          <img
            src="images/brand/illust-divider.png"
            alt=""
            aria-hidden="true"
            className="h-3.5 w-full object-contain sm:h-4"
          />
        </div>

        {/* Trống Đồng nguyên nét cọ bên trái + mô tả Trống Đồng bên phải */}
        <div className={`grid items-center md:grid-cols-12 ${embedded ? 'gap-4' : 'gap-7 md:gap-9'}`}>
          <div className="flex justify-center md:col-span-5">
            <img
              src="images/brand/illust-drum-line.png"
              alt={
                isEn
                  ? 'Dong Son bronze drum illustration'
                  : 'Minh họa Trống Đồng Đông Sơn'
              }
              className={`w-auto object-contain ${embedded ? 'h-32 sm:h-36' : 'h-48 sm:h-56'}`}
            />
          </div>

          <div className="md:col-span-7">
            <p
              className={`text-justify text-[#645D4E] tracking-[0.004em] ${
                embedded
                  ? 'text-[12.5px] leading-[1.58] sm:text-[13px]'
                  : 'text-[14px] leading-[1.6] sm:text-[14.5px] sm:leading-[1.62]'
              } ${isEn ? 'italic' : ''}`}
            >
              {isEn ? STORY_CONTENT.drumEn : STORY_CONTENT.drumVi}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
