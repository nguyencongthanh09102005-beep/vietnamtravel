import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, Camera, Utensils, Info } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

type TabType = 'overview' | 'history' | 'places' | 'cuisine';

const TABS: { id: TabType; label: string; icon: any }[] = [
  { id: 'overview', label: 'Tổng quan', icon: Info },
  { id: 'history', label: 'Lịch sử', icon: Clock },
  { id: 'places', label: 'Địa điểm', icon: Camera },
  { id: 'cuisine', label: 'Ẩm thực', icon: Utensils },
];

const HANOI_DATA = {
  overview: {
    description: "Hà Nội là thủ đô ngàn năm văn hiến của Việt Nam, nổi tiếng với kiến trúc trăm tuổi và nền văn hóa phong phú với sự ảnh hưởng của khu vực Đông Nam Á, Trung Quốc và Pháp. Nơi đây là trung tâm chính trị, văn hóa và giáo dục quan trọng của cả nước, mang trong mình vẻ đẹp cổ kính xen lẫn nhịp sống hiện đại năng động.",
    stats: [
      { label: "Diện tích", value: "3.359 km²" },
      { label: "Dân số", value: "8.5 triệu (2023)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa" }
    ]
  },
  history: [
    { year: "1010", event: "Vua Lý Thái Tổ dời đô từ Hoa Lư về thành Đại La, đổi tên là Thăng Long." },
    { year: "1831", event: "Vua Minh Mạng đổi tên Thăng Long thành Hà Nội." },
    { year: "1945", event: "Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập tại Quảng trường Ba Đình." },
    { year: "1999", event: "Hà Nội được UNESCO vinh danh là 'Thành phố vì hòa bình'." },
    { year: "2010", event: "Kỷ niệm Đại lễ 1000 năm Thăng Long - Hà Nội." }
  ],
  places: [
    {
      name: "Hồ Hoàn Kiếm",
      description: "Trái tim của thủ đô, gắn liền với truyền thuyết trả gươm thần cho Rùa Vàng.",
      image: "https://images.unsplash.com/photo-1619149822710-bbdc838f2b3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxIb2FuJTIwS2llbSUyMExha2UlMjBIYW5vaXxlbnwxfHx8fDE3Nzc4MTgyNzN8MA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      name: "Văn Miếu - Quốc Tử Giám",
      description: "Trường đại học đầu tiên của Việt Nam, biểu tượng của nền giáo dục khoa bảng.",
      image: "https://images.unsplash.com/photo-1627785740415-278ba9cc393a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUZW1wbGUlMjBvZiUyMExpdGVyYXR1cmUlMjBIYW5vaXxlbnwxfHx8fDE3Nzc4MTgyNzN8MA&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ],
  cuisine: [
    {
      name: "Phở Hà Nội",
      description: "Món ăn quốc hồn quốc túy với nước dùng thanh ngọt, bánh phở mềm và thịt bò/gà.",
      image: "https://images.unsplash.com/photo-1631709497146-a239ef373cf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQaG8lMjBub29kbGUlMjBzb3VwfGVufDF8fHx8MTc3NzgxODI3M3ww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      name: "Bún Chả",
      description: "Thịt lợn nướng tẩm ướp đậm đà, ăn kèm bún, rau sống và nước mắm chua ngọt.",
      image: "https://images.unsplash.com/photo-1579856896394-07dfa10d7c5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCdW4lMjBDaGElMjBIYW5vaXxlbnwxfHx8fDE3Nzc4MTgyNzN8MA&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ]
};
const HCM_DATA = {
  overview: {
    description: "Thành phố Hồ Chí Minh là trung tâm kinh tế, tài chính, văn hóa và giáo dục lớn nhất Việt Nam. Thành phố nổi tiếng với nhịp sống sôi động, hiện đại, là nơi giao thoa giữa nét đẹp lịch sử và sự phát triển đô thị hàng đầu cả nước.",
    stats: [
      { label: "Diện tích", value: "2.095 km²" },
      { label: "Dân số", value: "Khoảng 9,5 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa cận xích đạo" }
    ]
  },

  history: [
    {
      year: "1698",
      event: "Nguyễn Hữu Cảnh vào Nam kinh lý, lập phủ Gia Định, đánh dấu việc vùng đất Sài Gòn chính thức được xác lập trong hệ thống hành chính Đại Việt."
    },
    {
      year: "1859",
      event: "Thực dân Pháp nổ súng đánh chiếm thành Gia Định, mở đầu thời kỳ thuộc địa và quá trình đô thị hóa kiểu phương Tây tại Sài Gòn."
    },
    {
      year: "1862",
      event: "Sau Hòa ước Nhâm Tuất, Sài Gòn trở thành trung tâm hành chính và quân sự quan trọng của Pháp tại Nam Kỳ."
    },
    {
      year: "1887",
      event: "Sài Gòn trở thành một trong những đô thị trọng điểm của Liên bang Đông Dương và được mệnh danh là 'Hòn ngọc Viễn Đông'."
    },
    {
      year: "1975",
      event: "Chiến dịch Hồ Chí Minh toàn thắng, Sài Gòn được giải phóng, đất nước hoàn toàn thống nhất."
    },
    {
      year: "1976",
      event: "Quốc hội khóa VI quyết định đổi tên thành phố Sài Gòn - Gia Định thành Thành phố Hồ Chí Minh."
    },
    {
      year: "2021",
      event: "Thành phố Thủ Đức chính thức được thành lập trên cơ sở sáp nhập Quận 2, Quận 9 và Quận Thủ Đức, trở thành mô hình 'thành phố trong thành phố' đầu tiên của Việt Nam."
    },
    {
      year: "2025-2026",
      event: "TP.HCM tiếp tục triển khai sắp xếp đơn vị hành chính cấp phường và đẩy mạnh phát triển đô thị thông minh, giao thông xanh cùng chuyển đổi số quy mô lớn."
    }
  ],

  places: [
    {
      name: "Chợ Bến Thành",
      description: "Biểu tượng nổi tiếng của TP.HCM với kiến trúc lâu đời, là địa điểm mua sắm và tham quan thu hút đông đảo du khách.",
      image: "/banner/chobenthanh.jpg"
    },
    {
      name: "Dinh Độc Lập",
      description: "Di tích lịch sử quốc gia đặc biệt gắn liền với sự kiện giải phóng miền Nam và thống nhất đất nước năm 1975.",
      image: "/banner/dinhdoclap.webp"
    },
    {
      name: "Landmark 81",
      description: "Tòa nhà cao nhất Việt Nam, biểu tượng cho sự phát triển hiện đại và năng động của thành phố.",
      image: "/banner/landmark81.jpg"
    }
  ],

  cuisine: [
    {
      name: "Cơm tấm Sài Gòn",
      description: "Món ăn đặc trưng nổi tiếng với sườn nướng, bì, chả ăn kèm cơm tấm và nước mắm đậm vị.",
      image: "/banner/comtam.jpg"
    },
    {
      name: "Bánh mì Sài Gòn",
      description: "Ổ bánh mì giòn rụm với nhiều loại nhân như pate, thịt nguội, chả lụa và rau chua, nổi tiếng khắp thế giới.",
      image: "/banner/banhmi.jpg"
    },
    {
      name: "Hủ tiếu Nam Vang",
      description: "Món hủ tiếu nước đặc trưng phổ biến tại TP.HCM với nước dùng ngọt thanh, tôm, thịt bằm và trứng cút.",
      image: "/banner/hutieu.jpg"
    }
  ]
};
const DANANG_DATA = {
  overview: {
    description: "Đà Nẵng là thành phố cảng lớn và là trung tâm kinh tế, văn hóa, giáo dục, khoa học công nghệ lớn nhất miền Trung - Tây Nguyên. Được mệnh danh là 'Thành phố đáng sống nhất Việt Nam', Đà Nẵng thu hút du khách nhờ sự kết hợp hài hòa giữa biển xanh, núi non hùng vĩ và hạ tầng đô thị hiện đại, văn minh.",
    stats: [
      { label: "Diện tích", value: "1.285 km²" },
      { label: "Dân số", value: "1.23 triệu người (2023)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa (Chia làm 2 mùa: Mùa mưa và Mùa khô)" }
    ]
  },

  history: [
    {
      year: "1471",
      event: "Vua Lê Thánh Tông thân chinh mở mang bờ cõi về phía Nam, thành lập đạo thừa tuyên Quảng Nam, trong đó địa bàn Đà Nẵng thuộc huyện Điện Bàn, chính thức thuộc về bản đồ Đại Việt."
    },
    {
      year: "1835",
      event: "Vua Minh Mạng chuẩn y chỉ dụ: tất cả các tàu thuyền phương Tây vào giao thương chỉ được đậu tại cửa biển Đà Nẵng (gọi là Cửa Hàn), biến nơi đây thành thương cảng đối ngoại lớn nhất miền Trung lúc bấy giờ."
    },
    {
      year: "1858",
      event: "Liên quân Pháp - Tây Ban Nha nổ súng tấn công cửa biển Đà Nẵng, mở đầu cho cuộc chiến tranh xâm lược của thực dân Pháp tại Việt Nam."
    },
    {
      year: "1888",
      event: "Vua Đồng Khánh ký đạo dụ nhượng hẳn Đà Nẵng cho Pháp. Tổng thống Pháp lập ra thành phố Tourane (tên gọi của Đà Nẵng thời thuộc Pháp) là một trong những nhượng địa lớn."
    },
    {
      year: "1997",
      event: "Chính thức chia tách tỉnh Quảng Nam - Đà Nẵng. Thành phố Đà Nẵng trở thành thành phố trực thuộc trung ương, bước vào thời kỳ bứt phá, đô thị hóa và phát triển mạnh mẽ."
    },
    {
      year: "2024-2025",
      event: "Ủy ban Thường vụ Quốc hội ban hành Nghị quyết số 1253/NQ-UBTVQH15 về việc sắp xếp đơn vị hành chính cấp xã của TP. Đà Nẵng giai đoạn 2023 - 2025, chính thức sáp nhập hàng loạt phường tại các quận trung tâm như Hải Châu, Thanh Khê và Sơn Trà để tinh gọn bộ máy."
    }
  ],

  places: [
    {
      name: "Cầu Rồng",
      description: "Biểu tượng kiến trúc hiện đại độc đáo của thành phố với hình dáng con rồng thời Lý hướng ra biển lớn, có khả năng phun lửa và nước vào mỗi tối cuối tuần.",
      image: "/banner/caurong.jpg"
    },
    {
      name: "Bà Nà Hills (Cầu Vàng)",
      description: "Khu du lịch nghỉ dưỡng đẳng cấp trên đỉnh núi Chúa, nổi tiếng toàn cầu với công trình Cầu Vàng (Golden Bridge) được nâng đỡ bởi hai bàn tay khổng lồ rêu phong.",
      image: "/banner/banahills.jpg"
    },
    {
      name: "Ngũ Hành Sơn",
      description: "Quần thể gồm 5 ngọn núi đá vôi nhô lên giữa lòng thành phố, lưu giữ hệ thống hang động huyền bí, chùa chiền cổ kính và làng nghề điêu khắc đá mỹ nghệ lâu đời.",
      image: "/banner/nguhanhson.jpg"
    }
  ],

  cuisine: [
    {
      name: "Mì Quảng",
      description: "Linh hồn ẩm thực xứ Quảng - Đà, sợi mì dày dai ăn kèm chút nước lèo đậm đà sệt từ tôm thịt, gà hoặc ếch, rắc thêm đậu phộng rang và bánh tráng nướng giòn.",
      image: "/banner/miQuang.jpg"
    },
    {
      name: "Bánh tráng cuốn thịt heo",
      description: "Món ăn thanh mát nức lòng thực khách với những lát thịt heo luộc xẻ hai đầu mỡ, cuốn cùng rau sống đủ loại trong bánh tráng phơi sương và chấm mắm nêm cay nồng.",
      image: "/banner/banhtrangcuon.jpg"
    },
    {
      name: "Bún chả cá Đà Nẵng",
      description: "Sự kết hợp giữa những viên chả cá thát lát dai ngon và nước dùng ngọt lịm hầm từ xương cá, bí đỏ, su su, măng tươi kèm chút mắm ruốc thơm phức.",
      image: "/banner/bunchaca.jpg"
    }
  ]
};
const DIENBIEN_DATA = {
  overview: {
    description: "Điện Biên là tỉnh miền núi thuộc vùng Tây Bắc Việt Nam, nổi tiếng với chiến thắng Điện Biên Phủ vang dội năm 1954. Nơi đây sở hữu vẻ đẹp hùng vĩ của núi rừng, bản sắc văn hóa đa dạng của các dân tộc và nhiều di tích lịch sử quan trọng.",
    stats: [
      { label: "Diện tích", value: "9.539 km²" },
      { label: "Dân số", value: "Khoảng 650.000 người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa vùng núi cao" }
    ]
  },

  history: [
    {
      year: "1841",
      event: "Tên gọi Điện Biên chính thức xuất hiện dưới triều Nguyễn với ý nghĩa là vùng biên cương vững chắc phía Tây Bắc của đất nước."
    },
    {
      year: "1954",
      event: "Chiến thắng Điện Biên Phủ diễn ra từ ngày 13/3 đến 7/5/1954, kết thúc thắng lợi cuộc kháng chiến chống thực dân Pháp và làm chấn động địa cầu."
    },
    {
      year: "1992",
      event: "Tái lập tỉnh Lai Châu mới, trong đó khu vực Điện Biên tiếp tục là địa bàn chiến lược quan trọng vùng Tây Bắc."
    },
    {
      year: "2004",
      event: "Tỉnh Điện Biên chính thức được thành lập theo Nghị quyết của Quốc hội trên cơ sở chia tách tỉnh Lai Châu."
    },
    {
      year: "2024",
      event: "Điện Biên tổ chức trọng thể lễ kỷ niệm 70 năm Chiến thắng Điện Biên Phủ với nhiều hoạt động văn hóa, lịch sử và du lịch quy mô lớn."
    },
    {
      year: "2025-2026",
      event: "Tỉnh tiếp tục phát triển du lịch lịch sử, du lịch cộng đồng và đầu tư hạ tầng giao thông nhằm thúc đẩy kinh tế vùng Tây Bắc."
    }
  ],

  places: [
    {
      name: "Đồi A1",
      description: "Di tích lịch sử nổi tiếng gắn liền với trận chiến ác liệt trong Chiến dịch Điện Biên Phủ năm 1954.",
      image: "/banner/doiA1.jpg"
    },
    {
      name: "Tượng đài Chiến thắng Điện Biên Phủ",
      description: "Công trình biểu tượng nằm trên đồi D1, thể hiện tinh thần chiến thắng hào hùng của dân tộc Việt Nam.",
      image: "/banner/tuongdai.jpg"
    },
    {
      name: "Hồ Pá Khoang",
      description: "Danh thắng thiên nhiên nổi tiếng với phong cảnh thơ mộng, khí hậu mát mẻ và rừng núi xanh ngát.",
      image: "/banner/hopakhoang.webp"
    }
  ],

  cuisine: [
    {
      name: "Xôi nếp nương",
      description: "Món xôi đặc sản Tây Bắc được nấu từ nếp nương thơm dẻo, mang hương vị đặc trưng của vùng núi Điện Biên.",
      image: "/banner/xoinepnuong.webp"
    },
    {
      name: "Gà nướng mắc khén",
      description: "Món ăn nổi tiếng của đồng bào Tây Bắc với hương vị cay thơm đặc trưng từ hạt mắc khén.",
      image: "/banner/ganuong.pnj"
    },
    {
      name: "Pa pỉnh tộp",
      description: "Món cá nướng truyền thống của người Thái, được tẩm ướp nhiều loại gia vị núi rừng đặc sắc.",
      image: "/banner/papinh.jpg"
    }
  ]
};
const LAICHAU_DATA = {
  overview: {
    description: "Lai Châu là tỉnh miền núi thuộc vùng Tây Bắc Việt Nam, nổi bật với cảnh quan thiên nhiên hùng vĩ, những dãy núi cao, ruộng bậc thang tuyệt đẹp và bản sắc văn hóa đặc trưng của nhiều dân tộc thiểu số.",
    stats: [
      { label: "Diện tích", value: "9.068 km²" },
      { label: "Dân số", value: "Khoảng 510.000 người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa vùng núi cao" }
    ]
  },

  history: [
    {
      year: "1909",
      event: "Tỉnh Lai Châu được thành lập dưới thời Pháp thuộc, là vùng đất chiến lược quan trọng tại khu vực Tây Bắc."
    },
    {
      year: "1954",
      event: "Sau chiến thắng Điện Biên Phủ, Lai Châu bước vào giai đoạn xây dựng và phát triển cùng miền Bắc Việt Nam."
    },
    {
      year: "2004",
      event: "Quốc hội quyết định chia tách tỉnh Lai Châu cũ thành hai tỉnh Điện Biên và Lai Châu mới như hiện nay."
    },
    {
      year: "2016",
      event: "Nhiều công trình thủy điện lớn trên sông Đà hoàn thiện, góp phần thúc đẩy phát triển kinh tế của tỉnh."
    },
    {
      year: "2024",
      event: "Lai Châu đẩy mạnh phát triển du lịch sinh thái, du lịch cộng đồng gắn với văn hóa dân tộc vùng cao."
    },
    {
      year: "2025-2026",
      event: "Tỉnh tiếp tục đầu tư hạ tầng giao thông, phát triển nông nghiệp sạch và khai thác tiềm năng du lịch Tây Bắc."
    }
  ],

  places: [
    {
      name: "Đỉnh Pu Ta Leng",
      description: "Một trong những đỉnh núi cao nhất Việt Nam, nổi tiếng với cảnh sắc thiên nhiên hùng vĩ và mùa hoa đỗ quyên rực rỡ.",
      image: "/banner/putraleng.jpg"
    },
    {
      name: "Cầu kính Rồng Mây",
      description: "Điểm du lịch nổi tiếng nằm giữa núi rừng Tây Bắc với trải nghiệm săn mây và ngắm cảnh ngoạn mục.",
      image: "/banner/caurong.jpg"
    },
    {
      name: "Cao nguyên Sìn Hồ",
      description: "Được ví như 'Sa Pa thứ hai' của Tây Bắc với khí hậu mát mẻ quanh năm và cảnh quan thơ mộng.",
      image: "/banner/sinho.jpg"
    }
  ],

  cuisine: [
    {
      name: "Thịt trâu gác bếp",
      description: "Đặc sản nổi tiếng Tây Bắc với hương vị đậm đà, được hun khói từ bếp củi truyền thống.",
      image: "/banner/thittraugacbep.jpg"
    },
    {
      name: "Lợn cắp nách",
      description: "Món ăn đặc sản vùng cao với thịt chắc, thơm ngon, thường được chế biến bằng cách nướng hoặc hấp.",
      image: "/banner/loncapnach.webp"
    },
    {
      name: "Xôi tím Lai Châu",
      description: "Món xôi truyền thống của đồng bào dân tộc với màu tím tự nhiên từ lá cây rừng.",
      image: "/banner/xoitim.jpg"
    }
  ]
};
const SONLA_DATA = {
  overview: {
    description: "Sơn La là tỉnh miền núi thuộc vùng Tây Bắc Việt Nam, nổi tiếng với cảnh quan thiên nhiên hùng vĩ, cao nguyên Mộc Châu thơ mộng và nền văn hóa đa dạng của nhiều dân tộc anh em.",
    stats: [
      { label: "Diện tích", value: "14.123 km²" },
      { label: "Dân số", value: "Khoảng 1,35 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa vùng núi cao" }
    ]
  },

  history: [
    {
      year: "1895",
      event: "Tỉnh Sơn La được thành lập dưới thời Pháp thuộc, trở thành địa bàn chiến lược quan trọng của vùng Tây Bắc."
    },
    {
      year: "1908",
      event: "Nhà tù Sơn La được thực dân Pháp xây dựng nhằm giam giữ các chiến sĩ cách mạng Việt Nam."
    },
    {
      year: "1952",
      event: "Chiến dịch Tây Bắc thắng lợi, Sơn La được giải phóng khỏi sự kiểm soát của thực dân Pháp."
    },
    {
      year: "1994",
      event: "Công trình thủy điện Sơn La được phê duyệt, mở đầu cho dự án thủy điện lớn nhất Đông Nam Á thời điểm đó."
    },
    {
      year: "2012",
      event: "Nhà máy Thủy điện Sơn La chính thức khánh thành, góp phần quan trọng vào an ninh năng lượng quốc gia."
    },
    {
      year: "2024",
      event: "Sơn La tiếp tục phát triển mạnh du lịch sinh thái, nông nghiệp công nghệ cao và quảng bá thương hiệu cao nguyên Mộc Châu."
    },
    {
      year: "2025-2026",
      event: "Tỉnh đẩy mạnh phát triển hạ tầng giao thông, du lịch cộng đồng và xuất khẩu nông sản đặc trưng vùng Tây Bắc."
    }
  ],

  places: [
    {
      name: "Cao nguyên Mộc Châu",
      description: "Điểm du lịch nổi tiếng với đồi chè xanh mướt, mùa hoa cải trắng và khí hậu mát mẻ quanh năm.",
      image: "/banner/mocchau.webp"
    },
    {
      name: "Nhà tù Sơn La",
      description: "Di tích lịch sử quốc gia đặc biệt, nơi từng giam giữ nhiều chiến sĩ cách mạng Việt Nam.",
      image: "/banner/nhatu.jpg"
    },
    {
      name: "Thác Dải Yếm",
      description: "Danh thắng thiên nhiên nổi tiếng tại Mộc Châu với dòng thác trắng xóa giữa núi rừng Tây Bắc.",
      image: "/banner/thacdaiyem.jpeg"
    }
  ],

  cuisine: [
    {
      name: "Bê chao Mộc Châu",
      description: "Đặc sản nổi tiếng với thịt bê non mềm thơm được chao nhanh trong dầu nóng.",
      image: "/banner/be.jpg"
    },
    {
      name: "Cá suối nướng",
      description: "Món ăn dân dã của người Tây Bắc với cá suối tươi nướng than hồng thơm lừng.",
      image: "/banner/canuong.jpg"
    },
    {
      name: "Nậm pịa",
      description: "Món ăn truyền thống độc đáo của đồng bào dân tộc Thái với hương vị đặc trưng vùng núi.",
      image: "/banner/nampia.webp"
    }
  ]
};
const LAOCAI_DATA = {
  overview: {
    description: "Lào Cai là tỉnh miền núi thuộc vùng Tây Bắc Việt Nam, nổi tiếng với thị xã Sa Pa mờ sương, đỉnh Fansipan hùng vĩ và nền văn hóa đặc sắc của nhiều dân tộc thiểu số.",
    stats: [
      { label: "Diện tích", value: "6.364 km²" },
      { label: "Dân số", value: "Khoảng 800.000 người (2026)" },
      { label: "Khí hậu", value: "Cận nhiệt đới núi cao" }
    ]
  },

  history: [
    {
      year: "1907",
      event: "Tỉnh Lào Cai được thành lập dưới thời Pháp thuộc, trở thành địa bàn quan trọng vùng biên giới Tây Bắc."
    },
    {
      year: "1922",
      event: "Người Pháp bắt đầu phát triển Sa Pa thành khu nghỉ dưỡng nổi tiếng nhờ khí hậu mát mẻ quanh năm."
    },
    {
      year: "1979",
      event: "Chiến tranh biên giới phía Bắc diễn ra ác liệt tại Lào Cai và nhiều khu vực biên giới Việt - Trung."
    },
    {
      year: "1991",
      event: "Tỉnh Lào Cai được tái lập sau khi tách khỏi tỉnh Hoàng Liên Sơn."
    },
    {
      year: "2014",
      event: "Tuyến cao tốc Nội Bài - Lào Cai chính thức đi vào hoạt động, thúc đẩy mạnh mẽ kinh tế và du lịch."
    },
    {
      year: "2023",
      event: "Sa Pa được công nhận là Khu du lịch quốc gia, tiếp tục trở thành điểm đến nổi bật của Việt Nam."
    },
    {
      year: "2025-2026",
      event: "Lào Cai đẩy mạnh phát triển du lịch xanh, kinh tế cửa khẩu và hạ tầng giao thông kết nối vùng Tây Bắc."
    }
  ],

  places: [
    {
      name: "Sa Pa",
      description: "Điểm du lịch nổi tiếng với khí hậu mát lạnh, ruộng bậc thang và văn hóa đặc sắc vùng cao Tây Bắc.",
      image: "/banner/sapa.jpg"
    },
    {
      name: "Đỉnh Fansipan",
      description: "Nóc nhà Đông Dương với độ cao 3.143 mét, điểm đến hấp dẫn của du khách và người yêu khám phá.",
      image: "/banner/fanssipan.jpg"
    },
    {
      name: "Chợ Bắc Hà",
      description: "Phiên chợ vùng cao nổi tiếng mang đậm bản sắc văn hóa các dân tộc Tây Bắc.",
      image: "/banner/bachamarket.webp"
    }
  ],

  cuisine: [
    {
      name: "Thắng cố",
      description: "Món ăn truyền thống nổi tiếng của đồng bào vùng cao với hương vị đậm đà đặc trưng.",
      image: "/banner/thangco.jpg"
    },
    {
      name: "Cá hồi Sa Pa",
      description: "Đặc sản nổi tiếng được nuôi trong khí hậu lạnh vùng núi cao, thịt chắc và thơm ngon.",
      image: "/banner/cahisapa.png"
    },
    {
      name: "Lợn cắp nách",
      description: "Món ăn đặc trưng Tây Bắc với thịt thơm, săn chắc và thường được nướng nguyên con.",
      image: "/banner/loncapnach.webp"
    }
  ]
};
const TUYENQUANG_DATA = {
  overview: {
    description: "Tuyên Quang là tỉnh thuộc vùng Đông Bắc Việt Nam, nổi tiếng với cảnh quan thiên nhiên xanh mát, hồ sinh thái Na Hang và vai trò quan trọng trong lịch sử cách mạng Việt Nam.",
    stats: [
      { label: "Diện tích", value: "5.867 km²" },
      { label: "Dân số", value: "Khoảng 820.000 người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa" }
    ]
  },

  history: [
    {
      year: "1831",
      event: "Tỉnh Tuyên Quang chính thức được thành lập dưới triều vua Minh Mạng nhà Nguyễn."
    },
    {
      year: "1945",
      event: "Tân Trào, Tuyên Quang trở thành 'Thủ đô Khu giải phóng', nơi diễn ra Quốc dân Đại hội trước Cách mạng Tháng Tám."
    },
    {
      year: "1947",
      event: "Chiến thắng Việt Bắc Thu - Đông góp phần bảo vệ căn cứ địa cách mạng tại Tuyên Quang."
    },
    {
      year: "1975",
      event: "Tuyên Quang cùng cả nước bước vào giai đoạn xây dựng và phát triển sau ngày đất nước thống nhất."
    },
    {
      year: "2023",
      event: "Lễ hội Thành Tuyên tiếp tục được tổ chức quy mô lớn, trở thành sự kiện văn hóa nổi bật của miền Bắc."
    },
    {
      year: "2025-2026",
      event: "Tuyên Quang đẩy mạnh phát triển du lịch sinh thái, du lịch lịch sử và nâng cấp hạ tầng giao thông vùng Đông Bắc."
    }
  ],

  places: [
    {
      name: "Khu di tích Tân Trào",
      description: "Di tích lịch sử quốc gia đặc biệt gắn liền với Cách mạng Tháng Tám và Chủ tịch Hồ Chí Minh.",
      image: "/banner/tantrao.jpg"
    },
    {
      name: "Hồ Na Hang",
      description: "Danh thắng nổi tiếng với phong cảnh sơn thủy hữu tình, được ví như 'Hạ Long giữa đại ngàn'.",
      image: "/banner/nahang.jpg"
    },
    {
      name: "Thác Mơ",
      description: "Thác nước đẹp nằm giữa núi rừng nguyên sinh với khung cảnh hoang sơ và hùng vĩ.",
      image: "/banner/thacmo.webp"
    }
  ],

  cuisine: [
    {
      name: "Bánh gai Chiêm Hóa",
      description: "Đặc sản nổi tiếng của Tuyên Quang với lớp vỏ mềm dẻo từ lá gai và nhân đậu xanh thơm ngọt.",
      image: "/banner/banhhai.jpg"
    },
    {
      name: "Thịt lợn đen",
      description: "Món ăn đặc sản vùng núi với thịt săn chắc, thơm ngon và được chế biến theo nhiều cách truyền thống.",
      image: "/banner/thitlonden.png"
    },
    {
      name: "Cá đặc sản sông Gâm",
      description: "Các món cá tươi ngon từ sông Gâm nổi tiếng với vị ngọt tự nhiên và thịt chắc.",
      image: "/banner/casonggam.jpg"
    }
  ]
};
const CAOBANG_DATA = {
  overview: {
    description: "Cao Bằng là tỉnh miền núi thuộc vùng Đông Bắc Việt Nam, nổi tiếng với phong cảnh thiên nhiên hùng vĩ, thác Bản Giốc tuyệt đẹp và nhiều di tích lịch sử cách mạng quan trọng.",
    stats: [
      { label: "Diện tích", value: "6.700 km²" },
      { label: "Dân số", value: "Khoảng 560.000 người (2026)" },
      { label: "Khí hậu", value: "Cận nhiệt đới ẩm vùng núi cao" }
    ]
  },

  history: [
    {
      year: "1499",
      event: "Tên gọi Cao Bằng xuất hiện trong lịch sử dưới thời nhà Lê, là vùng đất biên cương quan trọng phía Bắc."
    },
    {
      year: "1941",
      event: "Chủ tịch Hồ Chí Minh trở về nước tại Pác Bó, Cao Bằng sau hơn 30 năm bôn ba tìm đường cứu nước."
    },
    {
      year: "1950",
      event: "Chiến dịch Biên giới Thu - Đông giành thắng lợi lớn, mở rộng căn cứ địa cách mạng Việt Bắc."
    },
    {
      year: "1979",
      event: "Cao Bằng là một trong những địa phương chịu ảnh hưởng nặng nề trong chiến tranh biên giới phía Bắc."
    },
    {
      year: "2018",
      event: "Công viên địa chất Non nước Cao Bằng được UNESCO công nhận là Công viên địa chất toàn cầu."
    },
    {
      year: "2025-2026",
      event: "Cao Bằng tiếp tục phát triển du lịch sinh thái, du lịch lịch sử và thúc đẩy kinh tế cửa khẩu vùng biên giới."
    }
  ],

  places: [
    {
      name: "Thác Bản Giốc",
      description: "Một trong những thác nước đẹp và lớn nhất Đông Nam Á nằm trên biên giới Việt Nam - Trung Quốc.",
      image: "/banner/bangioc.webp"
    },
    {
      name: "Khu di tích Pác Bó",
      description: "Di tích lịch sử nổi tiếng gắn liền với hoạt động cách mạng của Chủ tịch Hồ Chí Minh.",
      image: "/banner/pacbo.jpg"
    },
    {
      name: "Động Ngườm Ngao",
      description: "Hang động tự nhiên nổi tiếng với hệ thống nhũ đá kỳ ảo và vẻ đẹp độc đáo.",
      image: "/banner/nguomngao.jpg"
    }
  ],

  cuisine: [
    {
      name: "Bánh cuốn Cao Bằng",
      description: "Đặc sản nổi tiếng ăn kèm nước dùng nóng và thịt băm đậm đà hương vị vùng cao.",
      image: "/banner/banhhai.jpg"
    },
    {
      name: "Vịt quay 7 vị",
      description: "Món ăn đặc sản được tẩm ướp nhiều loại gia vị truyền thống độc đáo của người Tày.",
      image: "/banner/vitquay.jpg"
    },
    {
      name: "Hạt dẻ Trùng Khánh",
      description: "Đặc sản nổi tiếng của Cao Bằng với vị bùi béo và thơm ngon đặc trưng.",
      image: "/banner/hatde.jpg"
    }
  ]
};
const THAINGUYEN_DATA = {
  overview: {
    description: "Thái Nguyên là tỉnh thuộc vùng trung du và miền núi Bắc Bộ Việt Nam, nổi tiếng với vùng chè đặc sản, vai trò trung tâm công nghiệp - giáo dục của khu vực và nhiều di tích lịch sử cách mạng quan trọng.",
    stats: [
      { label: "Diện tích", value: "3.521 km²" },
      { label: "Dân số", value: "Khoảng 1,4 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa" }
    ]
  },

  history: [
    {
      year: "1831",
      event: "Tỉnh Thái Nguyên chính thức được thành lập dưới triều vua Minh Mạng nhà Nguyễn."
    },
    {
      year: "1947",
      event: "ATK Định Hóa trở thành trung tâm căn cứ địa kháng chiến chống thực dân Pháp của Trung ương Đảng và Chính phủ."
    },
    {
      year: "1965",
      event: "Khu Gang thép Thái Nguyên phát triển mạnh, trở thành biểu tượng công nghiệp nặng đầu tiên của Việt Nam."
    },
    {
      year: "1997",
      event: "Tỉnh Thái Nguyên được tái lập sau khi tách khỏi tỉnh Bắc Thái."
    },
    {
      year: "2013",
      event: "Nhiều tập đoàn công nghệ lớn đầu tư vào Thái Nguyên, thúc đẩy phát triển kinh tế và công nghiệp điện tử."
    },
    {
      year: "2025-2026",
      event: "Thái Nguyên tiếp tục phát triển công nghiệp công nghệ cao, giáo dục đại học và du lịch sinh thái vùng trung du Bắc Bộ."
    }
  ],

  places: [
    {
      name: "Hồ Núi Cốc",
      description: "Khu du lịch nổi tiếng với phong cảnh thiên nhiên thơ mộng gắn liền với truyền thuyết nàng Công - chàng Cốc.",
      image: "/banner/honuicoc.webp"
    },
    {
      name: "ATK Định Hóa",
      description: "Di tích lịch sử quốc gia đặc biệt, nơi ở và làm việc của Chủ tịch Hồ Chí Minh cùng Trung ương Đảng thời kháng chiến.",
      image: "/banner/atkdinhhoa.jpg"
    },
    {
      name: "Đồi chè Tân Cương",
      description: "Vùng chè nổi tiếng với khung cảnh xanh mướt và thương hiệu chè Thái Nguyên nổi tiếng cả nước.",
      image: "/banner/tancuong.jpg"
    }
  ],

  cuisine: [
    {
      name: "Chè Tân Cương",
      description: "Đặc sản nổi tiếng của Thái Nguyên với hương thơm cốm non và vị chát dịu đặc trưng.",
      image: "/banner/teatancuong.webp"
    },
    {
      name: "Bánh chưng Bờ Đậu",
      description: "Món bánh truyền thống nổi tiếng với lớp nếp dẻo thơm và nhân đậm đà.",
      image: "/banner/banhchung.jpg"
    },
    {
      name: "Nem chua Đại Từ",
      description: "Đặc sản địa phương với vị chua thanh nhẹ và hương vị thơm ngon đặc trưng.",
      image: "/banner/nemchua.jpg"
    }
  ]
};
const LANGSON_DATA = {
  overview: {
    description: "Lạng Sơn là tỉnh miền núi thuộc vùng Đông Bắc Việt Nam, nổi tiếng với cửa khẩu quốc tế quan trọng, cảnh quan núi non hùng vĩ và nền văn hóa đậm đà bản sắc dân tộc Tày, Nùng.",
    stats: [
      { label: "Diện tích", value: "8.310 km²" },
      { label: "Dân số", value: "Khoảng 820.000 người (2026)" },
      { label: "Khí hậu", value: "Cận nhiệt đới ẩm" }
    ]
  },

  history: [
    {
      year: "1831",
      event: "Tỉnh Lạng Sơn chính thức được thành lập dưới triều vua Minh Mạng nhà Nguyễn."
    },
    {
      year: "1885",
      event: "Lạng Sơn trở thành địa bàn chiến lược quan trọng trong cuộc chiến giữa quân Thanh và thực dân Pháp."
    },
    {
      year: "1950",
      event: "Chiến dịch Biên giới Thu - Đông góp phần giải phóng nhiều khu vực tại Lạng Sơn và vùng Đông Bắc."
    },
    {
      year: "1979",
      event: "Lạng Sơn là một trong những địa phương chịu ảnh hưởng nặng nề trong chiến tranh biên giới phía Bắc."
    },
    {
      year: "1991",
      event: "Hoạt động giao thương biên giới được khôi phục mạnh mẽ, thúc đẩy kinh tế cửa khẩu phát triển."
    },
    {
      year: "2025-2026",
      event: "Lạng Sơn tiếp tục phát triển kinh tế cửa khẩu, logistics và du lịch văn hóa vùng Đông Bắc."
    }
  ],

  places: [
    {
      name: "Động Tam Thanh",
      description: "Danh thắng nổi tiếng với hệ thống hang động kỳ ảo và nhiều giá trị lịch sử, văn hóa.",
      image: "/banner/dongtamthanh.jpg"
    },
    {
      name: "Núi Tô Thị",
      description: "Biểu tượng nổi tiếng của Lạng Sơn gắn liền với truyền thuyết người vợ chờ chồng.",
      image: "/banner/nuitoshi.jpg"
    },
    {
      name: "Chợ Đông Kinh",
      description: "Khu chợ lớn và nổi tiếng của Lạng Sơn với hoạt động mua bán sầm uất.",
      image: "/banner/cho dong kinh.jpg"
    }
  ],

  cuisine: [
    {
      name: "Vịt quay Lạng Sơn",
      description: "Đặc sản nổi tiếng với lớp da vàng giòn và hương vị đậm đà từ lá mắc mật.",
      image: "/banner/vitquay.jpg"
    },
    {
      name: "Khâu nhục",
      description: "Món ăn truyền thống của người Tày, Nùng với thịt heo hấp mềm cùng nhiều gia vị đặc trưng.",
      image: "/banner/khaunhuc.webp"
    },
    {
      name: "Phở chua",
      description: "Món ăn đặc sản với vị chua ngọt hài hòa, ăn kèm thịt quay và rau sống.",
      image: "/banner/phochua.jpg"
    }
  ]
};
const PHUTHO_DATA = {
  overview: {
    description: "Phú Thọ là tỉnh thuộc vùng trung du và miền núi Bắc Bộ Việt Nam, được xem là vùng đất cội nguồn dân tộc Việt Nam với Khu di tích lịch sử Đền Hùng nổi tiếng.",
    stats: [
      { label: "Diện tích", value: "3.534 km²" },
      { label: "Dân số", value: "Khoảng 1,6 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa" }
    ]
  },

  history: [
    {
      year: "2879 TCN",
      event: "Theo truyền thuyết, các Vua Hùng dựng nước Văn Lang - nhà nước đầu tiên của dân tộc Việt Nam tại vùng đất Phú Thọ."
    },
    {
      year: "1831",
      event: "Tỉnh Phú Thọ chính thức được thành lập dưới triều vua Minh Mạng nhà Nguyễn."
    },
    {
      year: "1968",
      event: "Phú Thọ sáp nhập với Vĩnh Phúc thành tỉnh Vĩnh Phú."
    },
    {
      year: "1997",
      event: "Tỉnh Phú Thọ được tái lập sau khi tách khỏi tỉnh Vĩnh Phú."
    },
    {
      year: "2012",
      event: "Tín ngưỡng thờ cúng Hùng Vương ở Phú Thọ được UNESCO công nhận là Di sản văn hóa phi vật thể đại diện của nhân loại."
    },
    {
      year: "2025-2026",
      event: "Phú Thọ tiếp tục phát triển du lịch văn hóa tâm linh, công nghiệp và hạ tầng giao thông vùng trung du Bắc Bộ."
    }
  ],

  places: [
    {
      name: "Đền Hùng",
      description: "Khu di tích lịch sử đặc biệt quốc gia thờ các Vua Hùng, điểm hành hương nổi tiếng của người Việt.",
      image: "/banner/denhung.webp"
    },
    {
      name: "Vườn quốc gia Xuân Sơn",
      description: "Khu bảo tồn thiên nhiên nổi tiếng với hệ sinh thái đa dạng và cảnh quan núi rừng hoang sơ.",
      image: "/banner/xuanson.jpg"
    },
    {
      name: "Đồi chè Long Cốc",
      description: "Danh thắng nổi tiếng với những đồi chè xanh mướt được ví như 'vịnh Hạ Long vùng trung du'.",
      image: "/banner/longcoc.webp"
    }
  ],

  cuisine: [
    {
      name: "Bánh tai",
      description: "Món bánh truyền thống của Phú Thọ với lớp bột mềm dẻo và nhân thịt đậm đà.",
      image: "/banner/banhtai.jpeg"
    },
    {
      name: "Cọ ỏm",
      description: "Đặc sản dân dã nổi tiếng của Phú Thọ với vị béo bùi đặc trưng.",
      image: "/banner/qua co.jpg"
    },
    {
      name: "Thịt chua Thanh Sơn",
      description: "Món ăn đặc sản được lên men tự nhiên với vị chua thanh và thơm ngon độc đáo.",
      image: "/banner/thit chua.webp"
    }
  ]
};
const BACNINH_DATA = {
  overview: {
    description: "Bắc Ninh là tỉnh thuộc vùng Đồng bằng sông Hồng Việt Nam, nổi tiếng là quê hương của dân ca Quan họ và là một trong những trung tâm công nghiệp phát triển mạnh ở miền Bắc.",
    stats: [
      { label: "Diện tích", value: "822,7 km²" },
      { label: "Dân số", value: "Khoảng 1,6 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa" }
    ]
  },

  history: [
    {
      year: "1030",
      event: "Vùng đất Bắc Ninh xưa thuộc trấn Kinh Bắc, nổi tiếng là trung tâm văn hóa và khoa bảng của Việt Nam."
    },
    {
      year: "1831",
      event: "Tỉnh Bắc Ninh chính thức được thành lập dưới triều vua Minh Mạng nhà Nguyễn."
    },
    {
      year: "1962",
      event: "Bắc Ninh sáp nhập với Bắc Giang thành tỉnh Hà Bắc."
    },
    {
      year: "1997",
      event: "Tỉnh Bắc Ninh được tái lập sau khi tách khỏi tỉnh Hà Bắc."
    },
    {
      year: "2009",
      event: "Dân ca Quan họ Bắc Ninh được UNESCO công nhận là Di sản văn hóa phi vật thể đại diện của nhân loại."
    },
    {
      year: "2025-2026",
      event: "Bắc Ninh tiếp tục phát triển mạnh công nghiệp công nghệ cao, đô thị thông minh và bảo tồn giá trị văn hóa Kinh Bắc."
    }
  ],

  places: [
    {
      name: "Chùa Dâu",
      description: "Ngôi chùa cổ nổi tiếng được xem là trung tâm Phật giáo cổ nhất Việt Nam.",
      image: "/banner/chuadau.jpg"
    },
    {
      name: "Đền Đô",
      description: "Di tích lịch sử nổi tiếng thờ các vị vua triều Lý, mang đậm kiến trúc truyền thống Việt Nam.",
      image: "/banner/dendo.jpg"
    },
    {
      name: "Làng tranh Đông Hồ",
      description: "Làng nghề truyền thống nổi tiếng với nghệ thuật tranh dân gian Đông Hồ.",
      image: "/banner/dongho.jpg"
    }
  ],

  cuisine: [
    {
      name: "Bánh phu thê",
      description: "Đặc sản nổi tiếng với lớp vỏ dẻo trong và nhân đậu xanh ngọt bùi.",
      image: "/banner/banhthe.jpg"
    },
    {
      name: "Nem Bùi",
      description: "Món nem đặc sản của Bắc Ninh với vị thơm ngon và cách chế biến truyền thống.",
      image: "/banner/nem bui.jpg"
    },
    {
      name: "Cháo cá Tích Nghi",
      description: "Món ăn dân dã nổi tiếng với vị ngọt thanh từ cá và nước dùng đậm đà.",
      image: "/banner/chao ca.jpg"
    }
  ]
};
const QUANGNINH_DATA = {
  overview: {
    description: "Quảng Ninh là tỉnh ven biển thuộc vùng Đông Bắc Việt Nam, nổi tiếng với Vịnh Hạ Long - Di sản thiên nhiên thế giới cùng nền kinh tế phát triển mạnh về du lịch, cảng biển và công nghiệp khai khoáng.",
    stats: [
      { label: "Diện tích", value: "6.207 km²" },
      { label: "Dân số", value: "Khoảng 1,45 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa ven biển" }
    ]
  },

  history: [
    {
      year: "1883",
      event: "Tỉnh Quảng Ninh được thành lập dưới thời Pháp thuộc với vai trò quan trọng về khai thác than và cảng biển."
    },
    {
      year: "1936",
      event: "Cuộc tổng bãi công của công nhân vùng mỏ Quảng Ninh diễn ra, trở thành dấu mốc lớn trong phong trào công nhân Việt Nam."
    },
    {
      year: "1963",
      event: "Hai tỉnh Hải Ninh và khu Hồng Quảng được hợp nhất để thành lập tỉnh Quảng Ninh."
    },
    {
      year: "1994",
      event: "Vịnh Hạ Long lần đầu được UNESCO công nhận là Di sản thiên nhiên thế giới về giá trị thẩm mỹ."
    },
    {
      year: "2000",
      event: "Vịnh Hạ Long tiếp tục được UNESCO công nhận lần thứ hai về giá trị địa chất và địa mạo."
    },
    {
      year: "2025-2026",
      event: "Quảng Ninh tiếp tục phát triển mạnh du lịch quốc tế, kinh tế biển và hạ tầng giao thông hiện đại vùng Đông Bắc."
    }
  ],

  places: [
    {
      name: "Vịnh Hạ Long",
      description: "Di sản thiên nhiên thế giới nổi tiếng với hàng nghìn đảo đá vôi và cảnh quan biển tuyệt đẹp.",
      image: "/banner/ha long.jpg"
    },
    {
      name: "Yên Tử",
      description: "Khu danh thắng tâm linh nổi tiếng gắn liền với Thiền phái Trúc Lâm và vua Trần Nhân Tông.",
      image: "/banner/yen tu.jpg"
    },
    {
      name: "Bãi Cháy",
      description: "Khu du lịch biển nổi tiếng với bãi biển đẹp và nhiều hoạt động vui chơi giải trí.",
      image: "/banner/bai chay.jpg"
    }
  ],

  cuisine: [
    {
      name: "Chả mực Hạ Long",
      description: "Đặc sản nổi tiếng của Quảng Ninh với hương vị thơm ngon và độ dai đặc trưng từ mực tươi.",
      image: "/banner/cha muc.jpg"
    },
    {
      name: "Sá sùng",
      description: "Đặc sản biển quý hiếm thường dùng để nấu nước dùng phở hoặc chế biến món hải sản cao cấp.",
      image: "/banner/sa sung.webp"
    },
    {
      name: "Bún bề bề",
      description: "Món bún hải sản nổi tiếng với nước dùng ngọt thanh từ bề bề tươi sống.",
      image: "/banner/bun be be.jpeg"
    }
  ]
};
const HAIPHONG_DATA = {
  overview: {
    description: "Hải Phòng là thành phố cảng lớn nhất miền Bắc Việt Nam, nổi tiếng với vai trò trung tâm kinh tế biển, công nghiệp và logistics quan trọng của cả nước.",
    stats: [
      { label: "Diện tích", value: "1.561 km²" },
      { label: "Dân số", value: "Khoảng 2,2 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa ven biển" }
    ]
  },

  history: [
    {
      year: "1888",
      event: "Hải Phòng chính thức được thành lập dưới thời Pháp thuộc và nhanh chóng trở thành cảng biển quan trọng ở Bắc Kỳ."
    },
    {
      year: "1955",
      event: "Hải Phòng hoàn toàn giải phóng, trở thành một trong những trung tâm công nghiệp lớn của miền Bắc."
    },
    {
      year: "1986",
      event: "Sau thời kỳ Đổi mới, Hải Phòng phát triển mạnh về công nghiệp, cảng biển và giao thương quốc tế."
    },
    {
      year: "2018",
      event: "Cầu vượt biển Tân Vũ - Lạch Huyện hoàn thành, góp phần thúc đẩy kết nối giao thông và kinh tế biển."
    },
    {
      year: "2023",
      event: "Hải Phòng tiếp tục nằm trong nhóm địa phương có tốc độ tăng trưởng kinh tế cao nhất cả nước."
    },
    {
      year: "2025-2026",
      event: "Thành phố đẩy mạnh phát triển cảng biển quốc tế, logistics, đô thị thông minh và du lịch biển đảo."
    }
  ],

  places: [
    {
      name: "Đảo Cát Bà",
      description: "Quần đảo nổi tiếng với cảnh quan thiên nhiên tuyệt đẹp và Vườn quốc gia Cát Bà đa dạng sinh học.",
      image: "/banner/cat ba.webp"
    },
    {
      name: "Nhà hát lớn Hải Phòng",
      description: "Công trình kiến trúc cổ mang phong cách châu Âu nổi bật giữa trung tâm thành phố.",
      image: "/banner/nha hat hai phong.jpg"
    },
    {
      name: "Bãi biển Đồ Sơn",
      description: "Khu du lịch biển nổi tiếng với cảnh quan đẹp và nhiều lễ hội truyền thống đặc sắc.",
      image: "/banner/do son.jpg"
    }
  ],

  cuisine: [
    {
      name: "Bánh đa cua",
      description: "Món ăn đặc sản nổi tiếng của Hải Phòng với nước dùng đậm vị cua đồng và bánh đa đỏ đặc trưng.",
      image: "/banner/banh da cua.jpg"
    },
    {
      name: "Nem cua bể",
      description: "Món nem vuông nổi tiếng với nhân cua biển thơm ngon và lớp vỏ chiên giòn hấp dẫn.",
      image: "/banner/nem cua be.png"
    },
    {
      name: "Bún cá cay",
      description: "Món bún đặc sản với nước dùng cay nhẹ, cá chiên giòn và chả cá đậm đà.",
      image: "/banner/bun ca.jpg"
    }
  ]
};
const HUNGYEN_DATA = {
  overview: {
    description: "Hưng Yên là tỉnh thuộc vùng Đồng bằng sông Hồng Việt Nam, nổi tiếng với truyền thống văn hiến lâu đời, phố Hiến cổ kính và đặc sản nhãn lồng trứ danh.",
    stats: [
      { label: "Diện tích", value: "930,2 km²" },
      { label: "Dân số", value: "Khoảng 1,4 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa" }
    ]
  },

  history: [
    {
      year: "1831",
      event: "Tỉnh Hưng Yên chính thức được thành lập dưới triều vua Minh Mạng nhà Nguyễn."
    },
    {
      year: "Thế kỷ XVII",
      event: "Phố Hiến phát triển hưng thịnh, trở thành thương cảng sầm uất nổi tiếng với câu nói 'Thứ nhất Kinh Kỳ, thứ nhì Phố Hiến'."
    },
    {
      year: "1968",
      event: "Hưng Yên sáp nhập với Hải Dương thành tỉnh Hải Hưng."
    },
    {
      year: "1997",
      event: "Tỉnh Hưng Yên được tái lập sau khi tách khỏi tỉnh Hải Hưng."
    },
    {
      year: "2013",
      event: "Nhãn lồng Hưng Yên được bảo hộ chỉ dẫn địa lý, khẳng định thương hiệu đặc sản nổi tiếng của địa phương."
    },
    {
      year: "2025-2026",
      event: "Hưng Yên tiếp tục phát triển công nghiệp, đô thị hiện đại và bảo tồn các giá trị văn hóa truyền thống vùng đồng bằng Bắc Bộ."
    }
  ],

  places: [
    {
      name: "Phố Hiến",
      description: "Khu di tích lịch sử nổi tiếng từng là thương cảng sầm uất bậc nhất miền Bắc Việt Nam.",
      image: "/banner/pho hien.JPG"
    },
    {
      name: "Đền Chử Đồng Tử",
      description: "Di tích tâm linh nổi tiếng gắn liền với truyền thuyết Chử Đồng Tử - Tiên Dung.",
      image: "/banner/den chu dong tu.jpg"
    },
    {
      name: "Hồ Bán Nguyệt",
      description: "Danh thắng nổi bật nằm giữa trung tâm thành phố Hưng Yên với khung cảnh thanh bình.",
      image: "/banner/ho ban nguyet.webp"
    }
  ],

  cuisine: [
    {
      name: "Nhãn lồng Hưng Yên",
      description: "Đặc sản nổi tiếng với quả to, cùi dày, vị ngọt thơm đặc trưng.",
      image: "/banner/nhan long.jpg"
    },
    {
      name: "Bún thang lươn",
      description: "Món ăn đặc sản với nước dùng đậm đà và lươn chế biến thơm ngon.",
      image: "/banner/bun thang luon.jpg"
    },
    {
      name: "Gà Đông Tảo",
      description: "Giống gà quý nổi tiếng với đôi chân to đặc trưng và chất lượng thịt thơm ngon.",
      image: "/banner/ga dong tao.jpg"
    }
  ]
};
const NINHBINH_DATA = {
  overview: {
    description: "Ninh Bình là tỉnh thuộc vùng Đồng bằng sông Hồng Việt Nam, nổi tiếng với quần thể danh thắng Tràng An, cố đô Hoa Lư và phong cảnh non nước hữu tình.",
    stats: [
      { label: "Diện tích", value: "1.411 km²" },
      { label: "Dân số", value: "Khoảng 1,1 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa" }
    ]
  },

  history: [
    {
      year: "968",
      event: "Đinh Bộ Lĩnh lên ngôi Hoàng đế, đặt quốc hiệu Đại Cồ Việt và chọn Hoa Lư làm kinh đô đầu tiên của nhà nước phong kiến tập quyền Việt Nam."
    },
    {
      year: "1010",
      event: "Vua Lý Thái Tổ dời đô từ Hoa Lư ra Thăng Long, mở ra thời kỳ phát triển mới của đất nước."
    },
    {
      year: "1831",
      event: "Tỉnh Ninh Bình chính thức được thành lập dưới triều vua Minh Mạng nhà Nguyễn."
    },
    {
      year: "2014",
      event: "Quần thể danh thắng Tràng An được UNESCO công nhận là Di sản văn hóa và thiên nhiên thế giới."
    },
    {
      year: "2023",
      event: "Ninh Bình tiếp tục nằm trong nhóm điểm đến du lịch hấp dẫn hàng đầu Việt Nam với lượng khách tăng mạnh."
    },
    {
      year: "2025-2026",
      event: "Tỉnh đẩy mạnh phát triển du lịch sinh thái, du lịch di sản và hạ tầng giao thông kết nối vùng Bắc Bộ."
    }
  ],

  places: [
    {
      name: "Quần thể danh thắng Tràng An",
      description: "Di sản thế giới nổi tiếng với hệ thống núi đá vôi, hang động và dòng sông thơ mộng.",
      image: "/banner/trang an.png"
    },
    {
      name: "Cố đô Hoa Lư",
      description: "Khu di tích lịch sử đặc biệt gắn liền với triều đại Đinh và Tiền Lê.",
      image: "/banner/hoa lu.jpg"
    },
    {
      name: "Tam Cốc - Bích Động",
      description: "Danh thắng nổi tiếng được ví như 'Vịnh Hạ Long trên cạn' với phong cảnh hữu tình.",
      image: "/banner/tam coc.jpg"
    }
  ],

  cuisine: [
    {
      name: "Cơm cháy Ninh Bình",
      description: "Đặc sản nổi tiếng với lớp cơm giòn rụm ăn kèm nước sốt đậm đà.",
      image: "/banner/com chay.jpg"
    },
    {
      name: "Thịt dê núi",
      description: "Món ăn đặc sản nổi tiếng với thịt dê săn chắc được chế biến thành nhiều món hấp dẫn.",
      image: "/banner/thit de.webp"
    },
    {
      name: "Miến lươn",
      description: "Món ăn dân dã với nước dùng ngọt thanh và lươn thơm ngon đặc trưng.",
      image: "/banner/mien luon.webp"
    }
  ]
};
const THANHHOA_DATA = {
  overview: {
    description: "Thanh Hóa là tỉnh thuộc vùng Bắc Trung Bộ Việt Nam, nổi tiếng với bề dày lịch sử, văn hóa lâu đời cùng nhiều danh lam thắng cảnh và bãi biển đẹp.",
    stats: [
      { label: "Diện tích", value: "11.114 km²" },
      { label: "Dân số", value: "Khoảng 3,8 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa" }
    ]
  },

  history: [
    {
      year: "1029",
      event: "Tên gọi Thanh Hóa xuất hiện dưới triều vua Lý Thái Tông, trở thành vùng đất quan trọng của Đại Việt."
    },
    {
      year: "1400",
      event: "Hồ Quý Ly lên ngôi Hoàng đế và xây dựng Thành Nhà Hồ tại Thanh Hóa."
    },
    {
      year: "1804",
      event: "Nhà Nguyễn chính thức đặt tên đơn vị hành chính là trấn Thanh Hóa."
    },
    {
      year: "2011",
      event: "Thành Nhà Hồ được UNESCO công nhận là Di sản văn hóa thế giới."
    },
    {
      year: "2023",
      event: "Thanh Hóa tiếp tục nằm trong nhóm tỉnh có tốc độ phát triển kinh tế cao của khu vực Bắc Trung Bộ."
    },
    {
      year: "2025-2026",
      event: "Tỉnh đẩy mạnh phát triển du lịch biển, công nghiệp, năng lượng và hạ tầng kinh tế trọng điểm."
    }
  ],

  places: [
    {
      name: "Thành Nhà Hồ",
      description: "Di sản văn hóa thế giới nổi bật với kiến trúc thành đá độc đáo của triều Hồ.",
      image: "/banner/thanh nha ho.webp"
    },
    {
      name: "Biển Sầm Sơn",
      description: "Bãi biển nổi tiếng với bờ cát dài, là điểm du lịch hấp dẫn của miền Bắc Việt Nam.",
      image: "/banner/sam son beach.jpg"
    },
    {
      name: "Suối cá thần Cẩm Lương",
      description: "Danh thắng nổi tiếng với đàn cá tự nhiên gắn liền nhiều truyền thuyết dân gian.",
      image: "/banner/cam luong fish stream.jpg"
    }
  ],

  cuisine: [
    {
      name: "Nem chua Thanh Hóa",
      description: "Đặc sản nổi tiếng với vị chua nhẹ, cay thơm và hương vị đặc trưng khó quên.",
      image: "/banner/nem chua.jpg"
    },
    {
      name: "Chả tôm",
      description: "Món ăn đặc sản với tôm tươi bọc bánh phở nướng thơm ngon hấp dẫn.",
      image: "/banner/cha tom.jpg"
    },
    {
      name: "Bánh răng bừa",
      description: "Món bánh truyền thống dân dã với nhân thịt thơm ngon và lớp bột mềm dẻo.",
      image: "/banner/banh rang bua.jpeg"
    }
  ]
};
const NGHEAN_DATA = {
  overview: {
    description: "Nghệ An là tỉnh lớn nhất Việt Nam thuộc vùng Bắc Trung Bộ, nổi tiếng với truyền thống hiếu học, quê hương Chủ tịch Hồ Chí Minh và nhiều danh lam thắng cảnh nổi bật.",
    stats: [
      { label: "Diện tích", value: "16.490 km²" },
      { label: "Dân số", value: "Khoảng 3,5 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa" }
    ]
  },

  history: [
    {
      year: "1030",
      event: "Tên gọi Nghệ An xuất hiện dưới triều vua Lý Thái Tông, trở thành vùng đất quan trọng của Đại Việt."
    },
    {
      year: "1888",
      event: "Phong trào Cần Vương và nhiều cuộc đấu tranh yêu nước diễn ra mạnh mẽ tại Nghệ An."
    },
    {
      year: "1930",
      event: "Phong trào Xô Viết Nghệ Tĩnh bùng nổ, trở thành dấu mốc quan trọng trong lịch sử cách mạng Việt Nam."
    },
    {
      year: "1957",
      event: "Khu di tích Kim Liên - quê hương Chủ tịch Hồ Chí Minh được bảo tồn và phát triển thành điểm đến lịch sử nổi tiếng."
    },
    {
      year: "2023",
      event: "Nghệ An tiếp tục phát triển mạnh về công nghiệp, du lịch và hạ tầng giao thông khu vực Bắc Trung Bộ."
    },
    {
      year: "2025-2026",
      event: "Tỉnh đẩy mạnh phát triển kinh tế biển, năng lượng tái tạo và du lịch văn hóa - sinh thái."
    }
  ],

  places: [
    {
      name: "Làng Sen Kim Liên",
      description: "Quê hương Chủ tịch Hồ Chí Minh, di tích lịch sử nổi tiếng thu hút đông đảo du khách.",
      image: "/banner/kim lien.jpg"
    },
    {
      name: "Biển Cửa Lò",
      description: "Bãi biển nổi tiếng với bờ cát dài, nước biển trong xanh và nhiều hoạt động du lịch hấp dẫn.",
      image: "/banner/cua lo beach.webp"
    },
    {
      name: "Vườn quốc gia Pù Mát",
      description: "Khu bảo tồn thiên nhiên nổi bật với hệ sinh thái rừng nguyên sinh đa dạng.",
      image: "/banner/pu mat.jpg"
    }
  ],

  cuisine: [
    {
      name: "Cháo lươn Nghệ An",
      description: "Đặc sản nổi tiếng với thịt lươn cay thơm và nước dùng đậm đà đặc trưng.",
      image: "/banner/chao luon.jpg"
    },
    {
      name: "Bánh mướt",
      description: "Món ăn dân dã mềm mịn thường ăn kèm chả lụa hoặc nước dùng nóng.",
      image: "/banner/banh muot.webp"
    },
    {
      name: "Nhút Thanh Chương",
      description: "Đặc sản làm từ mít non muối chua mang hương vị độc đáo của người dân xứ Nghệ.",
      image: "/banner/nhut thanh chuong.webp"
    }
  ]
};
const HATINH_DATA = {
  overview: {
    description: "Hà Tĩnh là tỉnh thuộc vùng Bắc Trung Bộ Việt Nam, nổi tiếng với truyền thống hiếu học, quê hương nhiều danh nhân lịch sử và vẻ đẹp thiên nhiên đặc trưng miền Trung.",
    stats: [
      { label: "Diện tích", value: "5.994 km²" },
      { label: "Dân số", value: "Khoảng 1,4 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa" }
    ]
  },

  history: [
    {
      year: "1831",
      event: "Tỉnh Hà Tĩnh chính thức được thành lập dưới triều vua Minh Mạng nhà Nguyễn."
    },
    {
      year: "1930",
      event: "Phong trào Xô Viết Nghệ Tĩnh diễn ra mạnh mẽ tại Hà Tĩnh và Nghệ An, trở thành dấu mốc lịch sử cách mạng Việt Nam."
    },
    {
      year: "1968",
      event: "Hà Tĩnh sáp nhập với Nghệ An thành tỉnh Nghệ Tĩnh."
    },
    {
      year: "1991",
      event: "Tỉnh Hà Tĩnh được tái lập sau khi tách khỏi tỉnh Nghệ Tĩnh."
    },
    {
      year: "2015",
      event: "Khu kinh tế Vũng Áng phát triển mạnh, trở thành trung tâm công nghiệp lớn của miền Trung."
    },
    {
      year: "2025-2026",
      event: "Hà Tĩnh tiếp tục phát triển công nghiệp, năng lượng, kinh tế biển và du lịch sinh thái."
    }
  ],

  places: [
    {
      name: "Ngã ba Đồng Lộc",
      description: "Di tích lịch sử nổi tiếng gắn liền với sự hy sinh anh dũng của 10 nữ thanh niên xung phong.",
      image: "/banner/nga ba dong loc.jpg"
    },
    {
      name: "Biển Thiên Cầm",
      description: "Bãi biển nổi tiếng với làn nước trong xanh và bãi cát đẹp của Hà Tĩnh.",
      image: "/banner/thien cam beach.jpg"
    },
    {
      name: "Chùa Hương Tích",
      description: "Danh thắng tâm linh nổi tiếng nằm trên núi Hồng Lĩnh với phong cảnh hữu tình.",
      image: "/banner/huong tich pagoda.jpg"
    }
  ],

  cuisine: [
    {
      name: "Kẹo cu đơ",
      description: "Đặc sản nổi tiếng của Hà Tĩnh với vị ngọt thơm từ lạc, mật mía và bánh tráng.",
      image: "/banner/keo cu do.webp"
    },
    {
      name: "Ram bánh mướt",
      description: "Món ăn dân dã nổi tiếng với bánh mướt mềm ăn kèm ram giòn rụm.",
      image: "/banner/banh muot.jpg"
    },
    {
      name: "Gỏi cá đục",
      description: "Đặc sản biển nổi tiếng với cá tươi trộn gia vị và rau sống đặc trưng miền Trung.",
      image: "/banner/goi ca.webp"
    }
  ]
};
const QUANGTRI_DATA = {
  overview: {
    description: "Quảng Trị là tỉnh thuộc vùng Bắc Trung Bộ Việt Nam, nổi tiếng với nhiều di tích lịch sử chiến tranh, tinh thần kiên cường và những bãi biển hoang sơ đẹp của miền Trung.",
    stats: [
      { label: "Diện tích", value: "4.739 km²" },
      { label: "Dân số", value: "Khoảng 700.000 người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa" }
    ]
  },

  history: [
    {
      year: "1809",
      event: "Tên gọi Quảng Trị chính thức xuất hiện dưới triều vua Gia Long nhà Nguyễn."
    },
    {
      year: "1954",
      event: "Hiệp định Genève được ký kết, sông Bến Hải tại Quảng Trị trở thành giới tuyến quân sự tạm thời chia cắt hai miền Nam - Bắc."
    },
    {
      year: "1972",
      event: "81 ngày đêm chiến đấu bảo vệ Thành cổ Quảng Trị trở thành biểu tượng anh dũng trong kháng chiến chống Mỹ."
    },
    {
      year: "1975",
      event: "Quảng Trị được giải phóng hoàn toàn, góp phần vào thắng lợi thống nhất đất nước."
    },
    {
      year: "1989",
      event: "Tỉnh Quảng Trị được tái lập sau khi tách khỏi tỉnh Bình Trị Thiên."
    },
    {
      year: "2025-2026",
      event: "Quảng Trị tiếp tục phát triển du lịch lịch sử, năng lượng tái tạo và kinh tế biển miền Trung."
    }
  ],

  places: [
    {
      name: "Thành cổ Quảng Trị",
      description: "Di tích lịch sử quốc gia đặc biệt gắn liền với cuộc chiến 81 ngày đêm năm 1972.",
      image: "/banner/quang tri citadel.jpg"
    },
    {
      name: "Cầu Hiền Lương - Sông Bến Hải",
      description: "Biểu tượng lịch sử về sự chia cắt và thống nhất đất nước Việt Nam.",
      image: "/banner/hien luong bridge.webp"
    },
    {
      name: "Đảo Cồn Cỏ",
      description: "Hòn đảo nổi tiếng với cảnh quan thiên nhiên hoang sơ và vị trí chiến lược ngoài khơi miền Trung.",
      image: "/banner/con co island.jpg"
    }
  ],

  cuisine: [
    {
      name: "Bún hến Mai Xá",
      description: "Đặc sản nổi tiếng với vị ngọt thanh từ hến và nước dùng đậm đà.",
      image: "/banner/bun hen.jpg"
    },
    {
      name: "Cháo vạt giường",
      description: "Món ăn dân dã với sợi bột dày ăn cùng tôm, thịt và nước dùng thơm ngon.",
      image: "/banner/chaovat.jpg"
    },
    {
      name: "Bánh ép",
      description: "Món ăn vặt nổi tiếng miền Trung với lớp bánh giòn thơm ăn kèm rau sống và nước chấm.",
      image: "/banner/banh ep.webp"
    }
  ]
};
const HUE_DATA = {
  overview: {
    description: "Huế là thành phố trực thuộc trung ương của Việt Nam, nổi tiếng với quần thể di tích cố đô, văn hóa cung đình đặc sắc và vẻ đẹp thơ mộng bên dòng sông Hương.",
    stats: [
      { label: "Diện tích", value: "4.947 km²" },
      { label: "Dân số", value: "Khoảng 1,3 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa" }
    ]
  },

  history: [
    {
      year: "1802",
      event: "Vua Gia Long lên ngôi, chọn Huế làm kinh đô của triều Nguyễn - triều đại phong kiến cuối cùng của Việt Nam."
    },
    {
      year: "1805",
      event: "Kinh thành Huế bắt đầu được xây dựng với quy mô lớn theo kiến trúc Vauban kết hợp phong cách truyền thống Việt Nam."
    },
    {
      year: "1945",
      event: "Vua Bảo Đại thoái vị tại Ngọ Môn, chấm dứt chế độ phong kiến Việt Nam."
    },
    {
      year: "1993",
      event: "Quần thể di tích Cố đô Huế được UNESCO công nhận là Di sản văn hóa thế giới."
    },
    {
      year: "2003",
      event: "Nhã nhạc cung đình Huế được UNESCO công nhận là Di sản văn hóa phi vật thể của nhân loại."
    },
    {
      year: "2025-2026",
      event: "Huế tiếp tục phát triển du lịch di sản, văn hóa và trở thành trung tâm văn hóa đặc sắc của miền Trung Việt Nam."
    }
  ],

  places: [
    {
      name: "Đại Nội Huế",
      description: "Quần thể kiến trúc cung đình nổi tiếng từng là trung tâm quyền lực của triều Nguyễn.",
      image: "/banner/hue imperial city.webp"
    },
    {
      name: "Chùa Thiên Mụ",
      description: "Ngôi chùa cổ nổi tiếng nằm bên dòng sông Hương, biểu tượng tâm linh của Huế.",
      image: "/banner/thien mu pagoda.jpg"
    },
    {
      name: "Lăng Khải Định",
      description: "Lăng vua nổi bật với kiến trúc kết hợp giữa phong cách Á Đông và châu Âu độc đáo.",
      image: "/banner/khai dinh tomb.jpg"
    }
  ],

  cuisine: [
    {
      name: "Bún bò Huế",
      description: "Đặc sản nổi tiếng với nước dùng đậm đà, vị cay đặc trưng và hương sả thơm hấp dẫn.",
      image: "/banner/bun bo hue.jpg"
    },
    {
      name: "Cơm hến",
      description: "Món ăn dân dã nổi tiếng với hến xào, cơm nguội và nhiều loại rau thơm đặc trưng.",
      image: "/banner/com hen.jpg"
    },
    {
      name: "Bánh bèo Huế",
      description: "Món bánh truyền thống nhỏ xinh ăn kèm tôm cháy và nước mắm đậm vị.",
      image: "/banner/banh beo hue.jpg"
    }
  ]
};
const TPDANANG_DATA = {
  overview: {
    description: "Đà Nẵng là thành phố trực thuộc trung ương thuộc vùng duyên hải Nam Trung Bộ Việt Nam, nổi tiếng với những bãi biển đẹp, hạ tầng hiện đại và là trung tâm kinh tế - du lịch lớn của miền Trung.",
    stats: [
      { label: "Diện tích", value: "1.285 km²" },
      { label: "Dân số", value: "Khoảng 1,3 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa" }
    ]
  },

  history: [
    {
      year: "1858",
      event: "Liên quân Pháp - Tây Ban Nha nổ súng tấn công Đà Nẵng, mở đầu cuộc xâm lược Việt Nam của thực dân Pháp."
    },
    {
      year: "1888",
      event: "Đà Nẵng được thành lập thành nhượng địa Tourane dưới thời Pháp thuộc."
    },
    {
      year: "1975",
      event: "Đà Nẵng được giải phóng, mở ra thời kỳ xây dựng và phát triển mới."
    },
    {
      year: "1997",
      event: "Đà Nẵng chính thức trở thành thành phố trực thuộc trung ương sau khi tách khỏi tỉnh Quảng Nam - Đà Nẵng."
    },
    {
      year: "2018",
      event: "Cầu Vàng tại Bà Nà Hills trở thành điểm du lịch nổi tiếng thế giới và biểu tượng mới của Đà Nẵng."
    },
    {
      year: "2025-2026",
      event: "Đà Nẵng tiếp tục phát triển đô thị thông minh, du lịch quốc tế và trung tâm công nghệ cao miền Trung."
    }
  ],

  places: [
    {
      name: "Bà Nà Hills",
      description: "Khu du lịch nổi tiếng với khí hậu mát mẻ, kiến trúc châu Âu và Cầu Vàng độc đáo.",
      image: "/banner/ba na hills.jpg"
    },
    {
      name: "Biển Mỹ Khê",
      description: "Một trong những bãi biển đẹp nhất hành tinh với bờ cát trắng và nước biển trong xanh.",
      image: "/banner/my khe beach.jpg"
    },
    {
      name: "Cầu Rồng",
      description: "Cây cầu biểu tượng nổi tiếng có khả năng phun lửa và phun nước vào cuối tuần.",
      image: "/banner/dragon bridge.jpg"
    }
  ],

  cuisine: [
    {
      name: "Mì Quảng",
      description: "Đặc sản nổi tiếng miền Trung với sợi mì vàng dai, nước dùng đậm đà và nhiều loại topping.",
      image: "/banner/mi quang.jpg"
    },
    {
      name: "Bánh tráng cuốn thịt heo",
      description: "Món ăn nổi tiếng với thịt heo luộc, rau sống và nước chấm mắm nêm đặc trưng.",
      image: "/banner/banh trang cuon thit heo.jpg"
    },
    {
      name: "Bún chả cá",
      description: "Món bún đặc sản với nước dùng ngọt thanh và chả cá thơm ngon.",
      image: "/banner/bun cha ca.jpg"
    }
  ]
};
const QUANGNGAI_DATA = {
  overview: {
    description: "Quảng Ngãi là tỉnh thuộc vùng duyên hải Nam Trung Bộ Việt Nam, nổi tiếng với đảo Lý Sơn, văn hóa Sa Huỳnh và nhiều di tích lịch sử cách mạng quan trọng.",
    stats: [
      { label: "Diện tích", value: "5.155 km²" },
      { label: "Dân số", value: "Khoảng 1,3 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa ven biển" }
    ]
  },

  history: [
    {
      year: "1805",
      event: "Tên gọi Quảng Ngãi chính thức được sử dụng dưới triều Nguyễn."
    },
    {
      year: "1909",
      event: "Văn hóa Sa Huỳnh tại Quảng Ngãi được phát hiện, trở thành một trong những nền văn hóa khảo cổ nổi bật của Việt Nam."
    },
    {
      year: "1945",
      event: "Nhân dân Quảng Ngãi giành chính quyền trong Cách mạng Tháng Tám."
    },
    {
      year: "1968",
      event: "Cuộc thảm sát Sơn Mỹ xảy ra tại Quảng Ngãi, trở thành sự kiện gây chấn động thế giới trong chiến tranh Việt Nam."
    },
    {
      year: "2009",
      event: "Nhà máy lọc dầu Dung Quất chính thức vận hành thương mại, thúc đẩy phát triển kinh tế khu vực miền Trung."
    },
    {
      year: "2025-2026",
      event: "Quảng Ngãi tiếp tục phát triển công nghiệp, kinh tế biển và du lịch đảo tại khu vực miền Trung."
    }
  ],

  places: [
    {
      name: "Đảo Lý Sơn",
      description: "Hòn đảo nổi tiếng với cảnh quan núi lửa độc đáo, biển xanh trong và đặc sản tỏi Lý Sơn.",
      image: "/banner/ly son island.webp"
    },
    {
      name: "Khu chứng tích Sơn Mỹ",
      description: "Di tích lịch sử ghi lại sự kiện Sơn Mỹ năm 1968 và thông điệp về hòa bình.",
      image: "/banner/son my memorial.jpg"
    },
    {
      name: "Biển Mỹ Khê Quảng Ngãi",
      description: "Bãi biển đẹp với cát trắng mịn và không gian yên bình của miền Trung.",
      image: "/banner/my khe quang ngai.jpg"
    }
  ],

  cuisine: [
    {
      name: "Don Quảng Ngãi",
      description: "Món ăn đặc sản nổi tiếng được chế biến từ don - một loại nhuyễn thể sống ở sông.",
      image: "/banner/don quang ngai.jpg"
    },
    {
      name: "Cá bống sông Trà",
      description: "Đặc sản nổi tiếng với cá bống kho đậm vị ăn cùng cơm nóng.",
      image: "/banner/ca bong kho.webp"
    },
    {
      name: "Tỏi Lý Sơn",
      description: "Đặc sản nổi tiếng cả nước với hương vị thơm đặc trưng được trồng trên đất núi lửa.",
      image: "/banner/ly son garlic.jpg"
    }
  ]
};
const GIALAI_DATA = {
  overview: {
    description: "Gia Lai là tỉnh thuộc khu vực Tây Nguyên Việt Nam, nổi tiếng với núi rừng hùng vĩ, văn hóa cồng chiêng đặc sắc và những cao nguyên rộng lớn đầy bản sắc.",
    stats: [
      { label: "Diện tích", value: "15.510 km²" },
      { label: "Dân số", value: "Khoảng 1,7 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa cao nguyên" }
    ]
  },

  history: [
    {
      year: "1932",
      event: "Tỉnh Pleiku được thành lập dưới thời Pháp thuộc, tiền thân của tỉnh Gia Lai ngày nay."
    },
    {
      year: "1975",
      event: "Gia Lai được giải phóng sau Chiến dịch Tây Nguyên, mở đầu cho Đại thắng mùa Xuân 1975."
    },
    {
      year: "1976",
      event: "Hai tỉnh Gia Lai và Kon Tum được hợp nhất thành tỉnh Gia Lai - Kon Tum."
    },
    {
      year: "1991",
      event: "Tỉnh Gia Lai được tái lập sau khi tách khỏi tỉnh Gia Lai - Kon Tum."
    },
    {
      year: "2005",
      event: "Không gian văn hóa cồng chiêng Tây Nguyên, trong đó có Gia Lai, được UNESCO công nhận là Di sản văn hóa phi vật thể của nhân loại."
    },
    {
      year: "2025-2026",
      event: "Gia Lai tiếp tục phát triển nông nghiệp công nghệ cao, năng lượng tái tạo và du lịch sinh thái Tây Nguyên."
    }
  ],

  places: [
    {
      name: "Biển Hồ T’Nưng",
      description: "Hồ nước nổi tiếng được ví như 'đôi mắt Pleiku' với phong cảnh thơ mộng giữa núi rừng Tây Nguyên.",
      image: "/banner/bien ho pleiku.jpeg"
    },
    {
      name: "Núi lửa Chư Đăng Ya",
      description: "Ngọn núi lửa đã ngừng hoạt động nổi tiếng với cảnh quan thiên nhiên và mùa hoa dã quỳ tuyệt đẹp.",
      image: "/banner/chu dang ya.webp"
    },
    {
      name: "Quảng trường Đại Đoàn Kết",
      description: "Công trình biểu tượng của thành phố Pleiku với tượng đài Chủ tịch Hồ Chí Minh.",
      image: "/banner/quang truong dai doan ket.jpg"
    }
  ],

  cuisine: [
    {
      name: "Phở khô Gia Lai",
      description: "Đặc sản nổi tiếng còn gọi là phở hai tô với sợi phở dai và nước dùng đậm đà.",
      image: "/banner/pho kho gia lai.webp"
    },
    {
      name: "Bún cua thối",
      description: "Món ăn đặc trưng Tây Nguyên với hương vị độc đáo từ cua đồng lên men.",
      image: "/banner/bun cua.jpg"
    },
    {
      name: "Cơm lam gà nướng",
      description: "Món ăn đặc sản Tây Nguyên với cơm nướng trong ống tre ăn kèm gà nướng thơm ngon.",
      image: "/banner/com lam ga nuong.jpg"
    }
  ]
};
const DAKLAK_DATA = {
  overview: {
    description: "Đắk Lắk là tỉnh thuộc khu vực Tây Nguyên Việt Nam, nổi tiếng với văn hóa cồng chiêng, thủ phủ cà phê Buôn Ma Thuột và cảnh quan núi rừng hùng vĩ.",
    stats: [
      { label: "Diện tích", value: "13.070 km²" },
      { label: "Dân số", value: "Khoảng 2 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa cao nguyên" }
    ]
  },

  history: [
    {
      year: "1904",
      event: "Tỉnh Đắk Lắk được thành lập dưới thời Pháp thuộc với trung tâm là Buôn Ma Thuột."
    },
    {
      year: "1975",
      event: "Chiến thắng Buôn Ma Thuột mở màn Chiến dịch Tây Nguyên, góp phần quan trọng vào Đại thắng mùa Xuân 1975."
    },
    {
      year: "2004",
      event: "Tỉnh Đắk Nông được tách ra từ tỉnh Đắk Lắk, hình thành địa giới hành chính như hiện nay."
    },
    {
      year: "2005",
      event: "Không gian văn hóa cồng chiêng Tây Nguyên, trong đó có Đắk Lắk, được UNESCO công nhận là Di sản văn hóa phi vật thể của nhân loại."
    },
    {
      year: "2023",
      event: "Lễ hội Cà phê Buôn Ma Thuột tiếp tục được tổ chức quy mô lớn nhằm quảng bá thương hiệu cà phê Việt Nam."
    },
    {
      year: "2025-2026",
      event: "Đắk Lắk tiếp tục phát triển nông nghiệp công nghệ cao, du lịch sinh thái và công nghiệp chế biến cà phê."
    }
  ],

  places: [
    {
      name: "Hồ Lắk",
      description: "Hồ nước ngọt tự nhiên lớn nổi tiếng với phong cảnh thơ mộng và văn hóa dân tộc M'Nông.",
      image: "/banner/lak lake.jpg"
    },
    {
      name: "Buôn Đôn",
      description: "Điểm du lịch nổi tiếng gắn liền với nghề săn bắt và thuần dưỡng voi Tây Nguyên.",
      image: "/banner/buon don.jpg"
    },
    {
      name: "Bảo tàng Thế giới Cà phê",
      description: "Công trình kiến trúc độc đáo tại Buôn Ma Thuột, nơi trưng bày văn hóa cà phê Việt Nam và thế giới.",
      image: "/banner/world coffee museum.jpg"
    }
  ],

  cuisine: [
    {
      name: "Cà phê Buôn Ma Thuột",
      description: "Đặc sản nổi tiếng thế giới với hương vị đậm đà đặc trưng của vùng đất bazan Tây Nguyên.",
      image: "/banner/vietnamese coffee.jpg"
    },
    {
      name: "Bún đỏ",
      description: "Món ăn nổi tiếng của Buôn Ma Thuột với nước dùng đỏ đặc trưng và vị đậm đà.",
      image: "/banner/bun do.png"
    },
    {
      name: "Gà nướng cơm lam",
      description: "Đặc sản Tây Nguyên với gà nướng thơm ngon ăn kèm cơm lam nướng trong ống tre.",
      image: "/banner/com lam ga nuong.jpg"
    }
  ]
};
const KHANHHOA_DATA = {
  overview: {
    description: "Khánh Hòa là tỉnh ven biển thuộc vùng Nam Trung Bộ Việt Nam, nổi tiếng với thành phố biển Nha Trang, vịnh biển đẹp và ngành du lịch phát triển hàng đầu cả nước.",
    stats: [
      { label: "Diện tích", value: "5.138 km²" },
      { label: "Dân số", value: "Khoảng 1,4 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới xavan ven biển" }
    ]
  },

  history: [
    {
      year: "1653",
      event: "Vùng đất Khánh Hòa chính thức được sáp nhập vào lãnh thổ Đại Việt dưới thời chúa Nguyễn."
    },
    {
      year: "1832",
      event: "Tỉnh Khánh Hòa được thành lập dưới triều vua Minh Mạng nhà Nguyễn."
    },
    {
      year: "1924",
      event: "Thành phố Nha Trang được hình thành và phát triển thành trung tâm du lịch, nghỉ dưỡng nổi tiếng."
    },
    {
      year: "2003",
      event: "Vịnh Nha Trang được công nhận là thành viên Câu lạc bộ các vịnh đẹp nhất thế giới."
    },
    {
      year: "2023",
      event: "Khánh Hòa phục hồi mạnh mẽ ngành du lịch quốc tế với lượng khách tăng cao sau đại dịch."
    },
    {
      year: "2025-2026",
      event: "Tỉnh tiếp tục phát triển kinh tế biển, du lịch cao cấp và hạ tầng đô thị ven biển hiện đại."
    }
  ],

  places: [
    {
      name: "Vịnh Nha Trang",
      description: "Một trong những vịnh biển đẹp nhất thế giới với làn nước trong xanh và nhiều đảo đẹp.",
      image: "/banner/nha trang bay.webp"
    },
    {
      name: "Tháp Bà Ponagar",
      description: "Quần thể kiến trúc Chăm Pa cổ nổi tiếng mang giá trị lịch sử và văn hóa đặc sắc.",
      image: "/banner/ponagar tower.jpg"
    },
    {
      name: "Đảo Hòn Mun",
      description: "Khu bảo tồn biển nổi tiếng với hệ sinh thái san hô đa dạng và hoạt động lặn biển hấp dẫn.",
      image: "/banner/hon mun island.webp"
    }
  ],

  cuisine: [
    {
      name: "Bún sứa Nha Trang",
      description: "Đặc sản nổi tiếng với nước dùng thanh ngọt và miếng sứa giòn tươi đặc trưng.",
      image: "/banner/bun sua.jpg"
    },
    {
      name: "Nem nướng Ninh Hòa",
      description: "Món ăn nổi tiếng với nem nướng thơm ngon ăn kèm rau sống và nước chấm đặc biệt.",
      image: "/banner/nem nuong.jpg"
    },
    {
      name: "Bánh căn",
      description: "Món bánh dân dã miền Trung với lớp vỏ giòn mềm ăn kèm nước mắm và topping hải sản.",
      image: "/banner/banh can.webp"
    }
  ]
};
const LAMDONG_DATA = {
  overview: {
    description: "Lâm Đồng là tỉnh thuộc khu vực Tây Nguyên Việt Nam, nổi tiếng với thành phố Đà Lạt mộng mơ, khí hậu mát mẻ quanh năm và nền nông nghiệp công nghệ cao phát triển.",
    stats: [
      { label: "Diện tích", value: "9.781 km²" },
      { label: "Dân số", value: "Khoảng 1,4 triệu người (2026)" },
      { label: "Khí hậu", value: "Ôn đới núi cao và nhiệt đới gió mùa cao nguyên" }
    ]
  },

  history: [
    {
      year: "1893",
      event: "Bác sĩ Alexandre Yersin khám phá cao nguyên Lang Biang, đặt nền móng cho sự hình thành thành phố Đà Lạt."
    },
    {
      year: "1916",
      event: "Đà Lạt được quy hoạch trở thành đô thị nghỉ dưỡng nổi tiếng dưới thời Pháp thuộc."
    },
    {
      year: "1976",
      event: "Tỉnh Lâm Đồng được thành lập trên cơ sở sáp nhập nhiều tỉnh thuộc khu vực Nam Tây Nguyên."
    },
    {
      year: "2014",
      event: "Đà Lạt được công nhận là thành phố Festival Hoa của Việt Nam."
    },
    {
      year: "2023",
      event: "Du lịch Đà Lạt và nông nghiệp công nghệ cao tiếp tục phát triển mạnh, thu hút đông đảo du khách và nhà đầu tư."
    },
    {
      year: "2025-2026",
      event: "Lâm Đồng đẩy mạnh phát triển đô thị xanh, du lịch sinh thái và nông nghiệp công nghệ cao bền vững."
    }
  ],

  places: [
    {
      name: "Hồ Xuân Hương",
      description: "Biểu tượng nổi tiếng của Đà Lạt với khung cảnh thơ mộng giữa trung tâm thành phố.",
      image: "/banner/xuan huong lake.jpg"
    },
    {
      name: "Núi Lang Biang",
      description: "Danh thắng nổi tiếng gắn liền với truyền thuyết tình yêu và cảnh quan núi rừng hùng vĩ.",
      image: "/banner/lang biang.jpg"
    },
    {
      name: "Thác Datanla",
      description: "Điểm du lịch nổi tiếng với dòng thác đẹp và nhiều hoạt động khám phá thiên nhiên.",
      image: "/banner/datanla falls.jpg"
    }
  ],

  cuisine: [
    {
      name: "Bánh căn Đà Lạt",
      description: "Món ăn nổi tiếng với lớp bánh nóng giòn ăn kèm nước chấm đậm vị.",
      image: "/banner/banh candalat.jpg"
    },
    {
      name: "Lẩu gà lá é",
      description: "Đặc sản thơm ngon với vị chua nhẹ của lá é kết hợp thịt gà đậm đà.",
      image: "/banner/lau ga la e.jpg"
    },
    {
      name: "Dâu tây Đà Lạt",
      description: "Đặc sản nổi tiếng với vị ngọt thanh và được trồng nhiều tại vùng khí hậu mát mẻ.",
      image: "/banner/strawberries.png"
    }
  ]
};
const DONGNAI_DATA = {
  overview: {
    description: "Đồng Nai là tỉnh thuộc vùng Đông Nam Bộ Việt Nam, nổi tiếng với nền công nghiệp phát triển mạnh, hệ thống khu công nghiệp lớn và nhiều danh thắng thiên nhiên hấp dẫn.",
    stats: [
      { label: "Diện tích", value: "5.907 km²" },
      { label: "Dân số", value: "Khoảng 3,5 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa cận xích đạo" }
    ]
  },

  history: [
    {
      year: "1698",
      event: "Nguyễn Hữu Cảnh vào Nam kinh lược, đặt nền móng hành chính cho vùng đất Đồng Nai."
    },
    {
      year: "1832",
      event: "Tỉnh Biên Hòa được thành lập dưới triều vua Minh Mạng, tiền thân của tỉnh Đồng Nai ngày nay."
    },
    {
      year: "1976",
      event: "Tỉnh Đồng Nai chính thức được thành lập sau ngày đất nước thống nhất."
    },
    {
      year: "1990",
      event: "Đồng Nai trở thành một trong những địa phương đi đầu cả nước về phát triển khu công nghiệp."
    },
    {
      year: "2021",
      event: "Dự án Cảng hàng không quốc tế Long Thành được đẩy mạnh thi công, trở thành công trình trọng điểm quốc gia."
    },
    {
      year: "2025-2026",
      event: "Đồng Nai tiếp tục phát triển công nghiệp công nghệ cao, logistics và hạ tầng giao thông vùng Đông Nam Bộ."
    }
  ],

  places: [
    {
      name: "Vườn quốc gia Cát Tiên",
      description: "Khu dự trữ sinh quyển nổi tiếng với hệ động thực vật đa dạng và rừng nguyên sinh rộng lớn.",
      image: "/banner/cat tien national park.jpg"
    },
    {
      name: "Khu du lịch Bửu Long",
      description: "Danh thắng nổi tiếng được ví như 'Vịnh Hạ Long thu nhỏ' của miền Đông Nam Bộ.",
      image: "/banner/buu long.jpg"
    },
    {
      name: "Thác Giang Điền",
      description: "Điểm du lịch sinh thái nổi tiếng với phong cảnh thiên nhiên và dòng thác đẹp.",
      image: "/banner/giang dien waterfall.webp"
    }
  ],

  cuisine: [
    {
      name: "Gỏi cá Biên Hòa",
      description: "Đặc sản nổi tiếng với cá tươi ăn kèm rau sống và nước chấm đậm đà.",
      image: "/banner/goica.jpg"
    },
    {
      name: "Bưởi Tân Triều",
      description: "Đặc sản trái cây nổi tiếng với vị ngọt thanh và hương thơm đặc trưng.",
      image: "/banner/pomelo.webp"
    },
    {
      name: "Lẩu lá khổ qua rừng",
      description: "Món ăn dân dã đặc trưng miền Đông Nam Bộ với vị đắng nhẹ độc đáo.",
      image: "/banner/lau la.jpg"
    }
  ]
};
const TAYNINH_DATA = {
  overview: {
    description: "Tây Ninh là tỉnh thuộc vùng Đông Nam Bộ Việt Nam, nổi tiếng với núi Bà Đen, Tòa Thánh Cao Đài và vị trí cửa ngõ giao thương quan trọng với Campuchia.",
    stats: [
      { label: "Diện tích", value: "4.041 km²" },
      { label: "Dân số", value: "Khoảng 1,3 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa cận xích đạo" }
    ]
  },

  history: [
    {
      year: "1838",
      event: "Tỉnh Tây Ninh được thành lập dưới triều vua Minh Mạng nhà Nguyễn."
    },
    {
      year: "1926",
      event: "Đạo Cao Đài chính thức được thành lập tại Tây Ninh, trở thành trung tâm tôn giáo lớn của Việt Nam."
    },
    {
      year: "1961",
      event: "Trung ương Cục miền Nam được thành lập tại chiến khu Dương Minh Châu trong thời kỳ kháng chiến chống Mỹ."
    },
    {
      year: "1975",
      event: "Tây Ninh được giải phóng hoàn toàn, bước vào thời kỳ phát triển mới."
    },
    {
      year: "2020",
      event: "Khu du lịch quốc gia Núi Bà Đen phát triển mạnh với hệ thống cáp treo hiện đại thu hút đông đảo du khách."
    },
    {
      year: "2025-2026",
      event: "Tây Ninh tiếp tục phát triển du lịch tâm linh, kinh tế cửa khẩu và năng lượng tái tạo."
    }
  ],

  places: [
    {
      name: "Núi Bà Đen",
      description: "Ngọn núi cao nhất Nam Bộ nổi tiếng với phong cảnh hùng vĩ và khu du lịch tâm linh.",
      image: "/banner/nui ba den.jpg"
    },
    {
      name: "Tòa Thánh Tây Ninh",
      description: "Công trình kiến trúc độc đáo và là trung tâm lớn nhất của đạo Cao Đài.",
      image: "/banner/cao dai temple.jpg"
    },
    {
      name: "Hồ Dầu Tiếng",
      description: "Hồ nước nhân tạo lớn nổi tiếng với cảnh quan thiên nhiên rộng lớn và thơ mộng.",
      image: "/banner/dau tieng lake.webp"
    }
  ],

  cuisine: [
    {
      name: "Bánh tráng phơi sương",
      description: "Đặc sản nổi tiếng với lớp bánh mềm dẻo ăn kèm thịt và rau sống.",
      image: "/banner/banhtrangphoisuong.jpeg"
    },
    {
      name: "Muối tôm Tây Ninh",
      description: "Gia vị đặc sản nổi tiếng với vị cay mặn đậm đà dùng chấm trái cây và món ăn.",
      image: "/banner/muoitom.jpg"
    },
    {
      name: "Bò tơ Tây Ninh",
      description: "Món ăn đặc sản nổi tiếng với thịt bò mềm ngon được chế biến thành nhiều món hấp dẫn.",
      image: "/banner/bo to.jpg"
    }
  ]
};
const DONGTHAP_DATA = {
  overview: {
    description: "Đồng Tháp là tỉnh thuộc vùng Đồng bằng sông Cửu Long Việt Nam, nổi tiếng với những cánh đồng sen bạt ngàn, văn hóa miệt vườn và nền nông nghiệp phát triển.",
    stats: [
      { label: "Diện tích", value: "3.383 km²" },
      { label: "Dân số", value: "Khoảng 1,7 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa cận xích đạo" }
    ]
  },

  history: [
    {
      year: "1757",
      event: "Vùng đất Đồng Tháp chính thức thuộc lãnh thổ Đại Việt dưới thời chúa Nguyễn."
    },
    {
      year: "1862",
      event: "Khu vực Đồng Tháp thuộc quyền kiểm soát của thực dân Pháp sau Hòa ước Nhâm Tuất."
    },
    {
      year: "1976",
      event: "Tỉnh Đồng Tháp được thành lập trên cơ sở hợp nhất tỉnh Sa Đéc và tỉnh Kiến Phong."
    },
    {
      year: "2012",
      event: "Khu Ramsar Tràm Chim được công nhận là khu Ramsar thứ 4 của Việt Nam có tầm quan trọng quốc tế."
    },
    {
      year: "2023",
      event: "Đồng Tháp tiếp tục phát triển mạnh du lịch sinh thái, nông nghiệp công nghệ cao và kinh tế cửa khẩu."
    },
    {
      year: "2025-2026",
      event: "Tỉnh đẩy mạnh chuyển đổi số nông nghiệp, phát triển du lịch xanh và xây dựng hình ảnh 'Đất Sen Hồng'."
    }
  ],

  places: [
    {
      name: "Vườn quốc gia Tràm Chim",
      description: "Khu Ramsar quốc tế nổi tiếng với hệ sinh thái đất ngập nước và nhiều loài chim quý hiếm.",
      image: "/banner/tram chim.webp"
    },
    {
      name: "Làng hoa Sa Đéc",
      description: "Làng nghề truyền thống nổi tiếng với hàng trăm loài hoa kiểng rực rỡ quanh năm.",
      image: "/banner/sa dec flower village.jpg"
    },
    {
      name: "Khu di tích Xẻo Quýt",
      description: "Di tích lịch sử cách mạng kết hợp du lịch sinh thái đặc trưng miền Tây Nam Bộ.",
      image: "/banner/xeo quyt.jpg"
    }
  ],

  cuisine: [
    {
      name: "Hủ tiếu Sa Đéc",
      description: "Đặc sản nổi tiếng với sợi hủ tiếu dai ngon và nước dùng đậm đà.",
      image: "/banner/hu tieu.jpg"
    },
    {
      name: "Nem Lai Vung",
      description: "Món nem nổi tiếng với vị chua ngọt đặc trưng và hương thơm hấp dẫn.",
      image: "/banner/nemlaivung.jpg"
    },
    {
      name: "Chuột đồng quay lu",
      description: "Món ăn dân dã miền Tây với thịt chuột đồng thơm ngon, da giòn đặc trưng.",
      image: "/banner/chuot dong.jpg"
    }
  ]
};
const VINHLONG_DATA = {
  overview: {
    description: "Vĩnh Long là tỉnh thuộc vùng Đồng bằng sông Cửu Long Việt Nam, nổi tiếng với hệ thống sông ngòi chằng chịt, vườn trái cây trù phú và văn hóa miệt vườn đặc sắc.",
    stats: [
      { label: "Diện tích", value: "1.525 km²" },
      { label: "Dân số", value: "Khoảng 1,1 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa cận xích đạo" }
    ]
  },

  history: [
    {
      year: "1732",
      event: "Dinh Long Hồ được thành lập, đặt nền móng cho vùng đất Vĩnh Long ngày nay."
    },
    {
      year: "1832",
      event: "Tỉnh Vĩnh Long chính thức được thành lập dưới triều vua Minh Mạng nhà Nguyễn."
    },
    {
      year: "1976",
      event: "Vĩnh Long và Trà Vinh được hợp nhất thành tỉnh Cửu Long."
    },
    {
      year: "1992",
      event: "Tỉnh Vĩnh Long được tái lập sau khi tách khỏi tỉnh Cửu Long."
    },
    {
      year: "2023",
      event: "Vĩnh Long tiếp tục phát triển mạnh nông nghiệp chất lượng cao và du lịch sinh thái miệt vườn."
    },
    {
      year: "2025-2026",
      event: "Tỉnh đẩy mạnh phát triển kinh tế xanh, nông nghiệp công nghệ cao và hạ tầng giao thông vùng Đồng bằng sông Cửu Long."
    }
  ],

  places: [
    {
      name: "Chợ nổi Trà Ôn",
      description: "Khu chợ nổi đặc trưng miền Tây với hoạt động mua bán nhộn nhịp trên sông nước.",
      image: "/banner/chonoitraon.jpg"
    },
    {
      name: "Cù lao An Bình",
      description: "Điểm du lịch sinh thái nổi tiếng với vườn trái cây và không gian miệt vườn yên bình.",
      image: "/banner/an binh.webp"
    },
    {
      name: "Văn Thánh Miếu Vĩnh Long",
      description: "Công trình kiến trúc cổ mang giá trị lịch sử và văn hóa của vùng Nam Bộ.",
      image: "/banner/van thanh mieu vinh long.jpg"
    }
  ],

  cuisine: [
    {
      name: "Cá tai tượng chiên xù",
      description: "Đặc sản nổi tiếng miền Tây với lớp da cá giòn rụm ăn kèm rau sống và bánh tráng.",
      image: "/banner/cataituong.png"
    },
    {
      name: "Bánh xèo hến cù lao",
      description: "Món bánh xèo đặc trưng với nhân hến thơm ngon và rau sống miền Tây.",
      image: "/banner/banh xeo.jpg"
    },
    {
      name: "Cam xoàn Tam Bình",
      description: "Đặc sản trái cây nổi tiếng với vị ngọt thanh và hương thơm đặc trưng.",
      image: "/banner/cam xoan.jpg"
    }
  ]
};
const CANTHO_DATA = {
  overview: {
    description: "Cần Thơ là thành phố trực thuộc trung ương thuộc vùng Đồng bằng sông Cửu Long Việt Nam, nổi tiếng với chợ nổi, văn hóa sông nước và vai trò trung tâm kinh tế - giáo dục của miền Tây Nam Bộ.",
    stats: [
      { label: "Diện tích", value: "1.440 km²" },
      { label: "Dân số", value: "Khoảng 1,3 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa cận xích đạo" }
    ]
  },

  history: [
    {
      year: "1739",
      event: "Vùng đất Cần Thơ được khai phá mạnh dưới thời chúa Nguyễn, hình thành các làng ven sông Hậu."
    },
    {
      year: "1876",
      event: "Cần Thơ trở thành trung tâm hành chính quan trọng của miền Tây Nam Bộ dưới thời Pháp thuộc."
    },
    {
      year: "1976",
      event: "Tỉnh Hậu Giang được thành lập với thành phố Cần Thơ là tỉnh lỵ."
    },
    {
      year: "2004",
      event: "Cần Thơ chính thức trở thành thành phố trực thuộc trung ương của Việt Nam."
    },
    {
      year: "2022",
      event: "Hạ tầng giao thông và logistics vùng Đồng bằng sông Cửu Long tiếp tục phát triển mạnh với vai trò trung tâm của Cần Thơ."
    },
    {
      year: "2025-2026",
      event: "Cần Thơ tiếp tục phát triển thành trung tâm đô thị sinh thái, giáo dục, y tế và công nghệ của Đồng bằng sông Cửu Long."
    }
  ],

  places: [
    {
      name: "Chợ nổi Cái Răng",
      description: "Chợ nổi nổi tiếng nhất miền Tây với hoạt động mua bán nhộn nhịp trên sông nước.",
      image: "/banner/cai rang floating market.webp"
    },
    {
      name: "Bến Ninh Kiều",
      description: "Biểu tượng du lịch nổi tiếng của Cần Thơ nằm bên dòng sông Hậu thơ mộng.",
      image: "/banner/ninh kieu wharf.webp"
    },
    {
      name: "Nhà cổ Bình Thủy",
      description: "Ngôi nhà cổ nổi bật với kiến trúc Đông - Tây kết hợp độc đáo.",
      image: "/banner/binh thuy ancient house.jpg"
    }
  ],

  cuisine: [
    {
      name: "Bánh xèo Cần Thơ",
      description: "Đặc sản nổi tiếng với lớp bánh vàng giòn, nhân tôm thịt và giá đỗ hấp dẫn.",
      image: "/banner/banhxeocantho.jpg"
    },
    {
      name: "Lẩu mắm",
      description: "Món ăn đặc trưng miền Tây với hương vị đậm đà từ mắm cá và nhiều loại rau đồng.",
      image: "/banner/lau mam.jpg"
    },
    {
      name: "Nem nướng Cái Răng",
      description: "Đặc sản thơm ngon ăn kèm bánh hỏi, rau sống và nước chấm đậm vị.",
      image: "/banner/nemnuongcairang.jpg"
    }
  ]
};
const ANGIANG_DATA = {
  overview: {
    description: "An Giang là tỉnh thuộc vùng Đồng bằng sông Cửu Long Việt Nam, nổi tiếng với văn hóa đa dạng, cảnh quan núi non độc đáo và hệ thống sông ngòi đặc trưng miền Tây Nam Bộ.",
    stats: [
      { label: "Diện tích", value: "3.536 km²" },
      { label: "Dân số", value: "Khoảng 2,2 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa cận xích đạo" }
    ]
  },

  history: [
    {
      year: "1757",
      event: "Vùng đất An Giang chính thức được sáp nhập vào lãnh thổ Đại Việt dưới thời chúa Nguyễn."
    },
    {
      year: "1832",
      event: "Tỉnh An Giang được thành lập dưới triều vua Minh Mạng nhà Nguyễn."
    },
    {
      year: "1976",
      event: "An Giang được tái lập sau khi đất nước thống nhất và điều chỉnh địa giới hành chính."
    },
    {
      year: "2013",
      event: "Khu di tích Óc Eo - Ba Thê được công nhận là Di tích quốc gia đặc biệt."
    },
    {
      year: "2023",
      event: "An Giang tiếp tục phát triển mạnh du lịch tâm linh, nông nghiệp và kinh tế biên giới."
    },
    {
      year: "2025-2026",
      event: "Tỉnh đẩy mạnh phát triển du lịch sinh thái, kinh tế cửa khẩu và chuyển đổi số nông nghiệp."
    }
  ],

  places: [
    {
      name: "Núi Cấm",
      description: "Ngọn núi cao nhất miền Tây Nam Bộ nổi tiếng với cảnh quan thiên nhiên và du lịch tâm linh.",
      image: "/banner/nui cam.jpg"
    },
    {
      name: "Rừng tràm Trà Sư",
      description: "Khu du lịch sinh thái nổi tiếng với hệ sinh thái ngập nước đặc trưng miền Tây.",
      image: "/banner/tra su forest.webp"
    },
    {
      name: "Miếu Bà Chúa Xứ Núi Sam",
      description: "Điểm du lịch tâm linh nổi tiếng thu hút hàng triệu du khách mỗi năm.",
      image: "/banner/ba chua xu temple.jpg"
    }
  ],

  cuisine: [
    {
      name: "Bún cá Châu Đốc",
      description: "Đặc sản nổi tiếng với nước dùng đậm đà và cá tươi đặc trưng miền sông nước.",
      image: "/banner/buncachaudoc.jpg"
    },
    {
      name: "Tung lò mò",
      description: "Món lạp xưởng bò đặc trưng của người Chăm tại An Giang.",
      image: "/banner/tung lo mo.jpg"
    },
    {
      name: "Đường thốt nốt",
      description: "Đặc sản nổi tiếng được chế biến từ cây thốt nốt đặc trưng vùng Bảy Núi.",
      image: "/banner/palm sugar.jpg"
    }
  ]
};
const CAMAU_DATA = {
  overview: {
    description: "Cà Mau là tỉnh cực Nam của Việt Nam thuộc vùng Đồng bằng sông Cửu Long, nổi tiếng với hệ sinh thái rừng ngập mặn, đất mũi thiêng liêng và văn hóa sông nước đặc trưng.",
    stats: [
      { label: "Diện tích", value: "5.294 km²" },
      { label: "Dân số", value: "Khoảng 1,2 triệu người (2026)" },
      { label: "Khí hậu", value: "Nhiệt đới gió mùa cận xích đạo" }
    ]
  },

  history: [
    {
      year: "1832",
      event: "Vùng đất Cà Mau thuộc tỉnh Hà Tiên dưới triều vua Minh Mạng nhà Nguyễn."
    },
    {
      year: "1956",
      event: "Tỉnh Cà Mau được thành lập dưới chính quyền Việt Nam Cộng hòa."
    },
    {
      year: "1976",
      event: "Cà Mau và Bạc Liêu được hợp nhất thành tỉnh Minh Hải."
    },
    {
      year: "1997",
      event: "Tỉnh Cà Mau được tái lập sau khi tách khỏi tỉnh Minh Hải."
    },
    {
      year: "2009",
      event: "Mũi Cà Mau được UNESCO công nhận là Khu dự trữ sinh quyển thế giới."
    },
    {
      year: "2025-2026",
      event: "Cà Mau tiếp tục phát triển kinh tế biển, năng lượng tái tạo và du lịch sinh thái vùng đất cực Nam Tổ quốc."
    }
  ],

  places: [
    {
      name: "Mũi Cà Mau",
      description: "Điểm cực Nam thiêng liêng của Tổ quốc với biểu tượng cột mốc tọa độ quốc gia nổi tiếng.",
      image: "/banner/ca mau cape.jpg"
    },
    {
      name: "Rừng U Minh Hạ",
      description: "Khu rừng ngập nước nổi tiếng với hệ sinh thái đa dạng và nét đặc trưng miền Tây Nam Bộ.",
      image: "/banner/u minh ha.jpg"
    },
    {
      name: "Hòn Đá Bạc",
      description: "Danh thắng nổi tiếng với quần thể đảo đá đẹp và giá trị lịch sử đặc biệt.",
      image: "/banner/hon da bac.jpg"
    }
  ],

  cuisine: [
    {
      name: "Cua Cà Mau",
      description: "Đặc sản nổi tiếng cả nước với thịt chắc, ngọt và hương vị đặc trưng vùng biển cực Nam.",
      image: "/banner/ca mau crab.jpg"
    },
    {
      name: "Ba khía muối",
      description: "Món ăn dân dã đặc trưng miền Tây được chế biến từ ba khía vùng rừng ngập mặn.",
      image: "/banner/ba khia.jpeg"
    },
    {
      name: "Lẩu mắm U Minh",
      description: "Món lẩu đậm chất miền Tây với hương vị mắm đặc trưng và nhiều loại hải sản, rau đồng.",
      image: "/banner/laumamuminh.jpeg"
    }
  ]
};
const QUANDAOTRUONGSA_DATA = {
  overview: {
    description: "Quần đảo Trường Sa là quần đảo thuộc chủ quyền Việt Nam nằm trên Biển Đông, có vị trí chiến lược đặc biệt quan trọng về quốc phòng, kinh tế biển và chủ quyền lãnh thổ quốc gia.",
    stats: [
      { label: "Diện tích", value: "Gồm hàng trăm đảo, đá, bãi cạn" },
      { label: "Vị trí", value: "Biển Đông, phía Đông Nam Việt Nam" },
      { label: "Khí hậu", value: "Nhiệt đới hải dương" }
    ]
  },

  history: [
    {
      year: "Thế kỷ XVII",
      event: "Các chúa Nguyễn đã tổ chức đội Hoàng Sa - Bắc Hải khai thác, quản lý và thực thi chủ quyền tại quần đảo Trường Sa."
    },
    {
      year: "1933",
      event: "Chính quyền Đông Dương thuộc Pháp tuyên bố sáp nhập quần đảo Trường Sa vào lãnh thổ Việt Nam."
    },
    {
      year: "1975",
      event: "Hải quân Việt Nam tiếp quản và bảo vệ nhiều đảo thuộc quần đảo Trường Sa sau ngày đất nước thống nhất."
    },
    {
      year: "1988",
      event: "Sự kiện Gạc Ma diễn ra khi các chiến sĩ hải quân Việt Nam anh dũng bảo vệ chủ quyền biển đảo."
    },
    {
      year: "2007",
      event: "Huyện đảo Trường Sa thuộc tỉnh Khánh Hòa tiếp tục được đầu tư phát triển về hạ tầng và dân sinh."
    },
    {
      year: "2025-2026",
      event: "Việt Nam tiếp tục tăng cường phát triển kinh tế biển, bảo vệ chủ quyền và nâng cao đời sống quân dân tại quần đảo Trường Sa."
    }
  ],

  places: [
    {
      name: "Đảo Trường Sa Lớn",
      description: "Trung tâm hành chính quan trọng của huyện đảo Trường Sa với nhiều công trình dân sinh và quốc phòng.",
      image: "/banner/truong sa island.webp"
    },
    {
      name: "Đảo Sinh Tồn",
      description: "Một trong những đảo nổi quan trọng của quần đảo Trường Sa với cộng đồng dân cư sinh sống.",
      image: "/banner/sinh ton island.jpg"
    },
    {
      name: "Đá Tây",
      description: "Cụm đảo nổi tiếng tại Trường Sa với hệ sinh thái biển và vị trí chiến lược quan trọng.",
      image: "/banner/da tay.jpg"
    }
  ],

  cuisine: [
    {
      name: "Hải sản Trường Sa",
      description: "Nguồn hải sản phong phú với nhiều loại cá, mực và tôm biển đặc trưng vùng Biển Đông.",
      image: "/banner/seafood.jpg"
    },
    {
      name: "Cá ngừ đại dương",
      description: "Đặc sản biển nổi tiếng được khai thác tại vùng biển Trường Sa với thịt chắc và giàu dinh dưỡng.",
      image: "/banner/tuna fish.jpg"
    },
    {
      name: "Mực một nắng",
      description: "Món hải sản nổi tiếng được chế biến từ mực tươi phơi nắng đặc trưng vùng biển đảo.",
      image: "/banner/dried squid.jpg"
    }
  ]
};
const HOANGSA_DATA = {
  overview: {
    description: "Quần đảo Hoàng Sa là quần đảo thuộc Biển Đông, có vị trí chiến lược quan trọng về quốc phòng, hàng hải và kinh tế biển.",
    stats: [
      { label: "Diện tích", value: "Khoảng 30.000 km² vùng biển" },
      { label: "Cấu trúc", value: "Gồm nhiều đảo, đá, bãi cạn và bãi ngầm" },
      { label: "Vị trí", value: "Phía Đông biển Việt Nam" }
    ]
  },

  history: [
    {
      year: "Thế kỷ XVII",
      event: "Các đội Hoàng Sa - Bắc Hải được tổ chức dưới thời chúa Nguyễn để khai thác và quản lý vùng biển đảo."
    },
    {
      year: "1816",
      event: "Nhà Nguyễn thực thi hoạt động quản lý và xác lập chủ quyền trên quần đảo Hoàng Sa."
    },
    {
      year: "1932",
      event: "Chính quyền Pháp ở Đông Dương tuyên bố hành chính quản lý quần đảo Hoàng Sa."
    },
    {
      year: "1974",
      event: "Xảy ra trận hải chiến Hoàng Sa, dẫn đến thay đổi kiểm soát thực tế một số khu vực."
    },
    {
      year: "1982",
      event: "Việt Nam thành lập huyện Hoàng Sa thuộc thành phố Đà Nẵng để quản lý hành chính."
    },
    {
      year: "2025-2026",
      event: "Tiếp tục khẳng định chủ quyền, nghiên cứu biển và bảo vệ môi trường biển tại khu vực Hoàng Sa."
    }
  ],

  places: [
    {
      name: "Đảo Phú Lâm",
      description: "Đảo lớn nhất của quần đảo Hoàng Sa, có vị trí quan trọng về địa lý và hàng hải.",
      image: "/banner/phu lam island.jpg"
    },
    {
      name: "Đảo Hoàng Sa",
      description: "Một trong các đảo thuộc nhóm Lưỡi Liềm của quần đảo Hoàng Sa.",
      image: "/banner/hoang sa island.jpg"
    },
    {
      name: "Đá Bắc",
      description: "Khu vực san hô thuộc quần đảo Hoàng Sa với hệ sinh thái biển phong phú.",
      image: "/banner/coral reef.webp"
    }
  ],

  cuisine: [
    {
      name: "Hải sản biển Hoàng Sa",
      description: "Nguồn hải sản phong phú từ vùng biển nhiệt đới, gồm cá, mực và tôm biển.",
      image: "/banner/seafood.jpg"
    },
    {
      name: "Cá biển nướng",
      description: "Món ăn phổ biến từ hải sản tươi được chế biến đơn giản giữ nguyên vị ngọt tự nhiên.",
      image: "/banner/grilled fish.jpg"
    },
    {
      name: "Mực khô",
      description: "Hải sản được phơi khô tự nhiên từ mực tươi đánh bắt ngoài biển.",
      image: "/banner/muckho.jpg"
    }
  ]
};
export function ProvinceDetails({ province }: { province: string }) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const isHanoi = province === 'Ha Noi';
  const isHCM = province === 'Ho Chi Minh';
  const isDaNang = province === 'Da Nang';
  const isDienBien = province === 'Dien Bien';
  const isLaiChau = province === 'Lai Chau';
  const isSonLa = province === 'Son La';
  const isLaoCai = province === 'Lao Cai';
  const isTUYENQUANG = province === 'Tuyen Quang';
  const isCaoBang = province === 'Cao Bang';
  const isThaiNguyen = province === 'Thai Nguyen';
  const isLangSon = province === 'Lang Son';
  const isPhuTho = province === 'Phu Tho';
  const isBacNinh = province === 'Bac Ninh';
  const isQuangNinh = province === 'Quang Ninh';
  const isHaiPhong = province === 'Hai Phong';
  const isHungYen = province === 'Hung Yen';
  const isNinhBinh = province === 'Ninh Binh';
  const isThanhHoa = province === 'Thanh Hoa';
  const isNgheAn = province === 'Nghe An';
  const isHatinh = province === 'Ha Tinh';
  const isQuangTri = province === 'Quang Tri';
  const isHue = province === 'Hue';
  const isTPDANANG = province === 'Da Nang';
  const isQuangNgai = province === 'Quang Ngai';
  const isGiaLai = province === 'Gia Lai';
  const isDakLak = province === 'Dak Lak';
  const isKhanhHoa = province === 'Khanh Hoa';
  const isLamDong = province === 'Lam Dong';
  const isDongNai = province === 'Dong Nai';
  const isTayNinh = province === 'Tay Ninh';
  const isDongThap = province === 'Dong Thap';
  const isVinhLong = province === 'Vinh Long';
  const isCanTho = province === 'Can Tho';
  const isAnGiang = province === 'An Giang';
  const isCaMau = province === 'Ca Mau';
  const isTruongSa = province === 'Truong Sa';
  const isHoangSa = province === 'Hoang Sa';

  const displayTitle =
  isHanoi ? 'Hà Nội'
  : isHCM ? 'TP. Hồ Chí Minh'
  : isDaNang ? 'TP. Đà Nẵng'
  : isDienBien ? 'Tỉnh Điện Biên'
  : isLaiChau ? 'Tỉnh Lai Châu'
  : isSonLa ? 'Tỉnh Sơn La'
  : isLaoCai ? 'Tỉnh Lào Cai'
  : isTUYENQUANG ? 'Tỉnh Tuyên Quang'
  : isCaoBang ? 'Tỉnh Cao Bằng'
  : isThaiNguyen ? 'Tỉnh Thái Nguyên'
  : isLangSon ? 'Tỉnh Lạng Sơn'
  : isPhuTho ? 'Tỉnh Phú Thọ'
  : isBacNinh ? 'Tỉnh Bắc Ninh'
  : isQuangNinh ? 'Tỉnh Quảng Ninh'
  : isHaiPhong ? 'TP. Hải Phòng'
  : isHungYen ? 'Tỉnh Hưng Yên'
  : isNinhBinh ? 'Tỉnh Ninh Bình'
  : isThanhHoa ? 'Tỉnh Thanh Hóa'
  : isNgheAn ? 'Tỉnh Nghệ An'
  : isHatinh ? 'Tỉnh Hà Tĩnh'
  : isQuangTri ? 'Tỉnh Quảng Trị'
  : isHue ? 'TP. Huế'
  : isTPDANANG ? 'TP. Đà Nẵng'
  : isQuangNgai ? 'Tỉnh Quảng Ngãi'
  : isGiaLai ? 'Tỉnh Gia Lai'
  : isDakLak ? 'Tỉnh Đắk Lắk'
  : isKhanhHoa ? 'Tỉnh Khánh Hòa'
  : isLamDong ? 'Tỉnh Lâm Đồng'
  : isDongNai ? 'Tỉnh Đồng Nai'
  : isTayNinh ? 'Tỉnh Tây Ninh'
  : isDongThap ? 'Tỉnh Đồng Tháp'
  : isVinhLong ? 'Tỉnh Vĩnh Long'
  : isCanTho ? 'TP. Cần Thơ'
  : isAnGiang ? 'Tỉnh An Giang'
  : isCaMau ? 'Tỉnh Cà Mau'
  : isTruongSa ? 'Quần đảo Trường Sa'
  : isHoangSa ? 'Quần đảo Hoàng Sa'
  : province;
  const bannerImg = isHanoi
  ? "/banner/hanoi.jpg"
  : isHCM
  ? "/banner/hcm.jpg"
  : isDaNang
  ? "/banner/danang.jpg"
  : isDienBien
? "/banner/dienbien.jpg"
  : isLaiChau
  ? "/banner/laichau.jpg"
  : isSonLa
  ? "/banner/sonla.jpg"
  : isLaoCai
  ? "/banner/laocai.jpg"
  : isTUYENQUANG
  ? "/banner/tuyenquang.jpg"
  : isCaoBang
  ? "/banner/caobang.jpg"
  : isThaiNguyen
  ? "/banner/thainguyen.jpg"
  : isLangSon
  ? "/banner/langson.jpg"
  : isPhuTho
  ? "/banner/phutho.jpg"
  : isBacNinh
  ? "/banner/bacninh.jpg"
  : isQuangNinh
  ? "/banner/quangninh.jpg"
  : isHungYen
  ? "/banner/hungyen.jpg"
  : isNinhBinh
  ? "/banner/ninhbinh.jpg"
  : isThanhHoa
  ? "/banner/thanhhoa.jpg"
  : isNgheAn
  ? "/banner/nghean.jpg"
  : isHatinh
  ? "/banner/hatinh.jpg"
  : isQuangTri
  ? "/banner/quangtri.jpg"
  : isHue
  ? "/banner/hue.jpg"
  : isTPDANANG
  ? "/banner/danang.jpg"
  : isQuangNgai
  ? "/banner/quangngai.jpg"
  : isGiaLai
  ? "/banner/gialai.jpg"
  : isDakLak
  ? "/banner/daklak.jpg"
  : isKhanhHoa
  ? "/banner/khanhhoa.jpg"
  : isLamDong
  ? "/banner/lamdong.jpg"
  : isDongNai
  ? "/banner/dongnai.jpg"
  : isTayNinh
  ? "/banner/tayninh.jpg"
  : isDongThap
  ? "/banner/dongthap.jpg"
  : isVinhLong
  ? "/banner/vinhtlong.jpg"
  : isCanTho
  ? "/banner/cantho.jpg"
  : isAnGiang
  ? "/banner/angiang.jpg"
  : isCaMau
  ? "/banner/camau.jpg"
  : isTruongSa
  ? "/banner/truongsa.jpg"
  : isHoangSa
  ? "/banner/hoangsa.jpg"
  : "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1080&auto=format&fit=crop";
     const currentData = isHanoi
     ? HANOI_DATA
     : isHCM
     ? HCM_DATA
     : isDaNang
     ? DANANG_DATA
     : isDienBien
     ? DIENBIEN_DATA
     : isLaiChau
     ? LAICHAU_DATA
     : isSonLa
     ? SONLA_DATA
      : isLaoCai
      ? LAOCAI_DATA
     : isTUYENQUANG
     ? TUYENQUANG_DATA
     : isCaoBang
     ? CAOBANG_DATA
     : isThaiNguyen
     ? THAINGUYEN_DATA
     : isLangSon
     ? LANGSON_DATA
     : isPhuTho
     ? PHUTHO_DATA
     : isBacNinh
     ? BACNINH_DATA
     : isQuangNinh
     ? QUANGNINH_DATA
     : isHaiPhong
     ? HAIPHONG_DATA
     : isHungYen
     ? HUNGYEN_DATA
     : isNinhBinh
     ? NINHBINH_DATA
     : isThanhHoa
     ? THANHHOA_DATA
     : isNgheAn
     ? NGHEAN_DATA
     : isHatinh
     ? HATINH_DATA
     : isQuangTri
     ? QUANGTRI_DATA
     : isHue
     ? HUE_DATA
     : isTPDANANG
     ? TPDANANG_DATA
     : isQuangNgai
     ? QUANGNGAI_DATA
     : isGiaLai
     ? GIALAI_DATA
     : isDakLak
     ? DAKLAK_DATA
     : isKhanhHoa
     ? KHANHHOA_DATA
     : isLamDong
     ? LAMDONG_DATA
     : isDongNai
     ? DONGNAI_DATA
     : isTayNinh
     ? TAYNINH_DATA
     : isDongThap
     ? DONGTHAP_DATA
     : isVinhLong
     ? VINHLONG_DATA
     : isCanTho
     ? CANTHO_DATA
     : isAnGiang
     ? ANGIANG_DATA
     : isCaMau
     ? CAMAU_DATA
     : isTruongSa
     ? QUANDAOTRUONGSA_DATA
     : isHoangSa
     ? HOANGSA_DATA
     : null;
  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Banner */}
      <div className="relative w-full h-[240px] shrink-0">
        <ImageWithFallback 
          src={bannerImg} 
          alt={displayTitle}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{displayTitle}</h1>
            <div className="flex items-center text-white/90 text-sm font-medium">
              <MapPin className="w-4 h-4 mr-1" />
              <span>Việt Nam</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-6 pt-4 border-b border-gray-100 overflow-x-auto hide-scrollbar shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-3 flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF385C]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${province}-${activeTab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {!currentData ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <MapPin className="w-8 h-8 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Đang cập nhật</h3>
                <p className="text-sm text-gray-500">Thông tin chi tiết về {displayTitle} sẽ sớm được bổ sung.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <p className="text-gray-600 leading-relaxed">
                      {currentData.overview.description}
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      {currentData.overview.stats.map((stat, i) => (
                        <div key={i} className="bg-gray-50 p-4 rounded-2xl">
                          <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                          <p className="font-semibold text-gray-900">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="relative border-l border-gray-200 ml-3 space-y-8 pb-4">
                    {currentData.history.map((item, i) => (
                      <div key={i} className="relative pl-6">
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#FF385C] ring-4 ring-white" />
                        <span className="inline-block px-2 py-1 bg-red-50 text-[#FF385C] text-xs font-bold rounded mb-2">
                          Năm {item.year}
                        </span>
                        <p className="text-gray-700 text-sm leading-relaxed">{item.event}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'places' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentData.places.map((place, i) => (
                      <div key={i} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-40 overflow-hidden">
                          <ImageWithFallback 
                            src={place.image} 
                            alt={place.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">{place.name}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2">{place.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'cuisine' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentData.cuisine.map((food, i) => (
                      <div key={i} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                        <ImageWithFallback 
                          src={food.image} 
                          alt={food.name}
                          className="w-20 h-20 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex flex-col justify-center">
                          <h3 className="font-semibold text-gray-900 mb-1">{food.name}</h3>
                          <p className="text-xs text-gray-500 line-clamp-2">{food.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}