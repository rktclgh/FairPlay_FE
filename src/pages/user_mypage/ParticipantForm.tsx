import React, { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { useNavigate, useSearchParams } from "react-router-dom";
import RegistrationSuccessModal from "../../components/RegistrationSuccessModal";
import WarningModal from "../../components/WarningModal";
import { eventApi } from "../../services/api";

export default function ParticipantForm(): JSX.Element {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const eventName = searchParams.get('eventName') || '행사';
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        agreeToTerms: false
    });
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [registeredParticipant, setRegisteredParticipant] = useState<any>(null);
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const [warningTitle, setWarningTitle] = useState("");
    const [warningMessage, setWarningMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        if (name === 'phone') {
            // 숫자만 허용하고 11자리로 제한
            const numericValue = value.replace(/[^0-9]/g, '');
            if (numericValue.length <= 11) {
                // 하이픈 자동 추가
                let formattedValue = numericValue;
                if (numericValue.length >= 3 && numericValue.length <= 7) {
                    formattedValue = numericValue.slice(0, 3) + '-' + numericValue.slice(3);
                } else if (numericValue.length >= 8) {
                    formattedValue = numericValue.slice(0, 3) + '-' + numericValue.slice(3, 7) + '-' + numericValue.slice(7);
                }

                setFormData(prev => ({
                    ...prev,
                    [name]: formattedValue
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.agreeToTerms) {
            alert("개인정보 수집 및 이용에 동의해주세요.");
            return;
        }
        if (!formData.name || !formData.phone || !formData.email) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        // 행사별 참여자 목록 가져오기
        const eventKey = `participants_${eventName}`;
        const existingParticipants = JSON.parse(localStorage.getItem(eventKey) || '[]');

        // 행사별 최대 참여자 수 확인
        const getMaxParticipants = (eventName: string): number => {
            if (eventName === "웨덱스 웨딩박람회 in COEX") return 1; // 계정 주인 + 1명 = 총 2명
            if (eventName === "G-DRAGON 콘서트: WORLD TOUR") return 2; // 계정 주인 + 2명 = 총 3명
            return 10; // 기본값
        };

        const maxParticipants = getMaxParticipants(eventName);

        // 현재 등록된 참여자 수가 최대치에 도달했는지 확인
        if (existingParticipants.length >= maxParticipants) {
            setWarningTitle("참여자 등록 완료");
            setWarningMessage("이미 모든 참석자의 정보가 제출되었습니다.");
            setIsWarningModalOpen(true);
            return;
        }

        // localStorage에 참여자 정보 저장
        const newParticipant = {
            id: `participant-${Date.now()}`,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            registrationDate: new Date().toISOString().split('T')[0],
            isOwner: false
        };

        // 새 참여자 추가
        const updatedParticipants = [...existingParticipants, newParticipant];

        // localStorage에 행사별로 저장
        localStorage.setItem(eventKey, JSON.stringify(updatedParticipants));

        // 성공 모달 표시
        setRegisteredParticipant(newParticipant);
        setIsSuccessModalOpen(true);
    };



    const handleSuccessModalClose = () => {
        setIsSuccessModalOpen(false);
        setRegisteredParticipant(null);
        navigate("/mypage/tickets");
    };

    const handleWarningModalClose = () => {
        setIsWarningModalOpen(false);
        navigate("/mypage/tickets");
    };

    // 토큰 검증 API 호출
    const validateToken = async () => {
        try {
            // URL에서 토큰 추출 (예: ?token=abc123)
            const token = searchParams.get('token');
            if (!token) {
                // 토큰이 없는 경우에도 테스트를 위해 기본값 사용
                console.log("토큰이 없음, 테스트용 기본값 사용");
                const testToken = 'valid'; // 테스트용 유효한 토큰
                const response = await eventApi.validateParticipantToken(testToken, eventName);
                setIsLoading(false);
                return true;
            }

            // API 호출
            const response = await eventApi.validateParticipantToken(token, eventName);

            // 성공 응답
            setIsLoading(false);
            return true;
        } catch (error: any) {
            setIsLoading(false);

            // 에러 응답에 따른 처리
            if (error.response?.status === 410) {
                // 모든 참석자 정보 제출 완료
                setWarningTitle("참여자 등록 완료");
                setWarningMessage("이미 모든 참석자의 정보가 제출되었습니다.");
                setIsWarningModalOpen(true);
                return false;
            } else if (error.response?.status === 401) {
                // 만료된 링크
                setWarningTitle("만료된 링크");
                setWarningMessage("참여자 정보 입력 기한이 지났습니다.\n대표자 및 행사 관리자에게 문의 바랍니다.");
                setIsWarningModalOpen(true);
                return false;
            } else if (error.response?.status === 400) {
                // 잘못된 링크
                setWarningTitle("잘못된 링크");
                setWarningMessage("유효하지 않은 링크입니다.");
                setIsWarningModalOpen(true);
                return false;
            } else {
                // 기타 에러
                setWarningTitle("오류 발생");
                setWarningMessage("일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.");
                setIsWarningModalOpen(true);
                return false;
            }
        }
    };

    // 페이지 로드 시 토큰 검증
    useEffect(() => {
        // 토큰 검증 실행
        validateToken();
    }, [eventName]);

    if (isLoading) {
        return (
            <div className="bg-white flex flex-col items-center min-h-screen w-full">
                <TopNav />
                <div className="w-full flex flex-col items-center">
                    <div className="w-full max-w-[800px] mt-20 mb-8 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">링크를 확인하는 중입니다...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white flex flex-col items-center min-h-screen w-full">
            <TopNav />
            <div className="w-full flex flex-col items-center">
                <div className="w-full max-w-[800px] mt-20 mb-8">
                    <h1 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[54px] mb-8">참여자 정보 입력</h1>
                    {/* 폼 컨테이너 시작 */}
                    <div className="bg-white">
                        {/* 개인정보 수집 및 이용 동의 섹션 */}
                        <div className="mb-8">
                            <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">
                                개인정보 수집 및 이용 동의
                            </h2>
                            <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto mb-4">
                                <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-sm leading-6 tracking-[0]">
                                    <p className="mb-2">1. 수집하는 개인정보 항목</p>
                                    <p className="mb-2">- 필수항목: 이름, 연락처, 이메일</p>
                                    <p className="mb-2">- 선택항목: 없음</p>
                                    <p className="mb-2">2. 개인정보의 수집 및 이용목적</p>
                                    <p className="mb-2">- 이벤트 참여자 관리 및 안내</p>
                                    <p className="mb-2">- 이벤트 관련 정보 전달</p>
                                    <p className="mb-2">3. 개인정보의 보유 및 이용기간</p>
                                    <p className="mb-2">- 이벤트 종료 후 1년까지</p>
                                    <p className="mb-2">4. 동의 거부권 및 거부에 따른 불이익</p>
                                    <p>개인정보 수집 및 이용에 동의하지 않을 경우 이벤트 참여가 제한될 수 있습니다.</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="agreeToTerms"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <label htmlFor="agreeToTerms" className="[font-family:'Roboto-Medium',Helvetica] font-medium text-black text-sm tracking-[0]">
                                    개인정보 수집 및 이용에 동의합니다.
                                </label>
                            </div>
                        </div>

                        {/* 참여자 정보 섹션 */}
                        <div className="mb-8">
                            <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg leading-[30px] tracking-[0] block text-left mb-6">
                                참여자 정보
                            </h2>
                            <div className="grid grid-cols-2 gap-8">
                                {/* 이름 */}
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                        이름
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="이름을 입력하세요"
                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.name ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                    />
                                </div>
                                {/* 휴대폰 번호 */}
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                        휴대폰 번호
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="010-1234-5678"
                                        maxLength={13}
                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.phone ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                    />
                                </div>
                                {/* 이메일 */}
                                <div>
                                    <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                                        이메일
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="example@email.com"
                                        className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${formData.email ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* 폼 컨테이너 끝 */}
                    <div className="flex flex-col items-center space-y-4 mt-8">
                        <button
                            onClick={handleSubmit}
                            disabled={!formData.agreeToTerms || !formData.name || !formData.phone || !formData.email}
                            className={`px-6 py-2 rounded-[10px] transition-colors text-sm ${formData.agreeToTerms && formData.name && formData.phone && formData.email
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-400 text-white cursor-not-allowed'
                                }`}
                        >
                            등록
                        </button>
                        <p className="text-sm text-gray-500 text-center">
                            모든 필수 항목을 입력하고 개인정보 수집 및 이용에 동의해주세요.
                        </p>
                    </div>
                </div>
            </div>

            <RegistrationSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={handleSuccessModalClose}
                participant={registeredParticipant}
                eventName={eventName}
            />
            <WarningModal
                isOpen={isWarningModalOpen}
                onClose={handleWarningModalClose}
                title={warningTitle}
                message={warningMessage}
            />
        </div>
    );
} 