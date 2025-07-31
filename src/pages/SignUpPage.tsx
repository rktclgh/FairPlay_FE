import React, { useState } from "react";
import { TopNav } from "../components/TopNav";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { RiKakaoTalkFill } from "react-icons/ri";

export const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [verificationCode, setVerificationCode] = useState("");

    // 숫자만 입력 허용하는 함수
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // 숫자만 추출
        const numericValue = value.replace(/[^0-9]/g, '');

        // 11자리로 제한
        if (numericValue.length <= 11) {
            // 자동 포맷팅: 010-1234-5678 형식
            let formattedValue = '';
            if (numericValue.length >= 3) {
                formattedValue = numericValue.slice(0, 3);
                if (numericValue.length >= 7) {
                    formattedValue += '-' + numericValue.slice(3, 7) + '-' + numericValue.slice(7);
                } else if (numericValue.length >= 4) {
                    formattedValue += '-' + numericValue.slice(3);
                }
            } else {
                formattedValue = numericValue;
            }
            setPhone(formattedValue);
        }
    };

    // 백스페이스 처리를 위한 함수
    const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            const currentValue = phone;
            const numericValue = currentValue.replace(/[^0-9]/g, '');

            // 숫자가 1개 이상 있을 때만 삭제 허용
            if (numericValue.length > 0) {
                const newNumericValue = numericValue.slice(0, -1);
                let formattedValue = '';

                if (newNumericValue.length >= 3) {
                    formattedValue = newNumericValue.slice(0, 3);
                    if (newNumericValue.length >= 7) {
                        formattedValue += '-' + newNumericValue.slice(3, 7) + '-' + newNumericValue.slice(7);
                    } else if (newNumericValue.length >= 4) {
                        formattedValue += '-' + newNumericValue.slice(3);
                    }
                } else {
                    formattedValue = newNumericValue;
                }
                setPhone(formattedValue);
                e.preventDefault();
            }
        }
    };

    const isSignUpEnabled =
        email.trim() !== "" &&
        password.trim().length >= 8 &&
        password === confirmPassword &&
        name.trim() !== "" &&
        phone.trim() !== "" &&
        verificationCode.trim() !== "";

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-[1442px] relative">
                <TopNav
                    className="!absolute !left-0 !-top-0.5"
                />

                <div className="absolute top-24 left-[569px] [font-family:'Segoe_UI-Bold',Helvetica] font-bold text-black text-[32px] text-center leading-[48px] whitespace-nowrap tracking-[0]">
                    회원가입
                </div>

                {/* 이름 입력 */}
                <div className="absolute top-[200px] left-[428px] [font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px] whitespace-nowrap">
                    이름
                </div>

                <div className="absolute w-[400px] h-[52px] top-[230px] left-[428px] border-b [border-bottom-style:solid] border-gray-300">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="실명을 입력하세요"
                        className="absolute w-[350px] h-[21px] top-[13px] left-[15px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-black placeholder:text-gray-400 text-base leading-[normal] bg-transparent border-none outline-none"
                        style={{
                            WebkitBoxShadow: '0 0 0 1000px white inset'
                        } as React.CSSProperties}
                    />
                </div>

                {/* 이메일 입력 */}
                <div className="inline-flex items-center gap-[3px] absolute top-[305px] left-[428px]">
                    <div className="relative w-fit mt-[-1.00px] [font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-black text-sm leading-[21px] tracking-[0] whitespace-nowrap">
                        이메일 주소
                    </div>
                </div>

                <div className="absolute w-[400px] h-[52px] top-[335px] left-[428px] border-b [border-bottom-style:solid] border-gray-300">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="이메일을 입력하세요"
                        className="absolute w-[350px] h-[21px] top-[13px] left-[15px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-black placeholder:text-gray-400 text-base leading-[normal] bg-transparent border-none outline-none"
                        style={{
                            WebkitBoxShadow: '0 0 0 1000px white inset'
                        } as React.CSSProperties}
                    />
                </div>

                <button className="absolute w-[60px] h-7 top-[345px] left-[768px] rounded-[10px] border border-solid border-gray-300 cursor-pointer transition-colors bg-transparent text-black hover:bg-gray-100 flex items-center justify-center">
                    <div className="[font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-xs text-center leading-[18px] tracking-[0] whitespace-nowrap">
                        중복 확인
                    </div>
                </button>

                {/* 인증번호 입력 */}
                <div className="inline-flex items-center gap-[3px] absolute top-[410px] left-[428px]">
                    <div className="relative w-fit mt-[-1.00px] [font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-black text-sm leading-[21px] tracking-[0] whitespace-nowrap">
                        인증 번호
                    </div>
                </div>

                <div className="absolute w-[400px] h-[52px] top-[440px] left-[428px] border-b [border-bottom-style:solid] border-gray-300">
                    <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="인증번호를 입력하세요"
                        className="absolute w-[350px] h-[21px] top-[13px] left-[15px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-black placeholder:text-gray-400 text-base leading-[normal] bg-transparent border-none outline-none"
                        style={{
                            WebkitBoxShadow: '0 0 0 1000px white inset'
                        } as React.CSSProperties}
                    />
                </div>

                {/* 비밀번호 입력 */}
                <div className="absolute top-[515px] left-[428px] [font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-black text-sm leading-[21px] tracking-[0] whitespace-nowrap">
                    비밀번호
                </div>

                <div className="absolute w-[400px] h-[52px] top-[545px] left-[428px] border-b [border-bottom-style:solid] border-gray-300">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호를 입력하세요"
                        className="absolute w-[320px] h-[21px] top-[13px] left-[15px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-black placeholder:text-gray-400 text-base leading-[normal] bg-transparent border-none outline-none"
                        style={{
                            WebkitBoxShadow: '0 0 0 1000px white inset'
                        } as React.CSSProperties}
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-[12px] right-[15px] w-8 h-8 flex items-center justify-center cursor-pointer hover:text-gray-600 z-10"
                        style={{ backgroundColor: 'transparent', border: 'none' }}
                    >
                        {showPassword ? (
                            <FaEyeSlash size={18} color="#6B7280" />
                        ) : (
                            <FaEye size={18} color="#6B7280" />
                        )}
                    </button>
                </div>

                <p className="absolute top-[604px] left-[428px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-gray-500 text-xs leading-[18px] tracking-[0] whitespace-nowrap">
                    • 8자 이상 16자 이하
                </p>


                <div className="absolute top-[634px] left-[428px] [font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-black text-sm leading-[21px] tracking-[0] whitespace-nowrap">
                    비밀번호 확인
                </div>

                <div className="absolute w-[400px] h-[52px] top-[664px] left-[428px] border-b [border-bottom-style:solid] border-gray-300">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="비밀번호를 다시 입력하세요"
                        className="absolute w-[320px] h-[21px] top-[13px] left-[15px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-black placeholder:text-gray-400 text-base leading-[normal] bg-transparent border-none outline-none"
                        style={{
                            WebkitBoxShadow: '0 0 0 1000px white inset'
                        } as React.CSSProperties}
                    />

                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute top-[12px] right-[15px] w-8 h-8 flex items-center justify-center cursor-pointer hover:text-gray-600 z-10"
                        style={{ backgroundColor: 'transparent', border: 'none' }}
                    >
                        {showConfirmPassword ? (
                            <FaEyeSlash size={18} color="#6B7280" />
                        ) : (
                            <FaEye size={18} color="#6B7280" />
                        )}
                    </button>
                </div>

                {/* 휴대폰 번호 입력 */}
                <div className="absolute top-[749px] left-[428px] [font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-black text-sm leading-[21px] tracking-[0] whitespace-nowrap">
                    휴대폰 번호
                </div>

                <div className="absolute w-[400px] h-[52px] top-[779px] left-[428px] border-b [border-bottom-style:solid] border-gray-300">
                    <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        onKeyDown={handlePhoneKeyDown}
                        placeholder="휴대폰 번호를 입력하세요"
                        className="absolute w-[350px] h-[21px] top-[13px] left-[15px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-black placeholder:text-gray-400 text-base leading-[normal] bg-transparent border-none outline-none"
                        style={{
                            WebkitBoxShadow: '0 0 0 1000px white inset'
                        } as React.CSSProperties}
                    />
                </div>

                {/* 회원가입 완료 버튼 */}
                <button
                    className={`absolute w-[400px] h-12 top-[859px] left-[428px] rounded-lg flex items-center justify-center transition-colors focus:outline-none ${isSignUpEnabled
                        ? 'bg-black text-white hover:bg-gray-800 cursor-pointer'
                        : 'bg-[#d9d9d9] text-white cursor-not-allowed'
                        }`}
                    style={{ borderRadius: '8px' }}
                    disabled={!isSignUpEnabled}
                >
                    <div className="[font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-base text-center leading-6 tracking-[0] whitespace-nowrap">
                        회원가입 완료
                    </div>
                </button>

                <div className="absolute w-[58px] h-[22px] top-[934px] left-[599px]">
                    <div className="absolute w-[58px] h-[21px] top-px left-0 bg-white" />

                    <div className="absolute top-0 left-4 [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-gray-500 text-sm leading-[21px] tracking-[0] whitespace-nowrap">
                        또는
                    </div>
                </div>

                {/* 카카오 회원가입 버튼 */}
                <button className="absolute w-[400px] h-12 top-[980px] left-[428px] bg-[#fee500] rounded-lg flex items-center justify-center cursor-pointer hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-300" style={{ borderRadius: '8px' }}>
                    <div className="flex items-center space-x-2">
                        <RiKakaoTalkFill size={20} color="#3c1e1e" />
                        <span className="text-[#3c1e1e] font-semibold text-sm" style={{ fontFamily: 'Segoe UI-Semibold, Helvetica' }}>카카오로 가입하기</span>
                    </div>
                </button>

                <div className="absolute w-[1256px] h-[205px] top-[1237px] left-0 bg-white border-t [border-top-style:solid] border-[#0000001f]">
                    <p className="absolute top-[62px] left-[515px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-base text-center leading-6 tracking-[0] whitespace-nowrap">
                        간편하고 안전한 행사 관리 솔루션
                    </p>

                    <div className="absolute top-[118px] left-[450px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-sm text-center leading-[21px] tracking-[0] whitespace-nowrap">
                        이용약관
                    </div>

                    <div className="absolute top-[118px] left-[534px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-sm text-center leading-[21px] tracking-[0] whitespace-nowrap">
                        개인정보처리방침
                    </div>

                    <div className="absolute top-[118px] left-[669px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-sm text-center leading-[21px] tracking-[0] whitespace-nowrap">
                        고객센터
                    </div>

                    <div className="absolute top-[118px] left-[752px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-sm text-center leading-[21px] tracking-[0] whitespace-nowrap">
                        회사소개
                    </div>
                </div>
            </div>
        </div>
    );
}; 