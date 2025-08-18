import React from 'react';
import { TopNav } from '../../components/TopNav';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                <div className="top-[137px] left-64 absolute">
                    <h1 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[54px] whitespace-nowrap">개인정보처리방침</h1>
                </div>

                <div className="ml-64 mt-[195px] w-[949px] pb-28 md:pb-36">
                    <div className="bg-white rounded-lg shadow-md p-6 space-y-4 text-sm leading-6 text-gray-800">
                        <p>FairPlay(이하 "회사")는 이용자의 개인정보를 소중히 여기며 관련 법령을 준수합니다. 본 방침은 서비스 제공을 위한 최소한의 수집, 안전한 보관, 목적 외 사용 금지, 이용자 권리 보장에 관한 내용을 포함합니다.</p>
                        <h2 className="font-bold text-black mt-4">1. 수집 항목 및 목적</h2>
                        <p>필수: 이메일, 이름/닉네임, 비밀번호, 접속 로그(보안). 선택: 전화번호. 목적: 회원관리, 예매/결제 처리, 고객지원.</p>
                        <h2 className="font-bold text-black mt-4">2. 보관 기간</h2>
                        <p>회원 탈퇴 시 즉시 파기. 관계 법령에 따른 보관(전자상거래 등 소비자보호법) 기간 동안 안전하게 분리 보관.</p>
                        <h2 className="font-bold text-black mt-4">3. 제3자 제공/처리위탁</h2>
                        <p>법령 또는 이용자 동의가 있는 경우에 한하여 제공됩니다. 처리위탁 시 수탁자, 위탁 업무, 보안 조치를 고지합니다.</p>
                        <h2 className="font-bold text-black mt-4">4. 이용자 권리</h2>
                        <p>개인정보 열람/정정/삭제/처리정지 요청 및 동의 철회가 가능합니다. 고객센터 채팅 또는 support@fair-play.ink 로 문의하세요.</p>
                        <h2 className="font-bold text-black mt-4">5. 안전성 확보 조치</h2>
                        <p>암호화 저장, 접근통제, 2단계 인증(선택/관리자), 접속기록 보관, 침입방지 등 기술/관리적 보호조치 시행.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;


