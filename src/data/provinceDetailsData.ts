import { provincesData, type ProvinceId } from './provincesData.js';

export interface ProvinceContent {
  overview: {
    description: string;
    stats: Array<{ label: string; value: string }>;
  };
  history: Array<{ year: string; event: string }>;
  places: Array<{ name: string; description: string; image: string }>;
  cuisine: Array<{ name: string; description: string; image: string }>;
}

export interface ProvinceDetailsCatalogItem {
  title: string;
  banner: string;
  data: ProvinceContent;
  administrativeSource?: { label: string; url: string; updatedAt: string };
}

const OFFICIAL_SOURCE = "https://xaydungchinhsach.chinhphu.vn/chi-tiet-34-don-vi-hanh-chinh-cap-tinh-tu-12-6-2025-119250612141845533.htm";

const HANOI_DATA = {
  overview: {
    description: "HĂ  Ná»™i lĂ  thá»§ Ä‘Ă´ ngĂ n nÄƒm vÄƒn hiáº¿n cá»§a Viá»‡t Nam, ná»•i tiáº¿ng vá»›i kiáº¿n trĂºc trÄƒm tuá»•i vĂ  ná»n vÄƒn hĂ³a phong phĂº vá»›i sá»± áº£nh hÆ°á»Ÿng cá»§a khu vá»±c ÄĂ´ng Nam Ă, Trung Quá»‘c vĂ  PhĂ¡p. NÆ¡i Ä‘Ă¢y lĂ  trung tĂ¢m chĂ­nh trá»‹, vÄƒn hĂ³a vĂ  giĂ¡o dá»¥c quan trá»ng cá»§a cáº£ nÆ°á»›c, mang trong mĂ¬nh váº» Ä‘áº¹p cá»• kĂ­nh xen láº«n nhá»‹p sá»‘ng hiá»‡n Ä‘áº¡i nÄƒng Ä‘á»™ng.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "3.359 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "8.5 triá»‡u (2023)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a" }
    ]
  },
  history: [
    { year: "1010", event: "Vua LĂ½ ThĂ¡i Tá»• dá»i Ä‘Ă´ tá»« Hoa LÆ° vá» thĂ nh Äáº¡i La, Ä‘á»•i tĂªn lĂ  ThÄƒng Long." },
    { year: "1831", event: "Vua Minh Máº¡ng Ä‘á»•i tĂªn ThÄƒng Long thĂ nh HĂ  Ná»™i." },
    { year: "1945", event: "Chá»§ tá»‹ch Há»“ ChĂ­ Minh Ä‘á»c báº£n TuyĂªn ngĂ´n Äá»™c láº­p táº¡i Quáº£ng trÆ°á»ng Ba ÄĂ¬nh." },
    { year: "1999", event: "HĂ  Ná»™i Ä‘Æ°á»£c UNESCO vinh danh lĂ  'ThĂ nh phá»‘ vĂ¬ hĂ²a bĂ¬nh'." },
    { year: "2010", event: "Ká»· niá»‡m Äáº¡i lá»… 1000 nÄƒm ThÄƒng Long - HĂ  Ná»™i." }
  ],
  places: [
    {
      name: "Há»“ HoĂ n Kiáº¿m",
      description: "TrĂ¡i tim cá»§a thá»§ Ä‘Ă´, gáº¯n liá»n vá»›i truyá»n thuyáº¿t tráº£ gÆ°Æ¡m tháº§n cho RĂ¹a VĂ ng.",
      image: "https://images.unsplash.com/photo-1619149822710-bbdc838f2b3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxIb2FuJTIwS2llbSUyMExha2UlMjBIYW5vaXxlbnwxfHx8fDE3Nzc4MTgyNzN8MA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      name: "VÄƒn Miáº¿u - Quá»‘c Tá»­ GiĂ¡m",
      description: "TrÆ°á»ng Ä‘áº¡i há»c Ä‘áº§u tiĂªn cá»§a Viá»‡t Nam, biá»ƒu tÆ°á»£ng cá»§a ná»n giĂ¡o dá»¥c khoa báº£ng.",
      image: "https://images.unsplash.com/photo-1627785740415-278ba9cc393a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUZW1wbGUlMjBvZiUyMExpdGVyYXR1cmUlMjBIYW5vaXxlbnwxfHx8fDE3Nzc4MTgyNzN8MA&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ],
  cuisine: [
    {
      name: "Phá»Ÿ HĂ  Ná»™i",
      description: "MĂ³n Äƒn quá»‘c há»“n quá»‘c tĂºy vá»›i nÆ°á»›c dĂ¹ng thanh ngá»t, bĂ¡nh phá»Ÿ má»m vĂ  thá»‹t bĂ²/gĂ .",
      image: "https://images.unsplash.com/photo-1631709497146-a239ef373cf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQaG8lMjBub29kbGUlMjBzb3VwfGVufDF8fHx8MTc3NzgxODI3M3ww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      name: "BĂºn Cháº£",
      description: "Thá»‹t lá»£n nÆ°á»›ng táº©m Æ°á»›p Ä‘áº­m Ä‘Ă , Äƒn kĂ¨m bĂºn, rau sá»‘ng vĂ  nÆ°á»›c máº¯m chua ngá»t.",
      image: "https://images.unsplash.com/photo-1579856896394-07dfa10d7c5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCdW4lMjBDaGElMjBIYW5vaXxlbnwxfHx8fDE3Nzc4MTgyNzN8MA&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ]
};

const HCM_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ TP. Há»“ ChĂ­ Minh, BĂ  Rá»‹a - VÅ©ng TĂ u vĂ  BĂ¬nh DÆ°Æ¡ng. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "6.772,59 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "14.002.598 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a cáº­n xĂ­ch Ä‘áº¡o" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ TP. Há»“ ChĂ­ Minh, BĂ  Rá»‹a - VÅ©ng TĂ u vĂ  BĂ¬nh DÆ°Æ¡ng; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1698",
      event: "Nguyá»…n Há»¯u Cáº£nh vĂ o Nam kinh lĂ½, láº­p phá»§ Gia Äá»‹nh, Ä‘Ă¡nh dáº¥u viá»‡c vĂ¹ng Ä‘áº¥t SĂ i GĂ²n chĂ­nh thá»©c Ä‘Æ°á»£c xĂ¡c láº­p trong há»‡ thá»‘ng hĂ nh chĂ­nh Äáº¡i Viá»‡t."
    },
    {
      year: "1859",
      event: "Thá»±c dĂ¢n PhĂ¡p ná»• sĂºng Ä‘Ă¡nh chiáº¿m thĂ nh Gia Äá»‹nh, má»Ÿ Ä‘áº§u thá»i ká»³ thuá»™c Ä‘á»‹a vĂ  quĂ¡ trĂ¬nh Ä‘Ă´ thá»‹ hĂ³a kiá»ƒu phÆ°Æ¡ng TĂ¢y táº¡i SĂ i GĂ²n."
    },
    {
      year: "1862",
      event: "Sau HĂ²a Æ°á»›c NhĂ¢m Tuáº¥t, SĂ i GĂ²n trá»Ÿ thĂ nh trung tĂ¢m hĂ nh chĂ­nh vĂ  quĂ¢n sá»± quan trá»ng cá»§a PhĂ¡p táº¡i Nam Ká»³."
    },
    {
      year: "1887",
      event: "SĂ i GĂ²n trá»Ÿ thĂ nh má»™t trong nhá»¯ng Ä‘Ă´ thá»‹ trá»ng Ä‘iá»ƒm cá»§a LiĂªn bang ÄĂ´ng DÆ°Æ¡ng vĂ  Ä‘Æ°á»£c má»‡nh danh lĂ  'HĂ²n ngá»c Viá»…n ÄĂ´ng'."
    },
    {
      year: "1975",
      event: "Chiáº¿n dá»‹ch Há»“ ChĂ­ Minh toĂ n tháº¯ng, SĂ i GĂ²n Ä‘Æ°á»£c giáº£i phĂ³ng, Ä‘áº¥t nÆ°á»›c hoĂ n toĂ n thá»‘ng nháº¥t."
    },
    {
      year: "1976",
      event: "Quá»‘c há»™i khĂ³a VI quyáº¿t Ä‘á»‹nh Ä‘á»•i tĂªn thĂ nh phá»‘ SĂ i GĂ²n - Gia Äá»‹nh thĂ nh ThĂ nh phá»‘ Há»“ ChĂ­ Minh."
    },
    {
      year: "2021",
      event: "ThĂ nh phá»‘ Thá»§ Äá»©c chĂ­nh thá»©c Ä‘Æ°á»£c thĂ nh láº­p trĂªn cÆ¡ sá»Ÿ sĂ¡p nháº­p Quáº­n 2, Quáº­n 9 vĂ  Quáº­n Thá»§ Äá»©c, trá»Ÿ thĂ nh mĂ´ hĂ¬nh 'thĂ nh phá»‘ trong thĂ nh phá»‘' Ä‘áº§u tiĂªn cá»§a Viá»‡t Nam."
    },
    {
      year: "2025-2026",
      event: "TP.HCM tiáº¿p tá»¥c triá»ƒn khai sáº¯p xáº¿p Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh cáº¥p phÆ°á»ng vĂ  Ä‘áº©y máº¡nh phĂ¡t triá»ƒn Ä‘Ă´ thá»‹ thĂ´ng minh, giao thĂ´ng xanh cĂ¹ng chuyá»ƒn Ä‘á»•i sá»‘ quy mĂ´ lá»›n."
    }
  ],

  places: [
    {
      name: "Chá»£ Báº¿n ThĂ nh",
      description: "Biá»ƒu tÆ°á»£ng ná»•i tiáº¿ng cá»§a TP.HCM vá»›i kiáº¿n trĂºc lĂ¢u Ä‘á»i, lĂ  Ä‘á»‹a Ä‘iá»ƒm mua sáº¯m vĂ  tham quan thu hĂºt Ä‘Ă´ng Ä‘áº£o du khĂ¡ch.",
      image: "/banner/chobenthanh.jpg"
    },
    {
      name: "Dinh Äá»™c Láº­p",
      description: "Di tĂ­ch lá»‹ch sá»­ quá»‘c gia Ä‘áº·c biá»‡t gáº¯n liá»n vá»›i sá»± kiá»‡n giáº£i phĂ³ng miá»n Nam vĂ  thá»‘ng nháº¥t Ä‘áº¥t nÆ°á»›c nÄƒm 1975.",
      image: "/banner/dinhdoclap.webp"
    },
    {
      name: "Landmark 81",
      description: "TĂ²a nhĂ  cao nháº¥t Viá»‡t Nam, biá»ƒu tÆ°á»£ng cho sá»± phĂ¡t triá»ƒn hiá»‡n Ä‘áº¡i vĂ  nÄƒng Ä‘á»™ng cá»§a thĂ nh phá»‘.",
      image: "/banner/landmark81.jpeg"
    }
  ],

  cuisine: [
    {
      name: "CÆ¡m táº¥m SĂ i GĂ²n",
      description: "MĂ³n Äƒn Ä‘áº·c trÆ°ng ná»•i tiáº¿ng vá»›i sÆ°á»n nÆ°á»›ng, bĂ¬, cháº£ Äƒn kĂ¨m cÆ¡m táº¥m vĂ  nÆ°á»›c máº¯m Ä‘áº­m vá»‹.",
      image: "/banner/comtam.jpg"
    },
    {
      name: "BĂ¡nh mĂ¬ SĂ i GĂ²n",
      description: "á»” bĂ¡nh mĂ¬ giĂ²n rá»¥m vá»›i nhiá»u loáº¡i nhĂ¢n nhÆ° pate, thá»‹t nguá»™i, cháº£ lá»¥a vĂ  rau chua, ná»•i tiáº¿ng kháº¯p tháº¿ giá»›i.",
      image: "/banner/banhmi.jpg"
    },
    {
      name: "Há»§ tiáº¿u Nam Vang",
      description: "MĂ³n há»§ tiáº¿u nÆ°á»›c Ä‘áº·c trÆ°ng phá»• biáº¿n táº¡i TP.HCM vá»›i nÆ°á»›c dĂ¹ng ngá»t thanh, tĂ´m, thá»‹t báº±m vĂ  trá»©ng cĂºt.",
      image: "/banner/hutieu.jpg"
    }
  ]
};

const DANANG_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ thĂ nh phá»‘ ÄĂ  Náºµng vĂ  Quáº£ng Nam. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "11.859,59 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "3.065.628 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a (Chia lĂ m 2 mĂ¹a: MĂ¹a mÆ°a vĂ  MĂ¹a khĂ´)" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ thĂ nh phá»‘ ÄĂ  Náºµng vĂ  Quáº£ng Nam; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1471",
      event: "Vua LĂª ThĂ¡nh TĂ´ng thĂ¢n chinh má»Ÿ mang bá» cĂµi vá» phĂ­a Nam, thĂ nh láº­p Ä‘áº¡o thá»«a tuyĂªn Quáº£ng Nam, trong Ä‘Ă³ Ä‘á»‹a bĂ n ÄĂ  Náºµng thuá»™c huyá»‡n Äiá»‡n BĂ n, chĂ­nh thá»©c thuá»™c vá» báº£n Ä‘á»“ Äáº¡i Viá»‡t."
    },
    {
      year: "1835",
      event: "Vua Minh Máº¡ng chuáº©n y chá»‰ dá»¥: táº¥t cáº£ cĂ¡c tĂ u thuyá»n phÆ°Æ¡ng TĂ¢y vĂ o giao thÆ°Æ¡ng chá»‰ Ä‘Æ°á»£c Ä‘áº­u táº¡i cá»­a biá»ƒn ÄĂ  Náºµng (gá»i lĂ  Cá»­a HĂ n), biáº¿n nÆ¡i Ä‘Ă¢y thĂ nh thÆ°Æ¡ng cáº£ng Ä‘á»‘i ngoáº¡i lá»›n nháº¥t miá»n Trung lĂºc báº¥y giá»."
    },
    {
      year: "1858",
      event: "LiĂªn quĂ¢n PhĂ¡p - TĂ¢y Ban Nha ná»• sĂºng táº¥n cĂ´ng cá»­a biá»ƒn ÄĂ  Náºµng, má»Ÿ Ä‘áº§u cho cuá»™c chiáº¿n tranh xĂ¢m lÆ°á»£c cá»§a thá»±c dĂ¢n PhĂ¡p táº¡i Viá»‡t Nam."
    },
    {
      year: "1888",
      event: "Vua Äá»“ng KhĂ¡nh kĂ½ Ä‘áº¡o dá»¥ nhÆ°á»£ng háº³n ÄĂ  Náºµng cho PhĂ¡p. Tá»•ng thá»‘ng PhĂ¡p láº­p ra thĂ nh phá»‘ Tourane (tĂªn gá»i cá»§a ÄĂ  Náºµng thá»i thuá»™c PhĂ¡p) lĂ  má»™t trong nhá»¯ng nhÆ°á»£ng Ä‘á»‹a lá»›n."
    },
    {
      year: "1997",
      event: "ChĂ­nh thá»©c chia tĂ¡ch tá»‰nh Quáº£ng Nam - ÄĂ  Náºµng. ThĂ nh phá»‘ ÄĂ  Náºµng trá»Ÿ thĂ nh thĂ nh phá»‘ trá»±c thuá»™c trung Æ°Æ¡ng, bÆ°á»›c vĂ o thá»i ká»³ bá»©t phĂ¡, Ä‘Ă´ thá»‹ hĂ³a vĂ  phĂ¡t triá»ƒn máº¡nh máº½."
    },
    {
      year: "2024-2025",
      event: "á»¦y ban ThÆ°á»ng vá»¥ Quá»‘c há»™i ban hĂ nh Nghá»‹ quyáº¿t sá»‘ 1253/NQ-UBTVQH15 vá» viá»‡c sáº¯p xáº¿p Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh cáº¥p xĂ£ cá»§a TP. ÄĂ  Náºµng giai Ä‘oáº¡n 2023 - 2025, chĂ­nh thá»©c sĂ¡p nháº­p hĂ ng loáº¡t phÆ°á»ng táº¡i cĂ¡c quáº­n trung tĂ¢m nhÆ° Háº£i ChĂ¢u, Thanh KhĂª vĂ  SÆ¡n TrĂ  Ä‘á»ƒ tinh gá»n bá»™ mĂ¡y."
    }
  ],

  places: [
    {
      name: "Cáº§u Rá»“ng",
      description: "Biá»ƒu tÆ°á»£ng kiáº¿n trĂºc hiá»‡n Ä‘áº¡i Ä‘á»™c Ä‘Ă¡o cá»§a thĂ nh phá»‘ vá»›i hĂ¬nh dĂ¡ng con rá»“ng thá»i LĂ½ hÆ°á»›ng ra biá»ƒn lá»›n, cĂ³ kháº£ nÄƒng phun lá»­a vĂ  nÆ°á»›c vĂ o má»—i tá»‘i cuá»‘i tuáº§n.",
      image: "/banner/caurong.jpg"
    },
    {
      name: "BĂ  NĂ  Hills (Cáº§u VĂ ng)",
      description: "Khu du lá»‹ch nghá»‰ dÆ°á»¡ng Ä‘áº³ng cáº¥p trĂªn Ä‘á»‰nh nĂºi ChĂºa, ná»•i tiáº¿ng toĂ n cáº§u vá»›i cĂ´ng trĂ¬nh Cáº§u VĂ ng (Golden Bridge) Ä‘Æ°á»£c nĂ¢ng Ä‘á»¡ bá»Ÿi hai bĂ n tay khá»•ng lá»“ rĂªu phong.",
      image: "/banner/banahills.jpg"
    },
    {
      name: "NgÅ© HĂ nh SÆ¡n",
      description: "Quáº§n thá»ƒ gá»“m 5 ngá»n nĂºi Ä‘Ă¡ vĂ´i nhĂ´ lĂªn giá»¯a lĂ²ng thĂ nh phá»‘, lÆ°u giá»¯ há»‡ thá»‘ng hang Ä‘á»™ng huyá»n bĂ­, chĂ¹a chiá»n cá»• kĂ­nh vĂ  lĂ ng nghá» Ä‘iĂªu kháº¯c Ä‘Ă¡ má»¹ nghá»‡ lĂ¢u Ä‘á»i.",
      image: "/banner/nguhanhson.jpg"
    }
  ],

  cuisine: [
    {
      name: "MĂ¬ Quáº£ng",
      description: "Linh há»“n áº©m thá»±c xá»© Quáº£ng - ÄĂ , sá»£i mĂ¬ dĂ y dai Äƒn kĂ¨m chĂºt nÆ°á»›c lĂ¨o Ä‘áº­m Ä‘Ă  sá»‡t tá»« tĂ´m thá»‹t, gĂ  hoáº·c áº¿ch, ráº¯c thĂªm Ä‘áº­u phá»™ng rang vĂ  bĂ¡nh trĂ¡ng nÆ°á»›ng giĂ²n.",
      image: "/banner/miQuang.jpg"
    },
    {
      name: "BĂ¡nh trĂ¡ng cuá»‘n thá»‹t heo",
      description: "MĂ³n Äƒn thanh mĂ¡t ná»©c lĂ²ng thá»±c khĂ¡ch vá»›i nhá»¯ng lĂ¡t thá»‹t heo luá»™c xáº» hai Ä‘áº§u má»¡, cuá»‘n cĂ¹ng rau sá»‘ng Ä‘á»§ loáº¡i trong bĂ¡nh trĂ¡ng phÆ¡i sÆ°Æ¡ng vĂ  cháº¥m máº¯m nĂªm cay ná»“ng.",
      image: "/banner/banhtrancuon.jpg"
    },
    {
      name: "BĂºn cháº£ cĂ¡ ÄĂ  Náºµng",
      description: "Sá»± káº¿t há»£p giá»¯a nhá»¯ng viĂªn cháº£ cĂ¡ thĂ¡t lĂ¡t dai ngon vĂ  nÆ°á»›c dĂ¹ng ngá»t lá»‹m háº§m tá»« xÆ°Æ¡ng cĂ¡, bĂ­ Ä‘á», su su, mÄƒng tÆ°Æ¡i kĂ¨m chĂºt máº¯m ruá»‘c thÆ¡m phá»©c.",
      image: "/banner/bunchaca.jpg"
    }
  ]
};

const DIENBIEN_DATA = {
  overview: {
    description: "Äiá»‡n BiĂªn lĂ  tá»‰nh miá»n nĂºi thuá»™c vĂ¹ng TĂ¢y Báº¯c Viá»‡t Nam, ná»•i tiáº¿ng vá»›i chiáº¿n tháº¯ng Äiá»‡n BiĂªn Phá»§ vang dá»™i nÄƒm 1954. NÆ¡i Ä‘Ă¢y sá»Ÿ há»¯u váº» Ä‘áº¹p hĂ¹ng vÄ© cá»§a nĂºi rá»«ng, báº£n sáº¯c vÄƒn hĂ³a Ä‘a dáº¡ng cá»§a cĂ¡c dĂ¢n tá»™c vĂ  nhiá»u di tĂ­ch lá»‹ch sá»­ quan trá»ng.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "9.539 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "Khoáº£ng 650.000 ngÆ°á»i (2026)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a vĂ¹ng nĂºi cao" }
    ]
  },

  history: [
    {
      year: "1841",
      event: "TĂªn gá»i Äiá»‡n BiĂªn chĂ­nh thá»©c xuáº¥t hiá»‡n dÆ°á»›i triá»u Nguyá»…n vá»›i Ă½ nghÄ©a lĂ  vĂ¹ng biĂªn cÆ°Æ¡ng vá»¯ng cháº¯c phĂ­a TĂ¢y Báº¯c cá»§a Ä‘áº¥t nÆ°á»›c."
    },
    {
      year: "1954",
      event: "Chiáº¿n tháº¯ng Äiá»‡n BiĂªn Phá»§ diá»…n ra tá»« ngĂ y 13/3 Ä‘áº¿n 7/5/1954, káº¿t thĂºc tháº¯ng lá»£i cuá»™c khĂ¡ng chiáº¿n chá»‘ng thá»±c dĂ¢n PhĂ¡p vĂ  lĂ m cháº¥n Ä‘á»™ng Ä‘á»‹a cáº§u."
    },
    {
      year: "1992",
      event: "TĂ¡i láº­p tá»‰nh Lai ChĂ¢u má»›i, trong Ä‘Ă³ khu vá»±c Äiá»‡n BiĂªn tiáº¿p tá»¥c lĂ  Ä‘á»‹a bĂ n chiáº¿n lÆ°á»£c quan trá»ng vĂ¹ng TĂ¢y Báº¯c."
    },
    {
      year: "2004",
      event: "Tá»‰nh Äiá»‡n BiĂªn chĂ­nh thá»©c Ä‘Æ°á»£c thĂ nh láº­p theo Nghá»‹ quyáº¿t cá»§a Quá»‘c há»™i trĂªn cÆ¡ sá»Ÿ chia tĂ¡ch tá»‰nh Lai ChĂ¢u."
    },
    {
      year: "2024",
      event: "Äiá»‡n BiĂªn tá»• chá»©c trá»ng thá»ƒ lá»… ká»· niá»‡m 70 nÄƒm Chiáº¿n tháº¯ng Äiá»‡n BiĂªn Phá»§ vá»›i nhiá»u hoáº¡t Ä‘á»™ng vÄƒn hĂ³a, lá»‹ch sá»­ vĂ  du lá»‹ch quy mĂ´ lá»›n."
    },
    {
      year: "2025-2026",
      event: "Tá»‰nh tiáº¿p tá»¥c phĂ¡t triá»ƒn du lá»‹ch lá»‹ch sá»­, du lá»‹ch cá»™ng Ä‘á»“ng vĂ  Ä‘áº§u tÆ° háº¡ táº§ng giao thĂ´ng nháº±m thĂºc Ä‘áº©y kinh táº¿ vĂ¹ng TĂ¢y Báº¯c."
    }
  ],

  places: [
    {
      name: "Äá»“i A1",
      description: "Di tĂ­ch lá»‹ch sá»­ ná»•i tiáº¿ng gáº¯n liá»n vá»›i tráº­n chiáº¿n Ă¡c liá»‡t trong Chiáº¿n dá»‹ch Äiá»‡n BiĂªn Phá»§ nÄƒm 1954.",
      image: "/banner/doiA1.jpg"
    },
    {
      name: "TÆ°á»£ng Ä‘Ă i Chiáº¿n tháº¯ng Äiá»‡n BiĂªn Phá»§",
      description: "CĂ´ng trĂ¬nh biá»ƒu tÆ°á»£ng náº±m trĂªn Ä‘á»“i D1, thá»ƒ hiá»‡n tinh tháº§n chiáº¿n tháº¯ng hĂ o hĂ¹ng cá»§a dĂ¢n tá»™c Viá»‡t Nam.",
      image: "/banner/tuongdai.jpg"
    },
    {
      name: "Há»“ PĂ¡ Khoang",
      description: "Danh tháº¯ng thiĂªn nhiĂªn ná»•i tiáº¿ng vá»›i phong cáº£nh thÆ¡ má»™ng, khĂ­ háº­u mĂ¡t máº» vĂ  rá»«ng nĂºi xanh ngĂ¡t.",
      image: "/banner/hopakhoang.webp"
    }
  ],

  cuisine: [
    {
      name: "XĂ´i náº¿p nÆ°Æ¡ng",
      description: "MĂ³n xĂ´i Ä‘áº·c sáº£n TĂ¢y Báº¯c Ä‘Æ°á»£c náº¥u tá»« náº¿p nÆ°Æ¡ng thÆ¡m dáº»o, mang hÆ°Æ¡ng vá»‹ Ä‘áº·c trÆ°ng cá»§a vĂ¹ng nĂºi Äiá»‡n BiĂªn.",
      image: "/banner/xoinephuong.webp"
    },
    {
      name: "GĂ  nÆ°á»›ng máº¯c khĂ©n",
      description: "MĂ³n Äƒn ná»•i tiáº¿ng cá»§a Ä‘á»“ng bĂ o TĂ¢y Báº¯c vá»›i hÆ°Æ¡ng vá»‹ cay thÆ¡m Ä‘áº·c trÆ°ng tá»« háº¡t máº¯c khĂ©n.",
      image: "/banner/ganuong.png"
    },
    {
      name: "Pa pá»‰nh tá»™p",
      description: "MĂ³n cĂ¡ nÆ°á»›ng truyá»n thá»‘ng cá»§a ngÆ°á»i ThĂ¡i, Ä‘Æ°á»£c táº©m Æ°á»›p nhiá»u loáº¡i gia vá»‹ nĂºi rá»«ng Ä‘áº·c sáº¯c.",
      image: "/banner/papinh.jpg"
    }
  ]
};

const LAICHAU_DATA = {
  overview: {
    description: "Lai ChĂ¢u lĂ  tá»‰nh miá»n nĂºi thuá»™c vĂ¹ng TĂ¢y Báº¯c Viá»‡t Nam, ná»•i báº­t vá»›i cáº£nh quan thiĂªn nhiĂªn hĂ¹ng vÄ©, nhá»¯ng dĂ£y nĂºi cao, ruá»™ng báº­c thang tuyá»‡t Ä‘áº¹p vĂ  báº£n sáº¯c vÄƒn hĂ³a Ä‘áº·c trÆ°ng cá»§a nhiá»u dĂ¢n tá»™c thiá»ƒu sá»‘.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "9.068 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "Khoáº£ng 510.000 ngÆ°á»i (2026)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a vĂ¹ng nĂºi cao" }
    ]
  },

  history: [
    {
      year: "1909",
      event: "Tá»‰nh Lai ChĂ¢u Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i thá»i PhĂ¡p thuá»™c, lĂ  vĂ¹ng Ä‘áº¥t chiáº¿n lÆ°á»£c quan trá»ng táº¡i khu vá»±c TĂ¢y Báº¯c."
    },
    {
      year: "1954",
      event: "Sau chiáº¿n tháº¯ng Äiá»‡n BiĂªn Phá»§, Lai ChĂ¢u bÆ°á»›c vĂ o giai Ä‘oáº¡n xĂ¢y dá»±ng vĂ  phĂ¡t triá»ƒn cĂ¹ng miá»n Báº¯c Viá»‡t Nam."
    },
    {
      year: "2004",
      event: "Quá»‘c há»™i quyáº¿t Ä‘á»‹nh chia tĂ¡ch tá»‰nh Lai ChĂ¢u cÅ© thĂ nh hai tá»‰nh Äiá»‡n BiĂªn vĂ  Lai ChĂ¢u má»›i nhÆ° hiá»‡n nay."
    },
    {
      year: "2016",
      event: "Nhiá»u cĂ´ng trĂ¬nh thá»§y Ä‘iá»‡n lá»›n trĂªn sĂ´ng ÄĂ  hoĂ n thiá»‡n, gĂ³p pháº§n thĂºc Ä‘áº©y phĂ¡t triá»ƒn kinh táº¿ cá»§a tá»‰nh."
    },
    {
      year: "2024",
      event: "Lai ChĂ¢u Ä‘áº©y máº¡nh phĂ¡t triá»ƒn du lá»‹ch sinh thĂ¡i, du lá»‹ch cá»™ng Ä‘á»“ng gáº¯n vá»›i vÄƒn hĂ³a dĂ¢n tá»™c vĂ¹ng cao."
    },
    {
      year: "2025-2026",
      event: "Tá»‰nh tiáº¿p tá»¥c Ä‘áº§u tÆ° háº¡ táº§ng giao thĂ´ng, phĂ¡t triá»ƒn nĂ´ng nghiá»‡p sáº¡ch vĂ  khai thĂ¡c tiá»m nÄƒng du lá»‹ch TĂ¢y Báº¯c."
    }
  ],

  places: [
    {
      name: "Äá»‰nh Pu Ta Leng",
      description: "Má»™t trong nhá»¯ng Ä‘á»‰nh nĂºi cao nháº¥t Viá»‡t Nam, ná»•i tiáº¿ng vá»›i cáº£nh sáº¯c thiĂªn nhiĂªn hĂ¹ng vÄ© vĂ  mĂ¹a hoa Ä‘á»— quyĂªn rá»±c rá»¡.",
      image: "/banner/putraleng.jpg"
    },
    {
      name: "Cáº§u kĂ­nh Rá»“ng MĂ¢y",
      description: "Äiá»ƒm du lá»‹ch ná»•i tiáº¿ng náº±m giá»¯a nĂºi rá»«ng TĂ¢y Báº¯c vá»›i tráº£i nghiá»‡m sÄƒn mĂ¢y vĂ  ngáº¯m cáº£nh ngoáº¡n má»¥c.",
      image: "/banner/caurong.jpg"
    },
    {
      name: "Cao nguyĂªn SĂ¬n Há»“",
      description: "ÄÆ°á»£c vĂ­ nhÆ° 'Sa Pa thá»© hai' cá»§a TĂ¢y Báº¯c vá»›i khĂ­ háº­u mĂ¡t máº» quanh nÄƒm vĂ  cáº£nh quan thÆ¡ má»™ng.",
      image: "/banner/sinho.jpg"
    }
  ],

  cuisine: [
    {
      name: "Thá»‹t trĂ¢u gĂ¡c báº¿p",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng TĂ¢y Báº¯c vá»›i hÆ°Æ¡ng vá»‹ Ä‘áº­m Ä‘Ă , Ä‘Æ°á»£c hun khĂ³i tá»« báº¿p cá»§i truyá»n thá»‘ng.",
      image: "/banner/thittraugacbep.jpg"
    },
    {
      name: "Lá»£n cáº¯p nĂ¡ch",
      description: "MĂ³n Äƒn Ä‘áº·c sáº£n vĂ¹ng cao vá»›i thá»‹t cháº¯c, thÆ¡m ngon, thÆ°á»ng Ä‘Æ°á»£c cháº¿ biáº¿n báº±ng cĂ¡ch nÆ°á»›ng hoáº·c háº¥p.",
      image: "/banner/loncapnach.webp"
    },
    {
      name: "XĂ´i tĂ­m Lai ChĂ¢u",
      description: "MĂ³n xĂ´i truyá»n thá»‘ng cá»§a Ä‘á»“ng bĂ o dĂ¢n tá»™c vá»›i mĂ u tĂ­m tá»± nhiĂªn tá»« lĂ¡ cĂ¢y rá»«ng.",
      image: "/banner/xoitim.jpg"
    }
  ]
};

const SONLA_DATA = {
  overview: {
    description: "SÆ¡n La lĂ  tá»‰nh miá»n nĂºi thuá»™c vĂ¹ng TĂ¢y Báº¯c Viá»‡t Nam, ná»•i tiáº¿ng vá»›i cáº£nh quan thiĂªn nhiĂªn hĂ¹ng vÄ©, cao nguyĂªn Má»™c ChĂ¢u thÆ¡ má»™ng vĂ  ná»n vÄƒn hĂ³a Ä‘a dáº¡ng cá»§a nhiá»u dĂ¢n tá»™c anh em.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "14.123 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "Khoáº£ng 1,35 triá»‡u ngÆ°á»i (2026)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a vĂ¹ng nĂºi cao" }
    ]
  },

  history: [
    {
      year: "1895",
      event: "Tá»‰nh SÆ¡n La Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i thá»i PhĂ¡p thuá»™c, trá»Ÿ thĂ nh Ä‘á»‹a bĂ n chiáº¿n lÆ°á»£c quan trá»ng cá»§a vĂ¹ng TĂ¢y Báº¯c."
    },
    {
      year: "1908",
      event: "NhĂ  tĂ¹ SÆ¡n La Ä‘Æ°á»£c thá»±c dĂ¢n PhĂ¡p xĂ¢y dá»±ng nháº±m giam giá»¯ cĂ¡c chiáº¿n sÄ© cĂ¡ch máº¡ng Viá»‡t Nam."
    },
    {
      year: "1952",
      event: "Chiáº¿n dá»‹ch TĂ¢y Báº¯c tháº¯ng lá»£i, SÆ¡n La Ä‘Æ°á»£c giáº£i phĂ³ng khá»i sá»± kiá»ƒm soĂ¡t cá»§a thá»±c dĂ¢n PhĂ¡p."
    },
    {
      year: "1994",
      event: "CĂ´ng trĂ¬nh thá»§y Ä‘iá»‡n SÆ¡n La Ä‘Æ°á»£c phĂª duyá»‡t, má»Ÿ Ä‘áº§u cho dá»± Ă¡n thá»§y Ä‘iá»‡n lá»›n nháº¥t ÄĂ´ng Nam Ă thá»i Ä‘iá»ƒm Ä‘Ă³."
    },
    {
      year: "2012",
      event: "NhĂ  mĂ¡y Thá»§y Ä‘iá»‡n SÆ¡n La chĂ­nh thá»©c khĂ¡nh thĂ nh, gĂ³p pháº§n quan trá»ng vĂ o an ninh nÄƒng lÆ°á»£ng quá»‘c gia."
    },
    {
      year: "2024",
      event: "SÆ¡n La tiáº¿p tá»¥c phĂ¡t triá»ƒn máº¡nh du lá»‹ch sinh thĂ¡i, nĂ´ng nghiá»‡p cĂ´ng nghá»‡ cao vĂ  quáº£ng bĂ¡ thÆ°Æ¡ng hiá»‡u cao nguyĂªn Má»™c ChĂ¢u."
    },
    {
      year: "2025-2026",
      event: "Tá»‰nh Ä‘áº©y máº¡nh phĂ¡t triá»ƒn háº¡ táº§ng giao thĂ´ng, du lá»‹ch cá»™ng Ä‘á»“ng vĂ  xuáº¥t kháº©u nĂ´ng sáº£n Ä‘áº·c trÆ°ng vĂ¹ng TĂ¢y Báº¯c."
    }
  ],

  places: [
    {
      name: "Cao nguyĂªn Má»™c ChĂ¢u",
      description: "Äiá»ƒm du lá»‹ch ná»•i tiáº¿ng vá»›i Ä‘á»“i chĂ¨ xanh mÆ°á»›t, mĂ¹a hoa cáº£i tráº¯ng vĂ  khĂ­ háº­u mĂ¡t máº» quanh nÄƒm.",
      image: "/banner/mocchau.webp"
    },
    {
      name: "NhĂ  tĂ¹ SÆ¡n La",
      description: "Di tĂ­ch lá»‹ch sá»­ quá»‘c gia Ä‘áº·c biá»‡t, nÆ¡i tá»«ng giam giá»¯ nhiá»u chiáº¿n sÄ© cĂ¡ch máº¡ng Viá»‡t Nam.",
      image: "/banner/nhatu.jpg"
    },
    {
      name: "ThĂ¡c Dáº£i Yáº¿m",
      description: "Danh tháº¯ng thiĂªn nhiĂªn ná»•i tiáº¿ng táº¡i Má»™c ChĂ¢u vá»›i dĂ²ng thĂ¡c tráº¯ng xĂ³a giá»¯a nĂºi rá»«ng TĂ¢y Báº¯c.",
      image: "/banner/thacdaiyem.jpeg"
    }
  ],

  cuisine: [
    {
      name: "BĂª chao Má»™c ChĂ¢u",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng vá»›i thá»‹t bĂª non má»m thÆ¡m Ä‘Æ°á»£c chao nhanh trong dáº§u nĂ³ng.",
      image: "/banner/be.jpg"
    },
    {
      name: "CĂ¡ suá»‘i nÆ°á»›ng",
      description: "MĂ³n Äƒn dĂ¢n dĂ£ cá»§a ngÆ°á»i TĂ¢y Báº¯c vá»›i cĂ¡ suá»‘i tÆ°Æ¡i nÆ°á»›ng than há»“ng thÆ¡m lá»«ng.",
      image: "/banner/canuong.jpg"
    },
    {
      name: "Náº­m pá»‹a",
      description: "MĂ³n Äƒn truyá»n thá»‘ng Ä‘á»™c Ä‘Ă¡o cá»§a Ä‘á»“ng bĂ o dĂ¢n tá»™c ThĂ¡i vá»›i hÆ°Æ¡ng vá»‹ Ä‘áº·c trÆ°ng vĂ¹ng nĂºi.",
      image: "/banner/nampia.webp"
    }
  ]
};

const LAOCAI_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ YĂªn BĂ¡i vĂ  LĂ o Cai. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "13.256,92 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "1.778.785 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Cáº­n nhiá»‡t Ä‘á»›i nĂºi cao" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ YĂªn BĂ¡i vĂ  LĂ o Cai; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1907",
      event: "Tá»‰nh LĂ o Cai Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i thá»i PhĂ¡p thuá»™c, trá»Ÿ thĂ nh Ä‘á»‹a bĂ n quan trá»ng vĂ¹ng biĂªn giá»›i TĂ¢y Báº¯c."
    },
    {
      year: "1922",
      event: "NgÆ°á»i PhĂ¡p báº¯t Ä‘áº§u phĂ¡t triá»ƒn Sa Pa thĂ nh khu nghá»‰ dÆ°á»¡ng ná»•i tiáº¿ng nhá» khĂ­ háº­u mĂ¡t máº» quanh nÄƒm."
    },
    {
      year: "1979",
      event: "Chiáº¿n tranh biĂªn giá»›i phĂ­a Báº¯c diá»…n ra Ă¡c liá»‡t táº¡i LĂ o Cai vĂ  nhiá»u khu vá»±c biĂªn giá»›i Viá»‡t - Trung."
    },
    {
      year: "1991",
      event: "Tá»‰nh LĂ o Cai Ä‘Æ°á»£c tĂ¡i láº­p sau khi tĂ¡ch khá»i tá»‰nh HoĂ ng LiĂªn SÆ¡n."
    },
    {
      year: "2014",
      event: "Tuyáº¿n cao tá»‘c Ná»™i BĂ i - LĂ o Cai chĂ­nh thá»©c Ä‘i vĂ o hoáº¡t Ä‘á»™ng, thĂºc Ä‘áº©y máº¡nh máº½ kinh táº¿ vĂ  du lá»‹ch."
    },
    {
      year: "2023",
      event: "Sa Pa Ä‘Æ°á»£c cĂ´ng nháº­n lĂ  Khu du lá»‹ch quá»‘c gia, tiáº¿p tá»¥c trá»Ÿ thĂ nh Ä‘iá»ƒm Ä‘áº¿n ná»•i báº­t cá»§a Viá»‡t Nam."
    },
    {
      year: "2025-2026",
      event: "LĂ o Cai Ä‘áº©y máº¡nh phĂ¡t triá»ƒn du lá»‹ch xanh, kinh táº¿ cá»­a kháº©u vĂ  háº¡ táº§ng giao thĂ´ng káº¿t ná»‘i vĂ¹ng TĂ¢y Báº¯c."
    }
  ],

  places: [
    {
      name: "Sa Pa",
      description: "Äiá»ƒm du lá»‹ch ná»•i tiáº¿ng vá»›i khĂ­ háº­u mĂ¡t láº¡nh, ruá»™ng báº­c thang vĂ  vÄƒn hĂ³a Ä‘áº·c sáº¯c vĂ¹ng cao TĂ¢y Báº¯c.",
      image: "/banner/sapa.jpg"
    },
    {
      name: "Äá»‰nh Fansipan",
      description: "NĂ³c nhĂ  ÄĂ´ng DÆ°Æ¡ng vá»›i Ä‘á»™ cao 3.143 mĂ©t, Ä‘iá»ƒm Ä‘áº¿n háº¥p dáº«n cá»§a du khĂ¡ch vĂ  ngÆ°á»i yĂªu khĂ¡m phĂ¡.",
      image: "/banner/fanssipan.jpg"
    },
    {
      name: "Chá»£ Báº¯c HĂ ",
      description: "PhiĂªn chá»£ vĂ¹ng cao ná»•i tiáº¿ng mang Ä‘áº­m báº£n sáº¯c vÄƒn hĂ³a cĂ¡c dĂ¢n tá»™c TĂ¢y Báº¯c.",
      image: "/banner/bachamarket.webp"
    }
  ],

  cuisine: [
    {
      name: "Tháº¯ng cá»‘",
      description: "MĂ³n Äƒn truyá»n thá»‘ng ná»•i tiáº¿ng cá»§a Ä‘á»“ng bĂ o vĂ¹ng cao vá»›i hÆ°Æ¡ng vá»‹ Ä‘áº­m Ä‘Ă  Ä‘áº·c trÆ°ng.",
      image: "/banner/thangco.jpg"
    },
    {
      name: "CĂ¡ há»“i Sa Pa",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng Ä‘Æ°á»£c nuĂ´i trong khĂ­ háº­u láº¡nh vĂ¹ng nĂºi cao, thá»‹t cháº¯c vĂ  thÆ¡m ngon.",
      image: "/banner/cahisapa.png"
    },
    {
      name: "Lá»£n cáº¯p nĂ¡ch",
      description: "MĂ³n Äƒn Ä‘áº·c trÆ°ng TĂ¢y Báº¯c vá»›i thá»‹t thÆ¡m, sÄƒn cháº¯c vĂ  thÆ°á»ng Ä‘Æ°á»£c nÆ°á»›ng nguyĂªn con.",
      image: "/banner/loncapnach.webp"
    }
  ]
};

const TUYENQUANG_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ HĂ  Giang vĂ  TuyĂªn Quang. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "13.795,50 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "1.865.270 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ HĂ  Giang vĂ  TuyĂªn Quang; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1831",
      event: "Tá»‰nh TuyĂªn Quang chĂ­nh thá»©c Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i triá»u vua Minh Máº¡ng nhĂ  Nguyá»…n."
    },
    {
      year: "1945",
      event: "TĂ¢n TrĂ o, TuyĂªn Quang trá»Ÿ thĂ nh 'Thá»§ Ä‘Ă´ Khu giáº£i phĂ³ng', nÆ¡i diá»…n ra Quá»‘c dĂ¢n Äáº¡i há»™i trÆ°á»›c CĂ¡ch máº¡ng ThĂ¡ng TĂ¡m."
    },
    {
      year: "1947",
      event: "Chiáº¿n tháº¯ng Viá»‡t Báº¯c Thu - ÄĂ´ng gĂ³p pháº§n báº£o vá»‡ cÄƒn cá»© Ä‘á»‹a cĂ¡ch máº¡ng táº¡i TuyĂªn Quang."
    },
    {
      year: "1975",
      event: "TuyĂªn Quang cĂ¹ng cáº£ nÆ°á»›c bÆ°á»›c vĂ o giai Ä‘oáº¡n xĂ¢y dá»±ng vĂ  phĂ¡t triá»ƒn sau ngĂ y Ä‘áº¥t nÆ°á»›c thá»‘ng nháº¥t."
    },
    {
      year: "2023",
      event: "Lá»… há»™i ThĂ nh TuyĂªn tiáº¿p tá»¥c Ä‘Æ°á»£c tá»• chá»©c quy mĂ´ lá»›n, trá»Ÿ thĂ nh sá»± kiá»‡n vÄƒn hĂ³a ná»•i báº­t cá»§a miá»n Báº¯c."
    },
    {
      year: "2025-2026",
      event: "TuyĂªn Quang Ä‘áº©y máº¡nh phĂ¡t triá»ƒn du lá»‹ch sinh thĂ¡i, du lá»‹ch lá»‹ch sá»­ vĂ  nĂ¢ng cáº¥p háº¡ táº§ng giao thĂ´ng vĂ¹ng ÄĂ´ng Báº¯c."
    }
  ],

  places: [
    {
      name: "Khu di tĂ­ch TĂ¢n TrĂ o",
      description: "Di tĂ­ch lá»‹ch sá»­ quá»‘c gia Ä‘áº·c biá»‡t gáº¯n liá»n vá»›i CĂ¡ch máº¡ng ThĂ¡ng TĂ¡m vĂ  Chá»§ tá»‹ch Há»“ ChĂ­ Minh.",
      image: "/banner/tantrao.jpg"
    },
    {
      name: "Há»“ Na Hang",
      description: "Danh tháº¯ng ná»•i tiáº¿ng vá»›i phong cáº£nh sÆ¡n thá»§y há»¯u tĂ¬nh, Ä‘Æ°á»£c vĂ­ nhÆ° 'Háº¡ Long giá»¯a Ä‘áº¡i ngĂ n'.",
      image: "/banner/nahang.jpg"
    },
    {
      name: "ThĂ¡c MÆ¡",
      description: "ThĂ¡c nÆ°á»›c Ä‘áº¹p náº±m giá»¯a nĂºi rá»«ng nguyĂªn sinh vá»›i khung cáº£nh hoang sÆ¡ vĂ  hĂ¹ng vÄ©.",
      image: "/banner/thacmo.webp"
    }
  ],

  cuisine: [
    {
      name: "BĂ¡nh gai ChiĂªm HĂ³a",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng cá»§a TuyĂªn Quang vá»›i lá»›p vá» má»m dáº»o tá»« lĂ¡ gai vĂ  nhĂ¢n Ä‘áº­u xanh thÆ¡m ngá»t.",
      image: "/banner/banhhai.jpg"
    },
    {
      name: "Thá»‹t lá»£n Ä‘en",
      description: "MĂ³n Äƒn Ä‘áº·c sáº£n vĂ¹ng nĂºi vá»›i thá»‹t sÄƒn cháº¯c, thÆ¡m ngon vĂ  Ä‘Æ°á»£c cháº¿ biáº¿n theo nhiá»u cĂ¡ch truyá»n thá»‘ng.",
      image: "/banner/thitlonden.png"
    },
    {
      name: "CĂ¡ Ä‘áº·c sáº£n sĂ´ng GĂ¢m",
      description: "CĂ¡c mĂ³n cĂ¡ tÆ°Æ¡i ngon tá»« sĂ´ng GĂ¢m ná»•i tiáº¿ng vá»›i vá»‹ ngá»t tá»± nhiĂªn vĂ  thá»‹t cháº¯c.",
      image: "/banner/casonggam.jpg"
    }
  ]
};

const CAOBANG_DATA = {
  overview: {
    description: "Cao Báº±ng lĂ  tá»‰nh miá»n nĂºi thuá»™c vĂ¹ng ÄĂ´ng Báº¯c Viá»‡t Nam, ná»•i tiáº¿ng vá»›i phong cáº£nh thiĂªn nhiĂªn hĂ¹ng vÄ©, thĂ¡c Báº£n Giá»‘c tuyá»‡t Ä‘áº¹p vĂ  nhiá»u di tĂ­ch lá»‹ch sá»­ cĂ¡ch máº¡ng quan trá»ng.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "6.700 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "Khoáº£ng 560.000 ngÆ°á»i (2026)" },
      { label: "KhĂ­ háº­u", value: "Cáº­n nhiá»‡t Ä‘á»›i áº©m vĂ¹ng nĂºi cao" }
    ]
  },

  history: [
    {
      year: "1499",
      event: "TĂªn gá»i Cao Báº±ng xuáº¥t hiá»‡n trong lá»‹ch sá»­ dÆ°á»›i thá»i nhĂ  LĂª, lĂ  vĂ¹ng Ä‘áº¥t biĂªn cÆ°Æ¡ng quan trá»ng phĂ­a Báº¯c."
    },
    {
      year: "1941",
      event: "Chá»§ tá»‹ch Há»“ ChĂ­ Minh trá»Ÿ vá» nÆ°á»›c táº¡i PĂ¡c BĂ³, Cao Báº±ng sau hÆ¡n 30 nÄƒm bĂ´n ba tĂ¬m Ä‘Æ°á»ng cá»©u nÆ°á»›c."
    },
    {
      year: "1950",
      event: "Chiáº¿n dá»‹ch BiĂªn giá»›i Thu - ÄĂ´ng giĂ nh tháº¯ng lá»£i lá»›n, má»Ÿ rá»™ng cÄƒn cá»© Ä‘á»‹a cĂ¡ch máº¡ng Viá»‡t Báº¯c."
    },
    {
      year: "1979",
      event: "Cao Báº±ng lĂ  má»™t trong nhá»¯ng Ä‘á»‹a phÆ°Æ¡ng chá»‹u áº£nh hÆ°á»Ÿng náº·ng ná» trong chiáº¿n tranh biĂªn giá»›i phĂ­a Báº¯c."
    },
    {
      year: "2018",
      event: "CĂ´ng viĂªn Ä‘á»‹a cháº¥t Non nÆ°á»›c Cao Báº±ng Ä‘Æ°á»£c UNESCO cĂ´ng nháº­n lĂ  CĂ´ng viĂªn Ä‘á»‹a cháº¥t toĂ n cáº§u."
    },
    {
      year: "2025-2026",
      event: "Cao Báº±ng tiáº¿p tá»¥c phĂ¡t triá»ƒn du lá»‹ch sinh thĂ¡i, du lá»‹ch lá»‹ch sá»­ vĂ  thĂºc Ä‘áº©y kinh táº¿ cá»­a kháº©u vĂ¹ng biĂªn giá»›i."
    }
  ],

  places: [
    {
      name: "ThĂ¡c Báº£n Giá»‘c",
      description: "Má»™t trong nhá»¯ng thĂ¡c nÆ°á»›c Ä‘áº¹p vĂ  lá»›n nháº¥t ÄĂ´ng Nam Ă náº±m trĂªn biĂªn giá»›i Viá»‡t Nam - Trung Quá»‘c.",
      image: "/banner/bangioc.webp"
    },
    {
      name: "Khu di tĂ­ch PĂ¡c BĂ³",
      description: "Di tĂ­ch lá»‹ch sá»­ ná»•i tiáº¿ng gáº¯n liá»n vá»›i hoáº¡t Ä‘á»™ng cĂ¡ch máº¡ng cá»§a Chá»§ tá»‹ch Há»“ ChĂ­ Minh.",
      image: "/banner/pacbo.jpg"
    },
    {
      name: "Äá»™ng NgÆ°á»m Ngao",
      description: "Hang Ä‘á»™ng tá»± nhiĂªn ná»•i tiáº¿ng vá»›i há»‡ thá»‘ng nhÅ© Ä‘Ă¡ ká»³ áº£o vĂ  váº» Ä‘áº¹p Ä‘á»™c Ä‘Ă¡o.",
      image: "/banner/nguomngao.jpg"
    }
  ],

  cuisine: [
    {
      name: "BĂ¡nh cuá»‘n Cao Báº±ng",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng Äƒn kĂ¨m nÆ°á»›c dĂ¹ng nĂ³ng vĂ  thá»‹t bÄƒm Ä‘áº­m Ä‘Ă  hÆ°Æ¡ng vá»‹ vĂ¹ng cao.",
      image: "/banner/banhhai.jpg"
    },
    {
      name: "Vá»‹t quay 7 vá»‹",
      description: "MĂ³n Äƒn Ä‘áº·c sáº£n Ä‘Æ°á»£c táº©m Æ°á»›p nhiá»u loáº¡i gia vá»‹ truyá»n thá»‘ng Ä‘á»™c Ä‘Ă¡o cá»§a ngÆ°á»i TĂ y.",
      image: "/banner/vitquay.jpg"
    },
    {
      name: "Háº¡t dáº» TrĂ¹ng KhĂ¡nh",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng cá»§a Cao Báº±ng vá»›i vá»‹ bĂ¹i bĂ©o vĂ  thÆ¡m ngon Ä‘áº·c trÆ°ng.",
      image: "/banner/hatde.jpg"
    }
  ]
};

const THAINGUYEN_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ Báº¯c Káº¡n vĂ  ThĂ¡i NguyĂªn. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "8.375,21 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "1.799.489 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ Báº¯c Káº¡n vĂ  ThĂ¡i NguyĂªn; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1831",
      event: "Tá»‰nh ThĂ¡i NguyĂªn chĂ­nh thá»©c Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i triá»u vua Minh Máº¡ng nhĂ  Nguyá»…n."
    },
    {
      year: "1947",
      event: "ATK Äá»‹nh HĂ³a trá»Ÿ thĂ nh trung tĂ¢m cÄƒn cá»© Ä‘á»‹a khĂ¡ng chiáº¿n chá»‘ng thá»±c dĂ¢n PhĂ¡p cá»§a Trung Æ°Æ¡ng Äáº£ng vĂ  ChĂ­nh phá»§."
    },
    {
      year: "1965",
      event: "Khu Gang thĂ©p ThĂ¡i NguyĂªn phĂ¡t triá»ƒn máº¡nh, trá»Ÿ thĂ nh biá»ƒu tÆ°á»£ng cĂ´ng nghiá»‡p náº·ng Ä‘áº§u tiĂªn cá»§a Viá»‡t Nam."
    },
    {
      year: "1997",
      event: "Tá»‰nh ThĂ¡i NguyĂªn Ä‘Æ°á»£c tĂ¡i láº­p sau khi tĂ¡ch khá»i tá»‰nh Báº¯c ThĂ¡i."
    },
    {
      year: "2013",
      event: "Nhiá»u táº­p Ä‘oĂ n cĂ´ng nghá»‡ lá»›n Ä‘áº§u tÆ° vĂ o ThĂ¡i NguyĂªn, thĂºc Ä‘áº©y phĂ¡t triá»ƒn kinh táº¿ vĂ  cĂ´ng nghiá»‡p Ä‘iá»‡n tá»­."
    },
    {
      year: "2025-2026",
      event: "ThĂ¡i NguyĂªn tiáº¿p tá»¥c phĂ¡t triá»ƒn cĂ´ng nghiá»‡p cĂ´ng nghá»‡ cao, giĂ¡o dá»¥c Ä‘áº¡i há»c vĂ  du lá»‹ch sinh thĂ¡i vĂ¹ng trung du Báº¯c Bá»™."
    }
  ],

  places: [
    {
      name: "Há»“ NĂºi Cá»‘c",
      description: "Khu du lá»‹ch ná»•i tiáº¿ng vá»›i phong cáº£nh thiĂªn nhiĂªn thÆ¡ má»™ng gáº¯n liá»n vá»›i truyá»n thuyáº¿t nĂ ng CĂ´ng - chĂ ng Cá»‘c.",
      image: "/banner/honuicoc.webp"
    },
    {
      name: "ATK Äá»‹nh HĂ³a",
      description: "Di tĂ­ch lá»‹ch sá»­ quá»‘c gia Ä‘áº·c biá»‡t, nÆ¡i á»Ÿ vĂ  lĂ m viá»‡c cá»§a Chá»§ tá»‹ch Há»“ ChĂ­ Minh cĂ¹ng Trung Æ°Æ¡ng Äáº£ng thá»i khĂ¡ng chiáº¿n.",
      image: "/banner/atkdinhhoa.jpg"
    },
    {
      name: "Äá»“i chĂ¨ TĂ¢n CÆ°Æ¡ng",
      description: "VĂ¹ng chĂ¨ ná»•i tiáº¿ng vá»›i khung cáº£nh xanh mÆ°á»›t vĂ  thÆ°Æ¡ng hiá»‡u chĂ¨ ThĂ¡i NguyĂªn ná»•i tiáº¿ng cáº£ nÆ°á»›c.",
      image: "/banner/tancuong.jpg"
    }
  ],

  cuisine: [
    {
      name: "ChĂ¨ TĂ¢n CÆ°Æ¡ng",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng cá»§a ThĂ¡i NguyĂªn vá»›i hÆ°Æ¡ng thÆ¡m cá»‘m non vĂ  vá»‹ chĂ¡t dá»‹u Ä‘áº·c trÆ°ng.",
      image: "/banner/teatancuong.webp"
    },
    {
      name: "BĂ¡nh chÆ°ng Bá» Äáº­u",
      description: "MĂ³n bĂ¡nh truyá»n thá»‘ng ná»•i tiáº¿ng vá»›i lá»›p náº¿p dáº»o thÆ¡m vĂ  nhĂ¢n Ä‘áº­m Ä‘Ă .",
      image: "/banner/banhchung.jpg"
    },
    {
      name: "Nem chua Äáº¡i Tá»«",
      description: "Äáº·c sáº£n Ä‘á»‹a phÆ°Æ¡ng vá»›i vá»‹ chua thanh nháº¹ vĂ  hÆ°Æ¡ng vá»‹ thÆ¡m ngon Ä‘áº·c trÆ°ng.",
      image: "/banner/nemchua.jpg"
    }
  ]
};

const LANGSON_DATA = {
  overview: {
    description: "Láº¡ng SÆ¡n lĂ  tá»‰nh miá»n nĂºi thuá»™c vĂ¹ng ÄĂ´ng Báº¯c Viá»‡t Nam, ná»•i tiáº¿ng vá»›i cá»­a kháº©u quá»‘c táº¿ quan trá»ng, cáº£nh quan nĂºi non hĂ¹ng vÄ© vĂ  ná»n vÄƒn hĂ³a Ä‘áº­m Ä‘Ă  báº£n sáº¯c dĂ¢n tá»™c TĂ y, NĂ¹ng.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "8.310 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "Khoáº£ng 820.000 ngÆ°á»i (2026)" },
      { label: "KhĂ­ háº­u", value: "Cáº­n nhiá»‡t Ä‘á»›i áº©m" }
    ]
  },

  history: [
    {
      year: "1831",
      event: "Tá»‰nh Láº¡ng SÆ¡n chĂ­nh thá»©c Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i triá»u vua Minh Máº¡ng nhĂ  Nguyá»…n."
    },
    {
      year: "1885",
      event: "Láº¡ng SÆ¡n trá»Ÿ thĂ nh Ä‘á»‹a bĂ n chiáº¿n lÆ°á»£c quan trá»ng trong cuá»™c chiáº¿n giá»¯a quĂ¢n Thanh vĂ  thá»±c dĂ¢n PhĂ¡p."
    },
    {
      year: "1950",
      event: "Chiáº¿n dá»‹ch BiĂªn giá»›i Thu - ÄĂ´ng gĂ³p pháº§n giáº£i phĂ³ng nhiá»u khu vá»±c táº¡i Láº¡ng SÆ¡n vĂ  vĂ¹ng ÄĂ´ng Báº¯c."
    },
    {
      year: "1979",
      event: "Láº¡ng SÆ¡n lĂ  má»™t trong nhá»¯ng Ä‘á»‹a phÆ°Æ¡ng chá»‹u áº£nh hÆ°á»Ÿng náº·ng ná» trong chiáº¿n tranh biĂªn giá»›i phĂ­a Báº¯c."
    },
    {
      year: "1991",
      event: "Hoáº¡t Ä‘á»™ng giao thÆ°Æ¡ng biĂªn giá»›i Ä‘Æ°á»£c khĂ´i phá»¥c máº¡nh máº½, thĂºc Ä‘áº©y kinh táº¿ cá»­a kháº©u phĂ¡t triá»ƒn."
    },
    {
      year: "2025-2026",
      event: "Láº¡ng SÆ¡n tiáº¿p tá»¥c phĂ¡t triá»ƒn kinh táº¿ cá»­a kháº©u, logistics vĂ  du lá»‹ch vÄƒn hĂ³a vĂ¹ng ÄĂ´ng Báº¯c."
    }
  ],

  places: [
    {
      name: "Äá»™ng Tam Thanh",
      description: "Danh tháº¯ng ná»•i tiáº¿ng vá»›i há»‡ thá»‘ng hang Ä‘á»™ng ká»³ áº£o vĂ  nhiá»u giĂ¡ trá»‹ lá»‹ch sá»­, vÄƒn hĂ³a.",
      image: "/banner/dongtamthanh.jpg"
    },
    {
      name: "NĂºi TĂ´ Thá»‹",
      description: "Biá»ƒu tÆ°á»£ng ná»•i tiáº¿ng cá»§a Láº¡ng SÆ¡n gáº¯n liá»n vá»›i truyá»n thuyáº¿t ngÆ°á»i vá»£ chá» chá»“ng.",
      image: "/banner/nuitoshi.jpg"
    },
    {
      name: "Chá»£ ÄĂ´ng Kinh",
      description: "Khu chá»£ lá»›n vĂ  ná»•i tiáº¿ng cá»§a Láº¡ng SÆ¡n vá»›i hoáº¡t Ä‘á»™ng mua bĂ¡n sáº§m uáº¥t.",
      image: "/banner/cho dong kinh.jpg"
    }
  ],

  cuisine: [
    {
      name: "Vá»‹t quay Láº¡ng SÆ¡n",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng vá»›i lá»›p da vĂ ng giĂ²n vĂ  hÆ°Æ¡ng vá»‹ Ä‘áº­m Ä‘Ă  tá»« lĂ¡ máº¯c máº­t.",
      image: "/banner/vitquay.jpg"
    },
    {
      name: "KhĂ¢u nhá»¥c",
      description: "MĂ³n Äƒn truyá»n thá»‘ng cá»§a ngÆ°á»i TĂ y, NĂ¹ng vá»›i thá»‹t heo háº¥p má»m cĂ¹ng nhiá»u gia vá»‹ Ä‘áº·c trÆ°ng.",
      image: "/banner/khaunhuc.webp"
    },
    {
      name: "Phá»Ÿ chua",
      description: "MĂ³n Äƒn Ä‘áº·c sáº£n vá»›i vá»‹ chua ngá»t hĂ i hĂ²a, Äƒn kĂ¨m thá»‹t quay vĂ  rau sá»‘ng.",
      image: "/banner/phochua.jpg"
    }
  ]
};

const PHUTHO_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ VÄ©nh PhĂºc, HĂ²a BĂ¬nh vĂ  PhĂº Thá». Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "9.361,38 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "4.022.638 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ VÄ©nh PhĂºc, HĂ²a BĂ¬nh vĂ  PhĂº Thá»; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "2879 TCN",
      event: "Theo truyá»n thuyáº¿t, cĂ¡c Vua HĂ¹ng dá»±ng nÆ°á»›c VÄƒn Lang - nhĂ  nÆ°á»›c Ä‘áº§u tiĂªn cá»§a dĂ¢n tá»™c Viá»‡t Nam táº¡i vĂ¹ng Ä‘áº¥t PhĂº Thá»."
    },
    {
      year: "1831",
      event: "Tá»‰nh PhĂº Thá» chĂ­nh thá»©c Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i triá»u vua Minh Máº¡ng nhĂ  Nguyá»…n."
    },
    {
      year: "1968",
      event: "PhĂº Thá» sĂ¡p nháº­p vá»›i VÄ©nh PhĂºc thĂ nh tá»‰nh VÄ©nh PhĂº."
    },
    {
      year: "1997",
      event: "Tá»‰nh PhĂº Thá» Ä‘Æ°á»£c tĂ¡i láº­p sau khi tĂ¡ch khá»i tá»‰nh VÄ©nh PhĂº."
    },
    {
      year: "2012",
      event: "TĂ­n ngÆ°á»¡ng thá» cĂºng HĂ¹ng VÆ°Æ¡ng á»Ÿ PhĂº Thá» Ä‘Æ°á»£c UNESCO cĂ´ng nháº­n lĂ  Di sáº£n vÄƒn hĂ³a phi váº­t thá»ƒ Ä‘áº¡i diá»‡n cá»§a nhĂ¢n loáº¡i."
    },
    {
      year: "2025-2026",
      event: "PhĂº Thá» tiáº¿p tá»¥c phĂ¡t triá»ƒn du lá»‹ch vÄƒn hĂ³a tĂ¢m linh, cĂ´ng nghiá»‡p vĂ  háº¡ táº§ng giao thĂ´ng vĂ¹ng trung du Báº¯c Bá»™."
    }
  ],

  places: [
    {
      name: "Äá»n HĂ¹ng",
      description: "Khu di tĂ­ch lá»‹ch sá»­ Ä‘áº·c biá»‡t quá»‘c gia thá» cĂ¡c Vua HĂ¹ng, Ä‘iá»ƒm hĂ nh hÆ°Æ¡ng ná»•i tiáº¿ng cá»§a ngÆ°á»i Viá»‡t.",
      image: "/banner/denhung.webp"
    },
    {
      name: "VÆ°á»n quá»‘c gia XuĂ¢n SÆ¡n",
      description: "Khu báº£o tá»“n thiĂªn nhiĂªn ná»•i tiáº¿ng vá»›i há»‡ sinh thĂ¡i Ä‘a dáº¡ng vĂ  cáº£nh quan nĂºi rá»«ng hoang sÆ¡.",
      image: "/banner/xuanson.jpg"
    },
    {
      name: "Äá»“i chĂ¨ Long Cá»‘c",
      description: "Danh tháº¯ng ná»•i tiáº¿ng vá»›i nhá»¯ng Ä‘á»“i chĂ¨ xanh mÆ°á»›t Ä‘Æ°á»£c vĂ­ nhÆ° 'vá»‹nh Háº¡ Long vĂ¹ng trung du'.",
      image: "/banner/longcoc.webp"
    }
  ],

  cuisine: [
    {
      name: "BĂ¡nh tai",
      description: "MĂ³n bĂ¡nh truyá»n thá»‘ng cá»§a PhĂº Thá» vá»›i lá»›p bá»™t má»m dáº»o vĂ  nhĂ¢n thá»‹t Ä‘áº­m Ä‘Ă .",
      image: "/banner/banhtai.jpeg"
    },
    {
      name: "Cá» á»m",
      description: "Äáº·c sáº£n dĂ¢n dĂ£ ná»•i tiáº¿ng cá»§a PhĂº Thá» vá»›i vá»‹ bĂ©o bĂ¹i Ä‘áº·c trÆ°ng.",
      image: "/banner/qua co.jpg"
    },
    {
      name: "Thá»‹t chua Thanh SÆ¡n",
      description: "MĂ³n Äƒn Ä‘áº·c sáº£n Ä‘Æ°á»£c lĂªn men tá»± nhiĂªn vá»›i vá»‹ chua thanh vĂ  thÆ¡m ngon Ä‘á»™c Ä‘Ă¡o.",
      image: "/banner/thit chua.webp"
    }
  ]
};

const BACNINH_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ Báº¯c Giang vĂ  Báº¯c Ninh. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "4.718,60 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "3.619.433 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ Báº¯c Giang vĂ  Báº¯c Ninh; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1030",
      event: "VĂ¹ng Ä‘áº¥t Báº¯c Ninh xÆ°a thuá»™c tráº¥n Kinh Báº¯c, ná»•i tiáº¿ng lĂ  trung tĂ¢m vÄƒn hĂ³a vĂ  khoa báº£ng cá»§a Viá»‡t Nam."
    },
    {
      year: "1831",
      event: "Tá»‰nh Báº¯c Ninh chĂ­nh thá»©c Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i triá»u vua Minh Máº¡ng nhĂ  Nguyá»…n."
    },
    {
      year: "1962",
      event: "Báº¯c Ninh sĂ¡p nháº­p vá»›i Báº¯c Giang thĂ nh tá»‰nh HĂ  Báº¯c."
    },
    {
      year: "1997",
      event: "Tá»‰nh Báº¯c Ninh Ä‘Æ°á»£c tĂ¡i láº­p sau khi tĂ¡ch khá»i tá»‰nh HĂ  Báº¯c."
    },
    {
      year: "2009",
      event: "DĂ¢n ca Quan há» Báº¯c Ninh Ä‘Æ°á»£c UNESCO cĂ´ng nháº­n lĂ  Di sáº£n vÄƒn hĂ³a phi váº­t thá»ƒ Ä‘áº¡i diá»‡n cá»§a nhĂ¢n loáº¡i."
    },
    {
      year: "2025-2026",
      event: "Báº¯c Ninh tiáº¿p tá»¥c phĂ¡t triá»ƒn máº¡nh cĂ´ng nghiá»‡p cĂ´ng nghá»‡ cao, Ä‘Ă´ thá»‹ thĂ´ng minh vĂ  báº£o tá»“n giĂ¡ trá»‹ vÄƒn hĂ³a Kinh Báº¯c."
    }
  ],

  places: [
    {
      name: "ChĂ¹a DĂ¢u",
      description: "NgĂ´i chĂ¹a cá»• ná»•i tiáº¿ng Ä‘Æ°á»£c xem lĂ  trung tĂ¢m Pháº­t giĂ¡o cá»• nháº¥t Viá»‡t Nam.",
      image: "/banner/chuadau.jpg"
    },
    {
      name: "Äá»n ÄĂ´",
      description: "Di tĂ­ch lá»‹ch sá»­ ná»•i tiáº¿ng thá» cĂ¡c vá»‹ vua triá»u LĂ½, mang Ä‘áº­m kiáº¿n trĂºc truyá»n thá»‘ng Viá»‡t Nam.",
      image: "/banner/dendo.jpg"
    },
    {
      name: "LĂ ng tranh ÄĂ´ng Há»“",
      description: "LĂ ng nghá» truyá»n thá»‘ng ná»•i tiáº¿ng vá»›i nghá»‡ thuáº­t tranh dĂ¢n gian ÄĂ´ng Há»“.",
      image: "/banner/dongho.jpg"
    }
  ],

  cuisine: [
    {
      name: "BĂ¡nh phu thĂª",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng vá»›i lá»›p vá» dáº»o trong vĂ  nhĂ¢n Ä‘áº­u xanh ngá»t bĂ¹i.",
      image: "/banner/banhthe.jpg"
    },
    {
      name: "Nem BĂ¹i",
      description: "MĂ³n nem Ä‘áº·c sáº£n cá»§a Báº¯c Ninh vá»›i vá»‹ thÆ¡m ngon vĂ  cĂ¡ch cháº¿ biáº¿n truyá»n thá»‘ng.",
      image: "/banner/nem bui.jpg"
    },
    {
      name: "ChĂ¡o cĂ¡ TĂ­ch Nghi",
      description: "MĂ³n Äƒn dĂ¢n dĂ£ ná»•i tiáº¿ng vá»›i vá»‹ ngá»t thanh tá»« cĂ¡ vĂ  nÆ°á»›c dĂ¹ng Ä‘áº­m Ä‘Ă .",
      image: "/banner/chao ca.jpg"
    }
  ]
};

const QUANGNINH_DATA = {
  overview: {
    description: "Quáº£ng Ninh lĂ  tá»‰nh ven biá»ƒn thuá»™c vĂ¹ng ÄĂ´ng Báº¯c Viá»‡t Nam, ná»•i tiáº¿ng vá»›i Vá»‹nh Háº¡ Long - Di sáº£n thiĂªn nhiĂªn tháº¿ giá»›i cĂ¹ng ná»n kinh táº¿ phĂ¡t triá»ƒn máº¡nh vá» du lá»‹ch, cáº£ng biá»ƒn vĂ  cĂ´ng nghiá»‡p khai khoĂ¡ng.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "6.207 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "Khoáº£ng 1,45 triá»‡u ngÆ°á»i (2026)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a ven biá»ƒn" }
    ]
  },

  history: [
    {
      year: "1883",
      event: "Tá»‰nh Quáº£ng Ninh Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i thá»i PhĂ¡p thuá»™c vá»›i vai trĂ² quan trá»ng vá» khai thĂ¡c than vĂ  cáº£ng biá»ƒn."
    },
    {
      year: "1936",
      event: "Cuá»™c tá»•ng bĂ£i cĂ´ng cá»§a cĂ´ng nhĂ¢n vĂ¹ng má» Quáº£ng Ninh diá»…n ra, trá»Ÿ thĂ nh dáº¥u má»‘c lá»›n trong phong trĂ o cĂ´ng nhĂ¢n Viá»‡t Nam."
    },
    {
      year: "1963",
      event: "Hai tá»‰nh Háº£i Ninh vĂ  khu Há»“ng Quáº£ng Ä‘Æ°á»£c há»£p nháº¥t Ä‘á»ƒ thĂ nh láº­p tá»‰nh Quáº£ng Ninh."
    },
    {
      year: "1994",
      event: "Vá»‹nh Háº¡ Long láº§n Ä‘áº§u Ä‘Æ°á»£c UNESCO cĂ´ng nháº­n lĂ  Di sáº£n thiĂªn nhiĂªn tháº¿ giá»›i vá» giĂ¡ trá»‹ tháº©m má»¹."
    },
    {
      year: "2000",
      event: "Vá»‹nh Háº¡ Long tiáº¿p tá»¥c Ä‘Æ°á»£c UNESCO cĂ´ng nháº­n láº§n thá»© hai vá» giĂ¡ trá»‹ Ä‘á»‹a cháº¥t vĂ  Ä‘á»‹a máº¡o."
    },
    {
      year: "2025-2026",
      event: "Quáº£ng Ninh tiáº¿p tá»¥c phĂ¡t triá»ƒn máº¡nh du lá»‹ch quá»‘c táº¿, kinh táº¿ biá»ƒn vĂ  háº¡ táº§ng giao thĂ´ng hiá»‡n Ä‘áº¡i vĂ¹ng ÄĂ´ng Báº¯c."
    }
  ],

  places: [
    {
      name: "Vá»‹nh Háº¡ Long",
      description: "Di sáº£n thiĂªn nhiĂªn tháº¿ giá»›i ná»•i tiáº¿ng vá»›i hĂ ng nghĂ¬n Ä‘áº£o Ä‘Ă¡ vĂ´i vĂ  cáº£nh quan biá»ƒn tuyá»‡t Ä‘áº¹p.",
      image: "/banner/ha long.jpg"
    },
    {
      name: "YĂªn Tá»­",
      description: "Khu danh tháº¯ng tĂ¢m linh ná»•i tiáº¿ng gáº¯n liá»n vá»›i Thiá»n phĂ¡i TrĂºc LĂ¢m vĂ  vua Tráº§n NhĂ¢n TĂ´ng.",
      image: "/banner/yen tu.jpg"
    },
    {
      name: "BĂ£i ChĂ¡y",
      description: "Khu du lá»‹ch biá»ƒn ná»•i tiáº¿ng vá»›i bĂ£i biá»ƒn Ä‘áº¹p vĂ  nhiá»u hoáº¡t Ä‘á»™ng vui chÆ¡i giáº£i trĂ­.",
      image: "/banner/bai chay.jpg"
    }
  ],

  cuisine: [
    {
      name: "Cháº£ má»±c Háº¡ Long",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng cá»§a Quáº£ng Ninh vá»›i hÆ°Æ¡ng vá»‹ thÆ¡m ngon vĂ  Ä‘á»™ dai Ä‘áº·c trÆ°ng tá»« má»±c tÆ°Æ¡i.",
      image: "/banner/cha muc.jpg"
    },
    {
      name: "SĂ¡ sĂ¹ng",
      description: "Äáº·c sáº£n biá»ƒn quĂ½ hiáº¿m thÆ°á»ng dĂ¹ng Ä‘á»ƒ náº¥u nÆ°á»›c dĂ¹ng phá»Ÿ hoáº·c cháº¿ biáº¿n mĂ³n háº£i sáº£n cao cáº¥p.",
      image: "/banner/sa sung.webp"
    },
    {
      name: "BĂºn bá» bá»",
      description: "MĂ³n bĂºn háº£i sáº£n ná»•i tiáº¿ng vá»›i nÆ°á»›c dĂ¹ng ngá»t thanh tá»« bá» bá» tÆ°Æ¡i sá»‘ng.",
      image: "/banner/bun be be.jpeg"
    }
  ]
};

const HAIPHONG_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ thĂ nh phá»‘ Háº£i PhĂ²ng vĂ  Háº£i DÆ°Æ¡ng. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "3.194,72 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "4.664.124 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a ven biá»ƒn" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ thĂ nh phá»‘ Háº£i PhĂ²ng vĂ  Háº£i DÆ°Æ¡ng; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1888",
      event: "Háº£i PhĂ²ng chĂ­nh thá»©c Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i thá»i PhĂ¡p thuá»™c vĂ  nhanh chĂ³ng trá»Ÿ thĂ nh cáº£ng biá»ƒn quan trá»ng á»Ÿ Báº¯c Ká»³."
    },
    {
      year: "1955",
      event: "Háº£i PhĂ²ng hoĂ n toĂ n giáº£i phĂ³ng, trá»Ÿ thĂ nh má»™t trong nhá»¯ng trung tĂ¢m cĂ´ng nghiá»‡p lá»›n cá»§a miá»n Báº¯c."
    },
    {
      year: "1986",
      event: "Sau thá»i ká»³ Äá»•i má»›i, Háº£i PhĂ²ng phĂ¡t triá»ƒn máº¡nh vá» cĂ´ng nghiá»‡p, cáº£ng biá»ƒn vĂ  giao thÆ°Æ¡ng quá»‘c táº¿."
    },
    {
      year: "2018",
      event: "Cáº§u vÆ°á»£t biá»ƒn TĂ¢n VÅ© - Láº¡ch Huyá»‡n hoĂ n thĂ nh, gĂ³p pháº§n thĂºc Ä‘áº©y káº¿t ná»‘i giao thĂ´ng vĂ  kinh táº¿ biá»ƒn."
    },
    {
      year: "2023",
      event: "Háº£i PhĂ²ng tiáº¿p tá»¥c náº±m trong nhĂ³m Ä‘á»‹a phÆ°Æ¡ng cĂ³ tá»‘c Ä‘á»™ tÄƒng trÆ°á»Ÿng kinh táº¿ cao nháº¥t cáº£ nÆ°á»›c."
    },
    {
      year: "2025-2026",
      event: "ThĂ nh phá»‘ Ä‘áº©y máº¡nh phĂ¡t triá»ƒn cáº£ng biá»ƒn quá»‘c táº¿, logistics, Ä‘Ă´ thá»‹ thĂ´ng minh vĂ  du lá»‹ch biá»ƒn Ä‘áº£o."
    }
  ],

  places: [
    {
      name: "Äáº£o CĂ¡t BĂ ",
      description: "Quáº§n Ä‘áº£o ná»•i tiáº¿ng vá»›i cáº£nh quan thiĂªn nhiĂªn tuyá»‡t Ä‘áº¹p vĂ  VÆ°á»n quá»‘c gia CĂ¡t BĂ  Ä‘a dáº¡ng sinh há»c.",
      image: "/banner/cat ba.webp"
    },
    {
      name: "NhĂ  hĂ¡t lá»›n Háº£i PhĂ²ng",
      description: "CĂ´ng trĂ¬nh kiáº¿n trĂºc cá»• mang phong cĂ¡ch chĂ¢u Ă‚u ná»•i báº­t giá»¯a trung tĂ¢m thĂ nh phá»‘.",
      image: "/banner/nha hat hai phong.jpg"
    },
    {
      name: "BĂ£i biá»ƒn Äá»“ SÆ¡n",
      description: "Khu du lá»‹ch biá»ƒn ná»•i tiáº¿ng vá»›i cáº£nh quan Ä‘áº¹p vĂ  nhiá»u lá»… há»™i truyá»n thá»‘ng Ä‘áº·c sáº¯c.",
      image: "/banner/do son.jpg"
    }
  ],

  cuisine: [
    {
      name: "BĂ¡nh Ä‘a cua",
      description: "MĂ³n Äƒn Ä‘áº·c sáº£n ná»•i tiáº¿ng cá»§a Háº£i PhĂ²ng vá»›i nÆ°á»›c dĂ¹ng Ä‘áº­m vá»‹ cua Ä‘á»“ng vĂ  bĂ¡nh Ä‘a Ä‘á» Ä‘áº·c trÆ°ng.",
      image: "/banner/banh da cua.jpg"
    },
    {
      name: "Nem cua bá»ƒ",
      description: "MĂ³n nem vuĂ´ng ná»•i tiáº¿ng vá»›i nhĂ¢n cua biá»ƒn thÆ¡m ngon vĂ  lá»›p vá» chiĂªn giĂ²n háº¥p dáº«n.",
      image: "/banner/nem cua be.png"
    },
    {
      name: "BĂºn cĂ¡ cay",
      description: "MĂ³n bĂºn Ä‘áº·c sáº£n vá»›i nÆ°á»›c dĂ¹ng cay nháº¹, cĂ¡ chiĂªn giĂ²n vĂ  cháº£ cĂ¡ Ä‘áº­m Ä‘Ă .",
      image: "/banner/bun ca.jpg"
    }
  ]
};

const HUNGYEN_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ ThĂ¡i BĂ¬nh vĂ  HÆ°ng YĂªn. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "2.514,81 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "3.567.943 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ ThĂ¡i BĂ¬nh vĂ  HÆ°ng YĂªn; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1831",
      event: "Tá»‰nh HÆ°ng YĂªn chĂ­nh thá»©c Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i triá»u vua Minh Máº¡ng nhĂ  Nguyá»…n."
    },
    {
      year: "Tháº¿ ká»· XVII",
      event: "Phá»‘ Hiáº¿n phĂ¡t triá»ƒn hÆ°ng thá»‹nh, trá»Ÿ thĂ nh thÆ°Æ¡ng cáº£ng sáº§m uáº¥t ná»•i tiáº¿ng vá»›i cĂ¢u nĂ³i 'Thá»© nháº¥t Kinh Ká»³, thá»© nhĂ¬ Phá»‘ Hiáº¿n'."
    },
    {
      year: "1968",
      event: "HÆ°ng YĂªn sĂ¡p nháº­p vá»›i Háº£i DÆ°Æ¡ng thĂ nh tá»‰nh Háº£i HÆ°ng."
    },
    {
      year: "1997",
      event: "Tá»‰nh HÆ°ng YĂªn Ä‘Æ°á»£c tĂ¡i láº­p sau khi tĂ¡ch khá»i tá»‰nh Háº£i HÆ°ng."
    },
    {
      year: "2013",
      event: "NhĂ£n lá»“ng HÆ°ng YĂªn Ä‘Æ°á»£c báº£o há»™ chá»‰ dáº«n Ä‘á»‹a lĂ½, kháº³ng Ä‘á»‹nh thÆ°Æ¡ng hiá»‡u Ä‘áº·c sáº£n ná»•i tiáº¿ng cá»§a Ä‘á»‹a phÆ°Æ¡ng."
    },
    {
      year: "2025-2026",
      event: "HÆ°ng YĂªn tiáº¿p tá»¥c phĂ¡t triá»ƒn cĂ´ng nghiá»‡p, Ä‘Ă´ thá»‹ hiá»‡n Ä‘áº¡i vĂ  báº£o tá»“n cĂ¡c giĂ¡ trá»‹ vÄƒn hĂ³a truyá»n thá»‘ng vĂ¹ng Ä‘á»“ng báº±ng Báº¯c Bá»™."
    }
  ],

  places: [
    {
      name: "Phá»‘ Hiáº¿n",
      description: "Khu di tĂ­ch lá»‹ch sá»­ ná»•i tiáº¿ng tá»«ng lĂ  thÆ°Æ¡ng cáº£ng sáº§m uáº¥t báº­c nháº¥t miá»n Báº¯c Viá»‡t Nam.",
      image: "/banner/pho hien.JPG"
    },
    {
      name: "Äá»n Chá»­ Äá»“ng Tá»­",
      description: "Di tĂ­ch tĂ¢m linh ná»•i tiáº¿ng gáº¯n liá»n vá»›i truyá»n thuyáº¿t Chá»­ Äá»“ng Tá»­ - TiĂªn Dung.",
      image: "/banner/den chu dong tu.jpg"
    },
    {
      name: "Há»“ BĂ¡n Nguyá»‡t",
      description: "Danh tháº¯ng ná»•i báº­t náº±m giá»¯a trung tĂ¢m thĂ nh phá»‘ HÆ°ng YĂªn vá»›i khung cáº£nh thanh bĂ¬nh.",
      image: "/banner/ho ban nguyet.webp"
    }
  ],

  cuisine: [
    {
      name: "NhĂ£n lá»“ng HÆ°ng YĂªn",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng vá»›i quáº£ to, cĂ¹i dĂ y, vá»‹ ngá»t thÆ¡m Ä‘áº·c trÆ°ng.",
      image: "/banner/nhan long.jpg"
    },
    {
      name: "BĂºn thang lÆ°Æ¡n",
      description: "MĂ³n Äƒn Ä‘áº·c sáº£n vá»›i nÆ°á»›c dĂ¹ng Ä‘áº­m Ä‘Ă  vĂ  lÆ°Æ¡n cháº¿ biáº¿n thÆ¡m ngon.",
      image: "/banner/bun thang luon.jpg"
    },
    {
      name: "GĂ  ÄĂ´ng Táº£o",
      description: "Giá»‘ng gĂ  quĂ½ ná»•i tiáº¿ng vá»›i Ä‘Ă´i chĂ¢n to Ä‘áº·c trÆ°ng vĂ  cháº¥t lÆ°á»£ng thá»‹t thÆ¡m ngon.",
      image: "/banner/ga dong tao.jpg"
    }
  ]
};

const NINHBINH_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ HĂ  Nam, Nam Äá»‹nh vĂ  Ninh BĂ¬nh. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "3.942,62 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "4.412.264 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ HĂ  Nam, Nam Äá»‹nh vĂ  Ninh BĂ¬nh; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "968",
      event: "Äinh Bá»™ LÄ©nh lĂªn ngĂ´i HoĂ ng Ä‘áº¿, Ä‘áº·t quá»‘c hiá»‡u Äáº¡i Cá»“ Viá»‡t vĂ  chá»n Hoa LÆ° lĂ m kinh Ä‘Ă´ Ä‘áº§u tiĂªn cá»§a nhĂ  nÆ°á»›c phong kiáº¿n táº­p quyá»n Viá»‡t Nam."
    },
    {
      year: "1010",
      event: "Vua LĂ½ ThĂ¡i Tá»• dá»i Ä‘Ă´ tá»« Hoa LÆ° ra ThÄƒng Long, má»Ÿ ra thá»i ká»³ phĂ¡t triá»ƒn má»›i cá»§a Ä‘áº¥t nÆ°á»›c."
    },
    {
      year: "1831",
      event: "Tá»‰nh Ninh BĂ¬nh chĂ­nh thá»©c Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i triá»u vua Minh Máº¡ng nhĂ  Nguyá»…n."
    },
    {
      year: "2014",
      event: "Quáº§n thá»ƒ danh tháº¯ng TrĂ ng An Ä‘Æ°á»£c UNESCO cĂ´ng nháº­n lĂ  Di sáº£n vÄƒn hĂ³a vĂ  thiĂªn nhiĂªn tháº¿ giá»›i."
    },
    {
      year: "2023",
      event: "Ninh BĂ¬nh tiáº¿p tá»¥c náº±m trong nhĂ³m Ä‘iá»ƒm Ä‘áº¿n du lá»‹ch háº¥p dáº«n hĂ ng Ä‘áº§u Viá»‡t Nam vá»›i lÆ°á»£ng khĂ¡ch tÄƒng máº¡nh."
    },
    {
      year: "2025-2026",
      event: "Tá»‰nh Ä‘áº©y máº¡nh phĂ¡t triá»ƒn du lá»‹ch sinh thĂ¡i, du lá»‹ch di sáº£n vĂ  háº¡ táº§ng giao thĂ´ng káº¿t ná»‘i vĂ¹ng Báº¯c Bá»™."
    }
  ],

  places: [
    {
      name: "Quáº§n thá»ƒ danh tháº¯ng TrĂ ng An",
      description: "Di sáº£n tháº¿ giá»›i ná»•i tiáº¿ng vá»›i há»‡ thá»‘ng nĂºi Ä‘Ă¡ vĂ´i, hang Ä‘á»™ng vĂ  dĂ²ng sĂ´ng thÆ¡ má»™ng.",
      image: "/banner/trang an.png"
    },
    {
      name: "Cá»‘ Ä‘Ă´ Hoa LÆ°",
      description: "Khu di tĂ­ch lá»‹ch sá»­ Ä‘áº·c biá»‡t gáº¯n liá»n vá»›i triá»u Ä‘áº¡i Äinh vĂ  Tiá»n LĂª.",
      image: "/banner/hoa lu.jpg"
    },
    {
      name: "Tam Cá»‘c - BĂ­ch Äá»™ng",
      description: "Danh tháº¯ng ná»•i tiáº¿ng Ä‘Æ°á»£c vĂ­ nhÆ° 'Vá»‹nh Háº¡ Long trĂªn cáº¡n' vá»›i phong cáº£nh há»¯u tĂ¬nh.",
      image: "/banner/tam coc.jpg"
    }
  ],

  cuisine: [
    {
      name: "CÆ¡m chĂ¡y Ninh BĂ¬nh",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng vá»›i lá»›p cÆ¡m giĂ²n rá»¥m Äƒn kĂ¨m nÆ°á»›c sá»‘t Ä‘áº­m Ä‘Ă .",
      image: "/banner/com chay.jpg"
    },
    {
      name: "Thá»‹t dĂª nĂºi",
      description: "MĂ³n Äƒn Ä‘áº·c sáº£n ná»•i tiáº¿ng vá»›i thá»‹t dĂª sÄƒn cháº¯c Ä‘Æ°á»£c cháº¿ biáº¿n thĂ nh nhiá»u mĂ³n háº¥p dáº«n.",
      image: "/banner/thit de.webp"
    },
    {
      name: "Miáº¿n lÆ°Æ¡n",
      description: "MĂ³n Äƒn dĂ¢n dĂ£ vá»›i nÆ°á»›c dĂ¹ng ngá»t thanh vĂ  lÆ°Æ¡n thÆ¡m ngon Ä‘áº·c trÆ°ng.",
      image: "/banner/mien luon.webp"
    }
  ]
};

const THANHHOA_DATA = {
  overview: {
    description: "Thanh HĂ³a lĂ  tá»‰nh thuá»™c vĂ¹ng Báº¯c Trung Bá»™ Viá»‡t Nam, ná»•i tiáº¿ng vá»›i bá» dĂ y lá»‹ch sá»­, vÄƒn hĂ³a lĂ¢u Ä‘á»i cĂ¹ng nhiá»u danh lam tháº¯ng cáº£nh vĂ  bĂ£i biá»ƒn Ä‘áº¹p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "11.114 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "Khoáº£ng 3,8 triá»‡u ngÆ°á»i (2026)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a" }
    ]
  },

  history: [
    {
      year: "1029",
      event: "TĂªn gá»i Thanh HĂ³a xuáº¥t hiá»‡n dÆ°á»›i triá»u vua LĂ½ ThĂ¡i TĂ´ng, trá»Ÿ thĂ nh vĂ¹ng Ä‘áº¥t quan trá»ng cá»§a Äáº¡i Viá»‡t."
    },
    {
      year: "1400",
      event: "Há»“ QuĂ½ Ly lĂªn ngĂ´i HoĂ ng Ä‘áº¿ vĂ  xĂ¢y dá»±ng ThĂ nh NhĂ  Há»“ táº¡i Thanh HĂ³a."
    },
    {
      year: "1804",
      event: "NhĂ  Nguyá»…n chĂ­nh thá»©c Ä‘áº·t tĂªn Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh lĂ  tráº¥n Thanh HĂ³a."
    },
    {
      year: "2011",
      event: "ThĂ nh NhĂ  Há»“ Ä‘Æ°á»£c UNESCO cĂ´ng nháº­n lĂ  Di sáº£n vÄƒn hĂ³a tháº¿ giá»›i."
    },
    {
      year: "2023",
      event: "Thanh HĂ³a tiáº¿p tá»¥c náº±m trong nhĂ³m tá»‰nh cĂ³ tá»‘c Ä‘á»™ phĂ¡t triá»ƒn kinh táº¿ cao cá»§a khu vá»±c Báº¯c Trung Bá»™."
    },
    {
      year: "2025-2026",
      event: "Tá»‰nh Ä‘áº©y máº¡nh phĂ¡t triá»ƒn du lá»‹ch biá»ƒn, cĂ´ng nghiá»‡p, nÄƒng lÆ°á»£ng vĂ  háº¡ táº§ng kinh táº¿ trá»ng Ä‘iá»ƒm."
    }
  ],

  places: [
    {
      name: "ThĂ nh NhĂ  Há»“",
      description: "Di sáº£n vÄƒn hĂ³a tháº¿ giá»›i ná»•i báº­t vá»›i kiáº¿n trĂºc thĂ nh Ä‘Ă¡ Ä‘á»™c Ä‘Ă¡o cá»§a triá»u Há»“.",
      image: "/banner/thanh nha ho.webp"
    },
    {
      name: "Biá»ƒn Sáº§m SÆ¡n",
      description: "BĂ£i biá»ƒn ná»•i tiáº¿ng vá»›i bá» cĂ¡t dĂ i, lĂ  Ä‘iá»ƒm du lá»‹ch háº¥p dáº«n cá»§a miá»n Báº¯c Viá»‡t Nam.",
      image: "/banner/sam son beach.jpg"
    },
    {
      name: "Suá»‘i cĂ¡ tháº§n Cáº©m LÆ°Æ¡ng",
      description: "Danh tháº¯ng ná»•i tiáº¿ng vá»›i Ä‘Ă n cĂ¡ tá»± nhiĂªn gáº¯n liá»n nhiá»u truyá»n thuyáº¿t dĂ¢n gian.",
      image: "/banner/cam luong fish stream.jpg"
    }
  ],

  cuisine: [
    {
      name: "Nem chua Thanh HĂ³a",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng vá»›i vá»‹ chua nháº¹, cay thÆ¡m vĂ  hÆ°Æ¡ng vá»‹ Ä‘áº·c trÆ°ng khĂ³ quĂªn.",
      image: "/banner/nem chua.jpg"
    },
    {
      name: "Cháº£ tĂ´m",
      description: "MĂ³n Äƒn Ä‘áº·c sáº£n vá»›i tĂ´m tÆ°Æ¡i bá»c bĂ¡nh phá»Ÿ nÆ°á»›ng thÆ¡m ngon háº¥p dáº«n.",
      image: "/banner/cha tom.jpg"
    },
    {
      name: "BĂ¡nh rÄƒng bá»«a",
      description: "MĂ³n bĂ¡nh truyá»n thá»‘ng dĂ¢n dĂ£ vá»›i nhĂ¢n thá»‹t thÆ¡m ngon vĂ  lá»›p bá»™t má»m dáº»o.",
      image: "/banner/banh rang bua.jpeg"
    }
  ]
};

const NGHEAN_DATA = {
  overview: {
    description: "Nghá»‡ An lĂ  tá»‰nh lá»›n nháº¥t Viá»‡t Nam thuá»™c vĂ¹ng Báº¯c Trung Bá»™, ná»•i tiáº¿ng vá»›i truyá»n thá»‘ng hiáº¿u há»c, quĂª hÆ°Æ¡ng Chá»§ tá»‹ch Há»“ ChĂ­ Minh vĂ  nhiá»u danh lam tháº¯ng cáº£nh ná»•i báº­t.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "16.490 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "Khoáº£ng 3,5 triá»‡u ngÆ°á»i (2026)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a" }
    ]
  },

  history: [
    {
      year: "1030",
      event: "TĂªn gá»i Nghá»‡ An xuáº¥t hiá»‡n dÆ°á»›i triá»u vua LĂ½ ThĂ¡i TĂ´ng, trá»Ÿ thĂ nh vĂ¹ng Ä‘áº¥t quan trá»ng cá»§a Äáº¡i Viá»‡t."
    },
    {
      year: "1888",
      event: "Phong trĂ o Cáº§n VÆ°Æ¡ng vĂ  nhiá»u cuá»™c Ä‘áº¥u tranh yĂªu nÆ°á»›c diá»…n ra máº¡nh máº½ táº¡i Nghá»‡ An."
    },
    {
      year: "1930",
      event: "Phong trĂ o XĂ´ Viáº¿t Nghá»‡ TÄ©nh bĂ¹ng ná»•, trá»Ÿ thĂ nh dáº¥u má»‘c quan trá»ng trong lá»‹ch sá»­ cĂ¡ch máº¡ng Viá»‡t Nam."
    },
    {
      year: "1957",
      event: "Khu di tĂ­ch Kim LiĂªn - quĂª hÆ°Æ¡ng Chá»§ tá»‹ch Há»“ ChĂ­ Minh Ä‘Æ°á»£c báº£o tá»“n vĂ  phĂ¡t triá»ƒn thĂ nh Ä‘iá»ƒm Ä‘áº¿n lá»‹ch sá»­ ná»•i tiáº¿ng."
    },
    {
      year: "2023",
      event: "Nghá»‡ An tiáº¿p tá»¥c phĂ¡t triá»ƒn máº¡nh vá» cĂ´ng nghiá»‡p, du lá»‹ch vĂ  háº¡ táº§ng giao thĂ´ng khu vá»±c Báº¯c Trung Bá»™."
    },
    {
      year: "2025-2026",
      event: "Tá»‰nh Ä‘áº©y máº¡nh phĂ¡t triá»ƒn kinh táº¿ biá»ƒn, nÄƒng lÆ°á»£ng tĂ¡i táº¡o vĂ  du lá»‹ch vÄƒn hĂ³a - sinh thĂ¡i."
    }
  ],

  places: [
    {
      name: "LĂ ng Sen Kim LiĂªn",
      description: "QuĂª hÆ°Æ¡ng Chá»§ tá»‹ch Há»“ ChĂ­ Minh, di tĂ­ch lá»‹ch sá»­ ná»•i tiáº¿ng thu hĂºt Ä‘Ă´ng Ä‘áº£o du khĂ¡ch.",
      image: "/banner/kim lien.jpg"
    },
    {
      name: "Biá»ƒn Cá»­a LĂ²",
      description: "BĂ£i biá»ƒn ná»•i tiáº¿ng vá»›i bá» cĂ¡t dĂ i, nÆ°á»›c biá»ƒn trong xanh vĂ  nhiá»u hoáº¡t Ä‘á»™ng du lá»‹ch háº¥p dáº«n.",
      image: "/banner/cua lo beach.webp"
    },
    {
      name: "VÆ°á»n quá»‘c gia PĂ¹ MĂ¡t",
      description: "Khu báº£o tá»“n thiĂªn nhiĂªn ná»•i báº­t vá»›i há»‡ sinh thĂ¡i rá»«ng nguyĂªn sinh Ä‘a dáº¡ng.",
      image: "/banner/pu mat.jpg"
    }
  ],

  cuisine: [
    {
      name: "ChĂ¡o lÆ°Æ¡n Nghá»‡ An",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng vá»›i thá»‹t lÆ°Æ¡n cay thÆ¡m vĂ  nÆ°á»›c dĂ¹ng Ä‘áº­m Ä‘Ă  Ä‘áº·c trÆ°ng.",
      image: "/banner/chao luon.jpg"
    },
    {
      name: "BĂ¡nh mÆ°á»›t",
      description: "MĂ³n Äƒn dĂ¢n dĂ£ má»m má»‹n thÆ°á»ng Äƒn kĂ¨m cháº£ lá»¥a hoáº·c nÆ°á»›c dĂ¹ng nĂ³ng.",
      image: "/banner/banh muot.webp"
    },
    {
      name: "NhĂºt Thanh ChÆ°Æ¡ng",
      description: "Äáº·c sáº£n lĂ m tá»« mĂ­t non muá»‘i chua mang hÆ°Æ¡ng vá»‹ Ä‘á»™c Ä‘Ă¡o cá»§a ngÆ°á»i dĂ¢n xá»© Nghá»‡.",
      image: "/banner/nhut thanh chuong.webp"
    }
  ]
};

const HATINH_DATA = {
  overview: {
    description: "HĂ  TÄ©nh lĂ  tá»‰nh thuá»™c vĂ¹ng Báº¯c Trung Bá»™ Viá»‡t Nam, ná»•i tiáº¿ng vá»›i truyá»n thá»‘ng hiáº¿u há»c, quĂª hÆ°Æ¡ng nhiá»u danh nhĂ¢n lá»‹ch sá»­ vĂ  váº» Ä‘áº¹p thiĂªn nhiĂªn Ä‘áº·c trÆ°ng miá»n Trung.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "5.994 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "Khoáº£ng 1,4 triá»‡u ngÆ°á»i (2026)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a" }
    ]
  },

  history: [
    {
      year: "1831",
      event: "Tá»‰nh HĂ  TÄ©nh chĂ­nh thá»©c Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i triá»u vua Minh Máº¡ng nhĂ  Nguyá»…n."
    },
    {
      year: "1930",
      event: "Phong trĂ o XĂ´ Viáº¿t Nghá»‡ TÄ©nh diá»…n ra máº¡nh máº½ táº¡i HĂ  TÄ©nh vĂ  Nghá»‡ An, trá»Ÿ thĂ nh dáº¥u má»‘c lá»‹ch sá»­ cĂ¡ch máº¡ng Viá»‡t Nam."
    },
    {
      year: "1968",
      event: "HĂ  TÄ©nh sĂ¡p nháº­p vá»›i Nghá»‡ An thĂ nh tá»‰nh Nghá»‡ TÄ©nh."
    },
    {
      year: "1991",
      event: "Tá»‰nh HĂ  TÄ©nh Ä‘Æ°á»£c tĂ¡i láº­p sau khi tĂ¡ch khá»i tá»‰nh Nghá»‡ TÄ©nh."
    },
    {
      year: "2015",
      event: "Khu kinh táº¿ VÅ©ng Ăng phĂ¡t triá»ƒn máº¡nh, trá»Ÿ thĂ nh trung tĂ¢m cĂ´ng nghiá»‡p lá»›n cá»§a miá»n Trung."
    },
    {
      year: "2025-2026",
      event: "HĂ  TÄ©nh tiáº¿p tá»¥c phĂ¡t triá»ƒn cĂ´ng nghiá»‡p, nÄƒng lÆ°á»£ng, kinh táº¿ biá»ƒn vĂ  du lá»‹ch sinh thĂ¡i."
    }
  ],

  places: [
    {
      name: "NgĂ£ ba Äá»“ng Lá»™c",
      description: "Di tĂ­ch lá»‹ch sá»­ ná»•i tiáº¿ng gáº¯n liá»n vá»›i sá»± hy sinh anh dÅ©ng cá»§a 10 ná»¯ thanh niĂªn xung phong.",
      image: "/banner/nga ba dong loc.jpg"
    },
    {
      name: "Biá»ƒn ThiĂªn Cáº§m",
      description: "BĂ£i biá»ƒn ná»•i tiáº¿ng vá»›i lĂ n nÆ°á»›c trong xanh vĂ  bĂ£i cĂ¡t Ä‘áº¹p cá»§a HĂ  TÄ©nh.",
      image: "/banner/thien cam beach.jpg"
    },
    {
      name: "ChĂ¹a HÆ°Æ¡ng TĂ­ch",
      description: "Danh tháº¯ng tĂ¢m linh ná»•i tiáº¿ng náº±m trĂªn nĂºi Há»“ng LÄ©nh vá»›i phong cáº£nh há»¯u tĂ¬nh.",
      image: "/banner/huong tich pagoda.jpg"
    }
  ],

  cuisine: [
    {
      name: "Káº¹o cu Ä‘Æ¡",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng cá»§a HĂ  TÄ©nh vá»›i vá»‹ ngá»t thÆ¡m tá»« láº¡c, máº­t mĂ­a vĂ  bĂ¡nh trĂ¡ng.",
      image: "/banner/keo cu do.webp"
    },
    {
      name: "Ram bĂ¡nh mÆ°á»›t",
      description: "MĂ³n Äƒn dĂ¢n dĂ£ ná»•i tiáº¿ng vá»›i bĂ¡nh mÆ°á»›t má»m Äƒn kĂ¨m ram giĂ²n rá»¥m.",
      image: "/banner/banh muot.jpg"
    },
    {
      name: "Gá»i cĂ¡ Ä‘á»¥c",
      description: "Äáº·c sáº£n biá»ƒn ná»•i tiáº¿ng vá»›i cĂ¡ tÆ°Æ¡i trá»™n gia vá»‹ vĂ  rau sá»‘ng Ä‘áº·c trÆ°ng miá»n Trung.",
      image: "/banner/goi ca.webp"
    }
  ]
};

const QUANGTRI_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ Quáº£ng BĂ¬nh vĂ  Quáº£ng Trá»‹. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "12.700 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "1.870.845 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ Quáº£ng BĂ¬nh vĂ  Quáº£ng Trá»‹; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1809",
      event: "TĂªn gá»i Quáº£ng Trá»‹ chĂ­nh thá»©c xuáº¥t hiá»‡n dÆ°á»›i triá»u vua Gia Long nhĂ  Nguyá»…n."
    },
    {
      year: "1954",
      event: "Hiá»‡p Ä‘á»‹nh GenĂ¨ve Ä‘Æ°á»£c kĂ½ káº¿t, sĂ´ng Báº¿n Háº£i táº¡i Quáº£ng Trá»‹ trá»Ÿ thĂ nh giá»›i tuyáº¿n quĂ¢n sá»± táº¡m thá»i chia cáº¯t hai miá»n Nam - Báº¯c."
    },
    {
      year: "1972",
      event: "81 ngĂ y Ä‘Ăªm chiáº¿n Ä‘áº¥u báº£o vá»‡ ThĂ nh cá»• Quáº£ng Trá»‹ trá»Ÿ thĂ nh biá»ƒu tÆ°á»£ng anh dÅ©ng trong khĂ¡ng chiáº¿n chá»‘ng Má»¹."
    },
    {
      year: "1975",
      event: "Quáº£ng Trá»‹ Ä‘Æ°á»£c giáº£i phĂ³ng hoĂ n toĂ n, gĂ³p pháº§n vĂ o tháº¯ng lá»£i thá»‘ng nháº¥t Ä‘áº¥t nÆ°á»›c."
    },
    {
      year: "1989",
      event: "Tá»‰nh Quáº£ng Trá»‹ Ä‘Æ°á»£c tĂ¡i láº­p sau khi tĂ¡ch khá»i tá»‰nh BĂ¬nh Trá»‹ ThiĂªn."
    },
    {
      year: "2025-2026",
      event: "Quáº£ng Trá»‹ tiáº¿p tá»¥c phĂ¡t triá»ƒn du lá»‹ch lá»‹ch sá»­, nÄƒng lÆ°á»£ng tĂ¡i táº¡o vĂ  kinh táº¿ biá»ƒn miá»n Trung."
    }
  ],

  places: [
    {
      name: "ThĂ nh cá»• Quáº£ng Trá»‹",
      description: "Di tĂ­ch lá»‹ch sá»­ quá»‘c gia Ä‘áº·c biá»‡t gáº¯n liá»n vá»›i cuá»™c chiáº¿n 81 ngĂ y Ä‘Ăªm nÄƒm 1972.",
      image: "/banner/quang tri citadel.jpg"
    },
    {
      name: "Cáº§u Hiá»n LÆ°Æ¡ng - SĂ´ng Báº¿n Háº£i",
      description: "Biá»ƒu tÆ°á»£ng lá»‹ch sá»­ vá» sá»± chia cáº¯t vĂ  thá»‘ng nháº¥t Ä‘áº¥t nÆ°á»›c Viá»‡t Nam.",
      image: "/banner/hien luong bridge.webp"
    },
    {
      name: "Äáº£o Cá»“n Cá»",
      description: "HĂ²n Ä‘áº£o ná»•i tiáº¿ng vá»›i cáº£nh quan thiĂªn nhiĂªn hoang sÆ¡ vĂ  vá»‹ trĂ­ chiáº¿n lÆ°á»£c ngoĂ i khÆ¡i miá»n Trung.",
      image: "/banner/con co island.jpg"
    }
  ],

  cuisine: [
    {
      name: "BĂºn háº¿n Mai XĂ¡",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng vá»›i vá»‹ ngá»t thanh tá»« háº¿n vĂ  nÆ°á»›c dĂ¹ng Ä‘áº­m Ä‘Ă .",
      image: "/banner/bun hen.jpg"
    },
    {
      name: "ChĂ¡o váº¡t giÆ°á»ng",
      description: "MĂ³n Äƒn dĂ¢n dĂ£ vá»›i sá»£i bá»™t dĂ y Äƒn cĂ¹ng tĂ´m, thá»‹t vĂ  nÆ°á»›c dĂ¹ng thÆ¡m ngon.",
      image: "/banner/chaovat.jpg"
    },
    {
      name: "BĂ¡nh Ă©p",
      description: "MĂ³n Äƒn váº·t ná»•i tiáº¿ng miá»n Trung vá»›i lá»›p bĂ¡nh giĂ²n thÆ¡m Äƒn kĂ¨m rau sá»‘ng vĂ  nÆ°á»›c cháº¥m.",
      image: "/banner/banh ep.webp"
    }
  ]
};

const HUE_DATA = {
  overview: {
    description: "Huáº¿ lĂ  thĂ nh phá»‘ trá»±c thuá»™c trung Æ°Æ¡ng cá»§a Viá»‡t Nam, ná»•i tiáº¿ng vá»›i quáº§n thá»ƒ di tĂ­ch cá»‘ Ä‘Ă´, vÄƒn hĂ³a cung Ä‘Ă¬nh Ä‘áº·c sáº¯c vĂ  váº» Ä‘áº¹p thÆ¡ má»™ng bĂªn dĂ²ng sĂ´ng HÆ°Æ¡ng.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "4.947 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "Khoáº£ng 1,3 triá»‡u ngÆ°á»i (2026)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a" }
    ]
  },

  history: [
    {
      year: "1802",
      event: "Vua Gia Long lĂªn ngĂ´i, chá»n Huáº¿ lĂ m kinh Ä‘Ă´ cá»§a triá»u Nguyá»…n - triá»u Ä‘áº¡i phong kiáº¿n cuá»‘i cĂ¹ng cá»§a Viá»‡t Nam."
    },
    {
      year: "1805",
      event: "Kinh thĂ nh Huáº¿ báº¯t Ä‘áº§u Ä‘Æ°á»£c xĂ¢y dá»±ng vá»›i quy mĂ´ lá»›n theo kiáº¿n trĂºc Vauban káº¿t há»£p phong cĂ¡ch truyá»n thá»‘ng Viá»‡t Nam."
    },
    {
      year: "1945",
      event: "Vua Báº£o Äáº¡i thoĂ¡i vá»‹ táº¡i Ngá» MĂ´n, cháº¥m dá»©t cháº¿ Ä‘á»™ phong kiáº¿n Viá»‡t Nam."
    },
    {
      year: "1993",
      event: "Quáº§n thá»ƒ di tĂ­ch Cá»‘ Ä‘Ă´ Huáº¿ Ä‘Æ°á»£c UNESCO cĂ´ng nháº­n lĂ  Di sáº£n vÄƒn hĂ³a tháº¿ giá»›i."
    },
    {
      year: "2003",
      event: "NhĂ£ nháº¡c cung Ä‘Ă¬nh Huáº¿ Ä‘Æ°á»£c UNESCO cĂ´ng nháº­n lĂ  Di sáº£n vÄƒn hĂ³a phi váº­t thá»ƒ cá»§a nhĂ¢n loáº¡i."
    },
    {
      year: "2025-2026",
      event: "Huáº¿ tiáº¿p tá»¥c phĂ¡t triá»ƒn du lá»‹ch di sáº£n, vÄƒn hĂ³a vĂ  trá»Ÿ thĂ nh trung tĂ¢m vÄƒn hĂ³a Ä‘áº·c sáº¯c cá»§a miá»n Trung Viá»‡t Nam."
    }
  ],

  places: [
    {
      name: "Äáº¡i Ná»™i Huáº¿",
      description: "Quáº§n thá»ƒ kiáº¿n trĂºc cung Ä‘Ă¬nh ná»•i tiáº¿ng tá»«ng lĂ  trung tĂ¢m quyá»n lá»±c cá»§a triá»u Nguyá»…n.",
      image: "/banner/hue imperial city.webp"
    },
    {
      name: "ChĂ¹a ThiĂªn Má»¥",
      description: "NgĂ´i chĂ¹a cá»• ná»•i tiáº¿ng náº±m bĂªn dĂ²ng sĂ´ng HÆ°Æ¡ng, biá»ƒu tÆ°á»£ng tĂ¢m linh cá»§a Huáº¿.",
      image: "/banner/thien mu pagoda.jpg"
    },
    {
      name: "LÄƒng Kháº£i Äá»‹nh",
      description: "LÄƒng vua ná»•i báº­t vá»›i kiáº¿n trĂºc káº¿t há»£p giá»¯a phong cĂ¡ch Ă ÄĂ´ng vĂ  chĂ¢u Ă‚u Ä‘á»™c Ä‘Ă¡o.",
      image: "/banner/khai dinh tomb.jpg"
    }
  ],

  cuisine: [
    {
      name: "BĂºn bĂ² Huáº¿",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng vá»›i nÆ°á»›c dĂ¹ng Ä‘áº­m Ä‘Ă , vá»‹ cay Ä‘áº·c trÆ°ng vĂ  hÆ°Æ¡ng sáº£ thÆ¡m háº¥p dáº«n.",
      image: "/banner/bun bo hue.jpg"
    },
    {
      name: "CÆ¡m háº¿n",
      description: "MĂ³n Äƒn dĂ¢n dĂ£ ná»•i tiáº¿ng vá»›i háº¿n xĂ o, cÆ¡m nguá»™i vĂ  nhiá»u loáº¡i rau thÆ¡m Ä‘áº·c trÆ°ng.",
      image: "/banner/com hen.jpg"
    },
    {
      name: "BĂ¡nh bĂ¨o Huáº¿",
      description: "MĂ³n bĂ¡nh truyá»n thá»‘ng nhá» xinh Äƒn kĂ¨m tĂ´m chĂ¡y vĂ  nÆ°á»›c máº¯m Ä‘áº­m vá»‹.",
      image: "/banner/banh beo hue.jpg"
    }
  ]
};

const QUANGNGAI_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ Kon Tum vĂ  Quáº£ng NgĂ£i. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "14.832,55 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "2.161.755 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a ven biá»ƒn" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ Kon Tum vĂ  Quáº£ng NgĂ£i; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1805",
      event: "TĂªn gá»i Quáº£ng NgĂ£i chĂ­nh thá»©c Ä‘Æ°á»£c sá»­ dá»¥ng dÆ°á»›i triá»u Nguyá»…n."
    },
    {
      year: "1909",
      event: "VÄƒn hĂ³a Sa Huá»³nh táº¡i Quáº£ng NgĂ£i Ä‘Æ°á»£c phĂ¡t hiá»‡n, trá»Ÿ thĂ nh má»™t trong nhá»¯ng ná»n vÄƒn hĂ³a kháº£o cá»• ná»•i báº­t cá»§a Viá»‡t Nam."
    },
    {
      year: "1945",
      event: "NhĂ¢n dĂ¢n Quáº£ng NgĂ£i giĂ nh chĂ­nh quyá»n trong CĂ¡ch máº¡ng ThĂ¡ng TĂ¡m."
    },
    {
      year: "1968",
      event: "Cuá»™c tháº£m sĂ¡t SÆ¡n Má»¹ xáº£y ra táº¡i Quáº£ng NgĂ£i, trá»Ÿ thĂ nh sá»± kiá»‡n gĂ¢y cháº¥n Ä‘á»™ng tháº¿ giá»›i trong chiáº¿n tranh Viá»‡t Nam."
    },
    {
      year: "2009",
      event: "NhĂ  mĂ¡y lá»c dáº§u Dung Quáº¥t chĂ­nh thá»©c váº­n hĂ nh thÆ°Æ¡ng máº¡i, thĂºc Ä‘áº©y phĂ¡t triá»ƒn kinh táº¿ khu vá»±c miá»n Trung."
    },
    {
      year: "2025-2026",
      event: "Quáº£ng NgĂ£i tiáº¿p tá»¥c phĂ¡t triá»ƒn cĂ´ng nghiá»‡p, kinh táº¿ biá»ƒn vĂ  du lá»‹ch Ä‘áº£o táº¡i khu vá»±c miá»n Trung."
    }
  ],

  places: [
    {
      name: "Äáº£o LĂ½ SÆ¡n",
      description: "HĂ²n Ä‘áº£o ná»•i tiáº¿ng vá»›i cáº£nh quan nĂºi lá»­a Ä‘á»™c Ä‘Ă¡o, biá»ƒn xanh trong vĂ  Ä‘áº·c sáº£n tá»i LĂ½ SÆ¡n.",
      image: "/banner/ly son island.webp"
    },
    {
      name: "Khu chá»©ng tĂ­ch SÆ¡n Má»¹",
      description: "Di tĂ­ch lá»‹ch sá»­ ghi láº¡i sá»± kiá»‡n SÆ¡n Má»¹ nÄƒm 1968 vĂ  thĂ´ng Ä‘iá»‡p vá» hĂ²a bĂ¬nh.",
      image: "/banner/son my memorial.jpg"
    },
    {
      name: "Biá»ƒn Má»¹ KhĂª Quáº£ng NgĂ£i",
      description: "BĂ£i biá»ƒn Ä‘áº¹p vá»›i cĂ¡t tráº¯ng má»‹n vĂ  khĂ´ng gian yĂªn bĂ¬nh cá»§a miá»n Trung.",
      image: "/banner/my khe quang ngai.jpg"
    }
  ],

  cuisine: [
    {
      name: "Don Quáº£ng NgĂ£i",
      description: "MĂ³n Äƒn Ä‘áº·c sáº£n ná»•i tiáº¿ng Ä‘Æ°á»£c cháº¿ biáº¿n tá»« don - má»™t loáº¡i nhuyá»…n thá»ƒ sá»‘ng á»Ÿ sĂ´ng.",
      image: "/banner/don quang ngai.jpg"
    },
    {
      name: "CĂ¡ bá»‘ng sĂ´ng TrĂ ",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng vá»›i cĂ¡ bá»‘ng kho Ä‘áº­m vá»‹ Äƒn cĂ¹ng cÆ¡m nĂ³ng.",
      image: "/banner/ca bong kho.webp"
    },
    {
      name: "Tá»i LĂ½ SÆ¡n",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng cáº£ nÆ°á»›c vá»›i hÆ°Æ¡ng vá»‹ thÆ¡m Ä‘áº·c trÆ°ng Ä‘Æ°á»£c trá»“ng trĂªn Ä‘áº¥t nĂºi lá»­a.",
      image: "/banner/ly son garlic.jpg"
    }
  ]
};

const GIALAI_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ BĂ¬nh Äá»‹nh vĂ  Gia Lai. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "21.576,53 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "3.583.693 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a cao nguyĂªn" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ BĂ¬nh Äá»‹nh vĂ  Gia Lai; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1932",
      event: "Tá»‰nh Pleiku Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i thá»i PhĂ¡p thuá»™c, tiá»n thĂ¢n cá»§a tá»‰nh Gia Lai ngĂ y nay."
    },
    {
      year: "1975",
      event: "Gia Lai Ä‘Æ°á»£c giáº£i phĂ³ng sau Chiáº¿n dá»‹ch TĂ¢y NguyĂªn, má»Ÿ Ä‘áº§u cho Äáº¡i tháº¯ng mĂ¹a XuĂ¢n 1975."
    },
    {
      year: "1976",
      event: "Hai tá»‰nh Gia Lai vĂ  Kon Tum Ä‘Æ°á»£c há»£p nháº¥t thĂ nh tá»‰nh Gia Lai - Kon Tum."
    },
    {
      year: "1991",
      event: "Tá»‰nh Gia Lai Ä‘Æ°á»£c tĂ¡i láº­p sau khi tĂ¡ch khá»i tá»‰nh Gia Lai - Kon Tum."
    },
    {
      year: "2005",
      event: "KhĂ´ng gian vÄƒn hĂ³a cá»“ng chiĂªng TĂ¢y NguyĂªn, trong Ä‘Ă³ cĂ³ Gia Lai, Ä‘Æ°á»£c UNESCO cĂ´ng nháº­n lĂ  Di sáº£n vÄƒn hĂ³a phi váº­t thá»ƒ cá»§a nhĂ¢n loáº¡i."
    },
    {
      year: "2025-2026",
      event: "Gia Lai tiáº¿p tá»¥c phĂ¡t triá»ƒn nĂ´ng nghiá»‡p cĂ´ng nghá»‡ cao, nÄƒng lÆ°á»£ng tĂ¡i táº¡o vĂ  du lá»‹ch sinh thĂ¡i TĂ¢y NguyĂªn."
    }
  ],

  places: [
    {
      name: "Biá»ƒn Há»“ Tâ€™NÆ°ng",
      description: "Há»“ nÆ°á»›c ná»•i tiáº¿ng Ä‘Æ°á»£c vĂ­ nhÆ° 'Ä‘Ă´i máº¯t Pleiku' vá»›i phong cáº£nh thÆ¡ má»™ng giá»¯a nĂºi rá»«ng TĂ¢y NguyĂªn.",
      image: "/banner/bien ho pleiku.jpeg"
    },
    {
      name: "NĂºi lá»­a ChÆ° ÄÄƒng Ya",
      description: "Ngá»n nĂºi lá»­a Ä‘Ă£ ngá»«ng hoáº¡t Ä‘á»™ng ná»•i tiáº¿ng vá»›i cáº£nh quan thiĂªn nhiĂªn vĂ  mĂ¹a hoa dĂ£ quá»³ tuyá»‡t Ä‘áº¹p.",
      image: "/banner/chu dang ya.webp"
    },
    {
      name: "Quáº£ng trÆ°á»ng Äáº¡i ÄoĂ n Káº¿t",
      description: "CĂ´ng trĂ¬nh biá»ƒu tÆ°á»£ng cá»§a thĂ nh phá»‘ Pleiku vá»›i tÆ°á»£ng Ä‘Ă i Chá»§ tá»‹ch Há»“ ChĂ­ Minh.",
      image: "/banner/quang truong dai doan ket.jpg"
    }
  ],

  cuisine: [
    {
      name: "Phá»Ÿ khĂ´ Gia Lai",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng cĂ²n gá»i lĂ  phá»Ÿ hai tĂ´ vá»›i sá»£i phá»Ÿ dai vĂ  nÆ°á»›c dĂ¹ng Ä‘áº­m Ä‘Ă .",
      image: "/banner/pho kho gia lai.webp"
    },
    {
      name: "BĂºn cua thá»‘i",
      description: "MĂ³n Äƒn Ä‘áº·c trÆ°ng TĂ¢y NguyĂªn vá»›i hÆ°Æ¡ng vá»‹ Ä‘á»™c Ä‘Ă¡o tá»« cua Ä‘á»“ng lĂªn men.",
      image: "/banner/bun cua.jpg"
    },
    {
      name: "CÆ¡m lam gĂ  nÆ°á»›ng",
      description: "MĂ³n Äƒn Ä‘áº·c sáº£n TĂ¢y NguyĂªn vá»›i cÆ¡m nÆ°á»›ng trong á»‘ng tre Äƒn kĂ¨m gĂ  nÆ°á»›ng thÆ¡m ngon.",
      image: "/banner/com lam ga nuong.jpg"
    }
  ]
};

const DAKLAK_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ PhĂº YĂªn vĂ  Äáº¯k Láº¯k. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "18.096,40 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "3.346.853 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a cao nguyĂªn" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ PhĂº YĂªn vĂ  Äáº¯k Láº¯k; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1904",
      event: "Tá»‰nh Äáº¯k Láº¯k Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i thá»i PhĂ¡p thuá»™c vá»›i trung tĂ¢m lĂ  BuĂ´n Ma Thuá»™t."
    },
    {
      year: "1975",
      event: "Chiáº¿n tháº¯ng BuĂ´n Ma Thuá»™t má»Ÿ mĂ n Chiáº¿n dá»‹ch TĂ¢y NguyĂªn, gĂ³p pháº§n quan trá»ng vĂ o Äáº¡i tháº¯ng mĂ¹a XuĂ¢n 1975."
    },
    {
      year: "2004",
      event: "Tá»‰nh Äáº¯k NĂ´ng Ä‘Æ°á»£c tĂ¡ch ra tá»« tá»‰nh Äáº¯k Láº¯k, hĂ¬nh thĂ nh Ä‘á»‹a giá»›i hĂ nh chĂ­nh nhÆ° hiá»‡n nay."
    },
    {
      year: "2005",
      event: "KhĂ´ng gian vÄƒn hĂ³a cá»“ng chiĂªng TĂ¢y NguyĂªn, trong Ä‘Ă³ cĂ³ Äáº¯k Láº¯k, Ä‘Æ°á»£c UNESCO cĂ´ng nháº­n lĂ  Di sáº£n vÄƒn hĂ³a phi váº­t thá»ƒ cá»§a nhĂ¢n loáº¡i."
    },
    {
      year: "2023",
      event: "Lá»… há»™i CĂ  phĂª BuĂ´n Ma Thuá»™t tiáº¿p tá»¥c Ä‘Æ°á»£c tá»• chá»©c quy mĂ´ lá»›n nháº±m quáº£ng bĂ¡ thÆ°Æ¡ng hiá»‡u cĂ  phĂª Viá»‡t Nam."
    },
    {
      year: "2025-2026",
      event: "Äáº¯k Láº¯k tiáº¿p tá»¥c phĂ¡t triá»ƒn nĂ´ng nghiá»‡p cĂ´ng nghá»‡ cao, du lá»‹ch sinh thĂ¡i vĂ  cĂ´ng nghiá»‡p cháº¿ biáº¿n cĂ  phĂª."
    }
  ],

  places: [
    {
      name: "Há»“ Láº¯k",
      description: "Há»“ nÆ°á»›c ngá»t tá»± nhiĂªn lá»›n ná»•i tiáº¿ng vá»›i phong cáº£nh thÆ¡ má»™ng vĂ  vÄƒn hĂ³a dĂ¢n tá»™c M'NĂ´ng.",
      image: "/banner/lak lake.jpg"
    },
    {
      name: "BuĂ´n ÄĂ´n",
      description: "Äiá»ƒm du lá»‹ch ná»•i tiáº¿ng gáº¯n liá»n vá»›i nghá» sÄƒn báº¯t vĂ  thuáº§n dÆ°á»¡ng voi TĂ¢y NguyĂªn.",
      image: "/banner/buon don.jpg"
    },
    {
      name: "Báº£o tĂ ng Tháº¿ giá»›i CĂ  phĂª",
      description: "CĂ´ng trĂ¬nh kiáº¿n trĂºc Ä‘á»™c Ä‘Ă¡o táº¡i BuĂ´n Ma Thuá»™t, nÆ¡i trÆ°ng bĂ y vÄƒn hĂ³a cĂ  phĂª Viá»‡t Nam vĂ  tháº¿ giá»›i.",
      image: "/banner/world coffee museum.jpg"
    }
  ],

  cuisine: [
    {
      name: "CĂ  phĂª BuĂ´n Ma Thuá»™t",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng tháº¿ giá»›i vá»›i hÆ°Æ¡ng vá»‹ Ä‘áº­m Ä‘Ă  Ä‘áº·c trÆ°ng cá»§a vĂ¹ng Ä‘áº¥t bazan TĂ¢y NguyĂªn.",
      image: "/banner/vietnamese coffee.jpg"
    },
    {
      name: "BĂºn Ä‘á»",
      description: "MĂ³n Äƒn ná»•i tiáº¿ng cá»§a BuĂ´n Ma Thuá»™t vá»›i nÆ°á»›c dĂ¹ng Ä‘á» Ä‘áº·c trÆ°ng vĂ  vá»‹ Ä‘áº­m Ä‘Ă .",
      image: "/banner/bun do.png"
    },
    {
      name: "GĂ  nÆ°á»›ng cÆ¡m lam",
      description: "Äáº·c sáº£n TĂ¢y NguyĂªn vá»›i gĂ  nÆ°á»›ng thÆ¡m ngon Äƒn kĂ¨m cÆ¡m lam nÆ°á»›ng trong á»‘ng tre.",
      image: "/banner/com lam ga nuong.jpg"
    }
  ]
};

const KHANHHOA_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ Ninh Thuáº­n vĂ  KhĂ¡nh HĂ²a. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "8.555,86 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "2.243.554 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i xavan ven biá»ƒn" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ Ninh Thuáº­n vĂ  KhĂ¡nh HĂ²a; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1653",
      event: "VĂ¹ng Ä‘áº¥t KhĂ¡nh HĂ²a chĂ­nh thá»©c Ä‘Æ°á»£c sĂ¡p nháº­p vĂ o lĂ£nh thá»• Äáº¡i Viá»‡t dÆ°á»›i thá»i chĂºa Nguyá»…n."
    },
    {
      year: "1832",
      event: "Tá»‰nh KhĂ¡nh HĂ²a Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i triá»u vua Minh Máº¡ng nhĂ  Nguyá»…n."
    },
    {
      year: "1924",
      event: "ThĂ nh phá»‘ Nha Trang Ä‘Æ°á»£c hĂ¬nh thĂ nh vĂ  phĂ¡t triá»ƒn thĂ nh trung tĂ¢m du lá»‹ch, nghá»‰ dÆ°á»¡ng ná»•i tiáº¿ng."
    },
    {
      year: "2003",
      event: "Vá»‹nh Nha Trang Ä‘Æ°á»£c cĂ´ng nháº­n lĂ  thĂ nh viĂªn CĂ¢u láº¡c bá»™ cĂ¡c vá»‹nh Ä‘áº¹p nháº¥t tháº¿ giá»›i."
    },
    {
      year: "2023",
      event: "KhĂ¡nh HĂ²a phá»¥c há»“i máº¡nh máº½ ngĂ nh du lá»‹ch quá»‘c táº¿ vá»›i lÆ°á»£ng khĂ¡ch tÄƒng cao sau Ä‘áº¡i dá»‹ch."
    },
    {
      year: "2025-2026",
      event: "Tá»‰nh tiáº¿p tá»¥c phĂ¡t triá»ƒn kinh táº¿ biá»ƒn, du lá»‹ch cao cáº¥p vĂ  háº¡ táº§ng Ä‘Ă´ thá»‹ ven biá»ƒn hiá»‡n Ä‘áº¡i."
    }
  ],

  places: [
    {
      name: "Vá»‹nh Nha Trang",
      description: "Má»™t trong nhá»¯ng vá»‹nh biá»ƒn Ä‘áº¹p nháº¥t tháº¿ giá»›i vá»›i lĂ n nÆ°á»›c trong xanh vĂ  nhiá»u Ä‘áº£o Ä‘áº¹p.",
      image: "/banner/nha trang bay.webp"
    },
    {
      name: "ThĂ¡p BĂ  Ponagar",
      description: "Quáº§n thá»ƒ kiáº¿n trĂºc ChÄƒm Pa cá»• ná»•i tiáº¿ng mang giĂ¡ trá»‹ lá»‹ch sá»­ vĂ  vÄƒn hĂ³a Ä‘áº·c sáº¯c.",
      image: "/banner/ponagar tower.jpg"
    },
    {
      name: "Äáº£o HĂ²n Mun",
      description: "Khu báº£o tá»“n biá»ƒn ná»•i tiáº¿ng vá»›i há»‡ sinh thĂ¡i san hĂ´ Ä‘a dáº¡ng vĂ  hoáº¡t Ä‘á»™ng láº·n biá»ƒn háº¥p dáº«n.",
      image: "/banner/hon mun island.webp"
    }
  ],

  cuisine: [
    {
      name: "BĂºn sá»©a Nha Trang",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng vá»›i nÆ°á»›c dĂ¹ng thanh ngá»t vĂ  miáº¿ng sá»©a giĂ²n tÆ°Æ¡i Ä‘áº·c trÆ°ng.",
      image: "/banner/bun sua.jpg"
    },
    {
      name: "Nem nÆ°á»›ng Ninh HĂ²a",
      description: "MĂ³n Äƒn ná»•i tiáº¿ng vá»›i nem nÆ°á»›ng thÆ¡m ngon Äƒn kĂ¨m rau sá»‘ng vĂ  nÆ°á»›c cháº¥m Ä‘áº·c biá»‡t.",
      image: "/banner/nem nuong.jpg"
    },
    {
      name: "BĂ¡nh cÄƒn",
      description: "MĂ³n bĂ¡nh dĂ¢n dĂ£ miá»n Trung vá»›i lá»›p vá» giĂ²n má»m Äƒn kĂ¨m nÆ°á»›c máº¯m vĂ  topping háº£i sáº£n.",
      image: "/banner/banh can.webp"
    }
  ]
};

const LAMDONG_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ Äáº¯k NĂ´ng, BĂ¬nh Thuáº­n vĂ  LĂ¢m Äá»“ng. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "24.233,07 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "3.872.999 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Ă”n Ä‘á»›i nĂºi cao vĂ  nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a cao nguyĂªn" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ Äáº¯k NĂ´ng, BĂ¬nh Thuáº­n vĂ  LĂ¢m Äá»“ng; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1893",
      event: "BĂ¡c sÄ© Alexandre Yersin khĂ¡m phĂ¡ cao nguyĂªn Lang Biang, Ä‘áº·t ná»n mĂ³ng cho sá»± hĂ¬nh thĂ nh thĂ nh phá»‘ ÄĂ  Láº¡t."
    },
    {
      year: "1916",
      event: "ÄĂ  Láº¡t Ä‘Æ°á»£c quy hoáº¡ch trá»Ÿ thĂ nh Ä‘Ă´ thá»‹ nghá»‰ dÆ°á»¡ng ná»•i tiáº¿ng dÆ°á»›i thá»i PhĂ¡p thuá»™c."
    },
    {
      year: "1976",
      event: "Tá»‰nh LĂ¢m Äá»“ng Ä‘Æ°á»£c thĂ nh láº­p trĂªn cÆ¡ sá»Ÿ sĂ¡p nháº­p nhiá»u tá»‰nh thuá»™c khu vá»±c Nam TĂ¢y NguyĂªn."
    },
    {
      year: "2014",
      event: "ÄĂ  Láº¡t Ä‘Æ°á»£c cĂ´ng nháº­n lĂ  thĂ nh phá»‘ Festival Hoa cá»§a Viá»‡t Nam."
    },
    {
      year: "2023",
      event: "Du lá»‹ch ÄĂ  Láº¡t vĂ  nĂ´ng nghiá»‡p cĂ´ng nghá»‡ cao tiáº¿p tá»¥c phĂ¡t triá»ƒn máº¡nh, thu hĂºt Ä‘Ă´ng Ä‘áº£o du khĂ¡ch vĂ  nhĂ  Ä‘áº§u tÆ°."
    },
    {
      year: "2025-2026",
      event: "LĂ¢m Äá»“ng Ä‘áº©y máº¡nh phĂ¡t triá»ƒn Ä‘Ă´ thá»‹ xanh, du lá»‹ch sinh thĂ¡i vĂ  nĂ´ng nghiá»‡p cĂ´ng nghá»‡ cao bá»n vá»¯ng."
    }
  ],

  places: [
    {
      name: "Há»“ XuĂ¢n HÆ°Æ¡ng",
      description: "Biá»ƒu tÆ°á»£ng ná»•i tiáº¿ng cá»§a ÄĂ  Láº¡t vá»›i khung cáº£nh thÆ¡ má»™ng giá»¯a trung tĂ¢m thĂ nh phá»‘.",
      image: "/banner/xuan huong lake.jpg"
    },
    {
      name: "NĂºi Lang Biang",
      description: "Danh tháº¯ng ná»•i tiáº¿ng gáº¯n liá»n vá»›i truyá»n thuyáº¿t tĂ¬nh yĂªu vĂ  cáº£nh quan nĂºi rá»«ng hĂ¹ng vÄ©.",
      image: "/banner/lang biang.jpg"
    },
    {
      name: "ThĂ¡c Datanla",
      description: "Äiá»ƒm du lá»‹ch ná»•i tiáº¿ng vá»›i dĂ²ng thĂ¡c Ä‘áº¹p vĂ  nhiá»u hoáº¡t Ä‘á»™ng khĂ¡m phĂ¡ thiĂªn nhiĂªn.",
      image: "/banner/datanla falls.jpg"
    }
  ],

  cuisine: [
    {
      name: "BĂ¡nh cÄƒn ÄĂ  Láº¡t",
      description: "MĂ³n Äƒn ná»•i tiáº¿ng vá»›i lá»›p bĂ¡nh nĂ³ng giĂ²n Äƒn kĂ¨m nÆ°á»›c cháº¥m Ä‘áº­m vá»‹.",
      image: "/banner/banh candalat.jpg"
    },
    {
      name: "Láº©u gĂ  lĂ¡ Ă©",
      description: "Äáº·c sáº£n thÆ¡m ngon vá»›i vá»‹ chua nháº¹ cá»§a lĂ¡ Ă© káº¿t há»£p thá»‹t gĂ  Ä‘áº­m Ä‘Ă .",
      image: "/banner/lau ga la e.jpg"
    },
    {
      name: "DĂ¢u tĂ¢y ÄĂ  Láº¡t",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng vá»›i vá»‹ ngá»t thanh vĂ  Ä‘Æ°á»£c trá»“ng nhiá»u táº¡i vĂ¹ng khĂ­ háº­u mĂ¡t máº».",
      image: "/banner/strawberries.png"
    }
  ]
};

const DONGNAI_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ BĂ¬nh PhÆ°á»›c vĂ  Äá»“ng Nai. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "12.737,18 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "4.491.408 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a cáº­n xĂ­ch Ä‘áº¡o" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ BĂ¬nh PhÆ°á»›c vĂ  Äá»“ng Nai; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1698",
      event: "Nguyá»…n Há»¯u Cáº£nh vĂ o Nam kinh lÆ°á»£c, Ä‘áº·t ná»n mĂ³ng hĂ nh chĂ­nh cho vĂ¹ng Ä‘áº¥t Äá»“ng Nai."
    },
    {
      year: "1832",
      event: "Tá»‰nh BiĂªn HĂ²a Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i triá»u vua Minh Máº¡ng, tiá»n thĂ¢n cá»§a tá»‰nh Äá»“ng Nai ngĂ y nay."
    },
    {
      year: "1976",
      event: "Tá»‰nh Äá»“ng Nai chĂ­nh thá»©c Ä‘Æ°á»£c thĂ nh láº­p sau ngĂ y Ä‘áº¥t nÆ°á»›c thá»‘ng nháº¥t."
    },
    {
      year: "1990",
      event: "Äá»“ng Nai trá»Ÿ thĂ nh má»™t trong nhá»¯ng Ä‘á»‹a phÆ°Æ¡ng Ä‘i Ä‘áº§u cáº£ nÆ°á»›c vá» phĂ¡t triá»ƒn khu cĂ´ng nghiá»‡p."
    },
    {
      year: "2021",
      event: "Dá»± Ă¡n Cáº£ng hĂ ng khĂ´ng quá»‘c táº¿ Long ThĂ nh Ä‘Æ°á»£c Ä‘áº©y máº¡nh thi cĂ´ng, trá»Ÿ thĂ nh cĂ´ng trĂ¬nh trá»ng Ä‘iá»ƒm quá»‘c gia."
    },
    {
      year: "2025-2026",
      event: "Äá»“ng Nai tiáº¿p tá»¥c phĂ¡t triá»ƒn cĂ´ng nghiá»‡p cĂ´ng nghá»‡ cao, logistics vĂ  háº¡ táº§ng giao thĂ´ng vĂ¹ng ÄĂ´ng Nam Bá»™."
    }
  ],

  places: [
    {
      name: "VÆ°á»n quá»‘c gia CĂ¡t TiĂªn",
      description: "Khu dá»± trá»¯ sinh quyá»ƒn ná»•i tiáº¿ng vá»›i há»‡ Ä‘á»™ng thá»±c váº­t Ä‘a dáº¡ng vĂ  rá»«ng nguyĂªn sinh rá»™ng lá»›n.",
      image: "/banner/cat tien national park.jpg"
    },
    {
      name: "Khu du lá»‹ch Bá»­u Long",
      description: "Danh tháº¯ng ná»•i tiáº¿ng Ä‘Æ°á»£c vĂ­ nhÆ° 'Vá»‹nh Háº¡ Long thu nhá»' cá»§a miá»n ÄĂ´ng Nam Bá»™.",
      image: "/banner/buu long.jpg"
    },
    {
      name: "ThĂ¡c Giang Äiá»n",
      description: "Äiá»ƒm du lá»‹ch sinh thĂ¡i ná»•i tiáº¿ng vá»›i phong cáº£nh thiĂªn nhiĂªn vĂ  dĂ²ng thĂ¡c Ä‘áº¹p.",
      image: "/banner/giang dien waterfall.webp"
    }
  ],

  cuisine: [
    {
      name: "Gá»i cĂ¡ BiĂªn HĂ²a",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng vá»›i cĂ¡ tÆ°Æ¡i Äƒn kĂ¨m rau sá»‘ng vĂ  nÆ°á»›c cháº¥m Ä‘áº­m Ä‘Ă .",
      image: "/banner/goica.jpg"
    },
    {
      name: "BÆ°á»Ÿi TĂ¢n Triá»u",
      description: "Äáº·c sáº£n trĂ¡i cĂ¢y ná»•i tiáº¿ng vá»›i vá»‹ ngá»t thanh vĂ  hÆ°Æ¡ng thÆ¡m Ä‘áº·c trÆ°ng.",
      image: "/banner/pomelo.webp"
    },
    {
      name: "Láº©u lĂ¡ khá»• qua rá»«ng",
      description: "MĂ³n Äƒn dĂ¢n dĂ£ Ä‘áº·c trÆ°ng miá»n ÄĂ´ng Nam Bá»™ vá»›i vá»‹ Ä‘áº¯ng nháº¹ Ä‘á»™c Ä‘Ă¡o.",
      image: "/banner/lau la.jpg"
    }
  ]
};

const TAYNINH_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ Long An vĂ  TĂ¢y Ninh. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "8.536,44 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "3.254.170 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a cáº­n xĂ­ch Ä‘áº¡o" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ Long An vĂ  TĂ¢y Ninh; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1838",
      event: "Tá»‰nh TĂ¢y Ninh Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i triá»u vua Minh Máº¡ng nhĂ  Nguyá»…n."
    },
    {
      year: "1926",
      event: "Äáº¡o Cao ÄĂ i chĂ­nh thá»©c Ä‘Æ°á»£c thĂ nh láº­p táº¡i TĂ¢y Ninh, trá»Ÿ thĂ nh trung tĂ¢m tĂ´n giĂ¡o lá»›n cá»§a Viá»‡t Nam."
    },
    {
      year: "1961",
      event: "Trung Æ°Æ¡ng Cá»¥c miá»n Nam Ä‘Æ°á»£c thĂ nh láº­p táº¡i chiáº¿n khu DÆ°Æ¡ng Minh ChĂ¢u trong thá»i ká»³ khĂ¡ng chiáº¿n chá»‘ng Má»¹."
    },
    {
      year: "1975",
      event: "TĂ¢y Ninh Ä‘Æ°á»£c giáº£i phĂ³ng hoĂ n toĂ n, bÆ°á»›c vĂ o thá»i ká»³ phĂ¡t triá»ƒn má»›i."
    },
    {
      year: "2020",
      event: "Khu du lá»‹ch quá»‘c gia NĂºi BĂ  Äen phĂ¡t triá»ƒn máº¡nh vá»›i há»‡ thá»‘ng cĂ¡p treo hiá»‡n Ä‘áº¡i thu hĂºt Ä‘Ă´ng Ä‘áº£o du khĂ¡ch."
    },
    {
      year: "2025-2026",
      event: "TĂ¢y Ninh tiáº¿p tá»¥c phĂ¡t triá»ƒn du lá»‹ch tĂ¢m linh, kinh táº¿ cá»­a kháº©u vĂ  nÄƒng lÆ°á»£ng tĂ¡i táº¡o."
    }
  ],

  places: [
    {
      name: "NĂºi BĂ  Äen",
      description: "Ngá»n nĂºi cao nháº¥t Nam Bá»™ ná»•i tiáº¿ng vá»›i phong cáº£nh hĂ¹ng vÄ© vĂ  khu du lá»‹ch tĂ¢m linh.",
      image: "/banner/nui ba den.jpg"
    },
    {
      name: "TĂ²a ThĂ¡nh TĂ¢y Ninh",
      description: "CĂ´ng trĂ¬nh kiáº¿n trĂºc Ä‘á»™c Ä‘Ă¡o vĂ  lĂ  trung tĂ¢m lá»›n nháº¥t cá»§a Ä‘áº¡o Cao ÄĂ i.",
      image: "/banner/cao dai temple.jpg"
    },
    {
      name: "Há»“ Dáº§u Tiáº¿ng",
      description: "Há»“ nÆ°á»›c nhĂ¢n táº¡o lá»›n ná»•i tiáº¿ng vá»›i cáº£nh quan thiĂªn nhiĂªn rá»™ng lá»›n vĂ  thÆ¡ má»™ng.",
      image: "/banner/dau tieng lake.webp"
    }
  ],

  cuisine: [
    {
      name: "BĂ¡nh trĂ¡ng phÆ¡i sÆ°Æ¡ng",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng vá»›i lá»›p bĂ¡nh má»m dáº»o Äƒn kĂ¨m thá»‹t vĂ  rau sá»‘ng.",
      image: "/banner/banhtrangphoisuong.jpeg"
    },
    {
      name: "Muá»‘i tĂ´m TĂ¢y Ninh",
      description: "Gia vá»‹ Ä‘áº·c sáº£n ná»•i tiáº¿ng vá»›i vá»‹ cay máº·n Ä‘áº­m Ä‘Ă  dĂ¹ng cháº¥m trĂ¡i cĂ¢y vĂ  mĂ³n Äƒn.",
      image: "/banner/muoitom.jpg"
    },
    {
      name: "BĂ² tÆ¡ TĂ¢y Ninh",
      description: "MĂ³n Äƒn Ä‘áº·c sáº£n ná»•i tiáº¿ng vá»›i thá»‹t bĂ² má»m ngon Ä‘Æ°á»£c cháº¿ biáº¿n thĂ nh nhiá»u mĂ³n háº¥p dáº«n.",
      image: "/banner/bo to.jpg"
    }
  ]
};

const DONGTHAP_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ Tiá»n Giang vĂ  Äá»“ng ThĂ¡p. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "5.938,64 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "4.370.046 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a cáº­n xĂ­ch Ä‘áº¡o" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ Tiá»n Giang vĂ  Äá»“ng ThĂ¡p; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1757",
      event: "VĂ¹ng Ä‘áº¥t Äá»“ng ThĂ¡p chĂ­nh thá»©c thuá»™c lĂ£nh thá»• Äáº¡i Viá»‡t dÆ°á»›i thá»i chĂºa Nguyá»…n."
    },
    {
      year: "1862",
      event: "Khu vá»±c Äá»“ng ThĂ¡p thuá»™c quyá»n kiá»ƒm soĂ¡t cá»§a thá»±c dĂ¢n PhĂ¡p sau HĂ²a Æ°á»›c NhĂ¢m Tuáº¥t."
    },
    {
      year: "1976",
      event: "Tá»‰nh Äá»“ng ThĂ¡p Ä‘Æ°á»£c thĂ nh láº­p trĂªn cÆ¡ sá»Ÿ há»£p nháº¥t tá»‰nh Sa ÄĂ©c vĂ  tá»‰nh Kiáº¿n Phong."
    },
    {
      year: "2012",
      event: "Khu Ramsar TrĂ m Chim Ä‘Æ°á»£c cĂ´ng nháº­n lĂ  khu Ramsar thá»© 4 cá»§a Viá»‡t Nam cĂ³ táº§m quan trá»ng quá»‘c táº¿."
    },
    {
      year: "2023",
      event: "Äá»“ng ThĂ¡p tiáº¿p tá»¥c phĂ¡t triá»ƒn máº¡nh du lá»‹ch sinh thĂ¡i, nĂ´ng nghiá»‡p cĂ´ng nghá»‡ cao vĂ  kinh táº¿ cá»­a kháº©u."
    },
    {
      year: "2025-2026",
      event: "Tá»‰nh Ä‘áº©y máº¡nh chuyá»ƒn Ä‘á»•i sá»‘ nĂ´ng nghiá»‡p, phĂ¡t triá»ƒn du lá»‹ch xanh vĂ  xĂ¢y dá»±ng hĂ¬nh áº£nh 'Äáº¥t Sen Há»“ng'."
    }
  ],

  places: [
    {
      name: "VÆ°á»n quá»‘c gia TrĂ m Chim",
      description: "Khu Ramsar quá»‘c táº¿ ná»•i tiáº¿ng vá»›i há»‡ sinh thĂ¡i Ä‘áº¥t ngáº­p nÆ°á»›c vĂ  nhiá»u loĂ i chim quĂ½ hiáº¿m.",
      image: "/banner/tram chim.webp"
    },
    {
      name: "LĂ ng hoa Sa ÄĂ©c",
      description: "LĂ ng nghá» truyá»n thá»‘ng ná»•i tiáº¿ng vá»›i hĂ ng trÄƒm loĂ i hoa kiá»ƒng rá»±c rá»¡ quanh nÄƒm.",
      image: "/banner/sa dec flower village.jpg"
    },
    {
      name: "Khu di tĂ­ch Xáº»o QuĂ½t",
      description: "Di tĂ­ch lá»‹ch sá»­ cĂ¡ch máº¡ng káº¿t há»£p du lá»‹ch sinh thĂ¡i Ä‘áº·c trÆ°ng miá»n TĂ¢y Nam Bá»™.",
      image: "/banner/xeo quyt.jpg"
    }
  ],

  cuisine: [
    {
      name: "Há»§ tiáº¿u Sa ÄĂ©c",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng vá»›i sá»£i há»§ tiáº¿u dai ngon vĂ  nÆ°á»›c dĂ¹ng Ä‘áº­m Ä‘Ă .",
      image: "/banner/hu tieu.jpg"
    },
    {
      name: "Nem Lai Vung",
      description: "MĂ³n nem ná»•i tiáº¿ng vá»›i vá»‹ chua ngá»t Ä‘áº·c trÆ°ng vĂ  hÆ°Æ¡ng thÆ¡m háº¥p dáº«n.",
      image: "/banner/nemlaivung.jpg"
    },
    {
      name: "Chuá»™t Ä‘á»“ng quay lu",
      description: "MĂ³n Äƒn dĂ¢n dĂ£ miá»n TĂ¢y vá»›i thá»‹t chuá»™t Ä‘á»“ng thÆ¡m ngon, da giĂ²n Ä‘áº·c trÆ°ng.",
      image: "/banner/chuot dong.jpg"
    }
  ]
};

const VINHLONG_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ Báº¿n Tre, TrĂ  Vinh vĂ  VÄ©nh Long. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "6.296,20 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "4.257.581 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a cáº­n xĂ­ch Ä‘áº¡o" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ Báº¿n Tre, TrĂ  Vinh vĂ  VÄ©nh Long; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1732",
      event: "Dinh Long Há»“ Ä‘Æ°á»£c thĂ nh láº­p, Ä‘áº·t ná»n mĂ³ng cho vĂ¹ng Ä‘áº¥t VÄ©nh Long ngĂ y nay."
    },
    {
      year: "1832",
      event: "Tá»‰nh VÄ©nh Long chĂ­nh thá»©c Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i triá»u vua Minh Máº¡ng nhĂ  Nguyá»…n."
    },
    {
      year: "1976",
      event: "VÄ©nh Long vĂ  TrĂ  Vinh Ä‘Æ°á»£c há»£p nháº¥t thĂ nh tá»‰nh Cá»­u Long."
    },
    {
      year: "1992",
      event: "Tá»‰nh VÄ©nh Long Ä‘Æ°á»£c tĂ¡i láº­p sau khi tĂ¡ch khá»i tá»‰nh Cá»­u Long."
    },
    {
      year: "2023",
      event: "VÄ©nh Long tiáº¿p tá»¥c phĂ¡t triá»ƒn máº¡nh nĂ´ng nghiá»‡p cháº¥t lÆ°á»£ng cao vĂ  du lá»‹ch sinh thĂ¡i miá»‡t vÆ°á»n."
    },
    {
      year: "2025-2026",
      event: "Tá»‰nh Ä‘áº©y máº¡nh phĂ¡t triá»ƒn kinh táº¿ xanh, nĂ´ng nghiá»‡p cĂ´ng nghá»‡ cao vĂ  háº¡ táº§ng giao thĂ´ng vĂ¹ng Äá»“ng báº±ng sĂ´ng Cá»­u Long."
    }
  ],

  places: [
    {
      name: "Chá»£ ná»•i TrĂ  Ă”n",
      description: "Khu chá»£ ná»•i Ä‘áº·c trÆ°ng miá»n TĂ¢y vá»›i hoáº¡t Ä‘á»™ng mua bĂ¡n nhá»™n nhá»‹p trĂªn sĂ´ng nÆ°á»›c.",
      image: "/banner/chonoitraon.jpg"
    },
    {
      name: "CĂ¹ lao An BĂ¬nh",
      description: "Äiá»ƒm du lá»‹ch sinh thĂ¡i ná»•i tiáº¿ng vá»›i vÆ°á»n trĂ¡i cĂ¢y vĂ  khĂ´ng gian miá»‡t vÆ°á»n yĂªn bĂ¬nh.",
      image: "/banner/an binh.webp"
    },
    {
      name: "VÄƒn ThĂ¡nh Miáº¿u VÄ©nh Long",
      description: "CĂ´ng trĂ¬nh kiáº¿n trĂºc cá»• mang giĂ¡ trá»‹ lá»‹ch sá»­ vĂ  vÄƒn hĂ³a cá»§a vĂ¹ng Nam Bá»™.",
      image: "/banner/van thanh mieu vinh long.jpg"
    }
  ],

  cuisine: [
    {
      name: "CĂ¡ tai tÆ°á»£ng chiĂªn xĂ¹",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng miá»n TĂ¢y vá»›i lá»›p da cĂ¡ giĂ²n rá»¥m Äƒn kĂ¨m rau sá»‘ng vĂ  bĂ¡nh trĂ¡ng.",
      image: "/banner/cataituong.png"
    },
    {
      name: "BĂ¡nh xĂ¨o háº¿n cĂ¹ lao",
      description: "MĂ³n bĂ¡nh xĂ¨o Ä‘áº·c trÆ°ng vá»›i nhĂ¢n háº¿n thÆ¡m ngon vĂ  rau sá»‘ng miá»n TĂ¢y.",
      image: "/banner/banh xeo.jpg"
    },
    {
      name: "Cam xoĂ n Tam BĂ¬nh",
      description: "Äáº·c sáº£n trĂ¡i cĂ¢y ná»•i tiáº¿ng vá»›i vá»‹ ngá»t thanh vĂ  hÆ°Æ¡ng thÆ¡m Ä‘áº·c trÆ°ng.",
      image: "/banner/cam xoan.jpg"
    }
  ]
};

const CANTHO_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ TP. Cáº§n ThÆ¡, SĂ³c TrÄƒng vĂ  Háº­u Giang. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "6.360,83 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "4.199.824 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a cáº­n xĂ­ch Ä‘áº¡o" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ TP. Cáº§n ThÆ¡, SĂ³c TrÄƒng vĂ  Háº­u Giang; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1739",
      event: "VĂ¹ng Ä‘áº¥t Cáº§n ThÆ¡ Ä‘Æ°á»£c khai phĂ¡ máº¡nh dÆ°á»›i thá»i chĂºa Nguyá»…n, hĂ¬nh thĂ nh cĂ¡c lĂ ng ven sĂ´ng Háº­u."
    },
    {
      year: "1876",
      event: "Cáº§n ThÆ¡ trá»Ÿ thĂ nh trung tĂ¢m hĂ nh chĂ­nh quan trá»ng cá»§a miá»n TĂ¢y Nam Bá»™ dÆ°á»›i thá»i PhĂ¡p thuá»™c."
    },
    {
      year: "1976",
      event: "Tá»‰nh Háº­u Giang Ä‘Æ°á»£c thĂ nh láº­p vá»›i thĂ nh phá»‘ Cáº§n ThÆ¡ lĂ  tá»‰nh lá»µ."
    },
    {
      year: "2004",
      event: "Cáº§n ThÆ¡ chĂ­nh thá»©c trá»Ÿ thĂ nh thĂ nh phá»‘ trá»±c thuá»™c trung Æ°Æ¡ng cá»§a Viá»‡t Nam."
    },
    {
      year: "2022",
      event: "Háº¡ táº§ng giao thĂ´ng vĂ  logistics vĂ¹ng Äá»“ng báº±ng sĂ´ng Cá»­u Long tiáº¿p tá»¥c phĂ¡t triá»ƒn máº¡nh vá»›i vai trĂ² trung tĂ¢m cá»§a Cáº§n ThÆ¡."
    },
    {
      year: "2025-2026",
      event: "Cáº§n ThÆ¡ tiáº¿p tá»¥c phĂ¡t triá»ƒn thĂ nh trung tĂ¢m Ä‘Ă´ thá»‹ sinh thĂ¡i, giĂ¡o dá»¥c, y táº¿ vĂ  cĂ´ng nghá»‡ cá»§a Äá»“ng báº±ng sĂ´ng Cá»­u Long."
    }
  ],

  places: [
    {
      name: "Chá»£ ná»•i CĂ¡i RÄƒng",
      description: "Chá»£ ná»•i ná»•i tiáº¿ng nháº¥t miá»n TĂ¢y vá»›i hoáº¡t Ä‘á»™ng mua bĂ¡n nhá»™n nhá»‹p trĂªn sĂ´ng nÆ°á»›c.",
      image: "/banner/cai rang floating market.webp"
    },
    {
      name: "Báº¿n Ninh Kiá»u",
      description: "Biá»ƒu tÆ°á»£ng du lá»‹ch ná»•i tiáº¿ng cá»§a Cáº§n ThÆ¡ náº±m bĂªn dĂ²ng sĂ´ng Háº­u thÆ¡ má»™ng.",
      image: "/banner/ninh kieu wharf.webp"
    },
    {
      name: "NhĂ  cá»• BĂ¬nh Thá»§y",
      description: "NgĂ´i nhĂ  cá»• ná»•i báº­t vá»›i kiáº¿n trĂºc ÄĂ´ng - TĂ¢y káº¿t há»£p Ä‘á»™c Ä‘Ă¡o.",
      image: "/banner/binh thuy ancient house.jpg"
    }
  ],

  cuisine: [
    {
      name: "BĂ¡nh xĂ¨o Cáº§n ThÆ¡",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng vá»›i lá»›p bĂ¡nh vĂ ng giĂ²n, nhĂ¢n tĂ´m thá»‹t vĂ  giĂ¡ Ä‘á»— háº¥p dáº«n.",
      image: "/banner/banhxeocantho.jpg"
    },
    {
      name: "Láº©u máº¯m",
      description: "MĂ³n Äƒn Ä‘áº·c trÆ°ng miá»n TĂ¢y vá»›i hÆ°Æ¡ng vá»‹ Ä‘áº­m Ä‘Ă  tá»« máº¯m cĂ¡ vĂ  nhiá»u loáº¡i rau Ä‘á»“ng.",
      image: "/banner/lau mam.jpg"
    },
    {
      name: "Nem nÆ°á»›ng CĂ¡i RÄƒng",
      description: "Äáº·c sáº£n thÆ¡m ngon Äƒn kĂ¨m bĂ¡nh há»i, rau sá»‘ng vĂ  nÆ°á»›c cháº¥m Ä‘áº­m vá»‹.",
      image: "/banner/nemnuongcairang.jpg"
    }
  ]
};

const ANGIANG_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ KiĂªn Giang vĂ  An Giang. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "9.888,91 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "4.952.238 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a cáº­n xĂ­ch Ä‘áº¡o" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ KiĂªn Giang vĂ  An Giang; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1757",
      event: "VĂ¹ng Ä‘áº¥t An Giang chĂ­nh thá»©c Ä‘Æ°á»£c sĂ¡p nháº­p vĂ o lĂ£nh thá»• Äáº¡i Viá»‡t dÆ°á»›i thá»i chĂºa Nguyá»…n."
    },
    {
      year: "1832",
      event: "Tá»‰nh An Giang Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i triá»u vua Minh Máº¡ng nhĂ  Nguyá»…n."
    },
    {
      year: "1976",
      event: "An Giang Ä‘Æ°á»£c tĂ¡i láº­p sau khi Ä‘áº¥t nÆ°á»›c thá»‘ng nháº¥t vĂ  Ä‘iá»u chá»‰nh Ä‘á»‹a giá»›i hĂ nh chĂ­nh."
    },
    {
      year: "2013",
      event: "Khu di tĂ­ch Ă“c Eo - Ba ThĂª Ä‘Æ°á»£c cĂ´ng nháº­n lĂ  Di tĂ­ch quá»‘c gia Ä‘áº·c biá»‡t."
    },
    {
      year: "2023",
      event: "An Giang tiáº¿p tá»¥c phĂ¡t triá»ƒn máº¡nh du lá»‹ch tĂ¢m linh, nĂ´ng nghiá»‡p vĂ  kinh táº¿ biĂªn giá»›i."
    },
    {
      year: "2025-2026",
      event: "Tá»‰nh Ä‘áº©y máº¡nh phĂ¡t triá»ƒn du lá»‹ch sinh thĂ¡i, kinh táº¿ cá»­a kháº©u vĂ  chuyá»ƒn Ä‘á»•i sá»‘ nĂ´ng nghiá»‡p."
    }
  ],

  places: [
    {
      name: "NĂºi Cáº¥m",
      description: "Ngá»n nĂºi cao nháº¥t miá»n TĂ¢y Nam Bá»™ ná»•i tiáº¿ng vá»›i cáº£nh quan thiĂªn nhiĂªn vĂ  du lá»‹ch tĂ¢m linh.",
      image: "/banner/nui cam.jpg"
    },
    {
      name: "Rá»«ng trĂ m TrĂ  SÆ°",
      description: "Khu du lá»‹ch sinh thĂ¡i ná»•i tiáº¿ng vá»›i há»‡ sinh thĂ¡i ngáº­p nÆ°á»›c Ä‘áº·c trÆ°ng miá»n TĂ¢y.",
      image: "/banner/tra su forest.webp"
    },
    {
      name: "Miáº¿u BĂ  ChĂºa Xá»© NĂºi Sam",
      description: "Äiá»ƒm du lá»‹ch tĂ¢m linh ná»•i tiáº¿ng thu hĂºt hĂ ng triá»‡u du khĂ¡ch má»—i nÄƒm.",
      image: "/banner/ba chua xu temple.jpg"
    }
  ],

  cuisine: [
    {
      name: "BĂºn cĂ¡ ChĂ¢u Äá»‘c",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng vá»›i nÆ°á»›c dĂ¹ng Ä‘áº­m Ä‘Ă  vĂ  cĂ¡ tÆ°Æ¡i Ä‘áº·c trÆ°ng miá»n sĂ´ng nÆ°á»›c.",
      image: "/banner/buncachaudoc.jpg"
    },
    {
      name: "Tung lĂ² mĂ²",
      description: "MĂ³n láº¡p xÆ°á»Ÿng bĂ² Ä‘áº·c trÆ°ng cá»§a ngÆ°á»i ChÄƒm táº¡i An Giang.",
      image: "/banner/tung lo mo.jpg"
    },
    {
      name: "ÄÆ°á»ng thá»‘t ná»‘t",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng Ä‘Æ°á»£c cháº¿ biáº¿n tá»« cĂ¢y thá»‘t ná»‘t Ä‘áº·c trÆ°ng vĂ¹ng Báº£y NĂºi.",
      image: "/banner/palm sugar.jpg"
    }
  ]
};

const CAMAU_DATA = {
  overview: {
    description: "ÄÆ¡n vá»‹ hĂ nh chĂ­nh hiá»‡n nay Ä‘Æ°á»£c hĂ¬nh thĂ nh sau Ä‘á»£t sáº¯p xáº¿p cáº¥p tá»‰nh nÄƒm 2025 trĂªn cÆ¡ sá»Ÿ Báº¡c LiĂªu vĂ  CĂ  Mau. Khu vá»±c má»›i káº¿ thá»«a khĂ´ng gian vÄƒn hĂ³a, cáº£nh quan, di sáº£n vĂ  tháº¿ máº¡nh du lá»‹ch cá»§a cĂ¡c Ä‘á»‹a phÆ°Æ¡ng trÆ°á»›c sáº¯p xáº¿p.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "7.942,39 kmÂ²" },
      { label: "DĂ¢n sá»‘", value: "2.606.672 ngÆ°á»i (NQ 202/2025/QH15)" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i giĂ³ mĂ¹a cáº­n xĂ­ch Ä‘áº¡o" }
    ]
  },

  history: [
    { year: "2025", event: "Thá»±c hiá»‡n Nghá»‹ quyáº¿t 202/2025/QH15, Ä‘Æ¡n vá»‹ hĂ nh chĂ­nh má»›i Ä‘Æ°á»£c hĂ¬nh thĂ nh trĂªn cÆ¡ sá»Ÿ Báº¡c LiĂªu vĂ  CĂ  Mau; chĂ­nh quyá»n Ä‘á»‹a phÆ°Æ¡ng má»›i chĂ­nh thá»©c hoáº¡t Ä‘á»™ng tá»« ngĂ y 01/07/2025." },
    {
      year: "1832",
      event: "VĂ¹ng Ä‘áº¥t CĂ  Mau thuá»™c tá»‰nh HĂ  TiĂªn dÆ°á»›i triá»u vua Minh Máº¡ng nhĂ  Nguyá»…n."
    },
    {
      year: "1956",
      event: "Tá»‰nh CĂ  Mau Ä‘Æ°á»£c thĂ nh láº­p dÆ°á»›i chĂ­nh quyá»n Viá»‡t Nam Cá»™ng hĂ²a."
    },
    {
      year: "1976",
      event: "CĂ  Mau vĂ  Báº¡c LiĂªu Ä‘Æ°á»£c há»£p nháº¥t thĂ nh tá»‰nh Minh Háº£i."
    },
    {
      year: "1997",
      event: "Tá»‰nh CĂ  Mau Ä‘Æ°á»£c tĂ¡i láº­p sau khi tĂ¡ch khá»i tá»‰nh Minh Háº£i."
    },
    {
      year: "2009",
      event: "MÅ©i CĂ  Mau Ä‘Æ°á»£c UNESCO cĂ´ng nháº­n lĂ  Khu dá»± trá»¯ sinh quyá»ƒn tháº¿ giá»›i."
    },
    {
      year: "2025-2026",
      event: "CĂ  Mau tiáº¿p tá»¥c phĂ¡t triá»ƒn kinh táº¿ biá»ƒn, nÄƒng lÆ°á»£ng tĂ¡i táº¡o vĂ  du lá»‹ch sinh thĂ¡i vĂ¹ng Ä‘áº¥t cá»±c Nam Tá»• quá»‘c."
    }
  ],

  places: [
    {
      name: "MÅ©i CĂ  Mau",
      description: "Äiá»ƒm cá»±c Nam thiĂªng liĂªng cá»§a Tá»• quá»‘c vá»›i biá»ƒu tÆ°á»£ng cá»™t má»‘c tá»a Ä‘á»™ quá»‘c gia ná»•i tiáº¿ng.",
      image: "/banner/ca mau cape.jpg"
    },
    {
      name: "Rá»«ng U Minh Háº¡",
      description: "Khu rá»«ng ngáº­p nÆ°á»›c ná»•i tiáº¿ng vá»›i há»‡ sinh thĂ¡i Ä‘a dáº¡ng vĂ  nĂ©t Ä‘áº·c trÆ°ng miá»n TĂ¢y Nam Bá»™.",
      image: "/banner/u minh ha.jpg"
    },
    {
      name: "HĂ²n ÄĂ¡ Báº¡c",
      description: "Danh tháº¯ng ná»•i tiáº¿ng vá»›i quáº§n thá»ƒ Ä‘áº£o Ä‘Ă¡ Ä‘áº¹p vĂ  giĂ¡ trá»‹ lá»‹ch sá»­ Ä‘áº·c biá»‡t.",
      image: "/banner/hon da bac.jpg"
    }
  ],

  cuisine: [
    {
      name: "Cua CĂ  Mau",
      description: "Äáº·c sáº£n ná»•i tiáº¿ng cáº£ nÆ°á»›c vá»›i thá»‹t cháº¯c, ngá»t vĂ  hÆ°Æ¡ng vá»‹ Ä‘áº·c trÆ°ng vĂ¹ng biá»ƒn cá»±c Nam.",
      image: "/banner/ca mau crab.jpg"
    },
    {
      name: "Ba khĂ­a muá»‘i",
      description: "MĂ³n Äƒn dĂ¢n dĂ£ Ä‘áº·c trÆ°ng miá»n TĂ¢y Ä‘Æ°á»£c cháº¿ biáº¿n tá»« ba khĂ­a vĂ¹ng rá»«ng ngáº­p máº·n.",
      image: "/banner/ba khia.jpeg"
    },
    {
      name: "Láº©u máº¯m U Minh",
      description: "MĂ³n láº©u Ä‘áº­m cháº¥t miá»n TĂ¢y vá»›i hÆ°Æ¡ng vá»‹ máº¯m Ä‘áº·c trÆ°ng vĂ  nhiá»u loáº¡i háº£i sáº£n, rau Ä‘á»“ng.",
      image: "/banner/laumamuminh.jpeg"
    }
  ]
};

const QUANDAOTRUONGSA_DATA = {
  overview: {
    description: "Quáº§n Ä‘áº£o TrÆ°á»ng Sa lĂ  quáº§n Ä‘áº£o thuá»™c chá»§ quyá»n Viá»‡t Nam náº±m trĂªn Biá»ƒn ÄĂ´ng, cĂ³ vá»‹ trĂ­ chiáº¿n lÆ°á»£c Ä‘áº·c biá»‡t quan trá»ng vá» quá»‘c phĂ²ng, kinh táº¿ biá»ƒn vĂ  chá»§ quyá»n lĂ£nh thá»• quá»‘c gia.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "Gá»“m hĂ ng trÄƒm Ä‘áº£o, Ä‘Ă¡, bĂ£i cáº¡n" },
      { label: "Vá»‹ trĂ­", value: "Biá»ƒn ÄĂ´ng, phĂ­a ÄĂ´ng Nam Viá»‡t Nam" },
      { label: "KhĂ­ háº­u", value: "Nhiá»‡t Ä‘á»›i háº£i dÆ°Æ¡ng" }
    ]
  },

  history: [
    {
      year: "Tháº¿ ká»· XVII",
      event: "CĂ¡c chĂºa Nguyá»…n Ä‘Ă£ tá»• chá»©c Ä‘á»™i HoĂ ng Sa - Báº¯c Háº£i khai thĂ¡c, quáº£n lĂ½ vĂ  thá»±c thi chá»§ quyá»n táº¡i quáº§n Ä‘áº£o TrÆ°á»ng Sa."
    },
    {
      year: "1933",
      event: "ChĂ­nh quyá»n ÄĂ´ng DÆ°Æ¡ng thuá»™c PhĂ¡p tuyĂªn bá»‘ sĂ¡p nháº­p quáº§n Ä‘áº£o TrÆ°á»ng Sa vĂ o lĂ£nh thá»• Viá»‡t Nam."
    },
    {
      year: "1975",
      event: "Háº£i quĂ¢n Viá»‡t Nam tiáº¿p quáº£n vĂ  báº£o vá»‡ nhiá»u Ä‘áº£o thuá»™c quáº§n Ä‘áº£o TrÆ°á»ng Sa sau ngĂ y Ä‘áº¥t nÆ°á»›c thá»‘ng nháº¥t."
    },
    {
      year: "1988",
      event: "Sá»± kiá»‡n Gáº¡c Ma diá»…n ra khi cĂ¡c chiáº¿n sÄ© háº£i quĂ¢n Viá»‡t Nam anh dÅ©ng báº£o vá»‡ chá»§ quyá»n biá»ƒn Ä‘áº£o."
    },
    {
      year: "2007",
      event: "Huyá»‡n Ä‘áº£o TrÆ°á»ng Sa thuá»™c tá»‰nh KhĂ¡nh HĂ²a tiáº¿p tá»¥c Ä‘Æ°á»£c Ä‘áº§u tÆ° phĂ¡t triá»ƒn vá» háº¡ táº§ng vĂ  dĂ¢n sinh."
    },
    {
      year: "2025-2026",
      event: "Viá»‡t Nam tiáº¿p tá»¥c tÄƒng cÆ°á»ng phĂ¡t triá»ƒn kinh táº¿ biá»ƒn, báº£o vá»‡ chá»§ quyá»n vĂ  nĂ¢ng cao Ä‘á»i sá»‘ng quĂ¢n dĂ¢n táº¡i quáº§n Ä‘áº£o TrÆ°á»ng Sa."
    }
  ],

  places: [
    {
      name: "Äáº£o TrÆ°á»ng Sa Lá»›n",
      description: "Trung tĂ¢m hĂ nh chĂ­nh quan trá»ng cá»§a huyá»‡n Ä‘áº£o TrÆ°á»ng Sa vá»›i nhiá»u cĂ´ng trĂ¬nh dĂ¢n sinh vĂ  quá»‘c phĂ²ng.",
      image: "/banner/truong sa island.webp"
    },
    {
      name: "Äáº£o Sinh Tá»“n",
      description: "Má»™t trong nhá»¯ng Ä‘áº£o ná»•i quan trá»ng cá»§a quáº§n Ä‘áº£o TrÆ°á»ng Sa vá»›i cá»™ng Ä‘á»“ng dĂ¢n cÆ° sinh sá»‘ng.",
      image: "/banner/sinh ton island.jpg"
    },
    {
      name: "ÄĂ¡ TĂ¢y",
      description: "Cá»¥m Ä‘áº£o ná»•i tiáº¿ng táº¡i TrÆ°á»ng Sa vá»›i há»‡ sinh thĂ¡i biá»ƒn vĂ  vá»‹ trĂ­ chiáº¿n lÆ°á»£c quan trá»ng.",
      image: "/banner/da tay.jpg"
    }
  ],

  cuisine: [
    {
      name: "Háº£i sáº£n TrÆ°á»ng Sa",
      description: "Nguá»“n háº£i sáº£n phong phĂº vá»›i nhiá»u loáº¡i cĂ¡, má»±c vĂ  tĂ´m biá»ƒn Ä‘áº·c trÆ°ng vĂ¹ng Biá»ƒn ÄĂ´ng.",
      image: "/banner/seafood.jpg"
    },
    {
      name: "CĂ¡ ngá»« Ä‘áº¡i dÆ°Æ¡ng",
      description: "Äáº·c sáº£n biá»ƒn ná»•i tiáº¿ng Ä‘Æ°á»£c khai thĂ¡c táº¡i vĂ¹ng biá»ƒn TrÆ°á»ng Sa vá»›i thá»‹t cháº¯c vĂ  giĂ u dinh dÆ°á»¡ng.",
      image: "/banner/tuna fish.jpg"
    },
    {
      name: "Má»±c má»™t náº¯ng",
      description: "MĂ³n háº£i sáº£n ná»•i tiáº¿ng Ä‘Æ°á»£c cháº¿ biáº¿n tá»« má»±c tÆ°Æ¡i phÆ¡i náº¯ng Ä‘áº·c trÆ°ng vĂ¹ng biá»ƒn Ä‘áº£o.",
      image: "/banner/dried squid.jpg"
    }
  ]
};

const HOANGSA_DATA = {
  overview: {
    description: "Quáº§n Ä‘áº£o HoĂ ng Sa lĂ  quáº§n Ä‘áº£o thuá»™c Biá»ƒn ÄĂ´ng, cĂ³ vá»‹ trĂ­ chiáº¿n lÆ°á»£c quan trá»ng vá» quá»‘c phĂ²ng, hĂ ng háº£i vĂ  kinh táº¿ biá»ƒn.",
    stats: [
      { label: "Diá»‡n tĂ­ch", value: "Khoáº£ng 30.000 kmÂ² vĂ¹ng biá»ƒn" },
      { label: "Cáº¥u trĂºc", value: "Gá»“m nhiá»u Ä‘áº£o, Ä‘Ă¡, bĂ£i cáº¡n vĂ  bĂ£i ngáº§m" },
      { label: "Vá»‹ trĂ­", value: "PhĂ­a ÄĂ´ng biá»ƒn Viá»‡t Nam" }
    ]
  },

  history: [
    {
      year: "Tháº¿ ká»· XVII",
      event: "CĂ¡c Ä‘á»™i HoĂ ng Sa - Báº¯c Háº£i Ä‘Æ°á»£c tá»• chá»©c dÆ°á»›i thá»i chĂºa Nguyá»…n Ä‘á»ƒ khai thĂ¡c vĂ  quáº£n lĂ½ vĂ¹ng biá»ƒn Ä‘áº£o."
    },
    {
      year: "1816",
      event: "NhĂ  Nguyá»…n thá»±c thi hoáº¡t Ä‘á»™ng quáº£n lĂ½ vĂ  xĂ¡c láº­p chá»§ quyá»n trĂªn quáº§n Ä‘áº£o HoĂ ng Sa."
    },
    {
      year: "1932",
      event: "ChĂ­nh quyá»n PhĂ¡p á»Ÿ ÄĂ´ng DÆ°Æ¡ng tuyĂªn bá»‘ hĂ nh chĂ­nh quáº£n lĂ½ quáº§n Ä‘áº£o HoĂ ng Sa."
    },
    {
      year: "1974",
      event: "Xáº£y ra tráº­n háº£i chiáº¿n HoĂ ng Sa, dáº«n Ä‘áº¿n thay Ä‘á»•i kiá»ƒm soĂ¡t thá»±c táº¿ má»™t sá»‘ khu vá»±c."
    },
    {
      year: "1982",
      event: "Viá»‡t Nam thĂ nh láº­p huyá»‡n HoĂ ng Sa thuá»™c thĂ nh phá»‘ ÄĂ  Náºµng Ä‘á»ƒ quáº£n lĂ½ hĂ nh chĂ­nh."
    },
    {
      year: "2025-2026",
      event: "Tiáº¿p tá»¥c kháº³ng Ä‘á»‹nh chá»§ quyá»n, nghiĂªn cá»©u biá»ƒn vĂ  báº£o vá»‡ mĂ´i trÆ°á»ng biá»ƒn táº¡i khu vá»±c HoĂ ng Sa."
    }
  ],

  places: [
    {
      name: "Äáº£o PhĂº LĂ¢m",
      description: "Äáº£o lá»›n nháº¥t cá»§a quáº§n Ä‘áº£o HoĂ ng Sa, cĂ³ vá»‹ trĂ­ quan trá»ng vá» Ä‘á»‹a lĂ½ vĂ  hĂ ng háº£i.",
      image: "/banner/phu lam island.jpg"
    },
    {
      name: "Äáº£o HoĂ ng Sa",
      description: "Má»™t trong cĂ¡c Ä‘áº£o thuá»™c nhĂ³m LÆ°á»¡i Liá»m cá»§a quáº§n Ä‘áº£o HoĂ ng Sa.",
      image: "/banner/hoang sa island.jpg"
    },
    {
      name: "ÄĂ¡ Báº¯c",
      description: "Khu vá»±c san hĂ´ thuá»™c quáº§n Ä‘áº£o HoĂ ng Sa vá»›i há»‡ sinh thĂ¡i biá»ƒn phong phĂº.",
      image: "/banner/coral reef.webp"
    }
  ],

  cuisine: [
    {
      name: "Háº£i sáº£n biá»ƒn HoĂ ng Sa",
      description: "Nguá»“n háº£i sáº£n phong phĂº tá»« vĂ¹ng biá»ƒn nhiá»‡t Ä‘á»›i, gá»“m cĂ¡, má»±c vĂ  tĂ´m biá»ƒn.",
      image: "/banner/seafood.jpg"
    },
    {
      name: "CĂ¡ biá»ƒn nÆ°á»›ng",
      description: "MĂ³n Äƒn phá»• biáº¿n tá»« háº£i sáº£n tÆ°Æ¡i Ä‘Æ°á»£c cháº¿ biáº¿n Ä‘Æ¡n giáº£n giá»¯ nguyĂªn vá»‹ ngá»t tá»± nhiĂªn.",
      image: "/banner/grilled fish.jpg"
    },
    {
      name: "Má»±c khĂ´",
      description: "Háº£i sáº£n Ä‘Æ°á»£c phÆ¡i khĂ´ tá»± nhiĂªn tá»« má»±c tÆ°Æ¡i Ä‘Ă¡nh báº¯t ngoĂ i biá»ƒn.",
      image: "/banner/muckho.jpg"
    }
  ]
};

export const provinceDetailsCatalog: Record<ProvinceId, ProvinceDetailsCatalogItem> = {
  "Ha Noi": {
    title: provincesData["Ha Noi"].name,
    banner: provincesData["Ha Noi"].banner,
    data: HANOI_DATA
  },
  "Ho Chi Minh": {
    title: provincesData["Ho Chi Minh"].name,
    banner: provincesData["Ho Chi Minh"].banner,
    data: HCM_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Da Nang": {
    title: provincesData["Da Nang"].name,
    banner: provincesData["Da Nang"].banner,
    data: DANANG_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Dien Bien": {
    title: provincesData["Dien Bien"].name,
    banner: provincesData["Dien Bien"].banner,
    data: DIENBIEN_DATA
  },
  "Lai Chau": {
    title: provincesData["Lai Chau"].name,
    banner: provincesData["Lai Chau"].banner,
    data: LAICHAU_DATA
  },
  "Son La": {
    title: provincesData["Son La"].name,
    banner: provincesData["Son La"].banner,
    data: SONLA_DATA
  },
  "Lao Cai": {
    title: provincesData["Lao Cai"].name,
    banner: provincesData["Lao Cai"].banner,
    data: LAOCAI_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Tuyen Quang": {
    title: provincesData["Tuyen Quang"].name,
    banner: provincesData["Tuyen Quang"].banner,
    data: TUYENQUANG_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Cao Bang": {
    title: provincesData["Cao Bang"].name,
    banner: provincesData["Cao Bang"].banner,
    data: CAOBANG_DATA
  },
  "Thai Nguyen": {
    title: provincesData["Thai Nguyen"].name,
    banner: provincesData["Thai Nguyen"].banner,
    data: THAINGUYEN_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Lang Son": {
    title: provincesData["Lang Son"].name,
    banner: provincesData["Lang Son"].banner,
    data: LANGSON_DATA
  },
  "Phu Tho": {
    title: provincesData["Phu Tho"].name,
    banner: provincesData["Phu Tho"].banner,
    data: PHUTHO_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Bac Ninh": {
    title: provincesData["Bac Ninh"].name,
    banner: provincesData["Bac Ninh"].banner,
    data: BACNINH_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Quang Ninh": {
    title: provincesData["Quang Ninh"].name,
    banner: provincesData["Quang Ninh"].banner,
    data: QUANGNINH_DATA
  },
  "Hai Phong": {
    title: provincesData["Hai Phong"].name,
    banner: provincesData["Hai Phong"].banner,
    data: HAIPHONG_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Hung Yen": {
    title: provincesData["Hung Yen"].name,
    banner: provincesData["Hung Yen"].banner,
    data: HUNGYEN_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Ninh Binh": {
    title: provincesData["Ninh Binh"].name,
    banner: provincesData["Ninh Binh"].banner,
    data: NINHBINH_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Thanh Hoa": {
    title: provincesData["Thanh Hoa"].name,
    banner: provincesData["Thanh Hoa"].banner,
    data: THANHHOA_DATA
  },
  "Nghe An": {
    title: provincesData["Nghe An"].name,
    banner: provincesData["Nghe An"].banner,
    data: NGHEAN_DATA
  },
  "Ha Tinh": {
    title: provincesData["Ha Tinh"].name,
    banner: provincesData["Ha Tinh"].banner,
    data: HATINH_DATA
  },
  "Quang Tri": {
    title: provincesData["Quang Tri"].name,
    banner: provincesData["Quang Tri"].banner,
    data: QUANGTRI_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Hue": {
    title: provincesData["Hue"].name,
    banner: provincesData["Hue"].banner,
    data: HUE_DATA
  },
  "Quang Ngai": {
    title: provincesData["Quang Ngai"].name,
    banner: provincesData["Quang Ngai"].banner,
    data: QUANGNGAI_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Gia Lai": {
    title: provincesData["Gia Lai"].name,
    banner: provincesData["Gia Lai"].banner,
    data: GIALAI_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Dak Lak": {
    title: provincesData["Dak Lak"].name,
    banner: provincesData["Dak Lak"].banner,
    data: DAKLAK_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Khanh Hoa": {
    title: provincesData["Khanh Hoa"].name,
    banner: provincesData["Khanh Hoa"].banner,
    data: KHANHHOA_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Lam Dong": {
    title: provincesData["Lam Dong"].name,
    banner: provincesData["Lam Dong"].banner,
    data: LAMDONG_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Dong Nai": {
    title: provincesData["Dong Nai"].name,
    banner: provincesData["Dong Nai"].banner,
    data: DONGNAI_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Tay Ninh": {
    title: provincesData["Tay Ninh"].name,
    banner: provincesData["Tay Ninh"].banner,
    data: TAYNINH_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Dong Thap": {
    title: provincesData["Dong Thap"].name,
    banner: provincesData["Dong Thap"].banner,
    data: DONGTHAP_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Vinh Long": {
    title: provincesData["Vinh Long"].name,
    banner: provincesData["Vinh Long"].banner,
    data: VINHLONG_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Can Tho": {
    title: provincesData["Can Tho"].name,
    banner: provincesData["Can Tho"].banner,
    data: CANTHO_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "An Giang": {
    title: provincesData["An Giang"].name,
    banner: provincesData["An Giang"].banner,
    data: ANGIANG_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Ca Mau": {
    title: provincesData["Ca Mau"].name,
    banner: provincesData["Ca Mau"].banner,
    data: CAMAU_DATA,
    administrativeSource: { label: 'Nghá»‹ quyáº¿t 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }
  },
  "Truong Sa": {
    title: provincesData["Truong Sa"].name,
    banner: provincesData["Truong Sa"].banner,
    data: QUANDAOTRUONGSA_DATA
  },
  "Hoang Sa": {
    title: provincesData["Hoang Sa"].name,
    banner: provincesData["Hoang Sa"].banner,
    data: HOANGSA_DATA
  }
};

