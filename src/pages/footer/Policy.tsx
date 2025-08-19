import React from 'react';
import { TopNav } from '../../components/TopNav';

const Policy: React.FC = () => {
    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                <div className="top-[137px] left-64 absolute">
                    <h1 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[54px] whitespace-nowrap">운영정책</h1>
                </div>

                <div className="ml-64 mt-[195px] w-[949px] pb-28 md:pb-36">
                    <div className="bg-white rounded-lg shadow-md p-6 space-y-4 text-sm leading-6 text-gray-800">
                        <p>운영정책은 공정하고 투명한 플랫폼 운영을 위한 기준입니다.</p>
                        <h2 className="font-bold text-black mt-4">1. 공정 예매</h2>
                        <p>자동화 매크로 차단, 중복 예매 방지, 실명/본인 확인 등 공정성 강화를 위한 기술/운영 정책을 적용합니다.</p>
                        <h2 className="font-bold text-black mt-4">2. 부정행위 대응</h2>
                        <p>약관/정책 위반 시 사전 고지 또는 긴급 차단 조치가 가능하며, 위반 정도에 따라 이용 제한이 적용될 수 있습니다.</p>
                        <h2 className="font-bold text-black mt-4">3. 신고/문의 처리</h2>
                        <p>고객센터 채팅 또는 이메일을 통해 접수된 문의는 순차적으로 처리됩니다. 긴급 장애는 즉시 공지합니다.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Policy;


