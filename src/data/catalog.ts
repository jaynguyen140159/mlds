/**
 * ============================================================================
 * DỮ LIỆU CHÍNH THỨC — KHOI MINH GIFTS × BỘ SƯU TẬP MỘT LÁT ĐÔNG SƠN (MLĐS)
 * ----------------------------------------------------------------------------
 * - Hỗ trợ đầy đủ song ngữ Việt / Anh (Language = 'vi' | 'en')
 * - Kiến trúc đơn hàng theo từng bộ (OrderSet) cho phép chọn số lượng trước rồi
 *   tùy chỉnh mẫu, chất liệu & khắc chữ độc lập cho từng bộ, kèm mã SKU kho
 *   (MLDS-01..11), mã font xưởng khắc (F01..F10), quy tắc IN HOA tự động và phiếu
 *   đơn 3 tầng tối ưu cho cả khách hàng và nhân sự Khoi Minh Gifts.
 * ============================================================================
 */

export type Language = 'vi' | 'en';
export type MaterialId = 'dong' | 'ma-vang';
export type WoodBaseId = 'tron' | 'khac';
export type FontCategory = 'classic' | 'script' | 'modern';
export type EngravingFontId =
  | 'playfair'
  | 'cormorant'
  | 'lora'
  | 'merriweather'
  | 'dancing'
  | 'pacifico'
  | 'patrick'
  | 'vietnam'
  | 'montserrat'
  | 'mono';

export interface ContactConfig {
  companyNameVi: string;
  companyNameEn: string;
  brandName: string;
  parentBrand: string;
  collectionNameVi: string;
  collectionNameEn: string;
  collectionCode: string;
  zaloPhone: string;
  messengerUsername: string;
  hotlineDisplay: string;
  email: string;
  orderEmailEndpoint: string;
  website: string;
  websiteDisplay: string;
  addressVi: string;
  addressEn: string;
  qrUrl: string;
}

export const CONTACT_CONFIG: ContactConfig = {
  companyNameVi: 'Công ty cổ phần Tư vấn, Dịch vụ và Thương mại Khởi Minh',
  companyNameEn: 'Khoi Minh Consulting, Service, and Trading Joint Stock Company',
  brandName: 'Khoi Minh Gifts',
  parentBrand: 'Khoi Minh CST',
  collectionNameVi: 'Một Lát Đông Sơn',
  collectionNameEn: 'A Slice of Dong Son Civilization',
  collectionCode: 'BST MLĐS',
  // Hotline chính thức từ ấn phẩm: (84) 793 381 666
  zaloPhone: '0793381666',
  // TODO: Cập nhật username Fanpage / Messenger nếu khác
  messengerUsername: 'khoiminhcst',
  hotlineDisplay: '(84) 793 381 666',
  email: 'info@khoiminhcst.vn',
  // Tạm thời trỏ đơn đặt hàng về jaynguyen140159@gmail.com để kiểm tra nhận mail thực tế
  orderEmailEndpoint: 'https://formsubmit.co/ajax/jaynguyen140159@gmail.com',
  website: 'https://www.khoiminhcst.vn',
  websiteDisplay: 'www.khoiminhcst.vn',
  addressVi: 'Số 38 Phố Huế, phường Cửa Nam, Hà Nội',
  addressEn: 'No. 38 Pho Hue, Cua Nam Ward, Hanoi',
  qrUrl: 'https://me-qr.com/7778295',
};

export interface MaterialOption {
  id: MaterialId;
  skuSuffix: 'D' | 'V24';
  label: string;
  labelEn: string;
  shortLabel: string;
  shortLabelEn: string;
  subtitle: string;
  subtitleEn: string;
  unitPrice: number;
  priceNote: string;
  priceNoteEn: string;
  swatchClass: string;
}

export const MATERIALS: Record<MaterialId, MaterialOption> = {
  dong: {
    id: 'dong',
    skuSuffix: 'D',
    label: 'Đồng',
    labelEn: 'Brushed Brass',
    shortLabel: 'Đồng',
    shortLabelEn: 'Brass',
    subtitle: 'Đồng thau nguyên chất xước mờ cổ điển',
    subtitleEn: 'Solid brushed brass with classic patina finish',
    // TODO: Cập nhật giá chính thức cho chất liệu Đồng
    unitPrice: 290000,
    priceNote: 'Giá dự kiến',
    priceNoteEn: 'Est. price',
    swatchClass: 'from-[#C89D54] via-[#B4823A] to-[#7A5622]',
  },
  'ma-vang': {
    id: 'ma-vang',
    skuSuffix: 'V24',
    label: 'Đồng Mạ Vàng 24K',
    labelEn: '24K Gold-Plated Brass',
    shortLabel: 'Mạ Vàng 24K',
    shortLabelEn: '24K Gold',
    subtitle: 'Cốt đồng phủ mạ vàng 24K ánh kim sang trọng',
    subtitleEn: 'Solid brass electroplated in lustrous 24K gold',
    // TODO: Cập nhật giá chính thức cho chất liệu Đồng Mạ Vàng 24K
    unitPrice: 450000,
    priceNote: 'Giá dự kiến',
    priceNoteEn: 'Est. price',
    swatchClass: 'from-[#F1D58B] via-[#C4942E] to-[#8F6A1A]',
  },
};

export interface WoodBaseOption {
  id: WoodBaseId;
  skuSuffix: 'TR' | 'KH';
  label: string;
  labelEn: string;
  shortLabel: string;
  shortLabelEn: string;
  subtitle: string;
  subtitleEn: string;
  extraPrice: number;
}

export const WOOD_BASES: Record<WoodBaseId, WoodBaseOption> = {
  tron: {
    id: 'tron',
    skuSuffix: 'TR',
    label: 'Đế gỗ trơn',
    labelEn: 'Plain Wood Base',
    shortLabel: 'Đế trơn',
    shortLabelEn: 'Plain base',
    subtitle: 'Đế gỗ tự nhiên thanh mảnh đi kèm tiêu chuẩn',
    subtitleEn: 'Slim natural beechwood base, standard finish',
    extraPrice: 0,
  },
  khac: {
    id: 'khac',
    skuSuffix: 'KH',
    label: 'Đế gỗ khắc laser',
    labelEn: 'Custom Laser Engraving',
    shortLabel: 'Đế khắc',
    shortLabelEn: 'Engraved base',
    subtitle: 'Khắc tên riêng hoặc lời chúc tinh tế theo yêu cầu',
    subtitleEn: 'Precision laser engraving for names or personal wishes',
    // TODO: Cập nhật phụ phí khắc đế gỗ (nếu có)
    extraPrice: 50000,
  },
};

export interface EngravingFontOption {
  id: EngravingFontId;
  code: string;
  name: string;
  category: FontCategory;
  styleLabel: string;
  styleLabelEn: string;
  caseRule: 'AS_TYPED' | 'UPPERCASE';
  styleNoteVi: string;
  styleNoteEn: string;
  fontFamily: string;
  sampleText: string;
  cssClass: string;
}

export const FONT_CATEGORIES: { id: FontCategory; label: string; labelEn: string }[] = [
  { id: 'classic', label: 'Cổ điển (4)', labelEn: 'Classic (4)' },
  { id: 'script', label: 'Thư họa (3)', labelEn: 'Calligraphy (3)' },
  { id: 'modern', label: 'Hiện đại (3)', labelEn: 'Modern (3)' },
];

export const ENGRAVING_FONTS: EngravingFontOption[] = [
  {
    id: 'playfair',
    code: 'F01',
    name: 'Playfair Display',
    category: 'classic',
    styleLabel: 'Cổ điển • Trang trọng',
    styleLabelEn: 'Classic • Formal',
    caseRule: 'AS_TYPED',
    styleNoteVi: '',
    styleNoteEn: '',
    fontFamily: '"Playfair Display", Georgia, serif',
    sampleText: 'Lưu giữ hồn Việt',
    cssClass: 'font-engraving-playfair',
  },
  {
    id: 'cormorant',
    code: 'F02',
    name: 'Cormorant Garamond',
    category: 'classic',
    styleLabel: 'Thư viện • In nghiêng',
    styleLabelEn: 'Editorial • Italic',
    caseRule: 'AS_TYPED',
    styleNoteVi: 'In nghiêng',
    styleNoteEn: 'Italic',
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    sampleText: 'Tặng người tri kỷ',
    cssClass: 'font-engraving-cormorant italic',
  },
  {
    id: 'lora',
    code: 'F03',
    name: 'Lora',
    category: 'classic',
    styleLabel: 'Văn chương • Ấm áp',
    styleLabelEn: 'Literary • Warm',
    caseRule: 'AS_TYPED',
    styleNoteVi: '',
    styleNoteEn: '',
    fontFamily: '"Lora", Georgia, serif',
    sampleText: 'Một thoáng Đông Sơn',
    cssClass: 'font-engraving-lora',
  },
  {
    id: 'merriweather',
    code: 'F04',
    name: 'Merriweather',
    category: 'classic',
    styleLabel: 'Rõ nét • Chững chạc',
    styleLabelEn: 'Crisp • Bold Serif',
    caseRule: 'AS_TYPED',
    styleNoteVi: '',
    styleNoteEn: '',
    fontFamily: '"Merriweather", Georgia, serif',
    sampleText: 'Kỷ niệm 2026',
    cssClass: 'font-engraving-merriweather',
  },
  {
    id: 'dancing',
    code: 'F05',
    name: 'Dancing Script',
    category: 'script',
    styleLabel: 'Chữ ký • Mềm mại',
    styleLabelEn: 'Signature • Flowing',
    caseRule: 'AS_TYPED',
    styleNoteVi: '',
    styleNoteEn: '',
    fontFamily: '"Dancing Script", cursive',
    sampleText: 'Mãi nhớ ngày này',
    cssClass: 'font-engraving-dancing',
  },
  {
    id: 'pacifico',
    code: 'F06',
    name: 'Pacifico',
    category: 'script',
    styleLabel: 'Nét cọ • Phóng khoáng',
    styleLabelEn: 'Brush • Expressive',
    caseRule: 'AS_TYPED',
    styleNoteVi: '',
    styleNoteEn: '',
    fontFamily: '"Pacifico", cursive',
    sampleText: 'Chúc bình an',
    cssClass: 'font-engraving-pacifico',
  },
  {
    id: 'patrick',
    code: 'F07',
    name: 'Patrick Hand',
    category: 'script',
    styleLabel: 'Viết tay • Tự nhiên',
    styleLabelEn: 'Handwritten • Casual',
    caseRule: 'AS_TYPED',
    styleNoteVi: '',
    styleNoteEn: '',
    fontFamily: '"Patrick Hand", cursive',
    sampleText: 'Gửi tặng bạn hiền',
    cssClass: 'font-engraving-patrick',
  },
  {
    id: 'vietnam',
    code: 'F08',
    name: 'Be Vietnam Pro',
    category: 'modern',
    styleLabel: 'Hiện đại • IN HOA',
    styleLabelEn: 'Modern • UPPERCASE',
    caseRule: 'UPPERCASE',
    styleNoteVi: 'IN HOA',
    styleNoteEn: 'UPPERCASE',
    fontFamily: '"Be Vietnam Pro", system-ui, sans-serif',
    sampleText: 'MINH ANH • 2026',
    cssClass: 'font-engraving-vietnam tracking-[0.12em] uppercase',
  },
  {
    id: 'montserrat',
    code: 'F09',
    name: 'Montserrat',
    category: 'modern',
    styleLabel: 'Hình học • IN HOA',
    styleLabelEn: 'Geometric • UPPERCASE',
    caseRule: 'UPPERCASE',
    styleNoteVi: 'IN HOA',
    styleNoteEn: 'UPPERCASE',
    fontFamily: '"Montserrat", system-ui, sans-serif',
    sampleText: 'KHOI MINH GIFTS',
    cssClass: 'font-engraving-montserrat tracking-[0.1em] uppercase',
  },
  {
    id: 'mono',
    code: 'F10',
    name: 'JetBrains Mono',
    category: 'modern',
    styleLabel: 'Tối giản • Dấu mốc',
    styleLabelEn: 'Minimal • Monospace',
    caseRule: 'AS_TYPED',
    styleNoteVi: '',
    styleNoteEn: '',
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    sampleText: 'MLĐS • 22.11.2026',
    cssClass: 'font-engraving-mono tracking-wider',
  },
];

export const ENGRAVING_SUGGESTIONS: string[] = [
  'Lưu giữ hồn Việt',
  'Tặng người tri kỷ',
  'MINH ANH • 2026',
];

export interface EngravedBaseSample {
  id: string;
  image: string;
  title: string;
  titleEn: string;
  fontTag: string;
  caption: string;
  captionEn: string;
}

export const ENGRAVED_BASE_SAMPLES: EngravedBaseSample[] = [
  {
    id: 'sample-1',
    image: 'images/bases/base-sample-1.jpg',
    title: 'Mẫu khắc Cổ điển',
    titleEn: 'Classic Serif Sample',
    fontTag: 'F01 · Playfair Display',
    caption: 'Khắc laser trực tiếp trên mặt trước đế gỗ thanh mảnh của bộ Mặt Trời Mạ Vàng 24K.',
    captionEn: 'Precision serif engraving on the slim wood base paired with The Sun 24K Gold.',
  },
  {
    id: 'sample-2',
    image: 'images/bases/base-sample-2.jpg',
    title: 'Mẫu khắc Chữ ký mềm mại',
    titleEn: 'Calligraphy Sample',
    fontTag: 'F05 · Thư họa / Chữ ký',
    caption: 'Đường nét uyển chuyển trên đế gỗ đồng bộ cùng mẫu Cơm Mới chất liệu Đồng.',
    captionEn: 'Flowing script engraving on the slim wood base paired with Harvest Celebration Brass.',
  },
  {
    id: 'sample-3',
    image: 'images/bases/base-sample-3.jpg',
    title: 'Mẫu khắc Tên & Dấu mốc',
    titleEn: 'Modern Name Sample',
    fontTag: 'F08 · Be Vietnam Pro (IN HOA)',
    caption: 'Tinh gọn, rõ nét cho tên cá nhân hoặc dấu mốc kỷ niệm trên đế gỗ bộ Hợp Nhất.',
    captionEn: 'Minimalist uppercase engraving ideal for personal names and special milestones.',
  },
];

export interface ProductDesign {
  id: string;
  skuCode: string;
  name: string;
  englishTag: string;
  motif: string;
  motifEn: string;
  shortDesc: string;
  shortDescEn: string;
  defaultMaterial: MaterialId;
  images: Partial<Record<MaterialId, string>>;
}

export const PRODUCTS: ProductDesign[] = [
  {
    id: 'mat-troi',
    skuCode: 'MLDS-01',
    name: 'Mặt Trời',
    englishTag: 'The Sun Origin',
    motif: 'Mặt Trời trung tâm Trống Đồng',
    motifEn: 'Central Sunburst Motif',
    shortDesc:
      'Lấy cảm hứng từ ngôi sao nhiều cánh nơi tâm trống đồng Đông Sơn — nguồn sáng khởi nguyên và năng lượng lan tỏa.',
    shortDescEn:
      'Inspired by the radiant multi-ray sun at the heart of the Dong Son drum — symbolizing primal light and vitality.',
    defaultMaterial: 'ma-vang',
    images: {
      dong: 'images/products/mat-troi-dong.jpg',
      'ma-vang': 'images/products/mat-troi-vang-24k.jpg',
    },
  },
  {
    id: 'com-moi',
    skuCode: 'MLDS-02',
    name: 'Cơm Mới',
    englishTag: 'Harvest Celebration',
    motif: 'Hội giã gạo & mùa lúa mới',
    motifEn: 'Rice-Pounding Harvest',
    shortDesc:
      'Tái hiện sinh động nhịp sống cộng đồng Lạc Việt trong lễ hội cơm mới — biểu trưng cho sự gắn kết và no ấm.',
    shortDescEn:
      'Depicts the joyful communal rice-pounding festival of ancient Lac Viet culture — celebrating abundance and unity.',
    defaultMaterial: 'dong',
    images: {
      dong: 'images/products/com-moi-dong.jpg',
      'ma-vang': 'images/products/com-moi-vang-24k.jpg',
    },
  },
  {
    id: 'hop-nhat',
    skuCode: 'MLDS-03',
    name: 'Hợp Nhất',
    englishTag: 'Harmony in Unity',
    motif: 'Vòng hoa văn đồng tâm',
    motifEn: 'Concentric Harmony',
    shortDesc:
      'Sự đan xen nhịp nhàng của các dải họa tiết cổ đại, gợi nhắc tinh thần đồng lòng và cân bằng trong cuộc sống.',
    shortDescEn:
      'Interlocking concentric motifs symbolizing balance, shared strength, and enduring harmony.',
    defaultMaterial: 'ma-vang',
    images: {
      dong: 'images/products/hop-nhat-dong.jpg',
      'ma-vang': 'images/products/hop-nhat-vang-24k.jpg',
    },
  },
  {
    id: 'dat-troi',
    skuCode: 'MLDS-04',
    name: 'Đất Trời',
    englishTag: 'Heaven & Earth',
    motif: 'Triết lý Âm Dương',
    motifEn: 'Heaven & Earth Cosmology',
    shortDesc:
      'Đường cắt uốn cong ôm trọn hoa văn vũ trụ quan người Việt xưa, mang lại cảm giác bình an trên từng trang sách.',
    shortDescEn:
      'Curved silhouette framing ancient Vietnamese cosmological carvings for serenity on every page.',
    defaultMaterial: 'dong',
    images: {
      dong: 'images/products/dat-troi-dong.jpg',
    },
  },
  {
    id: 'nay-no',
    skuCode: 'MLDS-05',
    name: 'Nảy Nở',
    englishTag: 'Blossoming Spirit',
    motif: 'Vũ công & đàn hươu',
    motifEn: 'Dancers & Deer Procession',
    shortDesc:
      'Nhịp chuyển động đầy sức sống của muông thú và lễ hội mùa xuân, gửi gắm lời chúc khởi đầu rạng rỡ.',
    shortDescEn:
      'Lively spring festival dancers and deer friezes celebrating radiant new beginnings.',
    defaultMaterial: 'dong',
    images: {
      dong: 'images/products/nay-no-dong.jpg',
    },
  },
  {
    id: 'giao-hoa',
    skuCode: 'MLDS-06',
    name: 'Giao Hòa',
    englishTag: 'Sacred Resonance',
    motif: 'Chim Lạc & sóng nước',
    motifEn: 'Lac Birds & Water Waves',
    shortDesc:
      'Khắc họa sự giao cảm giữa thiên nhiên và con người, nét chạm trổ thanh thoát ánh sắc vàng 24K.',
    shortDescEn:
      'Delicate pierced filigree capturing the resonance between nature and humankind in 24K gold tone.',
    defaultMaterial: 'ma-vang',
    images: {
      'ma-vang': 'images/products/giao-hoa-vang-24k.jpg',
    },
  },
  {
    id: 'sinh-soi',
    skuCode: 'MLDS-07',
    name: 'Sinh Sôi',
    englishTag: 'Abundant Vitality',
    motif: 'Đàn hươu tiếp nối',
    motifEn: 'Procession of Deer',
    shortDesc:
      'Hình ảnh đàn hươu vàng hiền hòa tiếp nối bất tận — biểu tượng của sinh khí, thịnh vượng và trường tồn.',
    shortDescEn:
      'Graceful deer marching in continuity — an emblem of vitality, prosperity, and longevity.',
    defaultMaterial: 'ma-vang',
    images: {
      'ma-vang': 'images/products/sinh-soi-vang-24k.jpg',
    },
  },
  {
    id: 'su-song',
    skuCode: 'MLDS-08',
    name: 'Sự Sống',
    englishTag: 'Pulse of Life',
    motif: 'Dòng chảy sinh mệnh',
    motifEn: 'Stream of Life',
    shortDesc:
      'Tôn vinh sức sống bền bỉ ngàn năm của văn minh sông Hồng qua từng chi tiết đột thủng tinh xảo.',
    shortDescEn:
      'Honors the enduring pulse of Red River civilization through intricate pierced metalwork.',
    defaultMaterial: 'ma-vang',
    images: {
      'ma-vang': 'images/products/su-song-vang-24k.jpg',
    },
  },
  {
    id: 'sung-tuc',
    skuCode: 'MLDS-09',
    name: 'Sung Túc',
    englishTag: 'Prosperity',
    motif: 'Mùa màng bội thu',
    motifEn: 'Bountiful Harvest',
    shortDesc:
      'Món quà ý nghĩa thay lời chúc đủ đầy, hanh thông và viên mãn dành cho đối tác, đồng nghiệp và người thân.',
    shortDescEn:
      'A meaningful gift expressing wishes of fullness, prosperity, and accomplishment.',
    defaultMaterial: 'ma-vang',
    images: {
      'ma-vang': 'images/products/sung-tuc-vang-24k.jpg',
    },
  },
  {
    id: 'thuan-phat',
    skuCode: 'MLDS-10',
    name: 'Thuận Phát',
    englishTag: 'Auspicious Flow',
    motif: 'Thuyền rồng & cánh chim',
    motifEn: 'Dragon Boat & Wings',
    shortDesc:
      'Dải cong mềm mại tượng trưng cho hành trình thuận buồm xuôi gió, mở ra những chương mới tốt đẹp.',
    shortDescEn:
      'Graceful sweeping form symbolizing smooth sailing and auspicious new chapters.',
    defaultMaterial: 'ma-vang',
    images: {
      'ma-vang': 'images/products/thuan-phat-vang-24k.jpg',
    },
  },
  {
    id: 'tot-tuoi',
    skuCode: 'MLDS-11',
    name: 'Tốt Tươi',
    englishTag: 'Flourishing Grace',
    motif: 'Hoa văn sinh thực',
    motifEn: 'Flourishing Motifs',
    shortDesc:
      'Vẻ đẹp mộc mạc mà rực rỡ của đất trời vào xuân, thích hợp làm dấu ấn tri ân và kỷ niệm.',
    shortDescEn:
      'Radiant springtime vitality preserved in brass — suited for appreciation and milestone gifts.',
    defaultMaterial: 'ma-vang',
    images: {
      'ma-vang': 'images/products/tot-tuoi-vang-24k.jpg',
    },
  },
];

export function getProductById(id: string): ProductDesign {
  return PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
}

export function getFontById(id: EngravingFontId): EngravingFontOption {
  return ENGRAVING_FONTS.find((f) => f.id === id) ?? ENGRAVING_FONTS[0];
}

export function getProductImage(
  product: ProductDesign,
  material: MaterialId,
  lang: Language = 'vi'
): { src: string; isExactMaterial: boolean; actualMaterialLabel: string } {
  const exact = product.images[material];
  if (exact) {
    return {
      src: exact,
      isExactMaterial: true,
      actualMaterialLabel: lang === 'vi' ? MATERIALS[material].label : MATERIALS[material].labelEn,
    };
  }
  const fallbackMaterial: MaterialId = material === 'dong' ? 'ma-vang' : 'dong';
  const fallbackSrc =
    product.images[fallbackMaterial] ??
    product.images.dong ??
    product.images['ma-vang'] ??
    'images/products/mat-troi-vang-24k.jpg';

  return {
    src: fallbackSrc,
    isExactMaterial: false,
    actualMaterialLabel:
      lang === 'vi' ? MATERIALS[fallbackMaterial].label : MATERIALS[fallbackMaterial].labelEn,
  };
}

/**
 * Chuẩn hóa nội dung khắc đúng như bản xem trước trên website để xưởng laser
 * sao chép chính xác 100% (bao gồm tự động chuyển IN HOA cho font Be Vietnam Pro / Montserrat).
 */
export function formatEngravingForWorkshop(text: string, font: EngravingFontOption): string {
  const lines = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .slice(0, 3)
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter((line) => line.length > 0);
  const cleaned = lines.join('\n');
  if (!cleaned) return '';
  return font.caseRule === 'UPPERCASE' ? cleaned.toLocaleUpperCase('vi-VN') : cleaned;
}

export function getRecommendedFontSizePt(text: string): number {
  const lines = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const maxLineLen = lines.reduce((max, l) => Math.max(max, l.length), 0);
  if (lines.length >= 3 || maxLineLen > 24) return 14;
  if (lines.length === 2 || maxLineLen > 16) return 15;
  return 16;
}

export interface EngravingPrintAsset {
  setIndex: number;
  filename: string;
  dataUrl: string;
  blob: Blob;
  text: string;
  fontLabel: string;
  boxSizeLabel: string;
  fontSizeLabel: string;
}

/**
 * Tạo ảnh mẫu in khắc đế gỗ tỷ lệ chuẩn 10 x 3 cm (nền trắng, khung chữ nhật viền đen)
 * để đính kèm gửi về email xưởng in và cho phép tải về.
 */
export async function generateEngravingPrintAsset(
  set: OrderSet,
  setIndex: number
): Promise<EngravingPrintAsset | null> {
  if (set.woodBase !== 'khac' || set.engravingLater) return null;
  const font = getFontById(set.fontId);
  const formatted = formatEngravingForWorkshop(set.engravingText, font);
  if (!formatted) return null;

  const fontSizePt = getRecommendedFontSizePt(formatted);
  const boxSizeLabel = '10 x 3 cm';
  const fontSizeLabel = `Size chữ ${fontSizePt} (14–16)`;

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 460;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ô chữ nhật tỷ lệ chuẩn 10 x 3 cm (1000 x 300 px) — sạch hoàn toàn như mẫu in
  const boxX = 100;
  const boxY = 80;
  const boxW = 1000;
  const boxH = 300;
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 3;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  const lines = formatted.split('\n').slice(0, 3);
  const fontSize = lines.length >= 3 ? 44 : lines.length === 2 ? 56 : formatted.length > 22 ? 50 : 64;
  const lineHeight = Math.round(fontSize * 1.35);

  ctx.fillStyle = '#111111';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${fontSize}px ${font.fontFamily}`;

  const totalTextHeight = (lines.length - 1) * lineHeight;
  const startY = boxY + boxH / 2 - totalTextHeight / 2;
  lines.forEach((line, idx) => {
    ctx.fillText(line, boxX + boxW / 2, startY + idx * lineHeight, boxW - 60);
  });

  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return null;

  return {
    setIndex,
    filename: `khac-de-go-bo-${setIndex + 1}.png`,
    dataUrl,
    blob,
    text: formatted,
    fontLabel: `[${font.code}] ${font.name}`,
    boxSizeLabel,
    fontSizeLabel,
  };
}

/** Nội dung chính thức Trang 2 PDF — Văn Minh Đông Sơn */
export const STORY_CONTENT = {
  titleVi: 'Văn Minh Đông Sơn',
  titleEn: 'Dong Son Civilization',
  leadVi:
    'Văn minh Đông Sơn là một trong những nền văn minh tiền sử quan trọng nhất của dân tộc Việt Nam, tồn tại từ khoảng thế kỷ thứ VII đến thế kỷ thứ III trước Công Nguyên. Nổi bật với nghệ thuật chế tác đồ đồng tinh xảo, văn minh Đông Sơn không chỉ định hình bản sắc văn hóa dân tộc Việt mà còn để lại dấu ấn sâu đậm trong những nền văn hoá cổ đại khác của Đông Nam Á và Nam Á.',
  leadEn:
    'The Đông Sơn civilization is one of the most important prehistoric cultures of the Vietnamese people, existing from around the 7th to the 3rd century BCE. Distinguished by its exquisite bronze craftsmanship, the Đông Sơn civilization not only shaped the national cultural identity but also left a profound mark on other ancient cultures of Southeast Asia and East Asia.',
  heritageVi:
    'Sự trường tồn và ảnh hưởng của văn hóa Đông Sơn đến ngày nay chính là minh chứng cho sức mạnh văn hóa và tinh thần của dân tộc Việt, là niềm tự hào và cũng là trách nhiệm của mỗi người Việt trong việc gìn giữ và phát huy những giá trị đó.',
  heritageEn:
    'The enduring presence and influence of the Đông Sơn culture to this day stand as a testament to the cultural and spiritual strength of the Vietnamese people, serving as both a source of pride and a responsibility for every Vietnamese person to preserve and promote these values.',
  drumVi:
    'Trống đồng là biểu tượng tiêu biểu của văn hóa Đông Sơn, được sử dụng trong các nghi lễ tôn giáo và các sự kiện cộng đồng quan trọng. Với những hoa văn chạm khắc tinh xảo miêu tả cuộc sống sinh hoạt, thiên nhiên và các hoạt động tín ngưỡng, trống đồng ghi lại những giá trị văn hóa, xã hội của người Việt cổ.',
  drumEn:
    'The bronze drum is a quintessential symbol of the Đông Sơn culture, used in religious ceremonies and significant community events. Adorned with intricate carvings depicting daily life, nature, and religious activities, these drums capture the cultural and social values of the ancient Vietnamese people.',
};

/** Nội dung chính thức Trang 1 PDF — Khoi Minh CST & Khoi Minh Gifts */
export const ABOUT_BRAND_CONTENT = {
  viParagraphs: [
    'Khoi Minh CST - Công ty cổ phần Tư vấn, Dịch vụ và Thương mại Khởi Minh là nhà tư vấn thương hiệu, đồng thời cũng là nhà chế tác quà tặng cao cấp.',
    'Không chỉ quà tặng cao cấp, chúng tôi mang đến giải pháp quà tặng doanh nghiệp toàn diện với tư duy của những chuyên gia về thương hiệu và trải nghiệm khách hàng, một nhu cầu thiết yếu của những thương hiệu hàng đầu mà thị trường quà tặng hiện nay khó có thể cung ứng thoả đáng.',
    'Với tầm nhìn đó, Khoi Minh CST đã tạo dựng Khoi Minh Gifts, một thương hiệu chuyên biệt có thể cam kết thoả mãn những nhu cầu chuyên biệt nhất về quà tặng doanh nghiệp.',
  ],
  enParagraphs: [
    'Khoi Minh CST - Khoi Minh Consulting, Service, and Trading Joint Stock Company acts as a brand consultant, and also A Premium Gift Crafthouse.',
    "Not only premium gifts, we provide a comprehensive corporate gifts solution with the brand and customer experience professional's mindset, the essentials of top brands that have been unsatisfactorily supplied by the gift market.",
    'In such a vision, Khoi Minh CST constructed KHOI MINH GIFTS, a specialized brand that can commit to the most distinctive corporate gift needs.',
  ],
};

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

export interface OrderSet {
  id: string;
  productId: string;
  material: MaterialId;
  woodBase: WoodBaseId;
  fontId: EngravingFontId;
  engravingText: string;
  engravingLater: boolean;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  note: string;
}

export const DEFAULT_CUSTOMER_INFO: CustomerInfo = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  note: '',
};

let setCounter = 1;
export function createOrderSet(overrides?: Partial<Omit<OrderSet, 'id'>>): OrderSet {
  setCounter += 1;
  return {
    id: `set-${Date.now()}-${setCounter}`,
    productId: overrides?.productId ?? PRODUCTS[0].id,
    material: overrides?.material ?? 'ma-vang',
    woodBase: overrides?.woodBase ?? 'tron',
    fontId: overrides?.fontId ?? 'playfair',
    engravingText: overrides?.engravingText ?? '',
    engravingLater: overrides?.engravingLater ?? false,
  };
}

export function getSetPrice(set: Pick<OrderSet, 'material' | 'woodBase'>): number {
  return MATERIALS[set.material].unitPrice + WOOD_BASES[set.woodBase].extraPrice;
}

export function getEngravingGroupKey(set: OrderSet): string | null {
  if (set.woodBase !== 'khac') return null;
  if (set.engravingLater) return 'LATER';
  const font = getFontById(set.fontId);
  const formatted = formatEngravingForWorkshop(set.engravingText, font);
  if (!formatted) return `EMPTY::${set.id}`;
  return `TEXT::${font.id}::${formatted}`;
}

export function getUniqueEngravingCount(sets: OrderSet[]): number {
  const keys = new Set<string>();
  sets.forEach((set) => {
    const key = getEngravingGroupKey(set);
    if (key) keys.add(key);
  });
  return keys.size;
}

/**
 * Tính giá hiển thị cho từng bộ trong đơn hàng:
 * nếu nhiều bộ dùng cùng 1 nội dung khắc, phí khắc chỉ tính 1 lần ở bộ đầu tiên dùng nội dung đó.
 */
export function getSetPriceInOrder(
  set: OrderSet,
  index: number,
  allSets: OrderSet[]
): { total: number; engravingFee: number; isDuplicateEngraving: boolean } {
  const basePrice = MATERIALS[set.material].unitPrice;
  const key = getEngravingGroupKey(set);
  if (!key) {
    return { total: basePrice, engravingFee: 0, isDuplicateEngraving: false };
  }
  const firstIdx = allSets.findIndex((s) => getEngravingGroupKey(s) === key);
  if (firstIdx !== -1 && firstIdx < index) {
    return { total: basePrice, engravingFee: 0, isDuplicateEngraving: true };
  }
  const fee = WOOD_BASES.khac.extraPrice;
  return { total: basePrice + fee, engravingFee: fee, isDuplicateEngraving: false };
}

export function getFullSetSku(set: Pick<OrderSet, 'productId' | 'material' | 'woodBase'>): string {
  const prod = getProductById(set.productId);
  const mat = MATERIALS[set.material];
  const base = WOOD_BASES[set.woodBase];
  return `${prod.skuCode}-${mat.skuSuffix}-${base.skuSuffix}`;
}

export function getBookmarkPickSku(set: Pick<OrderSet, 'productId' | 'material'>): string {
  const prod = getProductById(set.productId);
  const mat = MATERIALS[set.material];
  return `${prod.skuCode}-${mat.skuSuffix}`;
}

export function computeOrderRef(sets: OrderSet[], customer?: CustomerInfo): string {
  const raw = [
    sets
      .map(
        (s) =>
          `${s.productId}:${s.material}:${s.woodBase}:${s.fontId}:${s.engravingText}:${
            s.engravingLater ? '1' : '0'
          }`
      )
      .join('|'),
    customer?.phone?.trim() ?? '',
    customer?.fullName?.trim() ?? '',
  ].join('::');
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const code = String(Math.abs(hash) % 10000).padStart(4, '0');
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `#KM-${mm}${dd}-${code}`;
}

export function isSetEngravingValid(set: OrderSet): boolean {
  if (set.woodBase === 'tron') return true;
  if (set.engravingLater) return true;
  return set.engravingText.trim().length > 0;
}

export interface BuiltOrderPayload {
  orderRef: string;
  message: string;
  deepLinkMessage: string;
  totalQty: number;
  totalProductPrice: number;
  totalEngravingPrice: number;
  totalPrice: number;
}

/**
 * Tạo phiếu đơn hàng bán lẻ 3 tầng tối ưu cho cả Khách hàng kiểm tra và Xưởng Khoi Minh Gifts:
 * - Thông tin người nhận (Họ tên, SĐT, Email, Địa chỉ, Ghi chú)
 * - Tầng 1: Tổng hợp kho theo mã Bookmark SKU (đồng/vàng, số khắc/trơn)
 * - Tầng 2: Danh sách khắc laser gom các bộ giống nhau, chuẩn hóa font [F01..F10] & IN HOA đúng xem trước
 * - Tầng 3: Bóc tách giá sản phẩm + phụ phí khắc đế gỗ
 */
export function buildSellerReadyOrderMessage(
  sets: OrderSet[],
  customer: CustomerInfo,
  lang: Language = 'vi'
): BuiltOrderPayload {
  const orderRef = computeOrderRef(sets, customer);
  const totalQty = sets.length;
  const totalProductPrice = sets.reduce(
    (sum, s) => sum + MATERIALS[s.material].unitPrice,
    0
  );
  const totalEngravedQty = sets.filter((s) => s.woodBase === 'khac').length;
  const uniqueEngravingCount = getUniqueEngravingCount(sets);
  const totalEngravingPrice = uniqueEngravingCount * WOOD_BASES.khac.extraPrice;
  const totalPrice = totalProductPrice + totalEngravingPrice;

  // Tầng 1: Tổng hợp kho theo Bookmark SKU (productId + material)
  const stockMap = new Map<
    string,
    {
      pickSku: string;
      prodName: string;
      matLabel: string;
      engravedCount: number;
      plainCount: number;
      total: number;
    }
  >();

  sets.forEach((set) => {
    const pickSku = getBookmarkPickSku(set);
    const prod = getProductById(set.productId);
    const mat = MATERIALS[set.material];
    const existing = stockMap.get(pickSku) ?? {
      pickSku,
      prodName: prod.name,
      matLabel: mat.shortLabel,
      engravedCount: 0,
      plainCount: 0,
      total: 0,
    };
    if (set.woodBase === 'khac') {
      existing.engravedCount += 1;
    } else {
      existing.plainCount += 1;
    }
    existing.total += 1;
    stockMap.set(pickSku, existing);
  });

  const isEn = lang === 'en';
  const out: string[] = [];

  out.push(
    isEn
      ? `[KHOI MINH GIFTS ORDER · ${orderRef}]`
      : `[ĐƠN HÀNG KHOI MINH GIFTS · ${orderRef}]`
  );
  out.push(
    isEn
      ? `${CONTACT_CONFIG.collectionNameEn} (${CONTACT_CONFIG.collectionCode}) | Retail Order`
      : `BST ${CONTACT_CONFIG.collectionNameVi} (${CONTACT_CONFIG.collectionCode}) | Khách lẻ`
  );

  const hasCustomerFields =
    customer.fullName.trim() ||
    customer.phone.trim() ||
    customer.email.trim() ||
    customer.address.trim() ||
    customer.note.trim();

  if (hasCustomerFields) {
    out.push('');
    out.push(isEn ? '▸ CUSTOMER DETAILS:' : '▸ THÔNG TIN KHÁCH HÀNG:');
    if (customer.fullName.trim()) {
      out.push(`${isEn ? 'Name' : 'Họ tên'}: ${customer.fullName.trim()}`);
    }
    if (customer.phone.trim()) {
      out.push(`${isEn ? 'Phone' : 'SĐT'}: ${customer.phone.trim()}`);
    }
    if (customer.email.trim()) {
      out.push(`Email: ${customer.email.trim()}`);
    }
    if (customer.address.trim()) {
      out.push(`${isEn ? 'Address' : 'Địa chỉ'}: ${customer.address.trim()}`);
    }
    if (customer.note.trim()) {
      out.push(`${isEn ? 'Note' : 'Ghi chú'}: ${customer.note.trim()}`);
    }
  }

  out.push('');
  out.push(
    isEn ? `▸ WAREHOUSE PICK (${totalQty} sets):` : `▸ TỔNG HỢP KHO (${totalQty} bộ):`
  );
  stockMap.forEach((entry) => {
    const splitParts: string[] = [];
    if (entry.engravedCount > 0) {
      splitParts.push(`${entry.engravedCount} ${isEn ? 'engraved' : 'khắc'}`);
    }
    if (entry.plainCount > 0) {
      splitParts.push(`${entry.plainCount} ${isEn ? 'plain' : 'trơn'}`);
    }
    out.push(
      `• ×${entry.total} [${entry.pickSku}] ${entry.prodName} – ${entry.matLabel} (${splitParts.join(', ')})`
    );
  });

  if (totalEngravedQty > 0) {
    out.push('');
    out.push(
      isEn
        ? `▸ LASER ENGRAVING LIST (${totalEngravedQty} bases):`
        : `▸ DANH SÁCH KHẮC LASER (${totalEngravedQty} đế):`
    );

    const engravedGroups = new Map<
      string,
      {
        pickSku: string;
        font: EngravingFontOption;
        formatted: string;
        isLater: boolean;
        count: number;
      }
    >();

    sets.forEach((set) => {
      if (set.woodBase !== 'khac') return;
      const pickSku = getBookmarkPickSku(set);
      const font = getFontById(set.fontId);
      const formatted = set.engravingLater
        ? ''
        : formatEngravingForWorkshop(set.engravingText, font);
      const isLater = set.engravingLater || !formatted;
      const key = isLater
        ? `${pickSku}::LATER`
        : `${pickSku}::${font.code}::${formatted}`;

      const existing = engravedGroups.get(key) ?? {
        pickSku,
        font,
        formatted,
        isLater,
        count: 0,
      };
      existing.count += 1;
      engravedGroups.set(key, existing);
    });

    let groupIdx = 1;
    engravedGroups.forEach((group) => {
      const qtyBadge = group.count > 1 ? ` ×${group.count}` : '';
      if (group.isLater) {
        out.push(
          `${groupIdx}. [${group.pickSku}]${qtyBadge} ${
            isEn ? (group.count > 1 ? 'bases' : 'base') : 'đế'
          } — ${
            isEn ? 'Send engraving text via chat' : 'Gửi nội dung khắc sau qua chat'
          }`
        );
      } else {
        const caseNote = isEn
          ? group.font.styleNoteEn
            ? ` (${group.font.styleNoteEn})`
            : ''
          : group.font.styleNoteVi
            ? ` (${group.font.styleNoteVi})`
            : '';
        const fontSizePt = getRecommendedFontSizePt(group.formatted);
        out.push(
          `${groupIdx}. [${group.pickSku}] | [${group.font.code}] ${group.font.name}${caseNote}${qtyBadge} | Khung 10×3cm · Size chữ ${fontSizePt}: "${group.formatted.replace(/\n/g, ' / ')}"`
        );
      }
      groupIdx += 1;
    });
  }

  out.push('');
  out.push('────────────────────────');
  const dongCount = sets.filter((s) => s.material === 'dong').length;
  const vangCount = sets.filter((s) => s.material === 'ma-vang').length;
  const breakdown: string[] = [];
  if (vangCount > 0) {
    breakdown.push(
      `${vangCount}× ${isEn ? '24K Gold' : 'Vàng 24K'}: ${formatVND(
        vangCount * MATERIALS['ma-vang'].unitPrice
      )}`
    );
  }
  if (dongCount > 0) {
    breakdown.push(
      `${dongCount}× ${isEn ? 'Brass' : 'Đồng'}: ${formatVND(
        dongCount * MATERIALS.dong.unitPrice
      )}`
    );
  }
  if (totalEngravedQty > 0) {
    const sharedNote =
      totalEngravedQty > uniqueEngravingCount
        ? isEn
          ? ` (across ${totalEngravedQty} bases)`
          : ` (cho ${totalEngravedQty} đế)`
        : '';
    breakdown.push(
      `${uniqueEngravingCount}× ${isEn ? 'Engraving' : 'Nội dung khắc'}${sharedNote}: ${formatVND(
        totalEngravingPrice
      )}`
    );
  }

  out.push(
    `${isEn ? 'Estimated Total' : 'Tạm tính'}: ${formatVND(totalPrice)} (${breakdown.join(' | ')})`
  );
  out.push('────────────────────────');
  out.push(
    isEn
      ? 'Please confirm stock & engraving layout with me. Thank you!'
      : 'Nhờ Khoi Minh Gifts xác nhận tồn kho & chốt đơn giúp mình nhé!'
  );

  const message = out.join('\n');

  // Nếu tin nhắn dài, tạo bản rút gọn an toàn cho query ?text= trong khi vẫn sao chép bản ĐẦY ĐỦ vào clipboard
  let deepLinkMessage = message;
  if (encodeURIComponent(message).length > 1450) {
    deepLinkMessage = [
      isEn
        ? `[KHOI MINH GIFTS ORDER · ${orderRef}] (${totalQty} sets · Est. ${formatVND(totalPrice)})`
        : `[ĐƠN HÀNG KHOI MINH GIFTS · ${orderRef}] (${totalQty} bộ · Tạm tính ${formatVND(totalPrice)})`,
      customer.fullName.trim()
        ? `${isEn ? 'Customer' : 'Khách'}: ${customer.fullName.trim()} (${customer.phone.trim()})`
        : '',
      isEn
        ? 'Full order & engraving list copied to clipboard — please paste here!'
        : 'Chi tiết đơn & danh sách khắc đã được sao chép — mình dán ngay dưới đây nhé!',
    ]
      .filter(Boolean)
      .join('\n');
  }

  return {
    orderRef,
    message,
    deepLinkMessage,
    totalQty,
    totalProductPrice,
    totalEngravingPrice,
    totalPrice,
  };
}

export async function submitOrderToEmail(
  payload: BuiltOrderPayload,
  customer: CustomerInfo,
  lang: Language,
  printAssets: EngravingPrintAsset[] = []
): Promise<{ ok: boolean; mode: 'sent' | 'fallback' }> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 12000);

  try {
    const engravingSpecSummary =
      printAssets.length > 0
        ? printAssets
            .map(
              (a) =>
                `Bộ #${a.setIndex + 1}: "${a.text.replace(/\n/g, ' / ')}" | Font ${a.fontLabel} | Khung ${a.boxSizeLabel} | ${a.fontSizeLabel}`
            )
            .join('\n')
        : 'Đế gỗ trơn hoặc gửi chữ sau qua chat';

    if (printAssets.length > 0) {
      const formEndpoint = CONTACT_CONFIG.orderEmailEndpoint.replace('/ajax/', '/');
      const formData = new FormData();
      formData.append(
        '_subject',
        `[Khoi Minh Gifts] Đơn đặt hàng ${payload.orderRef} - ${customer.fullName.trim()}`
      );
      formData.append('_template', 'table');
      formData.append('_captcha', 'false');
      formData.append('ma_don_hang', payload.orderRef);
      formData.append('ngon_ngu', lang === 'vi' ? 'Tiếng Việt' : 'English');
      formData.append('khach_hang', customer.fullName.trim());
      formData.append('so_dien_thoai', customer.phone.trim());
      formData.append('email', customer.email.trim() || '(Không cung cấp)');
      formData.append('dia_chi', customer.address.trim() || '(Chưa nhập)');
      formData.append('ghi_chu', customer.note.trim() || '(Không có)');
      formData.append('tong_so_luong', `${payload.totalQty} bộ`);
      formData.append('tam_tinh', formatVND(payload.totalPrice));
      formData.append('thong_so_khac_de_go', engravingSpecSummary);
      formData.append('chi_tiet_don_hang', payload.message);
      if (customer.email.trim()) {
        formData.append('_replyto', customer.email.trim());
      }
      printAssets.forEach((asset) => {
        formData.append('attachment', asset.blob, asset.filename);
      });

      const res = await fetch(formEndpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
        signal: controller.signal,
      });

      if (res.ok) {
        return { ok: true, mode: 'sent' };
      }
    }

    const body: Record<string, string> = {
      _subject: `[Khoi Minh Gifts] Đơn đặt hàng ${payload.orderRef} - ${customer.fullName.trim()}`,
      _template: 'table',
      _captcha: 'false',
      ma_don_hang: payload.orderRef,
      ngon_ngu: lang === 'vi' ? 'Tiếng Việt' : 'English',
      khach_hang: customer.fullName.trim(),
      so_dien_thoai: customer.phone.trim(),
      email: customer.email.trim() || '(Không cung cấp)',
      dia_chi: customer.address.trim() || '(Chưa nhập)',
      ghi_chu: customer.note.trim() || '(Không có)',
      tong_so_luong: `${payload.totalQty} bộ`,
      tam_tinh: formatVND(payload.totalPrice),
      thong_so_khac_de_go: engravingSpecSummary,
      chi_tiet_don_hang: payload.message,
    };

    if (customer.email.trim()) {
      body._replyto = customer.email.trim();
    }

    const res = await fetch(CONTACT_CONFIG.orderEmailEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      return { ok: false, mode: 'fallback' };
    }

    const data = (await res.json().catch(() => null)) as { success?: boolean | string } | null;
    if (data && (data.success === true || data.success === 'true')) {
      return { ok: true, mode: 'sent' };
    }
    return { ok: true, mode: 'sent' };
  } catch {
    return { ok: false, mode: 'fallback' };
  } finally {
    window.clearTimeout(timer);
  }
}

export function buildMailtoHref(payload: BuiltOrderPayload, customer: CustomerInfo): string {
  const subject = encodeURIComponent(
    `[Khoi Minh Gifts] Đơn đặt hàng ${payload.orderRef} - ${customer.fullName.trim()}`
  );
  const body = encodeURIComponent(payload.message);
  return `mailto:${CONTACT_CONFIG.email}?subject=${subject}&body=${body}`;
}

export async function copyTextReliably(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to execCommand
    }
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
