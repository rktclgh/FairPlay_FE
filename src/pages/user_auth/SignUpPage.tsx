// src/pages/SignUpPage.tsx

import React, { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { FaCheck, FaTimes } from "react-icons/fa";
import { RiKakaoTalkFill } from "react-icons/ri";
import { Eye, EyeOff } from "lucide-react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

// .env 환경변수 적용
const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const REDIRECT_URI = `${import.meta.env.VITE_FRONTEND_BASE_URL}/auth/kakao/callback`;

export const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [nickname, setNickname] = useState("");
    const [phone, setPhone] = useState("");

    // 휴대폰 번호 포맷팅 함수
    const formatPhoneNumber = (value: string) => {
        // 숫자만 추출
        const numbers = value.replace(/[^0-9]/g, '');

        // 11자리 제한
        if (numbers.length > 11) {
            return formatPhoneNumber(numbers.slice(0, 11));
        }

        // 하이픈 추가
        if (numbers.length <= 3) {
            return numbers;
        } else if (numbers.length <= 7) {
            return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        } else {
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const formatted = formatPhoneNumber(value);
        setPhone(formatted);
    };
    const [verificationCode, setVerificationCode] = useState("");

    const [emailChecked, setEmailChecked] = useState(false);
    const [nicknameChecked, setNicknameChecked] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [verified, setVerified] = useState(false);

    const [emailVerificationTimer, setEmailVerificationTimer] = useState(0);
    const [isSendingVerification, setIsSendingVerification] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);
    const [emailValid, setEmailValid] = useState<boolean | null>(null);

    const navigate = useNavigate();

    // 비밀번호 일치 확인
    useEffect(() => {
        if (confirmPassword.length > 0) {
            setPasswordMatch(password === confirmPassword);
        } else {
            setPasswordMatch(null);
        }
    }, [password, confirmPassword]);

    // 이메일 유효성 검사
    useEffect(() => {
        if (email.length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setEmailValid(emailRegex.test(email));
        } else {
            setEmailValid(null);
        }
    }, [email]);

    // 이메일 인증 타이머
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (emailVerificationTimer > 0) {
            interval = setInterval(() => {
                setEmailVerificationTimer((prev) => {
                    if (prev <= 1) {
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [emailVerificationTimer]);

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
        } catch {
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
        } catch {
            setNicknameChecked(false);
        }
    };

    const handleSendVerification = async () => {
        if (emailVerificationTimer > 0 || isSendingVerification) {
            return; // 타이머가 실행 중이거나 발송 중이면 함수 실행 방지
        }

        setIsSendingVerification(true);

        try {
            await api.post("/api/email/send-verification", { email });
            toast.info("인증번호가 발송되었습니다.");
            setVerificationSent(true);
            setEmailVerificationTimer(30);
        } catch (error) {
            toast.error("인증번호 발송에 실패했습니다.");
        } finally {
            setIsSendingVerification(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!verificationCode) {
            toast.warn("인증번호를 입력하세요");
            return;
        }
        try {
            await api.post("/api/email/verify-code", { email, code: verificationCode });
            toast.success("인증 성공!");
            setVerified(true);
        } catch { }
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
            toast.success("회원가입 완료!");
            navigate("/login");
        } catch { }
    };

    // 카카오 연동용 회원가입(로그인) 버튼
    const handleKakaoSignUp = () => {
        window.location.href =
            `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
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
            <div className="bg-white w-full max-w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 콘텐츠 컨테이너 */}
                <div className="relative flex flex-col items-center px-4 sm:px-0" style={{ marginTop: '80px', paddingBottom: '40px' }}>
                    <Link to="/" className="mb-8">
                        <div className="[font-family:'Segoe_UI-Bold',Helvetica] font-bold text-black text-[32px] text-center leading-[48px] whitespace-nowrap tracking-[0]">
                            회원가입
                        </div>
                    </Link>

                    {/* 이름 입력 */}
                    <div className="w-full max-w-[400px] mb-6">
                        <div className="[font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px] whitespace-nowrap mb-1">
                            이름
                        </div>
                        <div className="w-full max-w-[400px] h-[52px] border-b border-gray-300">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="실명을 입력하세요"
                                className="w-full max-w-[350px] h-[21px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-black placeholder:text-gray-400 text-base leading-[normal] bg-transparent border-none outline-none"
                                style={{ WebkitBoxShadow: '0 0 0 1000px white inset', marginTop: '13px', marginLeft: '15px' }}
                            />
                        </div>
                    </div>

                    {/* 닉네임 입력 */}
                    <div className="w-full max-w-[400px] mb-6">
                        <div className="[font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-black text-sm tracking-[0] leading-[21px] whitespace-nowrap mb-1">
                            닉네임
                        </div>
                        <div className="w-full max-w-[400px] h-[52px] border-b border-gray-300 relative">
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="닉네임을 입력하세요"
                                className="w-full max-w-[350px] h-[21px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-black placeholder:text-gray-400 text-base leading-[normal] bg-transparent border-none outline-none"
                                style={{ WebkitBoxShadow: '0 0 0 1000px white inset', marginTop: '13px', marginLeft: '15px' }}
                            />
                            <button
                                onClick={handleCheckNickname}
                                disabled={nicknameChecked}
                                className={`absolute top-[5px] sm:top-[15px] right-0 w-[60px] h-7 rounded-[10px] border border-solid cursor-pointer transition-colors flex items-center justify-center ${nicknameChecked
                                    ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                                    : 'border-gray-300 bg-transparent text-black hover:bg-gray-100'
                                    }`}
                            >
                                <div className="[font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-xs text-center leading-[18px] tracking-[0] whitespace-nowrap">
                                    중복 확인
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* 이메일 주소 */}
                    <div className="w-full max-w-[400px] mb-6">
                        <div className="[font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-black text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-1">
                            이메일 주소
                        </div>
                        <div className="w-full max-w-[400px] h-[52px] border-b border-gray-300 relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="이메일을 입력하세요"
                                className="w-full max-w-[350px] h-[21px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-black placeholder:text-gray-400 text-base leading-[normal] bg-transparent border-none outline-none"
                                style={{ WebkitBoxShadow: '0 0 0 1000px white inset', marginTop: '13px', marginLeft: '15px' }}
                            />
                            <button
                                onClick={handleCheckEmail}
                                disabled={emailChecked || !emailValid}
                                className={`absolute top-[5px] sm:top-[15px] right-0 w-[60px] h-7 rounded-[10px] border border-solid cursor-pointer transition-colors flex items-center justify-center ${emailChecked || !emailValid
                                    ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                                    : 'border-gray-300 bg-transparent text-black hover:bg-gray-100'
                                    }`}
                            >
                                <div className="[font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-xs text-center leading-[18px] tracking-[0] whitespace-nowrap">
                                    중복 확인
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* 이메일 유효성 상태 표시 */}
                    {emailValid !== null && (
                        <div className="w-full max-w-[400px] -mt-4 flex items-center gap-2">
                            {emailValid ? (
                                <div className="flex items-center gap-2 text-green-600">
                                    <FaCheck size={14} />
                                    <span className="text-sm">올바른 이메일 형식입니다</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-500">
                                    <FaTimes size={14} />
                                    <span className="text-sm">올바르지 않은 이메일 형식입니다</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 인증번호 입력 - 조건부 렌더링 */}
                    {emailChecked && (
                        <div className="w-full max-w-[400px] mb-6">
                            <div className="[font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-black text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-1">
                                인증 번호
                            </div>
                            <div className="w-full max-w-[400px] h-[52px] border-b border-gray-300 relative">
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder={verificationSent ? "인증번호를 입력하세요" : "인증번호 발송 버튼을 눌러주세요"}
                                    className="w-full max-w-[350px] h-[21px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-black placeholder:text-gray-400 text-base leading-[normal] bg-transparent border-none outline-none"
                                    style={{ WebkitBoxShadow: '0 0 0 1000px white inset', marginTop: '13px', marginLeft: '15px' }}
                                    disabled={!verificationSent}
                                />
                                {verificationSent ? (
                                    <button
                                        onClick={handleVerifyCode}
                                        className="absolute top-[5px] sm:top-[15px] right-0 w-[60px] h-7 rounded-[10px] border border-solid border-gray-300 cursor-pointer transition-colors bg-transparent text-black hover:bg-gray-100 flex items-center justify-center"
                                    >
                                        <div className="[font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-xs text-center leading-[18px] tracking-[0] whitespace-nowrap">
                                            인증 확인
                                        </div>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSendVerification}
                                        disabled={emailVerificationTimer > 0 || isSendingVerification}
                                        className={`absolute top-[5px] sm:top-[15px] right-0 w-[100px] h-7 rounded-[10px] border border-solid transition-colors flex items-center justify-center ${emailVerificationTimer > 0 || isSendingVerification
                                            ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                                            : 'border-gray-300 bg-transparent text-black hover:bg-gray-100 cursor-pointer'
                                            }`}
                                    >
                                        <div className="[font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-xs text-center leading-[18px] tracking-[0] whitespace-nowrap">
                                            {isSendingVerification ? '발송중' : emailVerificationTimer > 0 ? `${emailVerificationTimer}초` : '인증번호 발송'}
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 비밀번호 입력 */}
                    <div className="w-full max-w-[400px] mb-6">
                        <div className="[font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-black text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-1">
                            비밀번호
                        </div>
                        <div className="w-full max-w-[400px] h-[52px] border-b border-gray-300 relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호를 입력하세요"
                                className="w-full max-w-[320px] h-[21px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-black placeholder:text-gray-400 text-base leading-[normal] bg-transparent border-none outline-none pr-12"
                                style={{ WebkitBoxShadow: '0 0 0 1000px white inset', marginTop: '13px', marginLeft: '15px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-[15px] right-0 sm:right-[15px] cursor-pointer hover:text-gray-700 z-10 border-none outline-none p-0 m-0 focus:outline-none focus:ring-0 focus:border-none"
                                style={{ background: 'none', backgroundColor: 'transparent', boxShadow: 'none' }}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5 text-gray-600" />
                                ) : (
                                    <Eye className="w-5 h-5 text-gray-600" />
                                )}
                            </button>
                        </div>
                        <p className="[font-family:'Segoe_UI-Regular',Helvetica] font-normal text-gray-500 text-xs leading-[18px] tracking-[0] whitespace-nowrap mt-2">
                            • 8자 이상 16자 이하
                        </p>
                    </div>

                    {/* 비밀번호 확인 */}
                    <div className="w-full max-w-[400px] mb-6">
                        <div className="[font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-black text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-1">
                            비밀번호 확인
                        </div>
                        <div className="w-full max-w-[400px] h-[52px] border-b border-gray-300 relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="비밀번호를 다시 입력하세요"
                                className="w-full max-w-[320px] h-[21px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-black placeholder:text-gray-400 text-base leading-[normal] bg-transparent border-none outline-none pr-12"
                                style={{ WebkitBoxShadow: '0 0 0 1000px white inset', marginTop: '13px', marginLeft: '15px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute top-[15px] right-0 sm:right-[15px] cursor-pointer hover:text-gray-700 z-10 border-none outline-none p-0 m-0 focus:outline-none focus:ring-0 focus:border-none"
                                style={{ background: 'none', backgroundColor: 'transparent', boxShadow: 'none' }}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5 text-gray-600" />
                                ) : (
                                    <Eye className="w-5 h-5 text-gray-600" />
                                )}
                            </button>
                        </div>
                        {/* 비밀번호 일치 상태 표시 */}
                        {passwordMatch !== null && (
                            <div className={`mt-2 flex items-center gap-2 ${passwordMatch ? 'text-green-600' : 'text-red-500'}`}>
                                {passwordMatch ? (
                                    <>
                                        <FaCheck size={14} />
                                        <span className="text-sm">비밀번호가 일치합니다</span>
                                    </>
                                ) : (
                                    <>
                                        <FaTimes size={14} />
                                        <span className="text-sm">비밀번호가 일치하지 않습니다</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 휴대폰 번호 입력 */}
                    <div className="w-full max-w-[400px] mb-8">
                        <div className="[font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-black text-sm leading-[21px] tracking-[0] whitespace-nowrap mb-1">
                            휴대폰 번호
                        </div>
                        <div className="w-full max-w-[400px] h-[52px] border-b border-gray-300">
                            <input
                                type="tel"
                                value={phone}
                                onChange={handlePhoneChange}
                                placeholder="휴대폰 번호를 입력하세요"
                                className="w-full max-w-[350px] h-[21px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-black placeholder:text-gray-400 text-base leading-[normal] bg-transparent border-none outline-none"
                                style={{ WebkitBoxShadow: '0 0 0 1000px white inset', marginTop: '13px', marginLeft: '15px' }}
                                maxLength={13}
                            />
                        </div>
                    </div>

                    {/* 회원가입 버튼 */}
                    <button
                        onClick={handleSignUp}
                        disabled={!isSignUpEnabled}
                        className={`w-full max-w-[400px] h-12 rounded-lg flex items-center justify-center transition-colors focus:outline-none mb-4 ${isSignUpEnabled
                            ? 'bg-black text-white hover:bg-gray-800 cursor-pointer'
                            : 'bg-[#d9d9d9] text-white cursor-not-allowed'
                            }`}
                        style={{ borderRadius: '8px' }}
                    >
                        <div className="[font-family:'Segoe_UI-Semibold',Helvetica] font-normal text-base text-center leading-6 tracking-[0] whitespace-nowrap">
                            회원가입
                        </div>
                    </button>

                    <div className="w-full max-w-[400px] mb-4 flex justify-center">
                        <div className="w-[58px] h-[22px] flex items-center justify-center">
                            <div className="[font-family:'Segoe_UI-Regular',Helvetica] font-normal text-gray-500 text-sm leading-[21px] tracking-[0] whitespace-nowrap">
                                또는
                            </div>
                        </div>
                    </div>

                    {/* 카카오 회원가입 버튼 */}
                    <button
                        className="w-full max-w-[400px] h-12 bg-[#fee500] rounded-lg flex items-center justify-center cursor-pointer hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-300"
                        style={{ borderRadius: '8px' }}
                        onClick={handleKakaoSignUp}
                    >
                        <div className="flex items-center space-x-2">
                            <RiKakaoTalkFill size={20} color="#3c1e1e" />
                            <span className="text-[#3c1e1e] font-semibold text-sm" style={{ fontFamily: 'Segoe_UI-Semibold, Helvetica' }}>카카오로 가입하기</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};
