# FairPlay Frontend 🎨

<div align="center">

**종합 행사 예약 및 관리 플랫폼 - 프론트엔드**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.11-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)

[**프로젝트 홈페이지**](https://fair-play.ink) | [**GitHub**](https://github.com/rktclgh/FairPlay_FE)

</div>

---

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#️-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [설치 및 실행](#-설치-및-실행)
- [주요 페이지](#-주요-페이지)
- [컴포넌트](#️-컴포넌트)
- [상태 관리](#-상태-관리)
- [배포](#-배포)

---

## 🎯 프로젝트 개요

**FairPlay Frontend**는 React와 TypeScript를 기반으로 구축된 종합 이벤트 관리 플랫폼의 사용자 인터페이스입니다. 반응형 디자인과 직관적인 UX를 통해 행사 예약, 실시간 채팅, QR 티켓 관리 등 다양한 기능을 제공합니다.

### 💡 개발 목표

- **사용자 친화적 UI/UX**: 직관적이고 아름다운 인터페이스
- **반응형 디자인**: 모바일, 태블릿, 데스크탑 모든 디바이스 지원
- **빠른 성능**: Vite 기반 빌드로 빠른 개발 및 프로덕션 성능
- **타입 안정성**: TypeScript로 안전한 개발 환경

### 📅 개발 정보

- **개발 기간**: 2024.04 - 2024.06 (3개월)
- **팀 구성**: 백엔드 2명, 프론트엔드 2명, 디자이너 1명
- **프로덕션 URL**: https://fair-play.ink

---

## ✨ 주요 기능

### 🎪 사용자 기능

<!-- 여기에 사용자 메인 화면 스크린샷 추가 -->

**1. 행사 탐색 및 예약**

```
✅ 행사 검색 및 필터링
   - 카테고리별 분류 (페스티벌, 전시회, 컨퍼런스 등)
   - 키워드 검색
   - 날짜 기반 필터
   - 지역별 필터

✅ 행사 상세 정보
   - 행사 소개 및 일정
   - 위치 및 지도 (Kakao Map)
   - 티켓 종류 및 가격
   - 리뷰 및 평점

✅ 간편 예약
   - 티켓 선택 및 수량 설정
   - 결제 (Iamport 통합)
   - QR 티켓 자동 발급
   - 예약 확인 이메일 발송
```

**2. 마이페이지**

<!-- 여기에 마이페이지 스크린샷 추가 -->

```
✅ 프로필 관리
   - 프로필 이미지 업로드
   - 개인정보 수정
   - 비밀번호 변경

✅ 예약 내역
   - 예약한 행사 목록
   - QR 티켓 보기
   - 예약 취소 및 환불

✅ 리뷰 관리
   - 작성한 리뷰 목록
   - 리뷰 수정 및 삭제

✅ 위시리스트
   - 관심 행사 저장
   - 빠른 예약 접근

✅ 디지털 명함 지갑
   - 받은 명함 관리
   - 명함 검색 및 필터링
```

**3. QR 티켓 시스템**

<!-- 여기에 QR 티켓 화면 스크린샷 추가 -->

```
✅ 모바일 QR 티켓
   - 예약 후 자동 생성
   - 모바일 최적화 디스플레이
   - PDF 다운로드 옵션

✅ 티켓 관리
   - 티켓 재발급
   - 다른 사용자에게 공유
   - 게스트 티켓 생성

✅ 입장 확인
   - QR 코드 스캔 화면
   - 실시간 입장 상태 확인
```

**4. 실시간 채팅**

<!-- 여기에 채팅 UI 스크린샷 추가 -->

```
✅ 채팅 기능
   - 1:1 채팅
   - 그룹 채팅
   - 실시간 메시지 수신

✅ 메시지 관리
   - 읽지 않은 메시지 알림
   - 채팅 기록 검색
   - 파일 첨부 (이미지, 문서)

✅ 상태 표시
   - 사용자 온라인/오프라인 상태
   - 타이핑 인디케이터
```

**5. AI 챗봇 (RAG 기반)**

<!-- 여기에 AI 챗봇 인터페이스 스크린샷 추가 -->

```
✅ 지능형 고객 지원
   - 행사 정보 질의응답
   - 예약 관련 문의
   - 시스템 사용법 안내

✅ 자연어 처리
   - 자유로운 질문 형식
   - 문맥 이해
   - 정확한 답변 제공

✅ 실시간 응답
   - WebSocket 기반 스트리밍
   - 빠른 응답 속도
```

---

### 🎪 행사 관리자 기능

<!-- 여기에 행사 관리자 대시보드 스크린샷 추가 -->

**1. 행사 관리 대시보드**

```
✅ 행사 생성 및 수정
   - Rich Text 에디터 (Quill)
   - 이미지 및 파일 업로드
   - 다국어 지원 (한국어/영어)
   - 행사 버전 관리

✅ 티켓 관리
   - 티켓 종류 추가/수정
   - 가격 설정
   - 재고 관리
   - 할인 쿠폰 생성

✅ 일정 관리
   - 세션 추가/수정
   - 타임테이블 관리
   - 발표자 정보 등록
```

**2. 예약 관리**

<!-- 여기에 예약 관리 화면 스크린샷 추가 -->

```
✅ 예약 현황
   - 실시간 예약 통계
   - 참가자 명단
   - Excel 다운로드 (xlsx)

✅ 참가자 관리
   - 참가자 검색
   - 정보 수정
   - 예약 취소 처리

✅ 대기열 관리
   - 대기 순서 확인
   - 자동 예약 전환
```

**3. 부스 관리**

```
✅ 부스 신청 관리
   - 신청 승인/거부
   - 부스 배치 관리
   - 부스 정보 수정

✅ 부스 관리자 권한
   - 관리자 권한 부여
   - 권한 취소
```

**4. 통계 및 분석**

<!-- 여기에 통계 대시보드 스크린샷 추가 -->

```
✅ 실시간 통계
   - 예약 현황
   - 매출 통계
   - 입장 현황 (QR 체크인)

✅ 차트 및 그래프
   - 시간대별 예약 추이 (Recharts)
   - 티켓 종류별 판매 현황
   - 참가자 인구 통계

✅ 리포트
   - 행사 종료 후 보고서
   - 리뷰 분석
   - 만족도 조사
```

**5. 정산 관리**

```
✅ 매출 확인
   - 티켓 판매 내역
   - 총 매출
   - 수수료 계산

✅ 정산 요청
   - 정산 신청
   - 정산 내역 조회
   - 입금 확인
```

---

### 🏪 부스 관리자 기능

<!-- 여기에 부스 관리자 QR 스캔 화면 스크린샷 추가 -->

**1. 부스 운영 대시보드**

```
✅ 부스 정보 관리
   - 부스 소개 수정
   - 이미지 업데이트
   - 운영 시간 설정

✅ QR 스캔 모드
   - 실시간 QR 코드 스캔 (jsqr)
   - 입장 권한 검증
   - 체험 프로그램 참여 기록

✅ 방문자 통계
   - 방문자 수 추적
   - 시간대별 방문 현황
   - 체험 참여율
```

**2. 체험 프로그램 관리**

```
✅ 프로그램 생성
   - 체험 정보 등록
   - 정원 설정
   - 소요 시간 설정

✅ 참여자 관리
   - 참여자 명단
   - 참여 확인
   - 후기 조회
```

---

### 👑 전체 관리자 기능

<!-- 여기에 관리자 대시보드 스크린샷 추가 -->

**1. 플랫폼 관리 대시보드**

```
✅ KPI 대시보드
   - 전체 사용자 수
   - 활성 행사 수
   - 총 매출
   - 예약 건수

✅ 사용자 관리
   - 전체 사용자 목록
   - 역할 변경
   - 계정 정지/활성화

✅ 권한 관리
   - EVENT_ADMIN 권한 부여/박탈
   - BOOTH_ADMIN 권한 부여/박탈
   - 권한 변경 이력 조회
```

**2. 행사 승인 관리**

```
✅ 행사 검토
   - 신규 행사 승인/거부
   - 행사 수정 요청 검토
   - 행사 상태 관리

✅ 품질 관리
   - 부적절한 콘텐츠 필터링
   - 행사 정보 검증
```

**3. 결제 및 정산 관리**

```
✅ 전체 결제 내역
   - 결제 승인/취소
   - 환불 처리
   - 정산 승인

✅ 재무 관리
   - 매출 통계
   - 수수료 관리
   - 정산 스케줄 관리
```

**4. VIP 배너 관리**

```
✅ 광고 배너
   - 배너 신청 승인/거부
   - 배너 노출 순위 관리
   - 광고 효과 통계
```

**5. 시스템 관리**

```
✅ 보안 로그
   - 로그인 기록
   - 접근 로그
   - 변경 이력

✅ 시스템 설정
   - 이메일 템플릿 관리
   - 알림 설정
   - 통합 관리
```

---

## 🛠️ 기술 스택

### 핵심 기술

| 기술 | 버전 | 용도 |
|-----|------|------|
| ![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react) | 18.3.1 | UI 라이브러리 |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript) | 5.8.3 | 타입 안정성 |
| ![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?logo=vite) | 5.4.19 | 빌드 도구 |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.11-38B2AC?logo=tailwind-css) | 3.4.11 | 스타일링 |

### UI 컴포넌트 라이브러리

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| **Radix UI** | 1.x | 접근성 높은 UI 프리미티브 |
| - Accordion | 1.x | 아코디언 컴포넌트 |
| - Alert Dialog | 1.x | 경고 대화상자 |
| - Avatar | 1.x | 아바타 |
| - Checkbox | 1.x | 체크박스 |
| - Dialog | 1.x | 모달 대화상자 |
| - Dropdown Menu | 1.x | 드롭다운 메뉴 |
| - Hover Card | 1.x | 호버 카드 |
| - Popover | 1.x | 팝오버 |
| - Progress | 1.x | 진행률 표시 |
| - Select | 1.x | 셀렉트 박스 |
| - Slider | 1.x | 슬라이더 |
| - Switch | 1.x | 스위치 |
| - Tabs | 1.x | 탭 |
| - Toast | 1.x | 토스트 알림 |
| - Tooltip | 1.x | 툴팁 |

### 라우팅 및 상태 관리

| 기술 | 버전 | 용도 |
|-----|------|------|
| **React Router** | 6.30.1 | 클라이언트 사이드 라우팅 |
| **TanStack Query** | 5.83.0 | 서버 상태 관리 |
| **Context API** | React 내장 | 전역 상태 관리 (테마 등) |

### HTTP 통신 및 WebSocket

| 기술 | 버전 | 용도 |
|-----|------|------|
| **Axios** | 1.11.0 | HTTP 클라이언트 |
| **Stompjs** | 2.3.3 | WebSocket 메시징 |
| **SockJS Client** | 1.6.1 | WebSocket 폴백 |

### 폼 및 검증

| 기술 | 버전 | 용도 |
|-----|------|------|
| **React Hook Form** | 7.61.1 | 폼 상태 관리 |
| **Zod** | 3.25.76 | 스키마 검증 |

### QR 코드

| 기술 | 버전 | 용도 |
|-----|------|------|
| **jsqr** | 1.4.0 | QR 코드 스캔 |
| **qrcode.react** | 4.2.0 | QR 코드 생성 |

### 리치 텍스트 에디터

| 기술 | 버전 | 용도 |
|-----|------|------|
| **React Quill** | 2.0.0 | WYSIWYG 에디터 |

### 차트 및 데이터 시각화

| 기술 | 버전 | 용도 |
|-----|------|------|
| **Recharts** | 2.15.4 | 차트 라이브러리 |

### 애니메이션

| 기술 | 버전 | 용도 |
|-----|------|------|
| **Framer Motion** | 12.23.12 | 애니메이션 라이브러리 |

### 국제화 (i18n)

| 기술 | 버전 | 용도 |
|-----|------|------|
| **i18next** | 25.3.6 | 다국어 지원 |
| **react-i18next** | 15.4.0 | React 통합 |

### 알림

| 기술 | 버전 | 용도 |
|-----|------|------|
| **react-toastify** | 11.0.5 | 토스트 알림 |
| **sonner** | 1.7.4 | 토스트 알림 (대체) |

### 유틸리티

| 기술 | 버전 | 용도 |
|-----|------|------|
| **date-fns** | 4.1.0 | 날짜 포맷팅 |
| **xlsx** | 0.18.5 | Excel 파일 생성 |
| **react-icons** | 5.x | 아이콘 |
| **clsx** | 2.x | className 관리 |

---

## 📁 프로젝트 구조

```
fairplay-fe/
├── src/
│   ├── pages/                      # 페이지 컴포넌트 (36+ 페이지)
│   │   ├── admin_*/               # 관리자 페이지
│   │   │   ├── admin_dashboard/  # 관리자 대시보드
│   │   │   ├── admin_account/    # 계정 관리
│   │   │   ├── admin_event/      # 행사 관리
│   │   │   ├── admin_payment/    # 결제 관리
│   │   │   ├── admin_refund/     # 환불 관리
│   │   │   ├── admin_settlement/ # 정산 관리
│   │   │   ├── admin_statistics/ # 통계 관리
│   │   │   ├── admin_vip_banner/ # VIP 배너 관리
│   │   │   ├── admin_security/   # 보안 로그
│   │   │   └── admin_settings/   # 시스템 설정
│   │   │
│   │   ├── host_*/                # 행사 관리자 페이지
│   │   │   ├── host_event/       # 행사 생성/수정
│   │   │   ├── host_reservation/ # 예약 관리
│   │   │   ├── host_booth/       # 부스 관리
│   │   │   ├── host_analytics/   # 통계 분석
│   │   │   ├── host_account/     # 프로필
│   │   │   └── host_payment/     # 결제 관리
│   │   │
│   │   ├── booth_admin/           # 부스 관리자 페이지
│   │   │   ├── BoothAdminDashboard.tsx
│   │   │   ├── BoothQRScanPage.tsx
│   │   │   └── BoothExperienceManagement.tsx
│   │   │
│   │   ├── user_*/                # 일반 사용자 페이지
│   │   │   ├── user_auth/        # 로그인, 회원가입
│   │   │   ├── user_event/       # 행사 탐색, 상세
│   │   │   ├── user_booth/       # 부스 목록, 상세
│   │   │   ├── user_mypage/      # 마이페이지
│   │   │   └── user_refund/      # 환불 내역
│   │   │
│   │   ├── footer/                # 푸터 페이지
│   │   │   ├── PrivacyPolicy.tsx
│   │   │   ├── TermsOfService.tsx
│   │   │   └── AboutUs.tsx
│   │   │
│   │   ├── MainPage.tsx           # 랜딩 페이지
│   │   ├── RegisterEvent.tsx      # 행사 등록
│   │   ├── QRScanPage.tsx         # QR 스캔
│   │   └── OnlyQrTicketPage.tsx   # QR 티켓 전용
│   │
│   ├── components/                 # 재사용 컴포넌트 (39+ 컴포넌트)
│   │   ├── layout/
│   │   │   ├── TopNav.tsx         # 상단 네비게이션
│   │   │   ├── Footer.tsx         # 푸터
│   │   │   ├── AdminSideNav.tsx   # 관리자 사이드바
│   │   │   ├── HostSideNav.tsx    # 행사 관리자 사이드바
│   │   │   └── BoothAdminSideNav.tsx # 부스 관리자 사이드바
│   │   │
│   │   ├── chat/                  # 채팅 컴포넌트
│   │   │   ├── ChatFloatingModal.tsx
│   │   │   ├── ChatMessageList.tsx
│   │   │   └── ChatInput.tsx
│   │   │
│   │   ├── qr/                    # QR 관련 컴포넌트
│   │   │   ├── QRCodeModal.tsx    # QR 코드 표시
│   │   │   ├── QRScannerModal.tsx # QR 스캔 UI
│   │   │   └── QrTicket.tsx       # QR 티켓 디자인
│   │   │
│   │   ├── event/                 # 행사 관련
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventDetail.tsx
│   │   │   └── EventFilter.tsx
│   │   │
│   │   ├── businesscard/          # 디지털 명함
│   │   │   ├── BusinessCardDesign.tsx
│   │   │   ├── FlippableBusinessCard.tsx
│   │   │   └── BusinessCardWallet.tsx
│   │   │
│   │   ├── ui/                    # UI 프리미티브 (Radix)
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   └── tooltip.tsx
│   │   │
│   │   ├── Loader.tsx             # 로딩 스피너
│   │   ├── NewLoader.tsx          # 새로운 로딩 애니메이션
│   │   ├── Heart.tsx              # 위시리스트 토글
│   │   ├── NotificationBell.tsx   # 알림 벨
│   │   └── DeleteButton.tsx       # 삭제 확인 버튼
│   │
│   ├── services/                   # API 서비스 (20+ 서비스)
│   │   ├── api.ts                 # Axios 인스턴스
│   │   ├── event.ts               # 행사 API
│   │   ├── reservation.ts         # 예약 API
│   │   ├── qrTicket.ts            # QR 티켓 API
│   │   ├── chat.ts                # 채팅 API
│   │   ├── paymentService.ts      # 결제 API
│   │   ├── businessCardService.ts # 명함 API
│   │   ├── boothExperienceService.ts # 부스 체험 API
│   │   ├── upload.ts              # 파일 업로드
│   │   ├── review.ts              # 리뷰 API
│   │   └── wishlist.ts            # 위시리스트 API
│   │
│   ├── hooks/                      # 커스텀 훅
│   │   ├── useFileUpload.ts       # 파일 업로드
│   │   ├── useFirstVisitGate.ts   # 첫 방문 모달
│   │   ├── useNotificationSocket.ts # WebSocket 알림
│   │   └── useScrollToTop.ts      # 스크롤 복원
│   │
│   ├── context/                    # React Context
│   │   └── ThemeContext.tsx       # 다크모드 테마
│   │
│   ├── types/                      # TypeScript 타입
│   │   └── types/                 # 타입 정의
│   │
│   ├── utils/                      # 유틸리티 함수
│   │   ├── auth.ts                # 인증 헬퍼
│   │   ├── tokenValidator.ts      # JWT 검증
│   │   ├── presenceManager.ts     # 사용자 온라인 상태
│   │   └── formatters.ts          # 포맷팅 함수
│   │
│   ├── i18n/                       # 국제화
│   │   ├── locales/
│   │   │   ├── en/                # 영어 번역
│   │   │   └── ko/                # 한국어 번역
│   │   └── i18n.ts                # i18next 설정
│   │
│   ├── assets/                     # 정적 파일
│   │   ├── images/                # 이미지
│   │   └── fonts/                 # 폰트
│   │
│   ├── lib/                        # 라이브러리 설정
│   ├── App.tsx                     # 루트 컴포넌트
│   ├── main.tsx                    # 진입점
│   └── index.css                   # 글로벌 스타일
│
├── public/                         # 정적 파일
├── .env                            # 환경 변수
├── .env.example                    # 환경 변수 예제
├── package.json                    # 의존성
├── vite.config.ts                  # Vite 설정
├── tailwind.config.js              # Tailwind 설정
├── tsconfig.json                   # TypeScript 설정
└── README.md                       # 문서
```

---

## 🚀 설치 및 실행

### 요구사항

- **Node.js**: 18.x 이상
- **npm** 또는 **yarn**

### 1. 저장소 클론

```bash
git clone https://github.com/rktclgh/FairPlay_FE.git
cd FairPlay_FE
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```bash
# Backend API
VITE_FRONTEND_BASE_URL=http://localhost:5173
VITE_BACKEND_BASE_URL=http://localhost:8080

# Kakao OAuth
VITE_KAKAO_CLIENT_ID=your_kakao_client_id
VITE_KAKAO_MAP_ID=your_kakao_map_id

# AWS CloudFront
VITE_CDN_BASE_URL=https://d3lmalqtze27ii.cloudfront.net

# Business Service
VITE_BUSINESS_SERVICE_KEY=your_business_service_key

# Feature Flags
VITE_ENABLE_NEW_PICKS=true
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 5. 빌드

**프로덕션 빌드**

```bash
npm run build
```

**개발 빌드**

```bash
npm run build:dev
```

### 6. 빌드 미리보기

```bash
npm run preview
```

---

## 📄 주요 페이지

### 사용자 페이지

| 페이지 | 경로 | 설명 |
|--------|------|------|
| **랜딩 페이지** | `/` | 메인 페이지, 인기 행사 |
| **로그인** | `/auth/login` | 이메일/소셜 로그인 |
| **회원가입** | `/auth/signup` | 회원가입 폼 |
| **행사 목록** | `/events` | 행사 검색 및 필터링 |
| **행사 상세** | `/event/:eventId` | 행사 정보, 예약 |
| **부스 목록** | `/booths` | 부스 목록 |
| **부스 상세** | `/booth/:boothId` | 부스 정보 |
| **마이페이지** | `/mypage/*` | 예약, 티켓, 리뷰, 명함 |
| **QR 티켓** | `/qr-ticket/:token` | QR 티켓 표시 |

### 행사 관리자 페이지

| 페이지 | 경로 | 설명 |
|--------|------|------|
| **대시보드** | `/host/dashboard` | 행사 관리 대시보드 |
| **행사 생성** | `/host/event/create` | 새 행사 생성 |
| **행사 수정** | `/host/event/:id/edit` | 행사 정보 수정 |
| **티켓 관리** | `/host/event/:id/tickets` | 티켓 설정 |
| **예약 관리** | `/host/reservation` | 예약 현황 |
| **부스 관리** | `/host/booth/*` | 부스 신청 관리 |
| **통계** | `/host/analytics/*` | 매출 및 통계 |

### 부스 관리자 페이지

| 페이지 | 경로 | 설명 |
|--------|------|------|
| **대시보드** | `/booth-admin/dashboard` | 부스 관리 대시보드 |
| **QR 스캔** | `/booth-admin/qr-scan` | QR 코드 스캔 |
| **체험 관리** | `/booth-admin/experience/*` | 체험 프로그램 관리 |

### 관리자 페이지

| 페이지 | 경로 | 설명 |
|--------|------|------|
| **대시보드** | `/admin/dashboard` | 플랫폼 전체 KPI |
| **사용자 관리** | `/admin/users` | 사용자 및 권한 관리 |
| **행사 관리** | `/admin/events` | 행사 승인 및 관리 |
| **결제 관리** | `/admin/payment` | 결제 및 환불 관리 |
| **통계** | `/admin/statistics/*` | 플랫폼 통계 |

---

## 🧩 컴포넌트

### 레이아웃 컴포넌트

**TopNav** - 상단 네비게이션

```tsx
import TopNav from '@/components/TopNav';

<TopNav />
```

**특징**:
- 로그인/비로그인 상태별 메뉴
- 알림 벨 (NotificationBell)
- 언어 전환 (한국어/영어)
- 다크모드 토글
- 사용자 프로필 드롭다운

**SideNav** - 사이드 네비게이션

```tsx
// 관리자용
import AdminSideNav from '@/components/AdminSideNav';

// 행사 관리자용
import HostSideNav from '@/components/HostSideNav';

// 부스 관리자용
import BoothAdminSideNav from '@/components/BoothAdminSideNav';
```

### QR 컴포넌트

**QRCodeModal** - QR 코드 표시

```tsx
import QRCodeModal from '@/components/QRCodeModal';

<QRCodeModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  ticketData={ticketData}
/>
```

**QRScannerModal** - QR 코드 스캔

```tsx
import QRScannerModal from '@/components/QRScannerModal';

<QRScannerModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onScanSuccess={handleScanSuccess}
/>
```

### 로딩 컴포넌트

**Loader** - 기본 로딩 스피너

```tsx
import Loader from '@/components/Loader';

{isLoading && <Loader />}
```

**NewLoader** - 점프 박스 애니메이션

```tsx
import NewLoader from '@/components/NewLoader';

{isLoading && (
  <div className="flex items-center justify-center">
    <NewLoader />
  </div>
)}
```

### 채팅 컴포넌트

**ChatFloatingModal** - 플로팅 채팅 UI

```tsx
import ChatFloatingModal from '@/components/chat/ChatFloatingModal';

<ChatFloatingModal />
```

### 명함 컴포넌트

**FlippableBusinessCard** - 플립 가능한 명함

```tsx
import FlippableBusinessCard from '@/components/businesscard/FlippableBusinessCard';

<FlippableBusinessCard
  frontData={frontData}
  backData={backData}
/>
```

---

## 🔄 상태 관리

### TanStack Query (React Query)

**서버 상태 관리 예시**

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { getEvents, createReservation } from '@/services/event';

// 행사 목록 조회
const { data, isLoading, error } = useQuery({
  queryKey: ['events'],
  queryFn: getEvents,
});

// 예약 생성
const mutation = useMutation({
  mutationFn: createReservation,
  onSuccess: () => {
    queryClient.invalidateQueries(['reservations']);
  },
});
```

### Context API

**테마 관리**

```tsx
import { useTheme } from '@/context/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
```

### 커스텀 훅

**파일 업로드**

```tsx
import { useFileUpload } from '@/hooks/useFileUpload';

function ImageUpload() {
  const { upload, isUploading, progress } = useFileUpload();

  const handleUpload = async (file: File) => {
    const url = await upload(file);
    console.log('Uploaded to:', url);
  };

  return (
    <div>
      {isUploading && <progress value={progress} max={100} />}
      <input type="file" onChange={e => handleUpload(e.target.files[0])} />
    </div>
  );
}
```

---

## 🌐 API 통신

### Axios 인스턴스

**기본 설정** (`src/services/api.ts`)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL + '/api',
  timeout: 30000,
});

// 요청 인터셉터 (JWT 토큰 추가)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (에러 처리)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 리프레시
      await refreshToken();
    }
    return Promise.reject(error);
  }
);

export default api;
```

### WebSocket 연결

**채팅 WebSocket** (`src/services/chat.ts`)

```typescript
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const connectWebSocket = (token: string) => {
  const socket = new SockJS(`${BACKEND_URL}/ws/chat`);

  const stompClient = new Client({
    webSocketFactory: () => socket,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    onConnect: () => {
      console.log('WebSocket connected');

      // 채팅방 구독
      stompClient.subscribe(`/topic/chat/${roomId}`, (message) => {
        const data = JSON.parse(message.body);
        handleNewMessage(data);
      });
    },
    onStompError: (frame) => {
      console.error('STOMP error:', frame);
    },
  });

  stompClient.activate();
  return stompClient;
};
```

---

## 🐳 배포

### Vite 빌드 설정

**`vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:8080',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
        },
      },
    },
  },
});
```

### GitHub Actions

프론트엔드 푸시 시 백엔드에 알림을 전송하여 통합 배포가 진행됩니다.

**배포 플로우**:
1. 프론트엔드 main 브랜치에 푸시
2. GitHub Actions에서 백엔드에 `repository_dispatch` 이벤트 전송
3. 백엔드에서 프론트엔드 소스를 받아 함께 빌드
4. Docker 이미지 생성 및 배포

---

## 📝 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (포트: 5173) |
| `npm run build` | 프로덕션 빌드 |
| `npm run build:dev` | 개발 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | ESLint 실행 |

---

## 🎨 스타일링

### Tailwind CSS

**유틸리티 클래스 활용**

```tsx
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
    행사 제목
  </h3>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
    예약하기
  </button>
</div>
```

### 다크모드

```tsx
// Tailwind의 dark: 접두사 사용
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  컨텐츠
</div>
```

---

## 🔐 인증

### 로그인 플로우

```typescript
import { login } from '@/services/auth';

const handleLogin = async (email: string, password: string) => {
  try {
    const { accessToken, refreshToken } = await login({ email, password });

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    navigate('/');
  } catch (error) {
    toast.error('로그인에 실패했습니다');
  }
};
```

### 보호된 라우트

```tsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('accessToken');
  const userRole = getUserRole();

  if (!token) {
    return <Navigate to="/auth/login" />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" />;
  }

  return children;
}
```

---

## 📱 반응형 디자인

### Tailwind 브레이크포인트

```tsx
<div className="
  grid
  grid-cols-1
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-4
  gap-4
">
  {/* 모바일: 1열, 태블릿: 2열, 데스크탑: 3-4열 */}
</div>
```

---

## 📞 문의

- **이메일**: songchih@icloud.com
- **GitHub**: [Issues](https://github.com/rktclgh/FairPlay_FE/issues)

---

**Made with ❤️ by FairPlay Team**
