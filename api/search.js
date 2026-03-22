export default async function handler(req, res) {
  // CORS 헤더 설정
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

  try {
    // 패션의류 카테고리로 검색 (50000 = 패션/의류)
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
    
    // 패션 관련 카테고리만 필터링
    const fashionCategories = [
      '패션의류', '패션잡화', '화장품/미용', '의류', '잡화', '신발', '가방', 
      '지갑', '벨트', '모자', '스카프', '장갑', '양말', '속옷', '수영복',
      '남성패션', '여성패션', '아동패션', '스포츠웨어', '언더웨어',
      '주얼리', '시계', '액세서리', '선글라스', '안경'
    ];

    if (data.items) {
      // 패션 카테고리 필터링
      data.items = data.items.filter(item => {
        const categories = [item.category1, item.category2, item.category3, item.category4].join(' ').toLowerCase();
        return fashionCategories.some(fc => categories.includes(fc.toLowerCase()));
      });

      // 최저가순 정렬 (배송비 포함)
      data.items.sort((a, b) => {
        const totalA = parseInt(a.lprice) + parseInt(a.delivery || 0);
        const totalB = parseInt(b.lprice) + parseInt(b.delivery || 0);
        return totalA - totalB;
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
