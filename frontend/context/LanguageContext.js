import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('toka-lang');
    if (saved) setLang(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('toka-lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'ar' : 'en'));

  // Helper: get text with fallback
  const t = (textAr, textEn) => {
    if (lang === 'ar') return textAr || textEn || '';
    return textEn || textAr || '';
  };

  // UI translations
  const translations = {
    en: {
      home: 'Home',
      products: 'Products',
      about: 'About',
      cart: 'Cart',
      search: 'Search products...',
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      checkout: 'Checkout',
      orderViaWhatsApp: 'Order via WhatsApp',
      featuredProducts: 'Featured Products',
      bestSellers: 'Best Sellers',
      allProducts: 'All Products',
      categories: 'Categories',
      allCategories: 'All Categories',
      price: 'Price',
      egp: 'EGP',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      total: 'Total',
      subtotal: 'Subtotal',
      yourCart: 'Your Cart',
      emptyCart: 'Your cart is empty',
      continueShopping: 'Continue Shopping',
      proceedToCheckout: 'Proceed to Checkout',
      name: 'Name',
      phone: 'Phone',
      address: 'Address',
      email: 'Email (optional)',
      notes: 'Notes (optional)',
      placeOrder: 'Place Order',
      cashOnDelivery: 'Cash on Delivery',
      orderSuccess: 'Order Placed Successfully!',
      orderSuccessMsg: 'Thank you for your order! We will contact you soon.',
      backToHome: 'Back to Home',
      qty: 'Qty',
      remove: 'Remove',
      noProducts: 'No products found',
      loading: 'Loading...',
      viewAll: 'View All',
      shopNow: 'Shop Now',
      heroTitle: 'Tooka — Handmade Headbands',
      heroSubtitle: 'Premium Quality | Unique Designs | For Babies, Girls & Women | Made with Care | Shipping Inside & Outside Egypt',
      adminLogin: 'Admin Login',
      username: 'Username',
      password: 'Password',
      login: 'Login',
      dashboard: 'Dashboard',
      logout: 'Logout',
      totalOrders: 'Total Orders',
      ordersToday: 'Orders Today',
      totalProducts: 'Total Products',
      estimatedRevenue: 'Est. Revenue',
      sendDailyReport: 'Send Daily Report',
      orderStatus: 'Status',
      pending: 'Pending',
      shipped: 'Shipped',
      delivered: 'Delivered',
      canceled: 'Canceled',
      actions: 'Actions',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      addProduct: 'Add Product',
      addCategory: 'Add Category',
      editAbout: 'Edit About Page',
      manageProducts: 'Manage Products',
      manageCategories: 'Manage Categories',
      manageOrders: 'Manage Orders',
      pages: 'Pages',
      featured: 'Featured',
      stock: 'Stock',
      category: 'Category',
      images: 'Images',
      description: 'Description',
      items: 'Items',
      date: 'Date',
      customer: 'Customer',
    },
    ar: {
      home: 'الرئيسية',
      products: 'المنتجات',
      about: 'عن توكا',
      cart: 'السلة',
      search: 'ابحثي عن منتج...',
      addToCart: 'أضف للسلة',
      buyNow: 'اشتري الآن',
      checkout: 'إتمام الطلب',
      orderViaWhatsApp: 'اطلبي عبر واتساب',
      featuredProducts: 'منتجات مميزة',
      bestSellers: 'الأكثر مبيعاً',
      allProducts: 'كل المنتجات',
      categories: 'الأقسام',
      allCategories: 'كل الأقسام',
      price: 'السعر',
      egp: 'ج.م',
      inStock: 'متوفر',
      outOfStock: 'نفذ',
      total: 'الإجمالي',
      subtotal: 'المجموع',
      yourCart: 'سلة التسوق',
      emptyCart: 'سلتك فارغة',
      continueShopping: 'تابعي التسوق',
      proceedToCheckout: 'إتمام الطلب',
      name: 'الاسم',
      phone: 'الهاتف',
      address: 'العنوان',
      email: 'البريد الإلكتروني (اختياري)',
      notes: 'ملاحظات (اختياري)',
      placeOrder: 'تأكيد الطلب',
      cashOnDelivery: 'الدفع عند الاستلام',
      orderSuccess: 'تم الطلب بنجاح!',
      orderSuccessMsg: 'شكراً لطلبك! سنتواصل معك قريباً.',
      backToHome: 'العودة للرئيسية',
      qty: 'الكمية',
      remove: 'حذف',
      noProducts: 'لا توجد منتجات',
      loading: 'جاري التحميل...',
      viewAll: 'عرض الكل',
      shopNow: 'تسوقي الآن',
      heroTitle: 'توكا — توك يدوية',
      heroSubtitle: 'جودة عالية | تصاميم فريدة | للبنات والسيدات | صناعة يدوية بعناية | شحن داخل وخارج مصر',
      adminLogin: 'تسجيل دخول الأدمن',
      username: 'اسم المستخدم',
      password: 'كلمة المرور',
      login: 'دخول',
      dashboard: 'لوحة التحكم',
      logout: 'خروج',
      totalOrders: 'إجمالي الطلبات',
      ordersToday: 'طلبات اليوم',
      totalProducts: 'إجمالي المنتجات',
      estimatedRevenue: 'الإيرادات المتوقعة',
      sendDailyReport: 'إرسال التقرير اليومي',
      orderStatus: 'الحالة',
      pending: 'قيد الانتظار',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      canceled: 'ملغي',
      actions: 'إجراءات',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      create: 'إنشاء',
      addProduct: 'إضافة منتج',
      addCategory: 'إضافة قسم',
      editAbout: 'تعديل صفحة عن',
      manageProducts: 'إدارة المنتجات',
      manageCategories: 'إدارة الأقسام',
      manageOrders: 'إدارة الطلبات',
      pages: 'الصفحات',
      featured: 'مميز',
      stock: 'المخزون',
      category: 'القسم',
      images: 'صور',
      description: 'الوصف',
      items: 'العناصر',
      date: 'التاريخ',
      customer: 'العميل',
    },
  };

  const ui = translations[lang] || translations.en;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, ui }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
