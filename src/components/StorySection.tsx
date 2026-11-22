import { STORY_CONTENT, type Language } from '../data/catalog';

interface StorySectionProps {
  lang: Language;
}

export function StorySection({ lang }: StorySectionProps) {
  const isEn = lang === 'en';

  return (
    <section
      id="cau-chuyen"
      className="pdf-paper-surface scroll-mt-14 border-b border-[#CEC7B7] py-16 sm:py-24"
      style={{ backgroundImage: "url('images/brand/paper-texture.jpg')" }}
    >
      <div className="mx-auto max-w-[820px] px-5 sm:px-8">
        {/* Phần đầu trang trung thành Trang 2 Trái PDF: Khóa tiêu đề PP Migra + Người giã gạo vector thuần */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="sr-only">
              {isEn ? STORY_CONTENT.titleEn : STORY_CONTENT.titleVi}
            </h2>
            <img
              src="images/brand/title-van-minh-dong-son.png"
              alt="Văn Minh Đông Sơn — Dong Son Civilization"
              className="h-auto w-[270px] max-w-full object-contain sm:w-[390px] lg:w-[430px]"
              loading="lazy"
            />
          </div>

          <img
            src="images/brand/illust-dancers.png"
            alt={
              isEn
                ? 'Dong Son festival rice-pounding dancers'
                : 'Hoa văn người giã gạo Đông Sơn'
            }
            className="h-24 w-auto self-end object-contain sm:h-32"
            loading="lazy"
          />
        </div>

        {/* Chính văn Be Vietnam Pro theo đúng tỷ lệ, màu đá ấm (#645D4E) và giãn dòng của bản in PDF */}
        <p
          className={`mt-7 text-justify text-[14px] leading-[1.6] tracking-[0.004em] text-[#645D4E] sm:text-[14.5px] sm:leading-[1.62] ${
            isEn ? 'italic' : ''
          }`}
        >
          {isEn ? STORY_CONTENT.leadEn : STORY_CONTENT.leadVi}
        </p>

        {/* Chim Lạc bên trái + đoạn giá trị di sản bên phải */}
        <div className="mt-8 grid items-center gap-7 md:grid-cols-12 md:gap-9">
          <div className="flex justify-center md:col-span-5 md:justify-start">
            <img
              src="images/brand/illust-chim-lac.png"
              alt={isEn ? 'Dong Son Lac bird illustration' : 'Hoa văn Chim Lạc Đông Sơn'}
              className="max-h-32 w-auto object-contain sm:max-h-36"
              loading="lazy"
            />
          </div>

          <div className="md:col-span-7">
            <p
              className={`text-justify text-[14px] leading-[1.6] tracking-[0.004em] text-[#645D4E] sm:text-[14.5px] sm:leading-[1.62] ${
                isEn ? 'italic' : ''
              }`}
            >
              {isEn ? STORY_CONTENT.heritageEn : STORY_CONTENT.heritageVi}
            </p>
          </div>
        </div>

        {/* Dải vòng tròn tiếp tuyến Đông Sơn nguyên nét */}
        <div className="my-9 sm:my-11">
          <img
            src="images/brand/illust-divider.png"
            alt=""
            aria-hidden="true"
            className="h-3.5 w-full object-contain sm:h-4"
            loading="lazy"
          />
        </div>

        {/* Trống Đồng nguyên nét cọ bên trái + mô tả Trống Đồng bên phải */}
        <div className="grid items-center gap-7 md:grid-cols-12 md:gap-9">
          <div className="flex justify-center md:col-span-5">
            <img
              src="images/brand/illust-drum-line.png"
              alt={
                isEn
                  ? 'Dong Son bronze drum illustration'
                  : 'Minh họa Trống Đồng Đông Sơn'
              }
              className="h-48 w-auto object-contain sm:h-56"
              loading="lazy"
            />
          </div>

          <div className="md:col-span-7">
            <p
              className={`text-justify text-[14px] leading-[1.6] tracking-[0.004em] text-[#645D4E] sm:text-[14.5px] sm:leading-[1.62] ${
                isEn ? 'italic' : ''
              }`}
            >
              {isEn ? STORY_CONTENT.drumEn : STORY_CONTENT.drumVi}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
