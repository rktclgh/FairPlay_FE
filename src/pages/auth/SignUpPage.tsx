import React, { useState } from "react";
import { TopNav } from "../../components/TopNav";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { RiKakaoTalkFill } from "react-icons/ri";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

export const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [nickname, setNickname] = useState("");
    const [phone, setPhone] = useState("");
    const [verificationCode, setVerificationCode] = useState("");

    const [emailChecked, setEmailChecked] = useState(false);
    const [nicknameChecked, setNicknameChecked] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [verified, setVerified] = useState(false);
    const navigate = useNavigate();

    const handleCheckEmail = async () => {
        if (!email) {
            toast.warn("이메일을 입력해주세요.");
            return;
        }
        try {
            const response = await api.get(`/api/users/check-email?email=${email}`);
            if (response.data.duplicate) {
                toast.error("이미 사용 중인 이메일입니다.");
                setEmailChecked(false);
            } else {
                toast.success("사용 가능한 이메일입니다.");
                setEmailChecked(true);
            }
        } catch (error) {
            setEmailChecked(false);
        }
    };

    const handleCheckNickname = async () => {
        if (!nickname) {
            toast.warn("닉네임을 입력해주세요.");
            return;
        }
        try {
            const response = await api.get(`/api/users/check-nickname?nickname=${nickname}`);
            if (response.data.duplicate) {
                toast.error("이미 사용 중인 닉네임입니다.");
                setNicknameChecked(false);
            } else {
                toast.success("사용 가능한 닉네임입니다.");
                setNicknameChecked(true);
            }
        } catch (error) {
            setNicknameChecked(false);
        }
    };

    const handleSendVerification = async () => {
        try {
            await api.post("/api/email/send-verification", { email });
            toast.info("인증번호가 발송되었습니다.");
            setVerificationSent(true);
        } catch (error) {
            // handled by interceptor
        }
    };

    const handleVerifyCode = async () => {
        if (!verificationCode) {
            toast.warn("인증번호를 입력해주세요.");
            return;
        }
        try {
            await api.post("/api/email/verify-code", { email, code: verificationCode });
            toast.success("이메일 인증이 완료되었습니다.");
            setVerified(true);
        } catch (error) {
            // handled by interceptor
        }
    };

    const handleSignUp = async () => {
        if (!isSignUpEnabled) {
            toast.error("모든 항목을 올바르게 입력하고 확인해주세요.");
            return;
        }
        try {
            await api.post("/api/users/signup", {
                email,
                password,
                name,
                nickname,
                phone,
                roleCodeId: 4 // 일반 사용자
            });
            toast.success("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
            navigate("/login");
        } catch (error) {
            // handled by interceptor
        }
    };

    const isSignUpEnabled =
        emailChecked &&
        nicknameChecked &&
        verified &&
        password.trim().length >= 8 &&
        password === confirmPassword &&
        name.trim() !== "" &&
        phone.trim() !== "";

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-[1442px] relative">
                <TopNav
                    className="!absolute !left-0 !-top-0.5"
                />

                <Link to="/" className="absolute top-24 left-[569px]">
                    <div className="[font-family:'Segoe_UI-Bold',Helvetica] font-bold text-black text-[32px] text-center leading-[48px] whitespace-nowrap tracking-[0]">
                        회원가입
                    </div>
                </Link>

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

                {/* 닉네임 입력 */}
                <div className="absolute top-[305px] left-[428px] [font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px] whitespace-nowrap">
                    닉네임
                </div>

                <div className="absolute w-[400px] h-[52px] top-[335px] left-[428px] border-b [border-bottom-style:solid] border-gray-300">
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="닉네임을 입력하세요"
                        className="absolute w-[350px] h-[21px] top-[13px] left-[15px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-black placeholder:text-gray-400 text-base leading-[normal] bg-transparent border-none outline-none"
                        style={{
                            WebkitBoxShadow: '0 0 0 1000px white inset'
                        } as React.CSSProperties}
                    />
                </div>
                <button onClick={handleCheckNickname} className="absolute w-[60px] h-7 top-[345px] left-[768px] rounded-[10px] border border-solid border-gray-300 cursor-pointer transition-colors bg-transparent text-black hover:bg-gray-100 flex items-center justify-center">
                    <div className="[font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-xs text-center leading-[18px] tracking-[0] whitespace-nowrap">
                        중복 확인
                    </div>
                </button>

                {/* 이메일 입력 */}
                <div className="inline-flex items-center gap-[3px] absolute top-[410px] left-[428px]">
                    <div className="relative w-fit mt-[-1.00px] [font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-black text-sm leading-[21px] tracking-[0] whitespace-nowrap">
                        이메일 주소
                    </div>
                </div>

                <div className="absolute w-[400px] h-[52px] top-[440px] left-[428px] border-b [border-bottom-style:solid] border-gray-300">
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

                <button onClick={handleCheckEmail} className="absolute w-[60px] h-7 top-[450px] left-[768px] rounded-[10px] border border-solid border-gray-300 cursor-pointer transition-colors bg-transparent text-black hover:bg-gray-100 flex items-center justify-center">
                    <div className="[font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-xs text-center leading-[18px] tracking-[0] whitespace-nowrap">
                        중복 확인
                    </div>
                </button>

                {emailChecked && (
                    <>
                        <button onClick={handleSendVerification} className="absolute w-[100px] h-7 top-[450px] left-[838px] rounded-[10px] border border-solid border-gray-300 cursor-pointer transition-colors bg-transparent text-black hover:bg-gray-100 flex items-center justify-center">
                            <div className="[font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-xs text-center leading-[18px] tracking-[0] whitespace-nowrap">
                                인증번호 발송
                            </div>
                        </button>
                    </>
                )}

                {/* 인증번호 입력 */}
                {verificationSent && (
                    <>
                        <div className="inline-flex items-center gap-[3px] absolute top-[515px] left-[428px]">
                            <div className="relative w-fit mt-[-1.00px] [font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-black text-sm leading-[21px] tracking-[0] whitespace-nowrap">
                                인증 번호
                            </div>
                        </div>

                        <div className="absolute w-[400px] h-[52px] top-[545px] left-[428px] border-b [border-bottom-style:solid] border-gray-300">
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
                        <button onClick={handleVerifyCode} className="absolute w-[60px] h-7 top-[555px] left-[768px] rounded-[10px] border border-solid border-gray-300 cursor-pointer transition-colors bg-transparent text-black hover:bg-gray-100 flex items-center justify-center">
                            <div className="[font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-xs text-center leading-[18px] tracking-[0] whitespace-nowrap">
                                인증
                            </div>
                        </button>
                    </>
                )}

                {/* 비밀번호 입력 */}
                <div className="absolute top-[620px] left-[428px] [font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-black text-sm leading-[21px] tracking-[0] whitespace-nowrap">
                    비밀번호
                </div>

                <div className="absolute w-[400px] h-[52px] top-[650px] left-[428px] border-b [border-bottom-style:solid] border-gray-300">
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

                <p className="absolute top-[709px] left-[428px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-gray-500 text-xs leading-[18px] tracking-[0] whitespace-nowrap">
                    • 8자 이상 16자 이하
                </p>


                <div className="absolute top-[739px] left-[428px] [font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-black text-sm leading-[21px] tracking-[0] whitespace-nowrap">
                    비밀번호 확인
                </div>

                <div className="absolute w-[400px] h-[52px] top-[769px] left-[428px] border-b [border-bottom-style:solid] border-gray-300">
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
                <div className="absolute top-[854px] left-[428px] [font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-black text-sm leading-[21px] tracking-[0] whitespace-nowrap">
                    휴대폰 번호
                </div>

                <div className="absolute w-[400px] h-[52px] top-[884px] left-[428px] border-b [border-bottom-style:solid] border-gray-300">
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="휴대폰 번호를 입력하세요"
                        className="absolute w-[350px] h-[21px] top-[13px] left-[15px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-black placeholder:text-gray-400 text-base leading-[normal] bg-transparent border-none outline-none"
                        style={{
                            WebkitBoxShadow: '0 0 0 1000px white inset'
                        } as React.CSSProperties}
                    />
                </div>

                {/* 회원가입 완료 버튼 */}
                <button
                    onClick={handleSignUp}
                    disabled={!isSignUpEnabled}
                    className={`absolute w-[400px] h-12 top-[964px] left-[428px] rounded-lg flex items-center justify-center transition-colors focus:outline-none ${isSignUpEnabled
                        ? 'bg-black text-white hover:bg-gray-800 cursor-pointer'
                        : 'bg-[#d9d9d9] text-white cursor-not-allowed'
                        }`}
                    style={{ borderRadius: '8px' }}
                >
                    <div className="[font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-base text-center leading-6 tracking-[0] whitespace-nowrap">
                        회원가입 완료
                    </div>
                </button>

                <div className="absolute w-[58px] h-[22px] top-[1039px] left-[599px]">
                    <div className="absolute w-[58px] h-[21px] top-px left-0 bg-white" />

                    <div className="absolute top-0 left-4 [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-gray-500 text-sm leading-[21px] tracking-[0] whitespace-nowrap">
                        또는
                    </div>
                </div>

                {/* 카카오 회원가입 버튼 */}
                <button className="absolute w-[400px] h-12 top-[1085px] left-[428px] bg-[#fee500] rounded-lg flex items-center justify-center cursor-pointer hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-300" style={{ borderRadius: '8px' }}>
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