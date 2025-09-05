import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import api from "../../api/axios";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";

// 상태코드 변환
const mapStatus = (statusCode: string) => {
  switch (statusCode) {
    case "ACTIVE": return "active";
    case "INACTIVE": return "inactive";
    case "EXPIRED": return "expired";
    default: return "inactive"; // fallback
  }
};

// 타입 매핑
const TYPE_IDS = {
  hero: 1,
  mdpick: 2,
  searchTop: 3,
  new: 4,
} as const;

const mapType = (id: number) => {
  const entry = Object.entries(TYPE_IDS).find(([_, val]) => val === id);
  return entry ? entry[0] : "unknown";
};

// 배너 데이터 인터페이스
interface BannerData {
    id: string;
    eventTitle: string;
    hostName: string;
    imageUrl: string;
    startDate: string;
    endDate: string;
    rank: number;
    status: 'active' | 'inactive' | 'expired';
    type: 'hero' | 'mdpick';
}

// MD PICK 데이터 인터페이스
interface MdPickData {
    id: string;
    eventTitle: string;
    hostName: string;
    imageUrl: string;         
    date: string;
    priority: number;
    status: 'active' | 'inactive';
}

// 백엔드 DTO (관리자 배너 응답)
type AdminBanner = {
  id: number;
  title: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  priority: number | null;
  startDate: string; // ISO
  endDate: string; // ISO
  statusCode: "ACTIVE" | "INACTIVE" | "EXPIRED";
  bannerTypeCode: "HERO" | "HOT_PICK" | "HOT_PICK" | "NEW" | string;
  eventId?: number | null;
};




export const VipBannerManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [heroBanners, setHeroBanners] = useState<BannerData[]>([]);
    const [mdPickBanners, setMdPickBanners] = useState<MdPickData[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    // 대시보드 요약
type Summary = {
  totalSales: number | string;
  activeCount: number;
  recentCount: number;
  expiringCount: number;
};

// 요약 상태
const [summary, setSummary] = useState<Summary>({
  totalSales: 0,
  activeCount: 0,
  recentCount: 0,
  expiringCount: 0,
});




  // 추가 폼
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<{
    type: "hero" | "mdpick";
    eventId: string;
    title: string;
    startDate: string;
    endDate: string;
    imageUrl: string;
    priority?: string; // mdpick에서만 사용
  }>({
    type: "hero",
    eventId: "",
    title: "",
    startDate: "",
    endDate: "",
    imageUrl: "",
    priority: "",
  });

  // ---------- helpers ----------
  const priorityBadgeClass = (p: number) =>
  p === 1 ? "bg-red-100 text-red-800" :
  p === 2 ? "bg-orange-100 text-orange-800" :
  p === 3 ? "bg-yellow-100 text-yellow-800" :
            "bg-blue-100 text-blue-800";

  const mapToUI = (b: AdminBanner): BannerData => ({
    id: String(b.id),
    eventTitle: b.title ?? "",
    hostName: "", // 필요 시 BE 확장
    imageUrl: b.imageUrl ?? "",
    startDate: dayjs(b.startDate).format("YYYY-MM-DD"),
    endDate: dayjs(b.endDate).format("YYYY-MM-DD"),
    rank: b.priority ?? 0,
    status:
      b.statusCode === "ACTIVE"
        ? "active"
        : b.statusCode === "INACTIVE"
        ? "inactive"
        : "expired",
    type: b.bannerTypeCode === "HERO" ? "hero" 
    : b.bannerTypeCode === "SEARCH_TOP" ? "mdpick"
      : "mdpick",
  });

  const mapToMdPickUI = (b: AdminBanner): MdPickData => ({
    id: String(b.id),
    eventTitle: b.title ?? "",
    hostName: "",
    imageUrl: b.imageUrl ?? "",        
    date: dayjs(b.startDate).format("YYYY-MM-DD"), // 1일 노출 가정
    priority: b.priority ?? 0,
    status: b.statusCode === "ACTIVE" ? "active" : "inactive",
  });

  // KRW 포맷 유틸
const formatKRW = (n: number | string) =>
  typeof n === "number"
    ? new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(n)
    : n; // 서버가 문자열로 주면 그대로 표시


  // ---------- API ----------
  const fetchSummary = async () => {
    const { data } = await api.get<Summary>("/api/admin/banners/summary", {
      params: { expiringDays: 7 },
    });
    setSummary(data);
  };

 const fetchVip = async (startDateFilter?: string, endDateFilter?: string) => {
  // 날짜 문자열을 LocalDateTime 형식으로 변환
  const fromParam = startDateFilter ? `${startDateFilter}T00:00:00` : undefined;
  const toParam = endDateFilter ? `${endDateFilter}T23:59:59` : undefined;
  
  // HERO
  const hero = await api.get<AdminBanner[]>("/api/admin/banners/vip", {
    params: { 
      type: "HERO",
      from: fromParam,
      to: toParam
    },
  });
  setHeroBanners(hero.data.map(mapToUI));

  // MD PICK (= 검색 상단 고정)
  const md = await api.get<AdminBanner[]>("/api/admin/banners/vip", {
    params: { 
      type: "SEARCH_TOP",
      from: fromParam,
      to: toParam
    },
  });
  setMdPickBanners(
    md.data
      .filter(b => b.bannerTypeCode === "SEARCH_TOP")
      .map(mapToMdPickUI)
  );
};

  const applyDateFilter = () => {
    fetchVip(startDate, endDate);
  };

  const resetDateFilter = () => {
    const today = new Date().toISOString().split('T')[0];
    const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(weekLater);
    fetchVip();
  };



   const createBanner = async () => {
  const bannerTypeCode = addForm.type === "hero" ? "HERO" : "SEARCH_TOP";

  const payload = {
    eventId: Number(addForm.eventId),
    title: addForm.title || null,
    startDate: dayjs(addForm.startDate).startOf("day").toISOString(),
    endDate: dayjs(addForm.endDate).endOf("day").toISOString(),
    imageUrl: addForm.imageUrl || null,
    priority:
      bannerTypeCode === "SEARCH_TOP" && addForm.priority
        ? Number(addForm.priority)
        : null,
    statusCode: "ACTIVE",
    bannerTypeCode, // 백엔드와 필드/값 통일
  };

  try {
    await api.post("/api/admin/banners", payload);
    await fetchVip();
    setShowAdd(false);
    setAddForm({
      type: "hero",
      eventId: "",
      title: "",
      startDate: "",
      endDate: "",
      imageUrl: "",
      priority: "",
    });
  } catch (err: any) {
    console.error("createBanner error:", err?.response?.data || err);
    alert(`[${err?.response?.status ?? ""}] ${err?.response?.data?.message ?? "요청 실패"}`);
  }
};

 

  const activateBanner = async (id: string) => {
  try {
    await api.patch(`/api/admin/banners/${id}/status`, {
      statusCode: "ACTIVE"
    });
    
    // 성공 시 배너 목록 새로고침
    await fetchVip();
    alert('배너가 성공적으로 활성화되었습니다.');
  } catch (err: any) {
    console.error("activateBanner error:", err?.response?.data || err);
    alert(`배너 활성화 실패: ${err?.response?.data?.message ?? "요청 실패"}`);
  }
};

const deactivateBanner = async (id: string) => {
  try {
    await api.patch(`/api/admin/banners/${id}/status`, {
      statusCode: "INACTIVE"
    });
    
    // 성공 시 배너 목록 새로고침
    await fetchVip();
    alert('배너가 성공적으로 비활성화되었습니다.');
  } catch (err: any) {
    console.error("deactivateBanner error:", err?.response?.data || err);
    alert(`배너 비활성화 실패: ${err?.response?.data?.message ?? "요청 실패"}`);
  }
};

const deleteBanner = async (id: string, title: string) => {
  if (!confirm(`'${title}' 배너를 완전히 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없으며, 연결된 슬롯이 재사용 가능한 빈 슬롯으로 변경됩니다.`)) {
    return;
  }
  
  try {
    const response = await api.delete(`/api/admin/banners/${id}`);
    
    // 성공 시 배너 목록 새로고침
    await fetchVip();
    alert(response.data?.message || '배너가 완전히 삭제되었습니다.');
  } catch (err: any) {
    console.error("deleteBanner error:", err?.response?.data || err);
    alert(`배너 삭제 실패: ${err?.response?.data?.message ?? "요청 실패"}`);
  }
};


useEffect(() => {
  (async () => {
    await Promise.all([fetchSummary(), fetchVip()]);
  })();
}, []);



    // 대시보드 컴포넌트
    const DashboardTab = () => (
        <div className="space-y-6">
            {/* 통계 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-blue-600">활성 배너</p>
      <p className="text-2xl font-bold text-blue-900">
        {heroBanners.filter(b => b.status === 'active').length +
         mdPickBanners.filter(b => b.status === 'active').length}
                              </p>

                        </div>
                    </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-green-600">MD PICK</p>
                            <p className="text-2xl font-bold text-green-900">{mdPickBanners.filter(b => b.status === 'active').length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-yellow-600">만료 예정</p>
<p className="text-2xl font-bold text-yellow-900">
  {summary.expiringCount}
</p>
                        </div>
                    </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-purple-600">이번 달 수익</p>
{/* 이번 달 수익 */}
<p className="text-2xl font-bold text-purple-900">
  {formatKRW(summary.totalSales)}
</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 현재 노출 중인 배너들 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">현재 노출 중인 배너</h3>
          <button
            className="px-3 py-2 text-sm rounded-md bg-black text-white"
            onClick={() => setShowAdd(v => !v)}
          >
            {showAdd ? "닫기" : "배너 추가"}
          </button>
        </div>

        {/* 날짜 필터 */}
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">시작 날짜:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">종료 날짜:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={applyDateFilter}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                필터 적용
              </button>
              <button
                onClick={resetDateFilter}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                초기화
              </button>
            </div>
          </div>
        </div>

        {/* 추가 폼 */}
        {showAdd && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-3 p-4 border rounded-md">
            <select
              className="border px-2 py-2 rounded"
              value={addForm.type}
              onChange={e => setAddForm(f => ({ ...f, type: e.target.value as "hero" | "mdpick" }))}
            >
              <option value="hero">HERO</option>
              <option value="mdpick">MD_PICK</option>
            </select>
            <input className="border px-2 py-2 rounded" placeholder="이벤트ID" value={addForm.eventId}
                   onChange={e => setAddForm(f => ({ ...f, eventId: e.target.value }))}/>
            <input className="border px-2 py-2 rounded" placeholder="제목" value={addForm.title}
                   onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))}/>
            <input type="date" className="border px-2 py-2 rounded" value={addForm.startDate}
                   onChange={e => setAddForm(f => ({ ...f, startDate: e.target.value }))}/>
            <input type="date" className="border px-2 py-2 rounded" value={addForm.endDate}
                   onChange={e => setAddForm(f => ({ ...f, endDate: e.target.value }))}/>
            <input className="border px-2 py-2 rounded" placeholder="이미지 URL" value={addForm.imageUrl}
                   onChange={e => setAddForm(f => ({ ...f, imageUrl: e.target.value }))}/>
            {addForm.type === "mdpick" && (
              <input className="border px-2 py-2 rounded md:col-span-2" placeholder="우선순위(숫자)" value={addForm.priority}
                     onChange={e => setAddForm(f => ({ ...f, priority: e.target.value }))}/>
            )}
            <div className="md:col-span-6 flex justify-end">
              <button className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white"
                      onClick={createBanner}>
                추가
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
            {/* 활성 배너들 먼저 표시 (날짜순 정렬) */}
            {mdPickBanners
  .filter(b => b.status === "active")
  .sort((a, b) => a.date.localeCompare(b.date) || a.priority - b.priority)
  .map((banner) => (
    <div
      key={`md-${banner.id}`}
      className="group flex items-center space-x-4 p-4 border rounded-lg hover:shadow-sm transition"
    >
      <img
        src={banner.imageUrl || "/images/placeholder.png"}
        alt={banner.eventTitle || "MD PICK"}
        className="w-16 h-12 object-cover rounded"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900 truncate">{banner.eventTitle}</h4>
          <span className="px-1.5 py-0.5 text-[10px] rounded bg-green-100 text-green-800">
            MD PICK
          </span>
        </div>
        {banner.hostName && (
          <p className="text-sm text-gray-600 truncate">{banner.hostName}</p>
        )}
        <p className="text-xs text-gray-500">노출 날짜: {banner.date}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityBadgeClass(banner.priority)}`}>
          {banner.priority}순위
        </span>
        {banner.status === 'active' ? (
          <button
            className="ml-1 px-2 py-1 text-xs rounded border bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
            onClick={() => deactivateBanner(banner.id)}
            aria-label={`${banner.eventTitle} 비활성화`}
          >
            비활성화
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              className="px-2 py-1 text-xs rounded border bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              onClick={() => activateBanner(banner.id)}
              aria-label={`${banner.eventTitle} 활성화`}
            >
              활성화
            </button>
            <button
              className="px-2 py-1 text-xs rounded border bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              onClick={() => deleteBanner(banner.id, banner.eventTitle)}
              aria-label={`${banner.eventTitle} 완전 삭제`}
            >
              완전삭제
            </button>
          </div>
        )}
      </div>
    </div>
))}

          {/* 비활성 MD PICK 배너들 표시 */}
          {mdPickBanners.filter(b => b.status === "inactive").length > 0 && (
            <>
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-600 mb-3">비활성 MD PICK 배너</h4>
                {mdPickBanners
                  .filter(b => b.status === "inactive")
                  .sort((a, b) => a.date.localeCompare(b.date) || a.priority - b.priority)
                  .map((banner) => (
                    <div
                      key={`md-inactive-${banner.id}`}
                      className="group flex items-center space-x-4 p-4 border rounded-lg hover:shadow-sm transition bg-gray-50 opacity-75"
                    >
                      <img
                        src={banner.imageUrl || "/images/placeholder.png"}
                        alt={banner.eventTitle || "MD PICK"}
                        className="w-16 h-12 object-cover rounded grayscale"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-700 truncate">{banner.eventTitle}</h4>
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-200 text-gray-600">
                            MD PICK (비활성)
                          </span>
                        </div>
                        {banner.hostName && (
                          <p className="text-sm text-gray-500 truncate">{banner.hostName}</p>
                        )}
                        <p className="text-xs text-gray-400">노출 날짜: {banner.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityBadgeClass(banner.priority)}`}>
                          {banner.priority}순위
                        </span>
                        <div className="flex gap-1">
                          <button
                            className="px-2 py-1 text-xs rounded border bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            onClick={() => activateBanner(banner.id)}
                            aria-label={`${banner.eventTitle} 활성화`}
                          >
                            활성화
                          </button>
                          <button
                            className="px-2 py-1 text-xs rounded border bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            onClick={() => deleteBanner(banner.id, banner.eventTitle)}
                            aria-label={`${banner.eventTitle} 완전 삭제`}
                          >
                            완전삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}

          {heroBanners
            .filter(b => b.status === "active")
            .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.rank - b.rank)
            .map((banner) => (
              <div key={banner.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <img src={banner.imageUrl} alt={banner.eventTitle} className="w-16 h-12 object-cover rounded" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{banner.eventTitle}</h4>
                  <p className="text-sm text-gray-600">{banner.hostName}</p>
                  <p className="text-xs text-gray-500">{banner.startDate} ~ {banner.endDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    banner.rank === 1 ? "bg-red-100 text-red-800" :
                    banner.rank === 2 ? "bg-orange-100 text-orange-800" :
                    banner.rank === 3 ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {banner.rank}순위
                  </span>
                  {banner.status === 'active' ? (
                    <button
                      className="ml-3 px-2 py-1 text-xs rounded border bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                      onClick={() => deactivateBanner(banner.id)}
                    >
                      비활성화
                    </button>
                  ) : (
                    <div className="flex gap-1 ml-3">
                      <button
                        className="px-2 py-1 text-xs rounded border bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        onClick={() => activateBanner(banner.id)}
                      >
                        활성화
                      </button>
                      <button
                        className="px-2 py-1 text-xs rounded border bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        onClick={() => deleteBanner(banner.id, banner.eventTitle)}
                      >
                        완전삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

          {/* 비활성 HERO 배너들 표시 */}
          {heroBanners.filter(b => b.status === "inactive").length > 0 && (
            <>
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-600 mb-3">비활성 HERO 배너</h4>
                {heroBanners
                  .filter(b => b.status === "inactive")
                  .map((banner) => (
                    <div key={`hero-inactive-${banner.id}`} className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50 opacity-75">
                      <img src={banner.imageUrl} alt={banner.eventTitle} className="w-16 h-12 object-cover rounded grayscale" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-700">{banner.eventTitle}</h4>
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-200 text-gray-600">
                            HERO (비활성)
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{banner.hostName}</p>
                        <p className="text-xs text-gray-400">{banner.startDate} ~ {banner.endDate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          banner.rank === 1 ? "bg-red-100 text-red-800" :
                          banner.rank === 2 ? "bg-orange-100 text-orange-800" :
                          banner.rank === 3 ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {banner.rank}순위
                        </span>
                        <div className="flex gap-1 ml-3">
                          <button
                            className="px-2 py-1 text-xs rounded border bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            onClick={() => activateBanner(banner.id)}
                          >
                            활성화
                          </button>
                          <button
                            className="px-2 py-1 text-xs rounded border bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            onClick={() => deleteBanner(banner.id, banner.eventTitle)}
                          >
                            완전삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );



    // 메인 배너 관리 컴포넌트
    const HeroBannerTab = () => (
        <div className="space-y-6">
            {/* 배너 스케줄 캘린더 */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">배너 스케줄 현황</h3>

                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-blue-800">선착순 결제 시스템</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                        호스트가 원하는 날짜의 원하는 순위를 먼저 결제한 사람이 해당 순위를 차지합니다.
                        관리자는 승인/반려만 가능하며 순위 조정은 불가능합니다.
                    </p>
                </div>

                {/* 날짜 필터 */}
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">시작 날짜:</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">종료 날짜:</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={applyDateFilter}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        필터 적용
                      </button>
                      <button
                        onClick={resetDateFilter}
                        className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      >
                        초기화
                      </button>
                    </div>
                  </div>
                </div>

                {/* 날짜 선택 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">스케줄 날짜 선택</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* 순위별 배너 표시 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((rank) => {
                        const banner = heroBanners.find(b =>
                            b.rank === rank &&
                            b.startDate <= selectedDate &&
                            b.endDate >= selectedDate
                        );

                        return (
                            <div key={rank} className={`border-2 rounded-lg p-4 ${banner ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                                }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`font-bold text-lg ${rank === 1 ? 'text-red-600' :
                                        rank === 2 ? 'text-orange-600' :
                                            rank === 3 ? 'text-yellow-600' :
                                                'text-gray-600'
                                        }`}>
                                        {rank}순위
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {rank === 1 ? '2,500,000원' :
                                            rank === 2 ? '2,200,000원' :
                                                rank === 3 ? '2,000,000원' :
                                                    rank === 4 ? '1,800,000원' :
                                                        rank === 5 ? '1,600,000원' :
                                                            rank === 6 ? '1,400,000원' :
                                                                rank === 7 ? '1,200,000원' :
                                                                    rank === 8 ? '1,000,000원' :
                                                                        rank === 9 ? '800,000원' :
                                                                            '600,000원'}
                                    </span>
                                </div>

                                {banner ? (
                                    <div className="space-y-2">
                                        <img src={banner.imageUrl} alt={banner.eventTitle} className="w-full h-20 object-cover rounded" />
                                        <h4 className="font-medium text-sm text-gray-900 truncate">{banner.eventTitle}</h4>
                                        <p className="text-xs text-gray-600">{banner.hostName}</p>
                                        <div className="text-xs text-gray-500">
                                            <div>노출 기간: {banner.startDate} ~ {banner.endDate}</div>
                                            <div className="mt-1">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${banner.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    banner.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {banner.status === 'active' ? '노출 중' : banner.status === 'inactive' ? '비활성' : '만료됨'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <p className="text-sm text-gray-500 mt-2">빈 슬롯</p>
                                        <p className="text-xs text-gray-400 mt-1">신청 대기 중</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 배너 목록 */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">전체 배너 현황</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이미지</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">행사명</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">호스트</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순위</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기간</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">결제 상태</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {heroBanners
                              .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.rank - b.rank)
                              .map((banner) => (
                                <tr key={banner.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <img src={banner.imageUrl} alt={banner.eventTitle} className="w-16 h-12 object-cover rounded" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{banner.eventTitle}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{banner.hostName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${banner.rank === 1 ? 'bg-red-100 text-red-800' :
                                            banner.rank === 2 ? 'bg-orange-100 text-orange-800' :
                                                banner.rank === 3 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-blue-100 text-blue-800'
                                            }`}>
                                            {banner.rank}순위
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{banner.startDate} ~ {banner.endDate}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${banner.status === 'active' ? 'bg-green-100 text-green-800' :
                                            banner.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {banner.status === 'active' ? '노출 중' : banner.status === 'inactive' ? '비활성' : '만료됨'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            결제 완료
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {banner.status === 'active' ? (
                                            <button
                                                className="px-2 py-1 text-xs rounded border bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                                                onClick={() => deactivateBanner(banner.id)}
                                            >
                                                비활성화
                                            </button>
                                        ) : (
                                            <div className="flex gap-1">
                                                <button
                                                    className="px-2 py-1 text-xs rounded border bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                                    onClick={() => activateBanner(banner.id)}
                                                >
                                                    활성화
                                                </button>
                                                <button
                                                    className="px-2 py-1 text-xs rounded border bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                                    onClick={() => deleteBanner(banner.id, banner.eventTitle)}
                                                >
                                                    완전삭제
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // MD PICK 관리 컴포넌트
    const MdPickTab = () => (
        <div className="space-y-6">
            {/* MD PICK 스케줄 뷰 */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">MD PICK 스케줄 현황</h3>

                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-green-800">선착순 결제 시스템</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                        호스트가 원하는 날짜를 먼저 결제한 사람이 해당 날짜를 차지합니다.
                        하루 최대 2개까지만 가능하며, 충돌이 발생하지 않습니다.
                    </p>
                </div>

                {/* 날짜 필터 */}
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">시작 날짜:</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">종료 날짜:</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={applyDateFilter}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        필터 적용
                      </button>
                      <button
                        onClick={resetDateFilter}
                        className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      >
                        초기화
                      </button>
                    </div>
                  </div>
                </div>

                {/* 날짜별 MD PICK 현황 */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">7일간 현황</label>
                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 7 }, (_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() + i);
                            const dateStr = date.toISOString().split('T')[0];
                            const dayBanners = mdPickBanners.filter(b => b.date === dateStr);

                            return (
                                <div key={i} className={`p-3 border rounded-lg text-center ${dayBanners.length >= 2 ? 'bg-red-50 border-red-200' :
                                    dayBanners.length === 1 ? 'bg-yellow-50 border-yellow-200' :
                                        'bg-green-50 border-green-200'
                                    }`}>
                                    <div className="text-xs text-gray-600 mb-1">
                                        {date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="text-sm font-medium">
                                        {dayBanners.length}/2
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {dayBanners.length >= 2 ? '매진' : dayBanners.length === 1 ? '1개 가능' : '신청 가능'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* MD PICK 목록 */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">현재 등록된 MD PICK (날짜순 정렬)</h4>
                    {mdPickBanners
                      .sort((a, b) => a.date.localeCompare(b.date) || a.priority - b.priority)
                      .map((banner) => (
                        <div key={banner.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${banner.priority === 1 ? 'bg-red-500' : 'bg-blue-500'
                                    }`}>
                                    {banner.priority}
                                </div>
                                <div>
                                    <h5 className="font-medium text-gray-900">{banner.eventTitle}</h5>
                                    <p className="text-sm text-gray-600">{banner.hostName}</p>
                                    <p className="text-xs text-gray-500">{banner.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    결제 완료
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 운영 현황 요약 */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">운영 현황 요약</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{mdPickBanners.length}</div>
                        <div className="text-sm text-blue-800">총 등록된 MD PICK</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">정상</div>
                        <div className="text-sm text-green-800">시스템 상태</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">0</div>
                        <div className="text-sm text-yellow-800">충돌 발생 건수</div>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">시스템 특징</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 선착순 결제로 충돌 발생 불가</li>
                        <li>• 하루 최대 2개 MD PICK 제한</li>
                        <li>• 자동 스케줄링으로 관리자 개입 불필요</li>
                        <li>• 실시간 가용성 확인 가능</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    VIP 배너 광고 관리
                </div>

                {/* 사이드바 */}
                <AdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                    {/* 탭 네비게이션 */}
                    <nav className="h-[40px] border-b border-neutral-200 relative mb-6" style={{ borderBottom: '1px solid #e5e5e5', marginBottom: '24px' }}>
                        <ul className="flex items-center h-full">
                            <li
                                className="h-full flex items-center px-2.5 cursor-pointer"
                                onClick={() => setActiveTab('dashboard')}
                            >
                                <span
                                    className={`
                                        relative text-base leading-[28px] font-['Roboto'] inline-block pb-1
                                        ${activeTab === 'dashboard'
                                            ? 'font-bold text-black after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-full after:bg-black content-[""]'
                                            : 'font-normal text-gray-600 hover:text-black'
                                        }
                                    `}
                                >
                                    대시보드
                                </span>
                            </li>
                            <li
                                className="h-full flex items-center px-2.5 cursor-pointer"
                                onClick={() => setActiveTab('hero')}
                            >
                                <span
                                    className={`
                                        relative text-base leading-[28px] font-['Roboto'] inline-block pb-1
                                        ${activeTab === 'hero'
                                            ? 'font-bold text-black after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-full after:bg-black content-[""]'
                                            : 'font-normal text-gray-600 hover:text-black'
                                        }
                                    `}
                                >
                                    메인 배너
                                </span>
                            </li>
                            <li
                                className="h-full flex items-center px-2.5 cursor-pointer"
                                onClick={() => setActiveTab('mdpick')}
                            >
                                <span
                                    className={`
                                        relative text-base leading-[28px] font-['Roboto'] inline-block pb-1
                                        ${activeTab === 'mdpick'
                                            ? 'font-bold text-black after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-full after:bg-black content-[""]'
                                            : 'font-normal text-gray-600 hover:text-black'
                                        }
                                    `}
                                >
                                    MD PICK
                                </span>
                            </li>
                        </ul>
                    </nav>

                    {/* 탭 콘텐츠 */}
                    <div className="bg-white rounded-lg shadow-md">
                        {activeTab === 'dashboard' && <DashboardTab />}
                        {activeTab === 'hero' && <HeroBannerTab />}
                        {activeTab === 'mdpick' && <MdPickTab />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VipBannerManagement;
