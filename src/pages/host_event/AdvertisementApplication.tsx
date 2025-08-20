import React, { useState } from 'react';
import { TopNav } from '../../components/TopNav';
import { HostSideNav } from '../../components/HostSideNav';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

// 유틸 
const fmtKST = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
const dateRangeOf = (from: string, to: string) => `${from} ~ ${to}`;

// 유틸 
const toLocalDateStr = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`; // 로컬 기준 YYYY-MM-DD
};


// ---- 서버 enum/타입 매핑 ----
type BannerSlotType = "HERO" | "SEARCH_TOP";
type BannerSlotStatus = "AVAILABLE" | "LOCKED" | "SOLD";

export interface SlotResponseDto {
  slotDate: string;            // YYYY-MM-DD
  priority: number | null;     // 1 | 2 (SEARCH_TOP)
  status: BannerSlotStatus;    // AVAILABLE | LOCKED | SOLD
  price: number;               // 원/일
}

/*interface LockSlotsRequestDto {
  typeCode: BannerSlotType;    // 'SEARCH_TOP' | 'HERO'
  items: { slotDate: string; priority: number }[];
  holdHours?: number | null;   // 생략 시 서버 기본(48h)
}
interface LockSlotsResponseDto {
  slotIds: number[];
  totalAmount: number;
  lockedUntil: string;         // ISO LocalDateTime
}*/

// [추가] 백엔드 CreateApplicationRequestDto에 맞춘 타입
interface CreateApplicationItem {
  date: string;       // YYYY-MM-DD
  priority: number;   // 1..N
}

interface CreateApplicationRequestDto {
  eventId: number;
  bannerType: BannerSlotType;   // "HERO" | "SEARCH_TOP"
  title: string;
  imageUrl: string;
  linkUrl?: string;
  items: CreateApplicationItem[];
  lockMinutes?: number;         // 옵션(기본 2880)
}

// ---- axios 인스턴스 ----
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL ?? "https://fair-play.ink",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- API 함수 ----
async function getSlots(params: { type: BannerSlotType; from: string; to: string }): Promise<SlotResponseDto[]> {
  const { data } = await api.get("/api/banner/slots", { params: { type: params.type, from: params.from, to: params.to } });
  return data;
}
/*async function lockSlots(body: LockSlotsRequestDto): Promise<LockSlotsResponseDto> {
  const { data } = await api.post("/api/banner/slots/lock", body);
  return data;
}*/

// [추가] 신청 생성 API
async function createApplication(body: CreateApplicationRequestDto): Promise<number> {
  const { data } = await api.post("/api/banner/applications", body);
  return data as number; // application id
}

const AdvertisementApplication: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTypes, setSelectedTypes] = useState({
    mainBanner: false,
    searchTop: false
  });

  const [mainBannerForm, setMainBannerForm] = useState<{
    date: string;
    rank: string;
  }[]>([]);

  const [currentSelection, setCurrentSelection] = useState({
    date: '',
    rank: ''
  });

  const [searchTopForm, setSearchTopForm] = useState({
    startDate: '',
    endDate: ''
  });

  // [추가] 메인 배너 신청에 필요한 입력값 (백엔드 DTO 필수 필드)
  const [heroMeta, setHeroMeta] = useState<{
    eventId: string;
    title: string;
    linkUrl: string;
  }>({ eventId: '', title: '', linkUrl: '' });


  // 슬롯 기반 상태(서버 연동)
  const [slotsByDate, setSlotsByDate] = useState<Record<string, SlotResponseDto[]>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // 선택한 기간 슬롯 조회 (서버)
  React.useEffect(() => {
    const fetch = async () => {
      if (!searchTopForm.startDate || !searchTopForm.endDate) return;
      const from = searchTopForm.startDate;
      const to = searchTopForm.endDate;
      if (new Date(from) > new Date(to)) return;
      try {
        setLoadingAvailability(true);
        setAvailabilityError(null);
        const list = await getSlots({ type: "SEARCH_TOP", from, to });
        const grouped: Record<string, SlotResponseDto[]> = {};
        for (const s of list) {
          const d = s.slotDate;
          (grouped[d] ??= []).push(s);
        }
        Object.values(grouped).forEach(arr =>
          arr.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
        );
        setSlotsByDate(grouped);
      } catch (e) {
        console.error(e);
        setAvailabilityError("가용 정보를 가져오지 못했어요.");
        setSlotsByDate({});
      } finally {
        setLoadingAvailability(false);
      }
    };
    fetch();
  }, [searchTopForm.startDate, searchTopForm.endDate]);

  // 메인 배너 광고용 달력 상태 (MD PICK과 별개)
  const [currentCalendarYear, setCurrentCalendarYear] = useState(new Date().getFullYear());
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date().getMonth() + 1);

  // 메인 배너 광고용 재고 상태 (MD PICK과 별개)
  const [inventoryStatus, setInventoryStatus] = useState<{
    [date: string]: {
      [rank: string]: 'available' | 'sold' | 'reserved'
    }
  }>({});



  // [추가] 현재 달 범위 ISO 계산
  const monthRange = React.useMemo(() => {
    const first = new Date(currentCalendarYear, currentCalendarMonth - 1, 1);
    const last = new Date(currentCalendarYear, currentCalendarMonth, 0);
    return { from: toLocalDateStr(first), to: toLocalDateStr(last) };
  }, [currentCalendarYear, currentCalendarMonth]);

  // [추가] HERO 슬롯을 서버에서 불러와 재고상태 반영
  React.useEffect(() => {
    (async () => {
      try {
        const list = await getSlots({ type: "HERO", from: monthRange.from, to: monthRange.to });
        // 같은 날짜의 여러 priority 상태를 맵으로 변환
        const next: Record<string, Record<string, 'available' | 'reserved' | 'sold'>> = {};
        for (const s of list) {
          const d = s.slotDate;
          const r = String(s.priority ?? 0);
          if (!next[d]) next[d] = {};
          next[d][r] =
            s.status === "AVAILABLE" ? "available" :
              s.status === "LOCKED" ? "reserved" :
                "sold";
        }
        setInventoryStatus(next);
      } catch (e) {
        console.error("HERO slots load failed", e);
        setInventoryStatus({});
      }
    })();
  }, [monthRange.from, monthRange.to]);

  // 특정 날짜의 특정 순위가 구매 가능한지 확인
  const isRankAvailable = (date: string, rank: string) => {
    return inventoryStatus[date]?.[rank] === 'available';
  };

  // 재고 상태에 따른 텍스트 반환
  const getInventoryStatusText = (date: string, rank: string) => {
    const status = inventoryStatus[date]?.[rank];
    switch (status) {
      case 'available':
        return '구매가능';
      case 'sold':
        return '매진';
      case 'reserved':
        return '예약됨';
      default:
        return '구매가능';
    }
  };

  // 재고 상태에 따른 스타일 클래스 반환
  const getInventoryStatusClass = (date: string, rank: string) => {
    const status = inventoryStatus[date]?.[rank];
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };


  // 슬롯 기반 헬퍼
  const getDateSlots = (date: string) => slotsByDate[date] ?? [];
  const getBookedCount = (date: string) =>
    getDateSlots(date).filter(s => s.status !== "AVAILABLE").length;
  const isMdPickAvailable = (date: string) =>
    getDateSlots(date).some(s => s.status === "AVAILABLE");
  const chooseSlotForDate = (date: string) => {
    const available = getDateSlots(date).filter(s => s.status === "AVAILABLE");
    if (!available.length) return null;
    available.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
    return { priority: available[0].priority ?? 1, price: available[0].price };
  };

  const [mdPickMeta, setMdPickMeta] = useState<{
  eventId: string;
  title: string;
  linkUrl: string;
}>({ eventId: '', title: '', linkUrl: '' });

  const getMdPickStatusText = (date: string) => {
    const slots = getDateSlots(date); // slotsByDate[date] ?? []
    if (!slots.length) return "신청 가능"; // 데이터 없으면 가용으로 간주
    const booked = slots.filter(s => s.status !== "AVAILABLE").length;
    if (booked === 0) return "신청 가능";
    if (booked === 1) return "1개 신청됨";
    return "매진";
  };

  const getMdPickStatusClass = (date: string) => {
    const text = getMdPickStatusText(date);
    if (text === "신청 가능") return "bg-green-100 text-green-800";
    if (text === "1개 신청됨") return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getAvailableDates = () => {
    if (!searchTopForm.startDate || !searchTopForm.endDate) return [];
    const s = new Date(searchTopForm.startDate);
    const e = new Date(searchTopForm.endDate);
    if (s > e) return [];
    const out: string[] = [];
    const cur = new Date(s);
    while (cur <= e) {
      const d = toLocalDateStr(cur);
      if (isMdPickAvailable(d)) out.push(d);
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  };
  const calculateSearchTopPrice = () =>
    getAvailableDates().reduce((sum, d) => sum + (chooseSlotForDate(d)?.price ?? 0), 0);

  const getSearchTopDays = () => {
    if (!searchTopForm.startDate || !searchTopForm.endDate) return 0;
    const s = new Date(searchTopForm.startDate);
    const e = new Date(searchTopForm.endDate);
    if (s > e) return 0;
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 3600 * 24)) + 1;
  };
  const getAvailableDays = () => getAvailableDates().length;
  const getConflictDates = () => {
    if (!searchTopForm.startDate || !searchTopForm.endDate) return [];
    const s = new Date(searchTopForm.startDate);
    const e = new Date(searchTopForm.endDate);
    if (s > e) return [];
    const out: string[] = [];
    const cur = new Date(s);
    while (cur <= e) {
      const d = toLocalDateStr(cur);
      const slots = getDateSlots(d);
      if (slots.length && slots.every(s => s.status !== "AVAILABLE")) out.push(d);
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  };
  const isMdPickRangeAvailable = () => {
    if (!searchTopForm.startDate || !searchTopForm.endDate) return false;
    const s = new Date(searchTopForm.startDate);
    const e = new Date(searchTopForm.endDate);
    if (s > e) return false;
    const cur = new Date(s);
    while (cur <= e) {
      const d = toLocalDateStr(cur);
      if (!isMdPickAvailable(d)) return false;
      cur.setDate(cur.getDate() + 1);
    }
    return true;
  };

  const { uploadedFiles, uploadFile, removeFile } = useFileUpload();

  const handleTypeChange = (type: 'mainBanner' | 'searchTop') => {
    setSelectedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleMainBannerChange = (field: 'date' | 'rank', value: string) => {
    if (field === 'date') {
      setCurrentSelection(prev => ({
        ...prev,
        date: value,
        rank: ''
      }));
    } else if (field === 'rank') {
      setCurrentSelection(prev => ({
        ...prev,
        rank: value
      }));
    }
  };

  const addSelection = () => {
    if (currentSelection.date && currentSelection.rank) {
      // 이미 같은 날짜에 다른 순위가 선택되어 있는지 확인
      const existingIndex = mainBannerForm.findIndex(item => item.date === currentSelection.date);

      if (existingIndex !== -1) {
        // 기존 선택을 업데이트
        const updatedForm = [...mainBannerForm];
        updatedForm[existingIndex] = { ...currentSelection };
        setMainBannerForm(updatedForm);
      } else {
        // 새로운 선택 추가
        setMainBannerForm(prev => [...prev, { ...currentSelection }]);
      }

      // 재고 상태를 'reserved'로 변경
      setInventoryStatus(prev => ({
        ...prev,
        [currentSelection.date]: {
          ...prev[currentSelection.date],
          [currentSelection.rank]: 'reserved'
        }
      }));

      // 현재 선택 초기화
      setCurrentSelection({ date: '', rank: '' });
    }
  };

  const removeSelection = (date: string) => {
    const removedItem = mainBannerForm.find(item => item.date === date);
    if (removedItem) {
      // 재고 상태를 다시 'available'로 변경
      setInventoryStatus(prev => ({
        ...prev,
        [date]: {
          ...prev[date],
          [removedItem.rank]: 'available'
        }
      }));
    }

    setMainBannerForm(prev => prev.filter(item => item.date !== date));
  };

  const handleSearchTopChange = (field: 'startDate' | 'endDate', value: string) => {
    setSearchTopForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (file: File, usage: string) => {
    if (!file) return;
    await uploadFile(file, usage);
  };

  // handleSubmit 전체
  const handleSubmit = async () => {
    try {
      // 1) MD PICK(SEARCH_TOP)만 처리
      if (selectedTypes.searchTop && searchTopForm.startDate && searchTopForm.endDate) {
  const dates = getAvailableDates();
  if (!dates.length) {
    alert("선택한 기간에 신청 가능한 날짜가 없습니다.");
    return;
  }

  // 이미지 URL(필수) 준비: 업로드한 md_pick 파일 사용
  const mdPickFile = uploadedFiles.get?.('md_pick') ?? null; // useFileUpload가 Map 기반이라고 가정
  if (!mdPickFile) {
    alert("MD PICK 이미지를 업로드해주세요.");
    return;
  }
  if (!mdPickMeta.eventId) {
    alert("MD PICK: 이벤트 ID를 입력해주세요.");
    return;
  }

  const mdPickImageUrl =
    `${import.meta.env.VITE_BACKEND_BASE_URL ?? window.location.origin}${mdPickFile.url}`;

  // ❗ DTO는 date 필드명 사용 (slotDate 아님)
  const items = dates
    .map(d => {
      const chosen = chooseSlotForDate(d);
      return chosen ? { date: d, priority: chosen.priority } : null;
    })
    .filter(Boolean) as { date: string; priority: number }[];

  if (!items.length) {
    alert("신청 가능한 날짜가 없습니다.");
    return;
  }

  const appId = await createApplication({
    eventId: Number(mdPickMeta.eventId),
    bannerType: "SEARCH_TOP",
    title: mdPickMeta.title || "MD PICK 광고",
    imageUrl: mdPickImageUrl,                  // DTO상 필수 + URL 형식
    linkUrl: mdPickMeta.linkUrl || undefined,  // 빈 문자열 보내지 말 것
    items,
    // lockMinutes: 2880,
  });

        alert(`MD PICK 신청이 접수되었습니다. 신청번호: ${appId}`);

      }

      // 2) 메인 배너(HERO)만 처리
      if (selectedTypes.mainBanner && mainBannerForm.length > 0) {
        const uploaded = Array.from(uploadedFiles.values())[0];
        if (!uploaded) {
          alert("메인 배너 이미지를 업로드해주세요.");
          return;
        }
        if (!heroMeta.eventId || !heroMeta.title) {
          alert("이벤트 ID와 제목을 입력해주세요.");
          return;
        }

        const imageUrl =
          `${import.meta.env.VITE_BACKEND_BASE_URL ?? window.location.origin}${uploaded.url}`;

        const items = mainBannerForm.map(({ date, rank }) => ({
          date,
          priority: Number(rank),
        }));

        const appId = await createApplication({
          eventId: Number(heroMeta.eventId),
          bannerType: "HERO",
          title: heroMeta.title,
          imageUrl,
          linkUrl: heroMeta.linkUrl || undefined,
          items,
          // lockMinutes: 2880,
        });

        alert(`메인 배너 신청이 접수되었습니다. 신청번호: ${appId}`);
      }

      // 둘 중 하나라도 성공했으면 목록으로 이동
      if (selectedTypes.mainBanner || selectedTypes.searchTop) {
        navigate("/admin_dashboard/advertisement-applications");
      }
    } catch (e) {
      console.error(e);
      alert("신청 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };


  // 선택 가능한 날짜 계산
  const getToday = () => toLocalDateStr(new Date());


  // 달력 날짜 생성 함수
  const generateCalendarDays = () => {
    const year = currentCalendarYear;
    const month = currentCalendarMonth;
    const firstDay = new Date(year, month - 1, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      days.push({
        date: date.getDate(),
        dateString: toLocalDateStr(date),
        isCurrentMonth: date.getMonth() === month - 1
      });
    }
    return days;
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-[1256px] min-h-screen relative">
        <TopNav />

        {/* 페이지 제목 */}
        <div
          className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
          광고 신청
        </div>

        {/* 광고 타입 선택 안내 */}
        <div
          className="top-[195px] left-64 text-sm text-gray-600 absolute tracking-[0] leading-[20px] whitespace-nowrap">
          신청할 타입을 체크해주세요.
        </div>

        {/* 사이드바 */}
        <HostSideNav className="!absolute !left-0 !top-[117px]" />

        {/* 메인 콘텐츠 */}
        <div className="absolute left-64 top-[220px] w-[949px] pb-20">
          <div className="space-y-8">
            {/* 메인 배너 광고 섹션 */}
            <div className="bg-white rounded-lg shadow-md p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="mainBanner"
                    checked={selectedTypes.mainBanner}
                    onChange={() => handleTypeChange('mainBanner')}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="mainBanner" className="text-lg font-semibold text-gray-800">
                    메인 배너
                  </label>
                </div>
              </div>

              <p className="text-gray-600 mb-4">메인 페이지 최상단에 등록됩니다.</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 예시 이미지 및 권장 크기 */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">예시</h4>
                  <img
                    src="/images/ex1.png"
                    alt="메인 배너 예시"
                    className="w-full h-64 object-contain rounded"
                  />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">권장 크기: 1920 x 400px</p>
                    <p className="text-xs text-gray-500 mt-1">웹/모바일 반응형 대응</p>
                  </div>

                  {/* [추가] 메인 배너 신청 메타 정보 입력 */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-sm text-gray-700">이벤트 ID</label>
                    <input
                      type="number"
                      value={heroMeta.eventId}
                      onChange={(e) => setHeroMeta(v => ({ ...v, eventId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 123"
                    />
                    <label className="block text-sm text-gray-700 mt-3">배너 제목</label>
                    <input
                      type="text"
                      value={heroMeta.title}
                      onChange={(e) => setHeroMeta(v => ({ ...v, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="노출될 제목"
                    />
                    <label className="block text-sm text-gray-700 mt-3">링크 URL (선택)</label>
                    <input
                      type="url"
                      value={heroMeta.linkUrl}
                      onChange={(e) => setHeroMeta(v => ({ ...v, linkUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>



              {/* 이미지 업로드 폼 */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">광고 이미지 업로드</h4>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors relative h-64 flex items-center justify-center"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                    const files = e.dataTransfer.files;
                    if (files && files[0] && files[0].type.startsWith('image/')) {
                      handleImageUpload(files[0], 'main_banner');
                    }
                  }}
                >
                  {uploadedFiles.size > 0 ? (
                    <div className="space-y-2">
                      {Array.from(uploadedFiles.values()).map((file, index) => (
                        <div key={index}>
                          <img
                            src={file.url}
                            alt="광고 이미지 미리보기"
                            className="mx-auto max-h-48 max-w-full object-contain rounded"
                          />
                          <p className="text-xs text-green-600">✓ {file.name}</p>
                          <div className="text-sm text-gray-600 space-x-2">
                            <label htmlFor="mainBannerImage" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                              <span>이미지 변경</span>
                              <input
                                id="mainBannerImage"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(file, 'main_banner');
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => removeFile('main_banner')}
                              className="text-red-600 hover:text-red-500"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <label htmlFor="mainBannerImage" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>이미지 업로드</span>
                          <input
                            id="mainBannerImage"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, 'main_banner');
                            }}
                          />
                        </label>
                        <p className="pl-1">또는 드래그 앤 드롭</p>
                      </div>
                      <p className="text-xs text-gray-500">이미지 파일 (PNG, JPG, GIF) 최대 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>


            {/* 선택사항 - 이벤트 디테일 페이지와 정확히 동일한 스타일 */}
            <div className="mt-8 border border-gray-200 rounded-lg">
              <div className="p-6">
                <h3 className="text-[20.3px] font-semibold text-[#212121] mb-6">
                  날짜 및 순위 선택
                </h3>

                <div className="flex gap-6">
                  {/* 좌측: 달력 - 30% */}
                  <div className="w-[30%]">
                    <h4 className="text-base font-medium text-gray-900 mb-4">날짜 선택</h4>

                    {/* 달력 헤더 */}
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-medium text-gray-900">
                        {currentCalendarYear}년 {currentCalendarMonth}월
                      </h5>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            if (currentCalendarMonth === 1) {
                              setCurrentCalendarMonth(12);
                              setCurrentCalendarYear(currentCalendarYear - 1);
                            } else {
                              setCurrentCalendarMonth(currentCalendarMonth - 1);
                            }
                          }}
                          className="p-1 hover:bg-gray-200 rounded text-xs"
                        >
                          ◀
                        </button>
                        <button
                          onClick={() => {
                            if (currentCalendarMonth === 12) {
                              setCurrentCalendarMonth(1);
                              setCurrentCalendarYear(currentCalendarYear + 1);
                            } else {
                              setCurrentCalendarMonth(currentCalendarMonth + 1);
                            }
                          }}
                          className="p-1 hover:bg-gray-200 rounded text-xs"
                        >
                          ▶
                        </button>
                      </div>
                    </div>

                    {/* 요일 헤더 */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                        <div key={day} className={`p-1 text-xs font-medium text-center ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
                          }`}>
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* 달력 날짜 그리드 */}
                    <div className="grid grid-cols-7 gap-1">
                      {generateCalendarDays().map((day, index) => {
                        const isEventDate = day.date <= 31; // 예시 달력 범위
                        const isSelected = mainBannerForm.some(item => item.date === day.dateString);
                        const isCurrentMonth = day.isCurrentMonth;
                        const isBookable = isEventDate && day.dateString >= getToday();
const isPastDate = day.dateString < getToday();

                        return (
                          <button
                            key={index}
                            onClick={() => isBookable ? handleMainBannerChange('date', day.dateString) : null}
                            disabled={!isBookable || !isCurrentMonth}
                            className={`p-1.5 text-xs rounded transition-colors relative h-8 ${!isCurrentMonth
                              ? 'text-gray-300 cursor-not-allowed'
                              : isSelected && isEventDate
                                ? 'bg-blue-600 text-white'
                                : isEventDate && isBookable
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'
                                  : isEventDate && isPastDate
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'text-gray-400 cursor-not-allowed'
                              }`}
                          >
                            {day.date}
                            {isEventDate && isCurrentMonth && (
                              <div className={`absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${isBookable ? 'bg-green-600' : 'bg-gray-400'
                                }`}></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 중앙: 순위 목록 - 40% */}
                  <div className="w-[40%]">
                    <h4 className="text-base font-medium text-gray-900 mb-4">
                      순위 선택 {currentSelection.date && `(${currentSelection.date})`}
                    </h4>

                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((rank) => {
                        const isSelected = currentSelection.rank === rank.toString();
                        const isAvailable = currentSelection.date ? isRankAvailable(currentSelection.date, rank.toString()) : false;
                        const statusText = currentSelection.date ? getInventoryStatusText(currentSelection.date, rank.toString()) : '구매가능';
                        const statusClass = currentSelection.date ? getInventoryStatusClass(currentSelection.date, rank.toString()) : 'bg-green-100 text-green-800';

                        // 순위별 가격 설정 (1순위가 가장 비싸고 순위가 낮을수록 할인)
                        const getPrice = (rank: number) => {
                          switch (rank) {
                            case 1: return "2,500,000원";
                            case 2: return "2,200,000원";
                            case 3: return "2,000,000원";
                            case 4: return "1,800,000원";
                            case 5: return "1,600,000원";
                            case 6: return "1,400,000원";
                            case 7: return "1,200,000원";
                            case 8: return "1,000,000원";
                            case 9: return "800,000원";
                            case 10: return "600,000원";
                            default: return "600,000원";
                          }
                        };

                        return (
                          <div
                            key={rank}
                            className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${isSelected && isAvailable
                              ? 'border-blue-500 bg-blue-50 cursor-pointer'
                              : isAvailable
                                ? 'border-gray-200 hover:bg-gray-50 cursor-pointer'
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                              }`}
                            onClick={() => isAvailable ? handleMainBannerChange('rank', rank.toString()) : null}
                          >
                            <div className="flex flex-col">
                              <span className={`text-sm font-semibold ${isAvailable ? 'text-[#212121]' : 'text-gray-500'
                                }`}>
                                {rank}순위
                              </span>
                              <span className={`text-xs ${isAvailable ? 'text-gray-500' : 'text-gray-400'
                                }`}>
                                {rank === 1 ? '최우선 노출' : rank <= 3 ? '우선 노출' : '일반 노출'}
                              </span>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <span className={`text-xs px-2 py-1 rounded font-medium ${statusClass}`}>
                                {statusText}
                              </span>
                              <span className={`text-xs ${isAvailable ? 'text-green-600' : 'text-gray-400'
                                }`}>
                                {getPrice(rank)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 우측: 선택된 상품 정보 - 30% */}
                  <div className="w-[30%]">
                    <h4 className="text-base font-medium text-gray-900 mb-4">선택된 상품</h4>

                    <div className="space-y-3">
                      {/* 현재 선택 정보 */}
                      {currentSelection.date && currentSelection.rank ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h5 className="text-sm font-medium text-blue-900 mb-2">현재 선택</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-blue-700">노출 날짜:</span>
                              <span className="text-sm font-medium">{currentSelection.date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-blue-700">순위:</span>
                              <span className="text-sm font-medium">{currentSelection.rank}순위</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-blue-700">가격:</span>
                              <span className="text-sm font-medium text-green-600">
                                {(() => {
                                  const rank = parseInt(currentSelection.rank);
                                  switch (rank) {
                                    case 1: return "2,500,000원";
                                    case 2: return "2,200,000원";
                                    case 3: return "2,000,000원";
                                    case 4: return "1,800,000원";
                                    case 5: return "1,600,000원";
                                    case 6: return "1,400,000원";
                                    case 7: return "1,200,000원";
                                    case 8: return "1,000,000원";
                                    case 9: return "800,000원";
                                    case 10: return "600,000원";
                                    default: return "600,000원";
                                  }
                                })()}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={addSelection}
                            className="w-full mt-3 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                          >
                            선택 추가
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                          {currentSelection.date ? (
                            <div>
                              <p className="text-sm mb-1">순위를 선택해주세요</p>
                              <p className="text-xs text-gray-400">중앙에서 순위를 선택하세요</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm mb-1">날짜를 선택해주세요</p>
                              <p className="text-xs text-gray-400">왼쪽에서 날짜를 선택하세요</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 선택된 상품 목록 */}
                      {mainBannerForm.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-900">선택된 광고 목록</h5>
                          {mainBannerForm.map((item, index) => (
                            <div key={index} className="bg-white border rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <h6 className="text-sm font-medium text-gray-900">메인 배너 광고</h6>
                                <button
                                  onClick={() => removeSelection(item.date)}
                                  className="text-red-500 hover:text-red-700 text-xs"
                                >
                                  삭제
                                </button>
                              </div>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">노출 날짜:</span>
                                  <span className="font-medium">{item.date}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">순위:</span>
                                  <span className="font-medium">{item.rank}순위</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">가격:</span>
                                  <span className="font-medium text-green-600">
                                    {(() => {
                                      const rank = parseInt(item.rank);
                                      switch (rank) {
                                        case 1: return "2,500,000원";
                                        case 2: return "2,200,000원";
                                        case 3: return "2,000,000원";
                                        case 4: return "1,800,000원";
                                        case 5: return "1,600,000원";
                                        case 6: return "1,400,000원";
                                        case 7: return "1,200,000원";
                                        case 8: return "1,000,000원";
                                        case 9: return "800,000원";
                                        case 10: return "600,000원";
                                        default: return "600,000원";
                                      }
                                    })()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">재고:</span>
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">
                                    예약됨
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* 총액 계산 */}
                          <div className="bg-gray-50 rounded-lg p-3 border-t">
                            <div className="flex justify-between">
                              <span className="text-sm font-semibold">총액:</span>
                              <span className="text-lg font-bold text-green-600">
                                {(() => {
                                  const total = mainBannerForm.reduce((sum, item) => {
                                    const rank = parseInt(item.rank);
                                    let price = 0;
                                    switch (rank) {
                                      case 1: price = 2500000; break;
                                      case 2: price = 2200000; break;
                                      case 3: price = 2000000; break;
                                      case 4: price = 1800000; break;
                                      case 5: price = 1600000; break;
                                      case 6: price = 1400000; break;
                                      case 7: price = 1200000; break;
                                      case 8: price = 1000000; break;
                                      case 9: price = 800000; break;
                                      case 10: price = 600000; break;
                                      default: price = 600000;
                                    }
                                    return sum + price;
                                  }, 0);
                                  return total.toLocaleString() + '원';
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 검색 상단 고정 광고 섹션 */}
          <div className="bg-white rounded-lg shadow-md p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="searchTop"
                  checked={selectedTypes.searchTop}
                  onChange={() => handleTypeChange('searchTop')}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="searchTop" className="text-lg font-semibold text-gray-800">
                  검색 상단 고정 (MD PICK)
                </label>
              </div>
            </div>

            <p className="text-gray-600 mb-4">
              메인화면 EVENTS 섹션과 이벤트오버뷰 페이지의 행사목록 최상단에 MD PICK 스티커와 함께 우선노출됩니다.<br></br>
              <span className="font-semibold text-red-600">최대 2개 행사만 동시 노출 가능</span>합니다.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 예시 이미지 및 가격 */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">예시</h4>
                <img
                  src="/images/ex2.png"
                  alt="검색 상단 고정 예시"
                  className="w-full h-64 object-contain rounded"
                />
                <div className="text-sm text-gray-600">
                  <p className="font-medium">MD PICK 스티커가 부착되어 최상단에 노출</p>
                  <p className="text-xs text-gray-500 mt-1">1번, 2번 순서로 우선 노출</p>
                </div>
              </div>

              {/* 날짜 선택 및 상태 확인 */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">노출 기간 설정</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      노출 시작일
                    </label>
                    <input
                      type="date"
                      min={getToday()}
                      value={searchTopForm.startDate}
                      onChange={(e) => handleSearchTopChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      노출 종료일
                    </label>
                    <input
                      type="date"
                      min={searchTopForm.startDate || getToday()}
                      value={searchTopForm.endDate}
                      onChange={(e) => handleSearchTopChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
<div className="space-y-2 pt-2">
  <label className="block text-sm text-gray-700">이벤트 ID</label>
  <input
    type="number"
    value={mdPickMeta.eventId}
    onChange={(e) => setMdPickMeta(v => ({ ...v, eventId: e.target.value }))}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="예: 456"
  />
</div>

<div className="space-y-4 mt-4">
  <h4 className="font-semibold text-gray-800">MD PICK 이미지 업로드</h4>
  <div
    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors relative h-64 flex items-center justify-center"
    onDragOver={(e) => {
      e.preventDefault();
      e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
    }}
    onDragLeave={(e) => {
      e.preventDefault();
      e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
    }}
    onDrop={(e) => {
      e.preventDefault();
      e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
      const files = e.dataTransfer.files;
      if (files && files[0] && files[0].type.startsWith('image/')) {
        handleImageUpload(files[0], 'md_pick');
      }
    }}
  >
    {(() => {
      const file = uploadedFiles.get?.('md_pick') ?? null;
      return file ? (
        <div className="space-y-2">
          <img
            src={file.url}
            alt="MD PICK 이미지 미리보기"
            className="mx-auto max-h-48 max-w-full object-contain rounded"
          />
          <p className="text-xs text-green-600">✓ {file.name}</p>
          <div className="text-sm text-gray-600 space-x-2">
            <label htmlFor="mdPickImage" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
              <span>이미지 변경</span>
              <input
                id="mdPickImage"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(f, 'md_pick');
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => removeFile('md_pick')}
              className="text-red-600 hover:text-red-500"
            >
              삭제
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="text-sm text-gray-600">
            <label htmlFor="mdPickImage" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
              <span>이미지 업로드</span>
              <input
                id="mdPickImage"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(f, 'md_pick');
                }}
              />
            </label>
            <p className="pl-1">또는 드래그 앤 드롭</p>
          </div>
          <p className="text-xs text-gray-500">이미지 파일 (PNG, JPG, GIF) 최대 5MB</p>
        </div>
      );
    })()}
  </div>
</div>

                {/* MD PICK 상태 확인 */}
                {searchTopForm.startDate && searchTopForm.endDate && (
                  <div className="mt-4 p-4 border rounded-lg">
                    <h5 className="text-sm font-medium text-gray-800 mb-3">선택 기간 MD PICK 상태</h5>

                    {/* 충돌 날짜가 있는 경우 경고 표시 */}
                    {!isMdPickRangeAvailable() && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium text-red-800">신청 불가능한 날짜가 포함되어 있습니다</span>
                        </div>
                        <div className="mt-2 text-xs text-red-700">
                          <p>다음 날짜에 이미 2개의 MD PICK 광고가 있습니다:</p>
                          <div className="mt-1 space-y-1">
                            {getConflictDates().map((date, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span>{date}</span>
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                  매진
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 선택 가능한 경우 성공 표시 */}
                    {isMdPickRangeAvailable() && (
                      <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium text-green-800">선택한 기간에 신청 가능합니다</span>
                        </div>
                        <div className="mt-2 text-xs text-green-700">
                          <p>해당 기간에 MD PICK 광고 신청이 가능합니다.</p>
                        </div>
                      </div>
                    )}

                    {/* 날짜별 상세 상태 */}
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {(() => {
                        if (!searchTopForm.startDate || !searchTopForm.endDate) return null;

                        const startDate = new Date(searchTopForm.startDate);
                        const endDate = new Date(searchTopForm.endDate);
                        const dates = [];

                        if (startDate > endDate) return null;

                        const currentDate = new Date(startDate);
                        while (currentDate <= endDate) {
                          const dateString = toLocalDateStr(currentDate);
                          dates.push(dateString);
                          currentDate.setDate(currentDate.getDate() + 1);
                        }

                        return dates.map((date, index) => {
                          const statusText = getMdPickStatusText(date);
                          const statusClass = getMdPickStatusClass(date);
                          const totalSlots = getDateSlots(date).length || 2; // 서버가 주는 슬롯 수, 없으면 2로 표기
                          const booked = getBookedCount(date);
                          return (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">{date}</span>
                              <span className={`px-2 py-1 rounded font-medium ${statusClass}`}>
                                {statusText}
                              </span>
                              {totalSlots > 0 && (
                                <span className="text-xs text-gray-500">({booked}/{totalSlots})</span>

                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {/* 가격 정보 */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-right space-y-2">
                    <p className="text-lg font-medium text-gray-700">가격: 500,000원 / 일</p>
                    {searchTopForm.startDate && searchTopForm.endDate && (
                      <div className={`border rounded-lg p-3 ${isMdPickRangeAvailable()
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-red-50 border-red-200'
                        }`}>
                        <div className={`text-sm space-y-1 ${isMdPickRangeAvailable() ? 'text-blue-800' : 'text-red-800'
                          }`}>
                          <div className="flex justify-between">
                            <span>전체 선택 기간:</span>
                            <span className="font-medium">{getSearchTopDays()}일</span>
                          </div>
                          <div className="flex justify-between">
                            <span>실제 신청 가능:</span>
                            <span className="font-medium">{getAvailableDays()}일</span>
                          </div>
                          <div className="flex justify-between">
                            <span>시작일:</span>
                            <span className="font-medium">{searchTopForm.startDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>종료일:</span>
                            <span className="font-medium">{searchTopForm.endDate}</span>
                          </div>
                        </div>
                        <div className={`border-t mt-2 pt-2 ${isMdPickRangeAvailable() ? 'border-blue-200' : 'border-red-200'
                          }`}>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold">총 금액:</span>
                            <span className={`text-xl font-bold ${isMdPickRangeAvailable() ? 'text-green-600' : 'text-red-600'
                              }`}>
                              {calculateSearchTopPrice().toLocaleString()}원
                            </span>
                          </div>
                        </div>
                        {/* 신청 가능한 날짜 목록 */}
                        {getAvailableDays() > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-600">
                              <p className="mb-2">신청 가능한 날짜:</p>
                              <div className="flex flex-wrap gap-1">
                                {getAvailableDates().map((date, index) => (
                                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                    {date}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 신청하기 버튼 */}
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              신청 후 승인이 완료되면 1~2일 내에 결제 요청 메일이 전송됩니다.
            </p>
            <button
              onClick={handleSubmit}
              disabled={!selectedTypes.mainBanner && !selectedTypes.searchTop}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              신청하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertisementApplication;