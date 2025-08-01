import React, { useState } from "react";
import { TopNav } from "../../components/TopNav";

export const FindPassword = () => {
    const [email, setEmail] = useState("");

    const isEmailValid = email.trim() !== "" && email.includes("@");

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-[1128px] relative">
                <TopNav
                    className="!absolute !left-0 !-top-0.5"
                />

                <div className="absolute top-44 left-[535px] [font-family:'Segoe_UI-Bold',Helvetica] font-bold text-black text-[32px] text-center tracking-[0] leading-[48px] whitespace-nowrap">
                    비밀번호 찾기
                </div>

                <p className="absolute top-[232px] left-[479px] [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-500 text-base text-center tracking-[0] leading-6 whitespace-nowrap">
                    등록된 이메일로 임시 비밀번호를 받아보세요
                </p>

                <div className="absolute top-[280px] left-[428px] [font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-[#2d3748] text-sm tracking-[0] leading-[21px] whitespace-nowrap">
                    이메일 주소
                </div>

                <div className="absolute w-[411px] h-[52px] top-[310px] left-[428px] border-b [border-bottom-style:solid] border-gray-300">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="이메일 주소를 입력하세요"
                        className="absolute w-[380px] h-[21px] top-[13px] left-[15px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-black placeholder:text-[#00000080] text-base leading-[normal] bg-transparent border-none outline-none"
                        style={{
                            WebkitBoxShadow: '0 0 0 1000px white inset'
                        } as React.CSSProperties}
                    />
                </div>

                <button
                    className={`absolute w-[411px] h-[52px] top-[403px] left-[428px] rounded-[10px] flex items-center justify-center transition-colors focus:outline-none ${isEmailValid
                        ? 'bg-black text-white hover:bg-gray-800 cursor-pointer'
                        : 'bg-[#d9d9d9] text-white cursor-not-allowed'
                        }`}
                    disabled={!isEmailValid}
                >
                    <div className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-base text-center tracking-[0] leading-6 whitespace-nowrap">
                        임시 비밀번호 발송
                    </div>
                </button>

                <div className="absolute w-[1256px] h-[205px] top-[923px] left-0 bg-white border-t [border-top-style:solid] border-[#0000001f]">
                    <p className="absolute top-[62px] left-[515px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-base text-center tracking-[0] leading-6 whitespace-nowrap">
                        간편하고 안전한 행사 관리 솔루션
                    </p>

                    <div className="absolute top-[118px] left-[450px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-sm text-center tracking-[0] leading-[21px] whitespace-nowrap">
                        이용약관
                    </div>

                    <div className="absolute top-[118px] left-[534px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-sm text-center tracking-[0] leading-[21px] whitespace-nowrap">
                        개인정보처리방침
                    </div>

                    <div className="absolute top-[118px] left-[669px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-sm text-center tracking-[0] leading-[21px] whitespace-nowrap">
                        고객센터
                    </div>

                    <div className="absolute top-[118px] left-[752px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-sm text-center tracking-[0] leading-[21px] whitespace-nowrap">
                        회사소개
                    </div>
                </div>
            </div>
        </div>
    );
}; 