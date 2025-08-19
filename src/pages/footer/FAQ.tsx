import React from 'react';
import { TopNav } from '../../components/TopNav';
import SupportSideNav from '../../components/SupportSideNav';

const FAQ: React.FC = () => {
    const items = [
        { q: '예매 취소는 어떻게 하나요?', a: '마이페이지 > 예매내역에서 예매 건을 선택 후 취소가 가능합니다. 일부 상품은 취소 수수료가 발생할 수 있습니다.' },
        { q: '로그인이 안돼요.', a: '비밀번호 찾기를 통해 임시 비밀번호를 발급받은 후 로그인해주세요. 지속될 경우 고객센터 채팅으로 문의 바랍니다.' },
        { q: '모바일에서 접속이 느려요.', a: '네트워크 상태에 따라 속도가 영향을 받을 수 있습니다. Wifi 환경을 권장하며, 문제가 지속되면 공지사항의 점검 안내를 확인해주세요.' },
    ];

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                <div className="top-[137px] left-64 absolute">
                    <h1 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[54px] whitespace-nowrap">자주 묻는 질문</h1>
                </div>

                <SupportSideNav className="!absolute !left-0 !top-[117px]" />

                <div className="ml-64 mt-[195px] w-[949px] pb-28 md:pb-36">
                    <div className="bg-white rounded-lg shadow-md divide-y">
                        {items.map((it, idx) => (
                            <details key={idx} className="p-6">
                                <summary className="cursor-pointer list-none font-semibold text-black">{it.q}</summary>
                                <p className="mt-2 text-gray-700 text-sm leading-6">{it.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ;


