import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TopNav } from "../../components/TopNav";
import { AdminSideNav } from "../../components/AdminSideNav";
import api from "../../api/axios";
import { toast } from "react-toastify";

interface AdminUser {
    userId: number;
    nickname?: string;
    name?: string;
    email: string;
    role?: number | string; // 0/1/2 또는 문자열("전체관리자" 등)
    authList?: string[]; // 현재 권한(영문 코드)
}
interface FunctionNameDto {
    functionName: string;
    functionNameKr: string;
}

interface PermissionOption {
    functionName: string;
    functionNameKr: string;
    enabled?: boolean;
}

// HTTP-only 쿠키 기반 인증 - withCredentials로 자동 전송됨

// ===== [DUMMY-START] AccountRoles 테스트 더미 데이터 (나중에 전체 블록 삭제해도 무방) =====
const USE_DUMMY_ACCOUNT_ROLES = false; // 더미 사용: true / 실제 API 사용: false

const DUMMY_ADMINS: AdminUser[] = [
    {
        userId: 1,
        role: "전체관리자",
        nickname: "test",
        email: "aogoggog@gmail.com",
        authList: [
            "getBoothExperiences",
            "getExperienceReservations",
            "updateReservationStatus",
            "getList",
            "updateEventDetail",
            "getAllPayments",
            "getReservations",
            "getReservationAttendees",
            "getLogs"
        ]
    }
];

const DUMMY_PERMISSION_OPTIONS: PermissionOption[] = [
    { functionName: "getBoothExperiences", functionNameKr: "부스 체험 목록 조회", enabled: true },
    { functionName: "getExperienceReservations", functionNameKr: "체험 예매 내역 조회", enabled: true },
    { functionName: "updateReservationStatus", functionNameKr: "예매 상태 변경", enabled: true },
    { functionName: "getList", functionNameKr: "행사 목록 조회", enabled: true },
    { functionName: "updateEventDetail", functionNameKr: "행사 상세 수정", enabled: false },
    { functionName: "getAllPayments", functionNameKr: "전체 결제 조회", enabled: false },
    { functionName: "getReservations", functionNameKr: "예매 목록 조회", enabled: true },
    { functionName: "getReservationAttendees", functionNameKr: "참석자 목록 조회", enabled: false },
    { functionName: "getLogs", functionNameKr: "로그 조회", enabled: true }
];
// ===== [DUMMY-END] AccountRoles 테스트 더미 데이터 =====

const roleCodeToLabel = (role: number | string | undefined): string => {
    if (typeof role === "number") {
        if (role === 0) return "전체관리자";
        if (role === 1) return "행사관리자";
        if (role === 2) return "부스관리자";
        return String(role);
    }
    return role || "-";
};

export const AccountRoles: React.FC = () => {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalLoading, setModalLoading] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [permissionOptions, setPermissionOptions] = useState<PermissionOption[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
    const [permissionNameMap, setPermissionNameMap] = useState<Record<string, string>>({});

    const upsertPermissionMap = (options: PermissionOption[]) => {
        setPermissionNameMap(prev => {
            const next = { ...prev } as Record<string, string>;
            for (const o of options) {
                if (o.functionName && o.functionNameKr) next[o.functionName] = o.functionNameKr;
            }
            return next;
        });
    };

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            // 더미 모드
            if (USE_DUMMY_ACCOUNT_ROLES) {
                setAdmins(DUMMY_ADMINS);
                return;
            }
            // 백엔드에서 관리자 목록 + 현재 권한 배열 전달
            // 예시 응답: [{ userId, role, nickname, email, authList: ["getBoothExperiences", ...] }]
            const res = await api.get("/api/super-admin/get-admins");
            const list: AdminUser[] = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setAdmins(list);
        } catch (err) {
            console.error("관리자 목록 조회 실패:", err);
            setAdmins([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
        // 권한 한글명 매핑 선로딩: 더미 또는 글로벌 엔드포인트 시도
        (async () => {
            try {
                if (USE_DUMMY_ACCOUNT_ROLES) {
                    upsertPermissionMap(DUMMY_PERMISSION_OPTIONS);
                    return;
                }
                const res = await api.get('/api/super-admin/get-auth-list');
                const allOptions: PermissionOption[] = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                if (allOptions?.length) upsertPermissionMap(allOptions);
            } catch {
                // 글로벌 목록 엔드포인트가 없을 수 있으므로 조용히 패스
            }
        })();
    }, []);
const openEditModal = useCallback(async (user: AdminUser) => {
    setSelectedUser(user);
    setPermissionOptions([]);
    setSelectedPermissions(new Set(user.authList || []));
    setModalOpen(true);
    try {
        setModalLoading(true);
        // 백엔드에서 권한 목록 가져오기
        const res = await api.get('/api/super-admin/get-auth-list');
        const options: PermissionOption[] = Array.isArray(res.data)
    ? (res.data as FunctionNameDto[]).map(fn => ({
        functionName: fn.functionName,
        functionNameKr: fn.functionNameKr,
        enabled: user.authList?.includes(fn.functionName)
    }))
    : [];
        setPermissionOptions(options);
        // 체크된 권한 초기화
        const enabledFromApi = options.filter(o => o.enabled).map(o => o.functionName);
        setSelectedPermissions(new Set(enabledFromApi));
        // 한글 매핑 갱신
        if (options?.length) upsertPermissionMap(options);
    } catch (err) {
        console.error("권한 옵션 조회 실패:", err);
        toast.error("권한 목록을 불러오지 못했습니다.");
    } finally {
        setModalLoading(false);
    }
}, []);

    const togglePermission = (fnName: string) => {
        setSelectedPermissions(prev => {
            const next = new Set(prev);
            if (next.has(fnName)) next.delete(fnName);
            else next.add(fnName);
            return next;
        });
    };

    const handleSave = async () => {
    if (!selectedUser) return;
    try {
        setSaving(true);
        const payload = Array.from(selectedPermissions); // List<String> 형태
        console.log(selectedUser.userId);
        console.log("selectedUser.userId:", selectedUser.userId);
console.log("payload:", payload);
        await api.post(`/api/super-admin/modify-auth/${Number(selectedUser.userId)}`, payload);
        console.log("권한 저장 성공");
        toast.success("권한이 저장되었습니다.");
        // 로컬에도 즉시 반영
        const updated = Array.from(selectedPermissions);
        setAdmins(prev => prev.map(u => u.userId === selectedUser.userId ? { ...u, authList: updated } : u));
        setModalOpen(false);
        setSelectedUser(null);
        fetchAdmins(); // 목록 갱신
    } catch (err) {
        console.error("권한 저장 실패:", err);
        toast.error("권한 저장에 실패했습니다.");
    } finally {
        setSaving(false);
    }
};

    const getPermissionLabel = useCallback((code: string) => permissionNameMap[code] || code, [permissionNameMap]);

    const renderCurrentAuthBadges = useCallback((authList?: string[]) => {
        if (!authList || authList.length === 0) return <span className="text-gray-400">-</span>;
        const maxShow = 10; // 두 줄까지 최대한 많이 보여주기 위해 상한을 늘림
        const shown = authList.slice(0, maxShow);
        const remain = Math.max(0, authList.length - maxShow);
        return (
            <div className="flex flex-wrap gap-x-2 gap-y-2 justify-start">
                {shown.map((a) => (
                    <span key={a} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">{getPermissionLabel(a)}</span>
                ))}
                {remain > 0 && (
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-xs">+{remain}</span>
                )}
            </div>
        );
    }, [getPermissionLabel]);

    // 수정 모달에서 체크박스 토글 시, 해당 사용자의 현재 권한 표시를 즉시 반영하기 위한 프리뷰 헬퍼
    const getAuthListForUser = useCallback((user: AdminUser): string[] | undefined => {
        if (selectedUser && modalOpen && user.userId === selectedUser.userId) {
            return Array.from(selectedPermissions);
        }
        return user.authList;
    }, [modalOpen, selectedPermissions, selectedUser]);

    const tableBody = useMemo(() => {
        if (loading) {
            return (
                <div className="py-8 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    데이터를 불러오는 중...
                </div>
            );
        }
        if (!admins || admins.length === 0) {
            return (
                <div className="py-8 text-center text-gray-500">등록된 관리자 계정이 없습니다.</div>
            );
        }
        return admins.map((user, index) => (
            <div
                key={user.userId}
                className={`grid grid-cols-5 gap-y-2 gap-x-0 py-5 px-6 text-sm items-center ${index !== admins.length - 1 ? "border-b border-gray-200" : ""}`}
                style={{ gridTemplateColumns: '0.7fr 1.2fr 0.6fr 4.5fr 0.6fr' }}
            >
                <div className="text-left font-bold text-black truncate">{user.nickname || user.name || '-'}</div>
                <div className="text-gray-700 text-left truncate">{user.email}</div>
                <div className="text-center text-gray-700">{roleCodeToLabel(user.role)}</div>
                <div className="text-left pl-1">{renderCurrentAuthBadges(getAuthListForUser(user))}</div>
                <div className="text-center">
                    <button
                        onClick={() => openEditModal(user)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                    >
                        수정
                    </button>
                </div>
            </div>
        ));
    }, [admins, loading, openEditModal, renderCurrentAuthBadges, getAuthListForUser]);

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                {/* 페이지 제목 */}
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    권한 설정
                </div>

                {/* 사이드바 */}
                <AdminSideNav className="!absolute !left-0 !top-[117px]" />

                {/* 메인 콘텐츠 */}
                <div className="absolute left-64 top-[195px] w-[949px] pb-20 space-y-6">
                    {/* 카드: 관리자 계정 테이블 */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* 테이블 헤더 */}
                        <div className="bg-gray-50 border-b border-gray-200 py-4 px-6">
                            <div className="grid grid-cols-5 gap-y-2 gap-x-0 text-sm font-bold text-gray-700" style={{ gridTemplateColumns: '0.7fr 1.2fr 0.6fr 4.5fr 0.6fr' }}>
                                <div className="text-left">계정명</div>
                                <div className="text-left">이메일</div>
                                <div className="text-center">역할</div>
                                <div className="text-left pl-1">현재 권한</div>
                                <div className="text-center">수정</div>
                            </div>
                        </div>

                        {/* 테이블 바디 */}
                        <div>
                            {tableBody}
                        </div>
                    </div>
                </div>

                {/* 권한 수정 모달 */}
                {modalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                        <div className="bg-white rounded-[10px] shadow-xl w-[720px] max-h-[90vh] overflow-y-auto">
                            {/* 모달 헤더 */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">권한 설정</h2>
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    ×
                                </button>
                            </div>

                            {/* 모달 바디 */}
                            <div className="p-6 space-y-5">
                                <div className="text-sm text-gray-700">
                                    대상: <span className="font-bold text-black">{selectedUser?.nickname || selectedUser?.name}</span>
                                    <span className="ml-2 text-gray-500">({selectedUser?.email})</span>
                                </div>

                                {modalLoading ? (
                                    <div className="py-8 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        권한 목록을 불러오는 중...
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {permissionOptions.length === 0 ? (
                                            <div className="text-gray-500 text-sm">표시할 권한이 없습니다.</div>
                                        ) : (
                                            permissionOptions.map((opt) => {
                                                const checked = selectedPermissions.has(opt.functionName);
                                                return (
                                                    <label key={opt.functionName} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900">{opt.functionNameKr}</div>
                                                            <div className="text-xs text-gray-500">{opt.functionName}</div>
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => togglePermission(opt.functionName)}
                                                            className="h-4 w-4"
                                                        />
                                                    </label>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* 모달 푸터 */}
                            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    disabled={saving}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-[10px] text-sm font-medium hover:bg-gray-50 transition-colors focus:outline-none"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-6 py-2 bg-black text-white rounded-[10px] text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none disabled:opacity-50"
                                >
                                    {saving ? "저장 중..." : "저장"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountRoles;
