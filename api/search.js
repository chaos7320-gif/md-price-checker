export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: '검색어를 입력해주세요.' });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });
  }

  // 패션 브랜드 리스트
  const fashionBrands = [
    // 스포츠/스니커즈
    '나이키', 'nike', '아디다스', 'adidas', '퓨마', 'puma', '뉴발란스', 'new balance', 
    '리복', 'reebok', '컨버스', 'converse', '반스', 'vans', '아식스', 'asics',
    '휠라', 'fila', '언더아머', 'under armour', '조던', 'jordan', '미즈노', 'mizuno',
    '살로몬', 'salomon', '호카', 'hoka', '온러닝', 'on running', '사카이', 'sacai',
    
    // 클래식/캐주얼 슈즈
    '하루타', 'haruta', '예루살렘샌들', 'jerusalem sandals', '트레통', 'tretorn',
    '빅토리아슈즈', 'victoria shoes', '빅토리아', 'victoria', '스페리', 'sperry',
    '클락스', 'clarks', '캠퍼', 'camper', '버켄스탁', 'birkenstock', '닥터마틴', 'dr. martens',
    '팀버랜드', 'timberland', '레드윙', 'red wing', '트리커스', 'trickers', '파라부트', 'paraboot',
    '크록스', 'crocs', '테바', 'teva', '챠코', 'chaco', '키인', 'keen',
    
    // 럭셔리/디자이너
    '구찌', 'gucci', '프라다', 'prada', '루이비통', 'louis vuitton', '샤넬', 'chanel',
    '발렌시아가', 'balenciaga', '보테가베네타', 'bottega veneta', '셀린느', 'celine',
    '디올', 'dior', '생로랑', 'saint laurent', '지방시', 'givenchy', '버버리', 'burberry',
    '펜디', 'fendi', '로에베', 'loewe', '발렌티노', 'valentino', '알렉산더맥퀸', 'alexander mcqueen',
    '톰브라운', 'thom browne', '메종마르지엘라', 'maison margiela', '마르니', 'marni',
    '아크네스튜디오', 'acne studios', '이자벨마랑', 'isabel marant', '막스마라', 'max mara',
    '몽클레어', 'moncler', '스톤아일랜드', 'stone island', '아미', 'ami', 
    
    // 컨템포러리/스트릿
    '스투시', 'stussy', '슈프림', 'supreme', '오프화이트', 'off-white', '팔라스', 'palace',
    '꼼데가르송', 'comme des garcons', '휴먼메이드', 'human made', '베이프', 'bape',
    '노스페이스', 'the north face', '파타고니아', 'patagonia', '아크테릭스', "arc'teryx",
    '캐나다구스', 'canada goose', '무스너클', 'moose knuckles', '칼하트', 'carhartt',
    '디키즈', 'dickies', '챔피온', 'champion', '캉골', 'kangol',
    
    // SPA/캐주얼
    '자라', 'zara', '유니클로', 'uniqlo', 'h&m', '코스', 'cos', '무지', 'muji',
    '갭', 'gap', '망고', 'mango', '마시모두띠', 'massimo dutti', '폴로', 'polo',
    '타미힐피거', 'tommy hilfiger', '캘빈클라인', 'calvin klein', '라코스테', 'lacoste',
    '폴스미스', 'paul smith', '랄프로렌', 'ralph lauren', '브룩스브라더스', 'brooks brothers',
    
    // 국내 브랜드
    '커버낫', 'covernat', '디스이즈네버댓', 'thisisneverthat', '엘무드', 'lmood',
    '마리떼프랑소와저버', 'marithe', '널디', 'nerdy', '이미스', 'emis',
    '아더에러', 'ader error', '앤더슨벨', 'andersson bell', '우알롱', 'wooalong',
    '인사일런스', 'insilence', '노이어', 'noir', '레이지오', 'razio',
    '무신사스탠다드', 'musinsa standard', '스파오', 'spao', '탑텐', 'topten',
    '지오다노', 'giordano', '폴햄', 'polham', '마인드브릿지', 'mind bridge',
    
    // 아웃도어/스포츠웨어
    '데상트', 'descente', '르꼬끄', 'le coq sportif', '엄브로', 'umbro',
    'k2', '블랙야크', 'blackyak', '네파', 'nepa', '아이더', 'eider',
    '밀레', 'millet', '마무트', 'mammut', '그레고리', 'gregory',
    
    // 가방/액세서리 브랜드
    '코치', 'coach', '마이클코어스', 'michael kors', '케이트스페이드', 'kate spade',
    '토리버치', 'tory burch', '마크제이콥스', 'marc jacobs', '롱샴', 'longchamp',
    '만다리나덕', 'mandarina duck', '쌤소나이트', 'samsonite', '투미', 'tumi',
    '프라이탁', 'freitag', '브리프팅', 'briefing', '포터', 'porter',
    
    // 시계/주얼리
    '롤렉스', 'rolex', '오메가', 'omega', '태그호이어', 'tag heuer',
    '까르띠에', 'cartier', '티파니', 'tiffany', '판도라', 'pandora',
    '다니엘웰링턴', 'daniel wellington', '카시오', 'casio', 'g-shock',
    
    // 아이웨어
    '레이밴', 'ray-ban', '오클리', 'oakley', '젠틀몬스터', 'gentle monster',
    '올리버피플스', 'oliver peoples', '톰포드', 'tom ford', '페르솔', 'persol'
  ];

  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query)}&display=100&sort=asc`,
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`네이버 API 오류: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.items) {
      // 브랜드 상품만 필터링
      data.items = data.items.filter(item => {
        const searchText = [
          item.title, 
          item.brand, 
          item.maker, 
          item.mallName,
          item.category1,
          item.category2,
          item.category3
        ].join(' ').toLowerCase();
        
        return fashionBrands.some(brand => searchText.includes(brand.toLowerCase()));
      });

      // 할인율 계산 추가
      data.items = data.items.map(item => {
        const salePrice = parseInt(item.lprice);
        const originalPrice = parseInt(item.hprice) || salePrice;
        const discountRate = originalPrice > salePrice 
          ? Math.round((1 - salePrice / originalPrice) * 100) 
          : 0;
        
        return {
          ...item,
          originalPrice: originalPrice,
          salePrice: salePrice,
          discountRate: discountRate
        };
      });

      // 판매가 기준 정렬
      data.items.sort((a, b) => a.salePrice - b.salePrice);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
