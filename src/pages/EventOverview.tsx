import {
    Calendar,
    ChevronDown,
    Heart,
} from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { TopNav } from "../components/TopNav";

export default function EventOverview() {
    const [selectedCategory, setSelectedCategory] = React.useState("all");
    const navigate = useNavigate();

    // Event data for mapping
    const categories = [
        { id: "all", name: "전체" },
        { id: "exhibition", name: "박람회" },
        { id: "performance", name: "공연" },
        { id: "seminar", name: "강연/세미나" },
        { id: "event", name: "전시/행사" },
        { id: "festival", name: "축제" },
    ];

    const events = [
        {
            id: 1,
            title: "2025 AI & 로봇 박람회",
            category: "박람회",
            date: "2025-08-15 ~ 2025-08-17",
            location: "코엑스 A홀",
            price: "15,000원 ~",
            image: "",
        },
        {
            id: 2,
            title: "서울 국제 도서전",
            category: "박람회",
            date: "2025-08-22 ~ 2025-08-25",
            location: "코엑스 B홀",
            price: "무료",
            image: "",
        },
        {
            id: 3,
            title: "BTS 월드투어 서울",
            category: "공연",
            date: "2025-08-28 ~ 2025-08-30",
            location: "올림픽공원",
            price: "120,000원 ~",
            image: "",
        },
        {
            id: 4,
            title: "블랙핑크 월드투어",
            category: "공연",
            date: "2025-09-01 ~ 2025-09-03",
            location: "고척스카이돔",
            price: "150,000원 ~",
            image: "",
        },
        {
            id: 5,
            title: "스타트업 투자 세미나",
            category: "강연/세미나",
            date: "2025-08-15",
            location: "강남구 컨벤션센터",
            price: "무료",
            image: "",
        },
        {
            id: 6,
            title: "AI 기술 컨퍼런스",
            category: "강연/세미나",
            date: "2025-09-10",
            location: "삼성동 코엑스",
            price: "80,000원 ~",
            image: "",
        },
        {
            id: 7,
            title: "현대미술 특별전",
            category: "전시/행사",
            date: "2025-09-05 ~ 2025-09-30",
            location: "국립현대미술관",
            price: "12,000원 ~",
            image: "",
        },
        {
            id: 8,
            title: "디자인 페어 서울",
            category: "전시/행사",
            date: "2025-09-10 ~ 2025-09-15",
            location: "예술의전당",
            price: "25,000원 ~",
            image: "",
        },
        {
            id: 9,
            title: "서울 국제 영화제",
            category: "축제",
            date: "2025-09-05 ~ 2025-09-15",
            location: "여의도 한강공원",
            price: "무료",
            image: "",
        },
        {
            id: 10,
            title: "서울 라이트 페스티벌",
            category: "축제",
            date: "2025-09-20 ~ 2025-09-25",
            location: "남산타워",
            price: "무료",
            image: "",
        },
    ];

    // 카테고리별 이벤트 필터링 함수
    const filteredEvents = events.filter(event => {
        if (selectedCategory === "all") {
            return true; // 전체 선택 시 모든 이벤트 표시
        }
        return event.category === categories.find(cat => cat.id === selectedCategory)?.name;
    });

    const footerLinks = [
        { name: "이용약관", href: "#" },
        { name: "개인정보처리방침", href: "#" },
        { name: "고객센터", href: "#" },
        { name: "회사소개", href: "#" },
    ];

    return (
        <div className="min-h-screen bg-white">
            <TopNav />

            <div className="flex justify-center w-full bg-white">
                <div className="w-full max-w-[1256px] relative">
                    {/* Category Navigation */}
                    <nav className="h-[40px] border-b border-neutral-200 relative mt-4" style={{ borderBottom: '1px solid #e5e5e5', marginBottom: '-1px' }}>
                        <ul className="flex items-center h-full">
                            {categories.map((category) => (
                                <li
                                    key={category.id}
                                    className="h-full flex items-center px-2.5 cursor-pointer"
                                    onClick={() => setSelectedCategory(category.id)}
                                >
                                    <span
                                        className={`
            relative text-base leading-[28px] font-['Roboto'] inline-block pb-1
            ${selectedCategory === category.id ? 'font-bold text-black after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-full after:bg-black content-[""]' : 'font-normal text-gray-600 hover:text-black'}
        `}
                                    >
                                        {category.name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* View Toggle and Filters */}
                    <div className="flex justify-between items-center mt-[30px] px-7">
                        {/* List/Calendar Toggle */}
                        <div className="border border-[#00000054] rounded-[10px] h-[45px] flex">
                            <button className="bg-black text-white rounded-[10px] h-full px-4 flex items-center gap-2">
                                <span className="text-sm font-bold">리스트형</span>
                            </button>
                            <button className="text-black h-full px-4 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm font-bold">캘린더형</span>
                            </button>
                        </div>

                        {/* Date Selector */}
                        <div className="flex items-center">
                            <button className="flex items-center gap-2 h-7 border border-gray-300 rounded px-3 py-1">
                                <Calendar className="h-5 w-5" />
                                <span className="text-base font-normal">2025년 7월 25일 (금)</span>
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="flex gap-3">
                            <select className="w-[100px] h-[41px] border-[#00000080] border rounded px-2 text-sm">
                                <option>카테고리</option>
                                <option value="all">전체</option>
                                <option value="exhibition">박람회</option>
                                <option value="performance">공연</option>
                                <option value="seminar">강연/세미나</option>
                                <option value="event">전시/행사</option>
                                <option value="festival">축제</option>
                            </select>

                            <select className="w-[104px] h-[41px] border-[#00000080] border rounded px-2 text-sm">
                                <option>전체 지역</option>
                                <option value="all">전체 지역</option>
                                <option value="seoul">서울</option>
                                <option value="busan">부산</option>
                                <option value="incheon">인천</option>
                            </select>
                        </div>
                    </div>

                    {/* Event Grid */}
                    <div className="grid grid-cols-5 gap-6 mt-10 px-6">
                        {filteredEvents.map((event) => (
                            <div key={event.id} className="relative cursor-pointer" onClick={() => navigate(`/eventdetail/${event.id}`)}>
                                <div className="relative">
                                    <img
                                        className="w-full h-64 object-cover rounded-[10px]"
                                        alt={event.title}
                                        src={event.image || "/images/NoImage.png"}
                                    />
                                    <Heart
                                        className="absolute top-4 right-4 w-5 h-5 cursor-pointer text-white drop-shadow-lg"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // 좋아요 기능 구현 예정
                                        }}
                                    />
                                </div>
                                <div className="mt-4 text-left">
                                    <span className="inline-block px-3 py-1 bg-blue-100 rounded text-xs text-blue-700 mb-2">
                                        {event.category}
                                    </span>
                                    <h3 className="font-bold text-xl text-black mb-2 truncate">{event.title}</h3>
                                    <div className="text-sm text-gray-600 mb-2">
                                        <div className="font-bold">{event.location}</div>
                                        <div>{event.date}</div>
                                    </div>
                                    <p className="font-bold text-lg text-[#ff6b35]">{event.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <footer className="mt-[60px] pt-[60px] border-t border-[#0000001f] text-center">
                        <p className="text-base text-[#666666]">
                            간편하고 안전한 행사 관리 솔루션
                        </p>

                        <div className="flex justify-center gap-5 mt-10">
                            {footerLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    className="text-sm text-[#666666]"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
} 