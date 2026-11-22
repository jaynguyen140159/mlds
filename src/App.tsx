import { useEffect, useState } from 'react';
import { BrochureBook, type BrochurePage } from './components/BrochureBook';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { InsideSpread } from './components/InsideSpread';
import { Navbar } from './components/Navbar';
import { ProductConfigurator } from './components/ProductConfigurator';
import {
  createOrderSet,
  DEFAULT_CUSTOMER_INFO,
  PRODUCTS,
  type CustomerInfo,
  type Language,
  type MaterialId,
  type OrderSet,
} from './data/catalog';

export function App() {
  const [lang, setLang] = useState<Language>('vi');
  const [currentPage, setCurrentPage] = useState<BrochurePage>(0);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [orderSets, setOrderSets] = useState<OrderSet[]>(() => [
    createOrderSet({
      productId: PRODUCTS[0].id,
      material: 'ma-vang',
      woodBase: 'tron',
    }),
  ]);
  const [activeSetIndex, setActiveSetIndex] = useState<number>(0);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(DEFAULT_CUSTOMER_INFO);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Nạp trước bộ ảnh nền & minh họa cốt lõi để lật trang 3D lần đầu mượt không khựng
  useEffect(() => {
    const preloadSources = [
      'images/brand/hero-drum-art.png',
      'images/brand/paper-texture.jpg',
      'images/brand/pattern-drum-teal.png',
      'images/brand/title-van-minh-dong-son.png',
      'images/brand/illust-dancers.png',
      'images/brand/illust-chim-lac.png',
      'images/brand/illust-divider.png',
      'images/brand/illust-drum-line.png',
      'images/brand/logo-stacked.png',
      'images/brand/qr-khoiminh.png',
    ];
    preloadSources.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const activeSet = orderSets[Math.min(activeSetIndex, orderSets.length - 1)] ?? orderSets[0];

  const handleSelectDesignFromSpread = (productId: string, material: MaterialId) => {
    setOrderSets((prev) =>
      prev.map((item, idx) => (idx === activeSetIndex ? { ...item, productId, material } : item))
    );
    setCheckoutStep(1);
    setCurrentPage(2);
  };

  const handleSetTotalQuantity = (rawQty: number) => {
    const qty = Math.min(20, Math.max(1, rawQty));
    setOrderSets((prev) => {
      if (qty === prev.length) return prev;
      if (qty < prev.length) {
        return prev.slice(0, qty);
      }
      const active = prev[Math.min(activeSetIndex, prev.length - 1)] ?? prev[0];
      const last = prev[prev.length - 1] ?? active;
      const lastProdIdx = Math.max(
        0,
        PRODUCTS.findIndex((p) => p.id === last.productId)
      );
      const additions = Array.from({ length: qty - prev.length }, (_, offset) => {
        const nextProd = PRODUCTS[(lastProdIdx + offset + 1) % PRODUCTS.length];
        return createOrderSet({
          productId: nextProd.id,
          material: active.material,
          woodBase: 'tron',
          fontId: active.fontId,
        });
      });
      return [...prev, ...additions];
    });
    setActiveSetIndex((idx) => Math.min(idx, qty - 1));
  };

  const handleAddOneAndSelect = () => {
    if (orderSets.length >= 20) return;
    const nextIndex = orderSets.length;
    const active = orderSets[Math.min(activeSetIndex, orderSets.length - 1)] ?? orderSets[0];
    const last = orderSets[orderSets.length - 1] ?? active;
    const lastProdIdx = Math.max(
      0,
      PRODUCTS.findIndex((p) => p.id === last.productId)
    );
    const nextProd = PRODUCTS[(lastProdIdx + 1) % PRODUCTS.length];

    setOrderSets((prev) => {
      if (prev.length >= 20) return prev;
      return [
        ...prev,
        createOrderSet({
          productId: nextProd.id,
          material: active.material,
          woodBase: 'tron',
          fontId: active.fontId,
        }),
      ];
    });
    setActiveSetIndex(nextIndex);
  };

  const handleUpdateActiveSet = (patch: Partial<Omit<OrderSet, 'id'>>) => {
    setOrderSets((prev) =>
      prev.map((item, idx) => (idx === activeSetIndex ? { ...item, ...patch } : item))
    );
  };

  const handleApplyActiveToAll = () => {
    setOrderSets((prev) => {
      const source = prev[Math.min(activeSetIndex, prev.length - 1)];
      if (!source) return prev;
      return prev.map((item) => ({
        ...item,
        productId: source.productId,
        material: source.material,
        woodBase: source.woodBase,
        fontId: source.fontId,
        engravingText: source.engravingText,
        engravingLater: source.engravingLater,
      }));
    });
  };

  const handleRemoveSet = (index: number) => {
    if (orderSets.length <= 1) return;
    setOrderSets((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, idx) => idx !== index);
    });
    setActiveSetIndex((curr) => {
      if (curr > index) return curr - 1;
      return Math.min(curr, Math.max(0, orderSets.length - 2));
    });
  };

  const handleEditSetFromStep2 = (index: number) => {
    setActiveSetIndex(Math.min(index, Math.max(0, orderSets.length - 1)));
    setCheckoutStep(1);
    setCurrentPage(2);
  };

  const handleUpdateCustomer = (patch: Partial<CustomerInfo>) => {
    setCustomerInfo((prev) => ({ ...prev, ...patch }));
  };

  const handleResetOrder = () => {
    setOrderSets([
      createOrderSet({
        productId: PRODUCTS[0].id,
        material: 'ma-vang',
        woodBase: 'tron',
      }),
    ]);
    setActiveSetIndex(0);
    setCustomerInfo(DEFAULT_CUSTOMER_INFO);
    setCheckoutStep(1);
  };

  const renderPage = (page: BrochurePage) => {
    switch (page) {
      case 0:
        return <Hero lang={lang} onOpenBrochure={() => setCurrentPage(1)} />;
      case 1:
        return (
          <InsideSpread
            lang={lang}
            initialProductId={activeSet.productId}
            initialMaterial={activeSet.material}
            onSelectDesignForOrder={handleSelectDesignFromSpread}
          />
        );
      case 2:
        return (
          <ProductConfigurator
            lang={lang}
            step={checkoutStep}
            onChangeStep={setCheckoutStep}
            orderSets={orderSets}
            activeSetIndex={activeSetIndex}
            onSelectSetIndex={setActiveSetIndex}
            onSetTotalQuantity={handleSetTotalQuantity}
            onAddOneAndSelect={handleAddOneAndSelect}
            onUpdateActiveSet={handleUpdateActiveSet}
            onApplyActiveToAll={handleApplyActiveToAll}
            onRemoveSet={handleRemoveSet}
            onEditSetFromStep2={handleEditSetFromStep2}
            customerInfo={customerInfo}
            onUpdateCustomer={handleUpdateCustomer}
            onResetOrder={handleResetOrder}
            onContactCorporate={() => setCurrentPage(3)}
          />
        );
      case 3:
        return <Footer lang={lang} onBackToCover={() => setCurrentPage(0)} />;
    }
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#E8E5DB] text-[#2B2823]">
      <Navbar
        currentPage={currentPage}
        onNavigatePage={setCurrentPage}
        savedSetCount={orderSets.length > 1 ? orderSets.length : 0}
        lang={lang}
        onChangeLang={setLang}
      />
      <main className="flex min-h-0 flex-1 flex-col">
        <BrochureBook
          currentPage={currentPage}
          onChangePage={setCurrentPage}
          lang={lang}
          totalOrderSets={orderSets.length}
          renderPage={renderPage}
        />
      </main>
    </div>
  );
}

export default App;
