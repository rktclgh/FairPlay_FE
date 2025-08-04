import React, { useState } from "react";
import api from "../../api/axios";
import { TopNav } from "../../components/TopNav";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { RiKakaoTalkFill } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const isLoginEnabled = email.trim() !== "" && password.trim().length >= 8;

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!isLoginEnabled) return;
        setLoading(true);
        try {
            const res = await api.post("/api/auth/login", {
                email,
                password
            });

            const { accessToken, refreshToken, user } = res.data;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);

            // 사용자 정보 저장 (백엔드에서 제공하지 않는 경우를 대비)
            if (user) {
                localStorage.setItem("loginEmail", user.email || email);
                localStorage.setItem("loginName", user.name || "");
                localStorage.setItem("loginPhone", user.phoneNumber || "");
            } else {
                // 백엔드에서 사용자 정보를 제공하지 않는 경우 기본값 저장
                localStorage.setItem("loginEmail", email);
                localStorage.setItem("loginName", "사용자");
                localStorage.setItem("loginPhone", "010-0000-0000");
            }

            toast.success("로그인에 성공했습니다!");
            navigate("/");
        } catch (error) {
            // Handled by axios interceptor
        } finally {
            setLoading(false);
        }
    };

    const handleKakaoLogin = () => {
        const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
        const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

        if (!KAKAO_CLIENT_ID || !KAKAO_REDIRECT_URI) {
            toast.error("카카오 로그인 설정이 클라이언트에 구성되지 않았습니다.");
            console.error("VITE_KAKAO_CLIENT_ID or VITE_KAKAO_REDIRECT_URI is not set in .env file");
            return;
        }

        const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;
        window.location.href = kakaoURL;
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white overflow-hidden w-[1256px] h-[1128px] relative">
                <TopNav className="!absolute !left-0 !-top-0.5" />
                {/* ... (하단 고정 footer, UI 동일하게 생략) ... */}

                <Link to="/" className="absolute top-[100px] left-[588px] flex items-center justify-center">
                    <img
                        className="w-[80px] h-[75px] object-contain"
                        alt="FairPlay Logo"
                        src="/images/FPlogo.png"
                    />
                </Link>

                <div className="absolute w-[50px] top-[200px] left-[422px] text-[#2d3748] text-sm">
                    이메일
                </div>
                <div className="absolute w-[411px] h-[52px] top-[230px] left-[422px] border-b border-gray-300">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="이메일을 입력하세요"
                        className="absolute w-[350px] h-[21px] top-[13px] left-[15px] text-black placeholder:text-gray-400 text-base bg-transparent border-none outline-none"
                        style={{ WebkitBoxShadow: '0 0 0 1000px white inset' }}
                    />
                </div>

                <div className="absolute w-[67px] top-[305px] left-[422px] text-[#2d3748] text-sm">
                    비밀번호
                </div>
                <div className="absolute w-[411px] h-[52px] top-[335px] left-[422px] border-b border-gray-300 relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호를 입력하세요"
                        className="absolute w-[350px] h-[21px] top-[13px] left-[15px] text-black placeholder:text-gray-400 text-base bg-transparent border-none outline-none"
                        style={{ WebkitBoxShadow: '0 0 0 1000px white inset' }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-[13px] right-[10px] w-8 h-8 flex items-center justify-center cursor-pointer hover:text-gray-600 z-10"
                        style={{ backgroundColor: 'transparent', border: 'none' }}
                    >
                        {showPassword ? (
                            <FaEyeSlash size={18} color="#6B7280" />
                        ) : (
                            <FaEye size={18} color="#6B7280" />
                        )}
                    </button>
                </div>

                <div className="absolute w-[416px] h-[21px] top-[476px] left-[421px]">
                    <div className="absolute w-52 h-[21px] top-0 left-52">
                        <Link to="/find-password" className="absolute w-[105px] top-1 left-[51px] text-black text-sm text-center hover:text-gray-600 whitespace-nowrap">
                            비밀번호 찾기
                        </Link>
                    </div>
                    <div className="absolute w-52 h-[21px] top-0 left-0">
                        <div className="relative w-[206px] h-[21px] border-r border-gray-300">
                            <Link to="/signup" className="absolute w-[67px] top-1 left-[69px] text-black text-sm text-center hover:text-gray-600 whitespace-nowrap">
                                회원가입
                            </Link>
                        </div>
                    </div>
                </div>

                <button
                    className={`absolute w-[411px] h-12 top-[411px] left-[422px] rounded-lg flex items-center justify-center transition-colors focus:outline-none ${isLoginEnabled && !loading
                        ? 'bg-black text-white hover:bg-gray-800 cursor-pointer'
                        : 'bg-[#d9d9d9] text-white cursor-not-allowed'
                        }`}
                    style={{ borderRadius: '8px' }}
                    disabled={!isLoginEnabled || loading}
                    onClick={handleLogin}
                >
                    <div className="font-normal text-base text-center leading-6">
                        {loading ? "로그인 중..." : "로그인"}
                    </div>
                </button>

                <button onClick={handleKakaoLogin} className="absolute w-[411px] h-12 top-[526px] left-[422px] bg-[#fee500] rounded-lg flex items-center justify-center cursor-pointer hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-300" style={{ borderRadius: '8px' }}>
                    <div className="flex items-center space-x-2">
                        <RiKakaoTalkFill size={20} color="#000000" />
                        <span className="text-black font-semibold text-base">카카오 로그인</span>
                    </div>
                </button>
            </div>
        </div>
    );
};
