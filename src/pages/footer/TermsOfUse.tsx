import React from 'react';
import { TopNav } from '../../components/TopNav';

const TermsOfUse: React.FC = () => {
    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />
                <div className="top-[137px] left-64 absolute">
                    <h1 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[54px] whitespace-nowrap">이용약관</h1>
                </div>
                <div className="ml-64 mt-[195px] w-[949px] pb-28 md:pb-36">
                    <div className="bg-white rounded-lg shadow-md p-6 space-y-4 text-sm leading-6 text-gray-800">
                        <p>본 약관은 FairPlay 서비스 이용에 관한 권리, 의무 및 책임사항을 규정합니다.</p>
                        <h2 className="font-bold text-black mt-4">1. 서비스의 제공</h2>
                        <p>회사는 예매/결제/관리 기능을 안정적으로 제공하기 위해 최선을 다합니다. 점검, 장애 등의 사유로 일시 중지될 수 있습니다.</p>
                        <h2 className="font-bold text-black mt-4">2. 회원의 의무</h2>
                        <p>회원은 계정 정보를 안전하게 관리하고, 타인의 권리를 침해하는 행위를 해서는 안 됩니다. 법령 및 본 약관을 준수합니다.</p>
                        <h2 className="font-bold text-black mt-4">3. 결제 및 환불</h2>
                        <p>결제/환불 정책은 각 상품/행사 정책을 따르며, 관련 법령에 따라 처리됩니다.</p>
                        <h2 className="font-bold text-black mt-4">4. 게시물의 권리</h2>
                        <p>회원이 게시한 콘텐츠의 책임은 회원에게 있으며, 회사는 필요한 범위 내에서 서비스 운영을 위해 사용할 수 있습니다.</p>
                        <h2 className="font-bold text-black mt-4">5. 책임의 한계</h2>
                        <p>천재지변, 불가항력 등 회사의 합리적인 통제 범위를 벗어난 사유로 발생한 손해에 대해서는 책임을 지지 않습니다.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfUse;


