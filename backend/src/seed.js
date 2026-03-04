require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Page = require('./models/Page');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/toka';

const categories = [
  { nameAr: 'توك شعر', nameEn: 'Hair Clips', slug: 'hair-clips' },
  { nameAr: 'أساور', nameEn: 'Bracelets', slug: 'bracelets' },
  { nameAr: 'عقود', nameEn: 'Necklaces', slug: 'necklaces' },
  { nameAr: 'حلقان', nameEn: 'Earrings', slug: 'earrings' },
];

const seedProducts = (categoryMap) => [
  {
    nameAr: 'توكة شعر لؤلؤية',
    nameEn: 'Pearl Hair Clip Set',
    descriptionAr: 'مجموعة من توك الشعر المزينة باللؤلؤ',
    descriptionEn: 'Set of pearl-embellished hair clips',
    price: 65,
    images: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=800'],
    categoryId: categoryMap['hair-clips'],
    stock: 20,
    isFeatured: true,
    soldCount: 45,
  },
  {
    nameAr: 'توكة شعر ذهبية',
    nameEn: 'Gold Vine Hair Clip',
    descriptionAr: 'توكة شعر بتصميم أوراق الشجر الذهبية',
    descriptionEn: 'Gold vine design hair clip',
    price: 85,
    images: ['https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&q=80&w=800'],
    categoryId: categoryMap['hair-clips'],
    stock: 12,
    isFeatured: false,
    soldCount: 18,
  },
  {
    nameAr: 'مشبك شعر كريستال',
    nameEn: 'Crystal Barrette',
    descriptionAr: 'مشبك شعر مرصع بالكريستال اللامع',
    descriptionEn: 'Sparkling crystal-encrusted barrette',
    price: 110,
    images: ['https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?auto=format&fit=crop&q=80&w=800'],
    categoryId: categoryMap['hair-clips'],
    stock: 8,
    isFeatured: true,
    soldCount: 22,
  },
  {
    nameAr: 'سوار ماسي رقيق',
    nameEn: 'Delicate Diamond Bracelet',
    descriptionAr: 'سوار رقيق مرصع بقطع الماس الصغيرة',
    descriptionEn: 'Delicate bracelet studded with small diamonds',
    price: 350,
    images: ['https://images.unsplash.com/photo-1471286174890-9c112ac6f1ad?auto=format&fit=crop&q=80&w=800'],
    categoryId: categoryMap['bracelets'],
    stock: 5,
    isFeatured: true,
    soldCount: 12,
  },
  {
    nameAr: 'سوار ذهب وردي',
    nameEn: 'Rose Gold Chain Bracelet',
    descriptionAr: 'سوار بتصميم سلسلة من الذهب الوردي',
    descriptionEn: 'Chain link bracelet in rose gold',
    price: 180,
    images: ['https://images.unsplash.com/photo-1615361200141-f45040f367be?auto=format&fit=crop&q=80&w=800'],
    categoryId: categoryMap['bracelets'],
    stock: 15,
    isFeatured: false,
    soldCount: 30,
  },
  {
    nameAr: 'سوار تنس كلاسيكي',
    nameEn: 'Classic Tennis Bracelet',
    descriptionAr: 'سوار تنس كلاسيكي مرصع بالزركون',
    descriptionEn: 'Classic tennis bracelet with cubic zirconia',
    price: 220,
    images: ['https://images.unsplash.com/photo-1599643478524-fb524b0eb1a7?auto=format&fit=crop&q=80&w=800'],
    categoryId: categoryMap['bracelets'],
    stock: 10,
    isFeatured: true,
    soldCount: 28,
  },
  {
    nameAr: 'سوار لؤلؤ المياه العذبة',
    nameEn: 'Freshwater Pearl Bracelet',
    descriptionAr: 'سوار أنيق من لآلئ المياه العذبة',
    descriptionEn: 'Elegant freshwater pearl bracelet',
    price: 150,
    images: ['https://plus.unsplash.com/premium_photo-1681276170753-41e97dc2cb52?auto=format&fit=crop&q=80&w=800'],
    categoryId: categoryMap['bracelets'],
    stock: 18,
    isFeatured: false,
    soldCount: 15,
  },
  {
    nameAr: 'عقد ذهبي بطبقات',
    nameEn: 'Layered Gold Necklace',
    descriptionAr: 'عقد عصري من طبقات الذهب',
    descriptionEn: 'Modern layered gold necklace',
    price: 250,
    images: ['https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800'],
    categoryId: categoryMap['necklaces'],
    stock: 12,
    isFeatured: true,
    soldCount: 35,
  },
  {
    nameAr: 'عقد بقلادة فيروز',
    nameEn: 'Turquoise Pendant Necklace',
    descriptionAr: 'عقد فضي مع قلادة من حجر الفيروز',
    descriptionEn: 'Silver necklace with a turquoise stone pendant',
    price: 140,
    images: ['https://plus.unsplash.com/premium_photo-1661645851221-3e4b4131df33?auto=format&fit=crop&q=80&w=800'],
    categoryId: categoryMap['necklaces'],
    stock: 14,
    isFeatured: false,
    soldCount: 20,
  },
  {
    nameAr: 'عقد شوكر كريستال',
    nameEn: 'Crystal Choker Necklace',
    descriptionAr: 'شوكر لامع مرصع بالكريستال للسهرات',
    descriptionEn: 'Sparkling crystal choker for evening wear',
    price: 180,
    images: ['https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=800'],
    categoryId: categoryMap['necklaces'],
    stock: 8,
    isFeatured: true,
    soldCount: 40,
  },
  {
    nameAr: 'عقد ماسي متدلي',
    nameEn: 'Diamond Drop Necklace',
    descriptionAr: 'عقد ذهب أبيض مع قطعة ماس متدلية',
    descriptionEn: 'White gold necklace with a drop diamond',
    price: 450,
    images: ['https://images.unsplash.com/photo-1599643478514-4fb48107954e?auto=format&fit=crop&q=80&w=800'],
    categoryId: categoryMap['necklaces'],
    stock: 4,
    isFeatured: false,
    soldCount: 6,
  },
  {
    nameAr: 'حلقان لؤلؤ بسيطة',
    nameEn: 'Minimalist Pearl Studs',
    descriptionAr: 'حلقان لؤلؤ دائرية كلاسيكية',
    descriptionEn: 'Classic round pearl stud earrings',
    price: 90,
    images: ['https://images.unsplash.com/photo-1535632787350-4e68ef0ac189?auto=format&fit=crop&q=80&w=800'],
    categoryId: categoryMap['earrings'],
    stock: 25,
    isFeatured: true,
    soldCount: 50,
  },
  {
    nameAr: 'حلقان دائرية ذهبية',
    nameEn: 'Gold Hoop Earrings',
    descriptionAr: 'حلقان دائرية كبيرة بلمعة ذهبية خاطفة',
    descriptionEn: 'Large gold hoop earrings with high shine',
    price: 120,
    images: ['https://images.unsplash.com/photo-1635848521021-d7211fa9cbab?auto=format&fit=crop&q=80&w=800'],
    categoryId: categoryMap['earrings'],
    stock: 30,
    isFeatured: false,
    soldCount: 42,
  },
  {
    nameAr: 'حلق الثريا الماسي',
    nameEn: 'Diamond Chandelier Earrings',
    descriptionAr: 'حلق طويل متدلي من فصوص الماس للمناسبات',
    descriptionEn: 'Long dangling diamond earrings for special occasions',
    price: 320,
    images: ['https://plus.unsplash.com/premium_photo-1681276169970-877473fe73e3?auto=format&fit=crop&q=80&w=800'],
    categoryId: categoryMap['earrings'],
    stock: 6,
    isFeatured: true,
    soldCount: 14,
  },
  {
    nameAr: 'حلق زمرد أنيق',
    nameEn: 'Emerald Drop Earrings',
    descriptionAr: 'حلق أنيق بحجر الزمرد الأخضر',
    descriptionEn: 'Elegant earrings featuring green emerald stones',
    price: 280,
    images: ['https://plus.unsplash.com/premium_photo-1681276170683-7c852445e998?auto=format&fit=crop&q=80&w=800'],
    categoryId: categoryMap['earrings'],
    stock: 7,
    isFeatured: false,
    soldCount: 9,
  }
];

const aboutPage = {
  slug: 'about',
  titleAr: 'عن توكا',
  titleEn: 'About TOKA',
  contentAr:
    'توكا هي علامة تجارية مصرية متخصصة في صناعة الإكسسوارات اليدوية. نصنع كل قطعة بحب واهتمام بالتفاصيل لنقدم لكِ إكسسوارات فريدة تعكس أنوثتك وجمالك. منتجاتنا مصنوعة من خامات عالية الجودة وكل قطعة هي عمل فني فريد.',
  contentEn:
    'TOKA is an Egyptian brand specializing in handmade accessories. We craft each piece with love and attention to detail to bring you unique accessories that reflect your femininity and beauty. Our products are made from high-quality materials, and every piece is a unique work of art.',
  images: [],
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Page.deleteMany({});
    console.log('Cleared existing data');

    // Seed categories
    const createdCategories = await Category.insertMany(categories);
    const categoryMap = {};
    createdCategories.forEach((c) => {
      categoryMap[c.slug] = c._id;
    });
    console.log(`✅ Seeded ${createdCategories.length} categories`);

    // Seed products
    const products = seedProducts(categoryMap);
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Seeded ${createdProducts.length} products`);

    // Seed about page
    await Page.create(aboutPage);
    console.log('✅ Seeded About page');

    console.log('\n🎉 Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
