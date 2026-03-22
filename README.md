# MD 최저가 체커 🏷️

네이버 쇼핑 API를 활용한 최저가 비교 웹사이트입니다.

## 🚀 배포 방법

### 1단계: GitHub 저장소 생성
1. GitHub에서 새 저장소 생성
2. 이 폴더의 모든 파일을 저장소에 업로드

### 2단계: Vercel 연결
1. [vercel.com](https://vercel.com) 접속 → GitHub 로그인
2. "Add New Project" 클릭
3. 방금 만든 GitHub 저장소 선택
4. **Environment Variables** 설정 (중요!):
   - `NAVER_CLIENT_ID`: 네이버 API Client ID
   - `NAVER_CLIENT_SECRET`: 네이버 API Client Secret
5. "Deploy" 클릭

### 3단계: 네이버 API 설정
1. [네이버 개발자센터](https://developers.naver.com) 접속
2. 애플리케이션 설정 → 웹 서비스 URL에 Vercel 도메인 추가
   - 예: `https://your-project.vercel.app`

## 📁 폴더 구조

```
md-price-checker/
├── api/
│   └── search.js      # 네이버 API 프록시 (서버리스 함수)
├── public/
│   └── index.html     # 프론트엔드
├── package.json
├── vercel.json        # Vercel 설정
└── README.md
```

## 🔧 환경변수

| 변수명 | 설명 |
|--------|------|
| `NAVER_CLIENT_ID` | 네이버 개발자센터에서 발급받은 Client ID |
| `NAVER_CLIENT_SECRET` | 네이버 개발자센터에서 발급받은 Client Secret |

## ✨ 기능

- 🔍 상품명 검색
- 📊 최저가 TOP 20 정렬
- 💰 최저가/평균가 통계
- 🏪 판매처(플랫폼) 표시
- 📱 모바일 반응형 지원
