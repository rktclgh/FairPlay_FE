import React, {useEffect, useState} from 'react';
import {TopNav} from "../../components/TopNav";
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import paymentService from '../../services/paymentService';
import {BoothAdminSideNav} from "../../components/BoothAdminSideNav";
import {QrCode, Plus, Users, Clock, Edit} from 'lucide-react';

interface BoothExternalLink {
    displayText: string;
    url: string;
}

interface BoothData {
    boothId: number;
    boothTitle: string;
    boothDescription?: string;
    boothBannerUrl?: string;
    startDate: string;
    endDate: string;
    statusCode: string;
    statusName: string;
    paymentStatus: string;
    paymentStatusCode: string;
    boothTypeName: string;
    boothTypeSize: string;
    price: number;
    managerName: string;
    contactEmail: string;
    contactNumber?: string;
    eventTitle: string;
    eventId: number;
    location?: string;
    boothExternalLinks?: BoothExternalLink[];
}

const BoothAdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [booths, setBooths] = useState<BoothData[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState<number | null>(null);

    const [boothInfo] = useState({
        boothName: '더미 부스 A',
        eventName: '더미 이벤트',
        totalExperiences: 2,
        totalReservations: 15,
        activeReservations: 8
    })

    useEffect(() => {
        fetchBooths();
    }, []);

    const [recentExperiences] = useState([
        {
            id: 1,
            title: '더미 체험 A',
            date: '2024-01-15',
            time: '10:00 - 11:00',
            participants: 3,
            maxCapacity: 10
        },
        {
            id: 2,
            title: '더미 체험 B',
            date: '2024-01-15',
            time: '14:00 - 15:30',
            participants: 5,
            maxCapacity: 12
        }
    ]);

    // boothId, eventId 전달 필요
    const handleQRScan = () => {
        navigate('/booth-admin/qr-scan', {
            state: { eventId: 1, boothId: 1 } // 상태 전달
        });
    };

    const handleExperienceManagement = () => {
        navigate('/booth-admin/experience-management');
    };

    const handleReservationManagement = () => {
        navigate('/booth-admin/experience-reserver-management');
    };

    const handleEditBooth = (boothId: number) => {
        navigate('/booth-admin/info-management');
    };

    const fetchBooths = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/booths/my-booths`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error('로그인이 필요합니다. 다시 로그인해주세요.');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    navigate('/login');
                    return;
                }
                throw new Error(`HTTP ${response.status}: 부스 신청 정보를 불러올 수 없습니다.`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Response is not JSON:', await response.text());
                throw new Error('서버에서 올바르지 않은 응답을 받았습니다. 로그인 상태를 확인해주세요.');
            }

            const data = await response.json();
            console.log('Booths:', data);
            setBooths(data);
        } catch (error) {
            console.error('Booth fetch error:', error);
            if (error instanceof Error && error.message.includes('JSON')) {
                toast.error('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                navigate('/login');
            } else {
                toast.error(error instanceof Error ? error.message : '데이터를 불러오는 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (booth: BoothData) => {
        if (booth.paymentStatusCode === 'PAID') {
            toast.info('이미 결제가 완료된 부스입니다.');
            return;
        }

        setPaymentLoading(booth.boothId);

        try {
            // 1. 결제 요청 데이터 준비
            const merchantUid = `booth_${Date.now()}`;
            const paymentRequestData = {
                merchantUid: merchantUid,
                impUid: null, // 아직 없음
                targetId: booth.boothId,
                price: booth.price,
                quantity: 1,
                amount: booth.price,
                paymentMethod: 'card',
                paymentTargetType: 'BOOTH'
            };

            // 2. 백엔드에 결제 정보 저장
            const requestResponse = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/booths/payment/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(paymentRequestData),
            });

            if (!requestResponse.ok) {
                throw new Error('결제 정보 저장 실패');
            }

            // 3. 아임포트 초기화
            await paymentService.initialize();

            // 4. 아임포트 결제 요청
            const paymentRequest = {
                pg: 'uplus',
                pay_method: 'card',
                merchant_uid: merchantUid,
                name: `${booth.eventTitle || '이벤트'} - ${booth.boothTitle}`,
                amount: booth.price,
                buyer_email: booth.contactEmail,
                buyer_name: booth.managerName
            };

            const paymentResponse = await paymentService.requestPayment(paymentRequest);

            if (!paymentResponse.success) {
                throw new Error(paymentResponse.error_msg || '결제가 취소되었습니다.');
            }

            // 5. 결제 성공 시 백엔드에 결제 완료 알림
            const completeResponse = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/booths/payment/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({
                    merchantUid: paymentResponse.merchant_uid,
                    impUid: paymentResponse.imp_uid,
                    targetId: booth.boothId,
                    status: 'PAID'
                }),
            });

            if (!completeResponse.ok) {
                throw new Error('결제 완료 처리에 실패했습니다.');
            }

            toast.success('결제가 성공적으로 완료되었습니다!');

            // 부스 신청 정보 다시 로드
            await fetchBooths();

        } catch (error) {
            console.error('Payment error:', error);
            toast.error(error instanceof Error ? error.message : '결제 중 오류가 발생했습니다.');
        } finally {
            setPaymentLoading(null);
        }
    };

    const canAccessOtherFeatures = (booth: BoothData) => {
        return booth.paymentStatusCode === 'PAID' && booth.statusCode === 'APPROVED';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav/>

                {/* 페이지 제목 */}
                <div
                    className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    부스 현황
                </div>

                {/* 사이드바 */}
                <BoothAdminSideNav className="!absolute !left-0 !top-[117px]"/>

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20">
                    {/* 헤더 */}
                    <div className="mb-6">
                        <p className="text-gray-600">부스 운영 현황을 한눈에 확인하세요</p>
                    </div>

                    {booths.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M5 21h2m0 0h2m-4 0v-2m0 0V7a2 2 0 012-2h2m0 16h2m0 0v-2"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">신청한 부스가 없습니다</h3>
                            <p className="text-gray-600">먼저 부스를 신청해주세요.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {booths.map((booth) => (
                                <div key={booth.boothId}
                                     className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    <div className="p-6">
                                        {/* Status Bar */}
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h2 className="text-xl font-semibold text-gray-900">{booth.boothTitle}</h2>
                                                <p className="text-gray-600">{booth.eventTitle || '이벤트 정보 없음'}</p>
                                            </div>
                                            <div className="flex space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          booth.statusCode === 'APPROVED' || booth.statusCode === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : booth.statusCode === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                      }`}>
                        {booth.statusName || booth.statusCode}
                      </span>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    booth.paymentStatusCode === 'PAID'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-orange-100 text-orange-800'
                                                }`}>
                        {booth.paymentStatus || booth.paymentStatusCode}
                      </span>
                                            </div>
                                        </div>

                                        {/* Feature Access */}
                                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                            {/* 부스 정보 요약 */}
                                            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">부스 정보</h3>
                                                
                                                {/* 배너 이미지 */}
                                                {booth.boothBannerUrl && (
                                                    <div className="mb-4">
                                                        <label className="block text-sm font-medium text-gray-500 mb-2">부스 배너</label>
                                                        <div className="w-64 h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                            <img 
                                                                src={booth.boothBannerUrl} 
                                                                alt="부스 배너" 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Booth Info Grid */}
                                                <div className="grid gap-4 mb-6" style={{gridTemplateColumns: '1fr 0.7fr 1.5fr 1fr'}}>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500">부스 타입</label>
                                                        <div className="mt-1 text-gray-900">{booth.boothTypeName}</div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500">크기</label>
                                                        <div className="mt-1 text-gray-900 text-sm">
                                                            {booth.boothTypeSize
                                                                ? booth.boothTypeSize.replace('x', 'm x ') + 'm'
                                                                : '미지정'
                                                            }
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500">운영 기간</label>
                                                        <div className="mt-1 text-gray-900">
                                                            {booth.startDate ? new Date(booth.startDate).toLocaleDateString() : ''} ~ {booth.endDate ? new Date(booth.endDate).toLocaleDateString() : ''}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500">결제 금액</label>
                                                        <div className="mt-1 text-lg font-semibold text-gray-900">
                                                            {booth.price?.toLocaleString() || 0}원
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 위치 정보 */}
                                                {booth.location && (
                                                    <div className="mb-4">
                                                        <label className="block text-sm font-medium text-gray-500">위치</label>
                                                        <div className="mt-1 text-gray-900">{booth.location}</div>
                                                    </div>
                                                )}

                                                {/* 외부 링크 */}
                                                {booth.boothExternalLinks && booth.boothExternalLinks.length > 0 && (
                                                    <div className="mb-4">
                                                        <label className="block text-sm font-medium text-gray-500 mb-2">외부 링크</label>
                                                        <div className="space-y-2">
                                                            {booth.boothExternalLinks.map((link, index) => (
                                                                <div key={index} className="flex items-center space-x-2">
                                                                    <span className="text-gray-700 font-medium">{link.displayText}:</span>
                                                                    <a 
                                                                        href={link.url} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer" 
                                                                        className="text-blue-600 hover:text-blue-800 underline break-all"
                                                                    >
                                                                        {link.url}
                                                                    </a>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 부스 설명 */}
                                                {booth.boothDescription && (
                                                    <div className="mb-4">
                                                        <label className="block text-sm font-medium text-gray-500 mb-2">부스 설명</label>
                                                        <div 
                                                            className="text-gray-900 prose prose-sm max-w-none"
                                                            dangerouslySetInnerHTML={{ __html: booth.boothDescription }}
                                                        />
                                                    </div>
                                                )}

                                                {/* Payment Section */}
                                                {booth.statusCode === 'APPROVED' && booth.paymentStatusCode === 'PENDING' && (
                                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-yellow-800">💳 결제가
                                                                    필요합니다</h3>
                                                                <p className="text-yellow-700 text-sm">부스 운영을 위해 결제를 완료해주세요.</p>
                                                            </div>
                                                            <button
                                                                onClick={() => handlePayment(booth)}
                                                                disabled={paymentLoading === booth.boothId}
                                                                className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50"
                                                            >
                                                                {paymentLoading === booth.boothId ? '결제 중...' : '결제하기'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 통계 카드 */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                                <div className="bg-white rounded-lg shadow-md p-6">
                                                    <div className="flex items-center">
                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                            <Plus className="w-6 h-6 text-blue-600" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <p className="text-sm font-medium text-gray-600">등록된 체험</p>
                                                            <p className="text-2xl font-semibold text-gray-900">{boothInfo.totalExperiences}개</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white rounded-lg shadow-md p-6">
                                                    <div className="flex items-center">
                                                        <div className="p-2 bg-green-100 rounded-lg">
                                                            <Users className="w-6 h-6 text-green-600" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <p className="text-sm font-medium text-gray-600">총 예약</p>
                                                            <p className="text-2xl font-semibold text-gray-900">{boothInfo.totalReservations}명</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white rounded-lg shadow-md p-6">
                                                    <div className="flex items-center">
                                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                                            <Clock className="w-6 h-6 text-yellow-600" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <p className="text-sm font-medium text-gray-600">활성 예약</p>
                                                            <p className="text-2xl font-semibold text-gray-900">{boothInfo.activeReservations}명</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 최근 체험 목록 */}
                                            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-900">최근 체험 목록</h3>
                                                    <button
                                                        onClick={handleExperienceManagement}
                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        전체 보기 →
                                                    </button>
                                                </div>
                                                <div className="space-y-4">
                                                    {recentExperiences.map((experience) => (
                                                        <div key={experience.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">{experience.title}</h4>
                                                                <p className="text-sm text-gray-600">{experience.date} {experience.time}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm text-gray-600">
                                                                    참여자: {experience.participants}/{experience.maxCapacity}명
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* 빠른 액션 */}
                                            <div className="bg-white rounded-lg shadow-md p-6">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 액션</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <button
                                                        onClick={() => handleEditBooth(booth.boothId)}
                                                        className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <Edit className="w-6 h-6 text-orange-600 mr-2" />
                                                        <span className="font-medium">정보 수정</span>
                                                    </button>
                                                    <button
                                                        onClick={handleQRScan}
                                                        className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <QrCode className="w-6 h-6 text-blue-600 mr-2" />
                                                        <span className="font-medium">QR 스캔</span>
                                                    </button>
                                                    <button
                                                        onClick={handleExperienceManagement}
                                                        className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <Plus className="w-6 h-6 text-green-600 mr-2" />
                                                        <span className="font-medium">체험 관리</span>
                                                    </button>
                                                    <button
                                                        onClick={handleReservationManagement}
                                                        className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <Users className="w-6 h-6 text-purple-600 mr-2" />
                                                        <span className="font-medium">예약 현황</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BoothAdminDashboard;