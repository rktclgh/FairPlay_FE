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
  userId: number;
  email: string;
  phone: string;
  name: string;
  nickname: string;
  role: string;
}

// 알림 정보 타입
export interface Notification {
  notificationId: number;
  typeCode: string;
  methodCode: string;
  title: string;
  message: string;
  url: string;
  isRead: boolean;
  createdAt: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
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
    userId: 1,
    email: "user@example.com",
    phone: "010-0000-0000",
    name: "사용자",
    nickname: "사용자닉네임",
    role: "USER",
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

          console.log("사용자 정보 조회 시작 - 토큰 확인:", {
            accessToken: !!accessToken,
            refreshToken: !!refreshToken,
          });

          if (!accessToken && !refreshToken) {
            throw new Error("로그인이 필요합니다.");
          }

          // 실제 백엔드 API 호출 시도
          try {
            console.log("API 호출 시도: /api/users/mypage");
            console.log("Authorization 헤더:", `Bearer ${accessToken}`);

            // 여러 가능한 엔드포인트 시도
            const endpoints = [
              "/api/users/mypage",
              "/api/users/me",
              "/api/user/profile",
            ];

            let response = null;
            let successfulEndpoint = null;

            for (const endpoint of endpoints) {
              try {
                console.log(`엔드포인트 시도: ${endpoint}`);
                response = await fetch(endpoint, {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                  },
                });

                console.log(
                  `${endpoint} 응답 상태:`,
                  response.status,
                  response.statusText
                );

                if (response.ok) {
                  successfulEndpoint = endpoint;
                  break;
                }
              } catch (endpointError) {
                console.log(`${endpoint} 호출 실패:`, endpointError);
                continue;
              }
            }

            if (response && response.ok) {
              const userData = await response.json();
              console.log(`성공한 엔드포인트: ${successfulEndpoint}`);
              console.log("API 응답 데이터:", userData);

              // API 응답 구조에 맞게 데이터 매핑
              const mappedUserData: UserInfo = {
                userId: userData.userId || userData.id || 1,
                email: userData.email,
                phone: userData.phone || userData.phoneNumber || "",
                name: userData.name || userData.username || "",
                nickname:
                  userData.nickname || userData.name || userData.username || "",
                role: userData.role || "USER",
              };
              console.log("매핑된 사용자 데이터:", mappedUserData);
              resolve(mappedUserData);
              return;
            } else {
              console.error("모든 API 엔드포인트 호출 실패");
              if (response) {
                console.error(
                  "마지막 응답 상태:",
                  response.status,
                  response.statusText
                );
                const errorText = await response.text();
                console.error("에러 응답:", errorText);
              }

              // API 호출 실패 시 fallback으로 넘어감
              throw new Error("모든 API 엔드포인트 호출 실패");
            }
          } catch (apiError) {
            console.error("백엔드 API 호출 중 오류:", apiError);
            console.log("API 호출 실패로 인해 localStorage 기반 데이터 사용");
          }

          // API 호출 실패 시 localStorage의 실제 로그인 정보 사용
          const loginEmail = localStorage.getItem("loginEmail");
          const loginName = localStorage.getItem("loginName");
          const loginPhone = localStorage.getItem("loginPhone");

          console.log("localStorage 저장된 정보:", {
            loginEmail,
            loginName,
            loginPhone,
          });

          if (loginEmail && loginName && loginPhone) {
            // 로그인 시 저장된 실제 정보 사용
            const userData: UserInfo = {
              userId: 1,
              email: loginEmail,
              phone: loginPhone,
              name: loginName,
              nickname: loginName, // 이름을 닉네임으로 사용
              role: "USER",
            };
            console.log("localStorage 기반 사용자 데이터:", userData);
            resolve(userData);
          } else if (loginEmail) {
            // 이메일만 있는 경우 (카카오 로그인 등)
            const userData: UserInfo = {
              userId: 1,
              email: loginEmail,
              phone: "010-0000-0000",
              name: "사용자",
              nickname: "사용자",
              role: "USER",
            };
            console.log("이메일 기반 사용자 데이터:", userData);
            resolve(userData);
          } else {
            // 저장된 정보가 없는 경우에만 기본 mock 데이터 사용
            console.warn("로그인 정보가 저장되지 않음, 기본 mock 데이터 사용");
            const mockUserData: UserInfo = {
              userId: 1,
              email: "user@fairplay.com",
              phone: "010-1234-5678",
              name: "페어플레이 사용자",
              nickname: "페어플레이 사용자",
              role: "USER",
            };
            console.log("Mock 사용자 데이터:", mockUserData);
            resolve(mockUserData);
          }
        } catch (error) {
          console.error("사용자 정보 조회 중 오류:", error);
          reject(error);
        }
      }, 300);
    });
  }

  // 비밀번호 변경
  async changePassword(request: PasswordChangeRequest): Promise<boolean> {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("로그인이 필요합니다.");
    }

    try {
      console.log("비밀번호 변경 API 호출:", {
        url: "/api/users/mypage/password",
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: {
          currentPassword: request.currentPassword,
          newPassword: request.newPassword,
        },
      });

      const response = await fetch("/api/users/mypage/password", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: request.currentPassword,
          newPassword: request.newPassword,
        }),
      });

      console.log("API 응답 상태:", response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = "비밀번호 변경에 실패했습니다.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error("에러 응답 파싱 실패:", parseError);

          // 백엔드 API가 준비되지 않은 경우 mock 처리
          if (response.status === 403 || response.status === 404) {
            console.warn("백엔드 API가 준비되지 않음, mock 처리로 진행");
            return new Promise((resolve) => {
              setTimeout(() => {
                // 실제로는 서버에서 검증하지만, 여기서는 mock으로 처리
                const isValidOldPassword = request.currentPassword.length >= 6; // 간단한 검증
                const isValidNewPassword = request.newPassword.length >= 8;

                if (isValidOldPassword && isValidNewPassword) {
                  console.log("Mock 비밀번호 변경 성공");
                  resolve(true);
                } else {
                  console.log(
                    "Mock 비밀번호 변경 실패: 유효하지 않은 비밀번호"
                  );
                  resolve(false);
                }
              }, 1000);
            });
          }
        }
        throw new Error(errorMessage);
      }

      // 성공 응답 처리 - JSON이 아닐 수 있으므로 안전하게 처리
      try {
        const responseData = await response.json();
        console.log("비밀번호 변경 성공:", responseData);
      } catch {
        console.log("비밀번호 변경 성공 (JSON 응답 없음)");
      }
      return true;
    } catch (error) {
      console.error("비밀번호 변경 중 오류:", error);
      throw error;
    }
  }

  // 알림 목록 조회
  async getNotifications(): Promise<Notification[]> {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.log("로그인 토큰 없음, 알림을 조회할 수 없습니다.");
      return [];
    }

    try {
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          `알림 목록 조회 실패: ${response.status} ${response.statusText}`,
          errorBody
        );
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error("알림 목록 조회 중 네트워크 오류:", error);
      return [];
    }
  }

  // 알림 읽음 처리
  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return false;

    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.ok;
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
      return false;
    }
  }

  // 알림 삭제
  async deleteNotification(notificationId: number): Promise<boolean> {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return false;

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error("알림 삭제 실패:", error);
      return false;
    }
  }

  // 여러 알림 삭제
  async deleteMultipleNotifications(
    notificationIds: number[]
  ): Promise<boolean> {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return false;

    try {
      const response = await fetch(
        `/api/notifications?notificationIds=${notificationIds.join(",")}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.ok;
    } catch (error) {
      console.error("여러 알림 삭제 실패:", error);
      return false;
    }
  }
}

// export const eventApi = new EventApi();

export const eventApi = new EventApi();
