# 🐾 PetSOS - 반려동물 응급 이송 서비스

> 반려동물의 응급 상황에서 빠르고 안전한 병원 이송을 도와주는 모바일 애플리케이션

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)

## 📱 프로젝트 소개

PetSOS는 반려동물의 응급 상황 발생 시 신속하고 안전한 병원 이송을 지원하는 모바일 플랫폼입니다. 보호자는 간편하게 이송을 요청하고, 전문 라이더가 반려동물을 안전하게 병원까지 이송합니다.

### ✨ 주요 기능

#### 👨‍👩‍👧‍👦 보호자 기능
- 🚨 **긴급 호출**: 간편한 응급 이송 요청
- 🏥 **병원 검색**: 주변 동물병원 정보 및 위치 확인
- 📍 **실시간 추적**: 라이더의 실시간 위치 및 이송 현황 확인
- 🐕 **반려동물 관리**: 반려동물 정보 등록 및 관리
- 📞 **병원 연락**: 원터치 전화 연결 및 길찾기

#### 🚗 라이더 기능
- 📲 **요청 알림**: 실시간 이송 요청 수신
- 🗺️ **경로 안내**: 픽업 위치와 병원까지의 경로 제공
- 📊 **상태 관리**: 이송 단계별 상태 업데이트
- 👤 **프로필 관리**: 라이더 활성화 상태 제어

## 🎨 스크린샷

### 보호자 화면
- 로그인 화면: 직관적인 사용자 유형 선택
- 홈 화면: 등록된 반려동물 및 진행 중인 요청 확인
- 긴급 호출: 반려동물 선택 및 증상 입력
- 실시간 추적: 지도에서 라이더 위치 확인

### 라이더 화면
- 활성화 토글: 요청 수신 상태 제어
- 요청 목록: 수락 가능한 요청 확인
- 이송 추적: 픽업지와 병원 위치 확인

## 🛠️ 기술 스택

### Frontend
- **React Native**: 크로스 플랫폼 모바일 앱 개발
- **TypeScript**: 타입 안정성 및 개발 생산성
- **Expo**: 빠른 개발 및 테스트 환경
- **React Navigation**: 화면 네비게이션 관리
- **React Native Maps**: 지도 및 위치 기능

### Design System
- **Custom Theme**: 일관된 디자인 시스템
- **Color Palette**:
  - Primary: `#5B8CFF` (신뢰감 있는 파란색)
  - Secondary: `#6BCFB8` (의료적인 민트색)
  - Accent: `#FFB84D` (따뜻한 오렌지색)
- **Typography**: 가독성 높은 폰트 시스템
- **Shadows & Spacing**: 일관된 여백 및 그림자 효과

## 📦 설치 및 실행

### 사전 요구사항
```bash
Node.js >= 16.0.0
npm >= 8.0.0
Expo CLI
```

### 설치
```bash
# 저장소 클론
git clone https://github.com/SeungMin2001/Pet-SOS.git
cd Pet-SOS/petsos-app

# 의존성 설치
npm install

# Expo 앱 설치 (모바일 기기)
# iOS: App Store에서 "Expo Go" 검색
# Android: Play Store에서 "Expo Go" 검색
```

### 실행
```bash
# 개발 서버 시작
npm start

# iOS 시뮬레이터에서 실행
npm run ios

# Android 에뮬레이터에서 실행
npm run android

# 웹 브라우저에서 실행
npm run web
```

### 데모 계정
프로젝트는 데모 모드로 실행되며, 별도의 회원가입 없이 테스트할 수 있습니다:
- **보호자 계정**: 로그인 화면에서 "보호자" 선택
- **라이더 계정**: 로그인 화면에서 "라이더" 선택

## 📂 프로젝트 구조

```
petsos-app/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   ├── screens/            # 화면 컴포넌트
│   │   ├── auth/          # 인증 관련 화면
│   │   ├── guardian/      # 보호자 화면
│   │   └── rider/         # 라이더 화면
│   ├── navigation/         # 네비게이션 설정
│   ├── context/           # Context API
│   ├── services/          # API 서비스
│   ├── types/             # TypeScript 타입 정의
│   ├── utils/             # 유틸리티 함수
│   │   └── theme.ts       # 디자인 시스템
│   └── data/              # Mock 데이터
├── App.tsx                # 앱 진입점
├── package.json
└── README.md
```

## 🎯 주요 화면 흐름

### 보호자 플로우
```
로그인 → 홈 화면 → 긴급 호출 → 병원 선택 → 요청 추적 → 완료
```

### 라이더 플로우
```
로그인 → 활성화 → 요청 수신 → 요청 수락 → 픽업 → 이송 → 완료
```

## 🚀 향후 개발 계획

- [ ] 백엔드 API 연동
- [ ] 실시간 채팅 기능
- [ ] 결제 시스템 통합
- [ ] 이송 이력 조회
- [ ] 푸시 알림 기능
- [ ] 다국어 지원
- [ ] 라이더 평가 시스템
- [ ] 응급 상황 가이드

## 🔧 개발 환경

- **React Native**: 0.74.5
- **TypeScript**: 5.3.3
- **Expo**: ~51.0.28
- **React Navigation**: 6.x
- **React Native Maps**: 1.14.0

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 👨‍💻 개발자

**SeungMin**
- GitHub: [@SeungMin2001](https://github.com/SeungMin2001)

## 🙏 감사의 말

이 프로젝트는 반려동물과 함께하는 모든 분들의 안전과 행복을 위해 만들어졌습니다.

---

⭐️ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!
