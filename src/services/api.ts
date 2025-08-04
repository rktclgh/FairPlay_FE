// 타입 정의
export interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  price: string;
  category: string;
  image: string;
}

export interface HotPick {
  id: number;
  title: string;
  date: string;
  location: string;
  category: string;
  image: string;
}

export interface HeroPoster {
  id: number;
  title: string;
  horizontalImage: string;
  verticalImage: string;
}

// 사용자 정보 타입
export interface UserInfo {
  email: string;
  name: string;
  phoneNumber: string;
}

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
}

// API 서비스
class EventApi {
  // 임시 데이터 (실제 API 연동 시 교체)
  private mockHotPicks: HotPick[] = [
    {
      id: 1,
      title: "G-DRAGON 2025 WORLD TOUR",
      date: "2025.05.10",
      location: "올림픽공원",
      category: "공연",
      image: "/images/gd2.png",
    },
    {
      id: 2,
      title: "BTS 월드투어 서울",
      date: "2025-08-28 ~ 2025-08-30",
      location: "올림픽공원",
      category: "공연",
      image: "/images/NoImage.png",
    },
    {
      id: 3,
      title: "YE LIVE IN KOREA",
      date: "2025.06.15",
      location: "인천문학경기장",
      category: "공연",
      image: "/images/YE1.png",
    },
    {
      id: 4,
      title: "AI 기술 컨퍼런스",
      date: "2025-09-10",
      location: "삼성동 코엑스",
      category: "강연/세미나",
      image: "/images/NoImage.png",
    },
    {
      id: 5,
      title: "서울 라이트 페스티벌",
      date: "2025-09-20 ~ 2025-09-25",
      location: "남산타워",
      category: "축제",
      image: "/images/NoImage.png",
    },
  ];

  private mockEvents: Event[] = [
    {
      id: 1,
      title: "2025 AI & 로봇 박람회",
      date: "2025-08-15 ~ 2025-08-17",
      location: "코엑스 A홀",
      price: "15,000원 ~",
      category: "박람회",
      image: "/images/NoImage.png",
    },
    {
      id: 2,
      title: "G-DRAGON 2025 WORLD TOUR IN JAPAN",
      date: "2025.05.25",
      location: "KYOCERA DOME OSAKA",
      price: "150,000원 ~",
      category: "공연",
      image: "/images/gd2.png",
    },
    {
      id: 3,
      title: "YE LIVE IN KOREA",
      date: "2025.06.15",
      location: "인천문학경기장",
      price: "120,000원 ~",
      category: "공연",
      image: "/images/YE1.png",
    },
    {
      id: 4,
      title: "현대미술 특별전",
      date: "2025-09-05 ~ 2025-09-30",
      location: "국립현대미술관",
      price: "12,000원 ~",
      category: "전시/행사",
      image: "/images/NoImage.png",
    },
    {
      id: 5,
      title: "서울 국제 도서전",
      date: "2025-08-22 ~ 2025-08-25",
      location: "코엑스 B홀",
      price: "무료",
      category: "박람회",
      image: "/images/NoImage.png",
    },
  ];

  private mockHeroPosters: HeroPoster[] = [
    {
      id: 1,
      title: "G-DRAGON 2025 WORLD TOUR",
      horizontalImage: "/images/gd1.png",
      verticalImage: "/images/gd1.png",
    },
    {
      id: 2,
      title: "YE2 Concert",
      horizontalImage: "/images/YE2.png",
      verticalImage: "/images/YE2.png",
    },
    {
      id: 3,
      title: "YE LIVE IN KOREA",
      horizontalImage: "/images/YE1.png",
      verticalImage: "/images/YE1.png",
    },
    {
      id: 4,
      title: "NoImage 1",
      horizontalImage: "/images/NoImage.png",
      verticalImage: "/images/NoImage.png",
    },
    {
      id: 5,
      title: "NoImage 2",
      horizontalImage: "/images/NoImage.png",
      verticalImage: "/images/NoImage.png",
    },
    {
      id: 6,
      title: "NoImage 3",
      horizontalImage: "/images/NoImage.png",
      verticalImage: "/images/NoImage.png",
    },
    {
      id: 7,
      title: "NoImage 4",
      horizontalImage: "/images/NoImage.png",
      verticalImage: "/images/NoImage.png",
    },
  ];

  // 사용자 정보 관련 mock 데이터 (실제 로그인한 사용자 정보로 교체 필요)
  private mockUserInfo: UserInfo = {
    email: "user@example.com",
    name: "사용자",
    phoneNumber: "010-0000-0000",
  };

  async getHotPicks(): Promise<HotPick[]> {
    // 실제 API 호출 시 여기에 fetch 로직 추가
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.mockHotPicks);
      }, 500);
    });
  }

  async getEvents(category?: string): Promise<Event[]> {
    // 실제 API 호출 시 여기에 fetch 로직 추가
    return new Promise((resolve) => {
      setTimeout(() => {
        if (category && category !== "전체") {
          const filteredEvents = this.mockEvents.filter(
            (event) => event.category === category
          );
          resolve(filteredEvents);
        } else {
          resolve(this.mockEvents);
        }
      }, 500);
    });
  }

  async getHeroPosters(): Promise<HeroPoster[]> {
    // 실제 API 호출 시 여기에 fetch 로직 추가
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.mockHeroPosters);
      }, 500);
    });
  }

  // 사용자 정보 조회
  async getUserInfo(): Promise<UserInfo> {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // 로그인 토큰 확인
          const accessToken = localStorage.getItem("accessToken");
          const refreshToken = localStorage.getItem("refreshToken");

          if (!accessToken && !refreshToken) {
            throw new Error("로그인이 필요합니다.");
          }

          // 실제 백엔드 API 호출 시도
          try {
            const response = await fetch("/api/users/me", {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              const userData = await response.json();
              resolve(userData);
              return;
            }
          } catch (apiError) {
            console.warn("백엔드 API 호출 중 오류:", apiError);
          }

          // 백엔드 API가 준비되지 않았거나 실패한 경우
          // 로그인 시 저장된 정보를 기반으로 사용자 정보 생성
          const loginEmail = localStorage.getItem("loginEmail");
          const loginName = localStorage.getItem("loginName");
          const loginPhone = localStorage.getItem("loginPhone");

          if (loginEmail && loginName && loginPhone) {
            // 로그인 시 저장된 실제 정보 사용
            const userData: UserInfo = {
              email: loginEmail,
              name: loginName,
              phoneNumber: loginPhone,
            };
            resolve(userData);
          } else {
            // 저장된 정보가 없는 경우 기본 mock 데이터 사용
            console.warn("로그인 정보가 저장되지 않음, 기본 mock 데이터 사용");
            const mockUserData: UserInfo = {
              email: "user@fairplay.com",
              name: "페어플레이 사용자",
              phoneNumber: "010-1234-5678",
            };
            resolve(mockUserData);
          }
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  }

  // 비밀번호 변경
  async changePassword(request: PasswordChangeRequest): Promise<boolean> {
    // 실제 API 호출 시 여기에 fetch 로직 추가
    return new Promise((resolve) => {
      setTimeout(() => {
        // 실제로는 서버에서 검증하지만, 여기서는 mock으로 처리
        const isValidOldPassword = request.oldPassword === "mypassword123"; // 실제로는 서버에서 검증
        const isValidNewPassword = request.newPassword.length >= 8;

        resolve(isValidOldPassword && isValidNewPassword);
      }, 500);
    });
  }
}

export const eventApi = new EventApi();
