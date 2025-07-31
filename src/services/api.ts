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
  category: string;
  image: string;
}

export interface HeroPoster {
  id: number;
  title: string;
  horizontalImage: string;
  verticalImage: string;
}

// API 서비스
class EventApi {
  // 임시 데이터 (실제 API 연동 시 교체)
  private mockHotPicks: HotPick[] = [
    {
      id: 1,
      title: "G-DRAGON 2025 WORLD TOUR",
      date: "2025.05.10",
      category: "공연",
      image: "/images/gd2.png",
    },
    {
      id: 2,
      title: "G-DRAGON 2025 WORLD TOUR",
      date: "2025.05.25",
      category: "공연",
      image: "/images/gd2.png",
    },
    {
      id: 3,
      title: "YE1 Concert",
      date: "2025.06.15",
      category: "공연",
      image: "/images/YE1.png",
    },
    {
      id: 4,
      title: "YE2 Concert",
      date: "2025.07.20",
      category: "공연",
      image: "/images/YE2.png",
    },
    {
      id: 5,
      title: "G-DRAGON 2025 WORLD TOUR",
      date: "2025.08.15",
      category: "공연",
      image: "/images/gd1.png",
    },
  ];

  private mockEvents: Event[] = [
    {
      id: 1,
      title: "G-DRAGON 2025 WORLD TOUR IN JAPAN",
      date: "2025.05.10",
      location: "TOKYO DOME",
      price: "₩150,000",
      category: "공연",
      image: "/images/gd1.png",
    },
    {
      id: 2,
      title: "G-DRAGON 2025 WORLD TOUR IN JAPAN",
      date: "2025.05.25",
      location: "KYOCERA DOME OSAKA",
      price: "₩150,000",
      category: "공연",
      image: "/images/gd2.png",
    },
    {
      id: 3,
      title: "YE1 Concert",
      date: "2025.06.15",
      location: "SEOUL OLYMPIC STADIUM",
      price: "₩120,000",
      category: "공연",
      image: "/images/YE1.png",
    },
    {
      id: 4,
      title: "YE2 Concert",
      date: "2025.07.20",
      location: "BUSAN ASIAD STADIUM",
      price: "₩100,000",
      category: "공연",
      image: "/images/YE2.png",
    },
    {
      id: 5,
      title: "G-DRAGON 2025 WORLD TOUR",
      date: "2025.08.15",
      location: "SEOUL WORLD CUP STADIUM",
      price: "₩180,000",
      category: "공연",
      image: "/images/gd1.png",
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
      title: "YE1 Concert",
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
}

export const eventApi = new EventApi();
