import React, { useMemo, useState } from 'react';
import { TopNav } from '../../components/TopNav';
import SupportSideNav from '../../components/SupportSideNav';

type Notice = {
    id: number;
    title: string;
    createdAt: string;
    type: '공지' | '이벤트';
    subType?: '서비스 안내' | '기타';
    content: string;
};

const DUMMY_NOTICES: Notice[] = [
    {
        id: 1010,
        title: 'FairPlay 정식 오픈 및 도메인 안내 (https://fair-play.ink)',
        createdAt: '2025-08-20',
        type: '공지',
        subType: '서비스 안내',
        content: 'FairPlay가 정식 오픈했습니다. 브라우저 주소창에 https://fair-play.ink 를 입력해 접속해주세요.'
    },
    {
        id: 1009,
        title: '고객센터 채팅 오픈 안내 (우측 하단 버튼/푸터 고객센터)',
        createdAt: '2025-08-19',
        type: '공지',
        subType: '서비스 안내',
        content: '상단바 및 푸터의 고객센터를 통해 운영자와 1:1 채팅 문의가 가능합니다.'
    },
    {
        id: 1008,
        title: '행사관리자 > 결제/예약 목록, 부스 참가자 관리 기능 추가',
        createdAt: '2025-08-18',
        type: '공지',
        subType: '서비스 안내',
        content: '행사관리자 사이드바에 결제/예약 목록과 참가 부스 목록/상세 기능이 추가되었습니다.'
    },
    {
        id: 1007,
        title: '[이벤트] 신규 회원 웰컴 쿠폰 지급 (첫 결제 10% 할인)',
        createdAt: '2025-08-18',
        type: '이벤트',
        content: '회원가입 후 7일 이내 첫 결제 시 자동 적용되는 10% 할인 쿠폰을 지급합니다.'
    },
    {
        id: 1006,
        title: '보안 고도화: 2단계 인증, IP 화이트리스트, 로그인 기록 저장',
        createdAt: '2025-08-17',
        type: '공지',
        subType: '서비스 안내',
        content: '관리자 페이지 보안을 위해 2FA, IP 화이트리스트, 로그인 기록 저장 기능을 제공합니다.'
    },
    {
        id: 1005,
        title: '모바일 접속 최적화 및 반응형 개선',
        createdAt: '2025-08-16',
        type: '공지',
        subType: '서비스 안내',
        content: '모바일 네트워크 환경에서 접속 안정성을 개선하고 반응형 UI를 보완했습니다.'
    },
    {
        id: 1004,
        title: '[이벤트] 리뷰 작성 이벤트: 추첨을 통해 기프티콘 증정',
        createdAt: '2025-08-16',
        type: '이벤트',
        content: '행사 관람 후 리뷰를 작성하면 추첨을 통해 소정의 기프티콘을 드립니다.'
    },
    {
        id: 1003,
        title: '시스템 점검 안내 (8/25 02:00 ~ 04:00)',
        createdAt: '2025-08-15',
        type: '공지',
        subType: '기타',
        content: '서비스 안정화를 위해 새벽 시간대 점검을 진행합니다.'
    },
];

const pillClass = (t: Notice['type']) => t === '공지' ? 'bg-gray-100 text-gray-800' : 'bg-emerald-100 text-emerald-700';

export default function Notices() {
    const [keyword, setKeyword] = useState('');
    const [tab, setTab] = useState<'전체' | '공지' | '이벤트'>('전체');
    const [subTab, setSubTab] = useState<'전체' | '서비스 안내' | '기타'>('전체');

    const list = useMemo(() => {
        return DUMMY_NOTICES.filter(n =>
            (tab === '전체' || n.type === tab) &&
            (tab !== '공지' || subTab === '전체' || n.subType === subTab) &&
            (keyword.trim() === '' || n.title.toLowerCase().includes(keyword.toLowerCase()))
        );
    }, [keyword, tab, subTab]);

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                <div className="top-[137px] left-64 absolute">
                    <h1 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[54px] whitespace-nowrap">
                        공지사항
                    </h1>
                </div>

                <SupportSideNav className="!absolute !left-0 !top-[117px]" />

                <div className="ml-64 mt-[195px] w-[949px] pb-28 md:pb-36">
                    {/* 검색 */}
                    <input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="검색"
                        className="w-full px-3 py-2 border border-gray-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                    />

                    {/* 탭 1: 전체 / 공지 / 이벤트 */}
                    <div className="grid grid-cols-3 border rounded-[10px] overflow-hidden mb-2">
                        {(['전체', '공지', '이벤트'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => { setTab(t); setSubTab('전체'); }}
                                className={`py-3 text-sm ${tab === t ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} border-r last:border-r-0`}
                            >{t}</button>
                        ))}
                    </div>

                    {/* 탭 2: 공지 하위 탭 */}
                    {tab === '공지' && (
                        <div className="grid grid-cols-2 border rounded-[10px] overflow-hidden mb-4">
                            {(['서비스 안내', '기타'] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSubTab(s)}
                                    className={`py-3 text-sm ${subTab === s ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-700'} border-r last:border-r-0`}
                                >{s}</button>
                            ))}
                        </div>
                    )}

                    {/* 목록 (테이블 헤더 없는 행 형태) */}
                    <div className="border rounded-[10px] overflow-hidden divide-y">
                        {list.length === 0 ? (
                            <div className="py-12 text-center text-gray-500">게시된 공지사항이 없습니다.</div>
                        ) : (
                            list.map((n) => (
                                <div key={n.id} className="flex items-center px-3 md:px-5 py-4">
                                    <div className={`w-12 md:w-16 shrink-0 text-[13px] md:text-sm font-bold text-black`}>{n.type}</div>
                                    <button
                                        type="button"
                                        className="flex-1 text-left text-[13px] md:text-base text-gray-900 hover:underline bg-transparent p-0 border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-none"
                                        style={{ outline: 'none' }}
                                    >
                                        {n.title}
                                    </button>
                                    <div className="w-24 md:w-28 shrink-0 text-right text-xs md:text-sm text-gray-500">{n.createdAt}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


