import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applyForBooth, getBoothTypes } from '../../api/boothApi';
import { BoothType, BoothApplicationRequest } from '../../types/booth';

const BoothApplication: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<BoothApplicationRequest>({
        boothTitle: '',
        boothDescription: '',
        boothEmail: '',
        managerName: '',
        contactEmail: '',
        contactNumber: '',
        boothTypeId: 0,
        startDate: '',
        endDate: '',
        boothExternalLinks: [],
        boothBannerUrl: '',
    });
    const [boothTypes, setBoothTypes] = useState<BoothType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (eventId) {
            getBoothTypes(parseInt(eventId))
                .then(setBoothTypes)
                .catch(err => console.error('Failed to load booth types', err));
        }
    }, [eventId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventId) return;

        setSubmitting(true);
        setError(null);

        applyForBooth(parseInt(eventId), formData)
            .then(() => {
                alert('부스 신청이 완료되었습니다. 관리자 승인 후 이메일로 안내됩니다.');
                navigate(`/events/${eventId}/booths`); // Redirect to booth list after successful application
            })
            .catch(err => {
                setError('신청 처리 중 오류가 발생했습니다. 입력 내용을 확인해주세요.');
                console.error(err);
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    return (
        <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '2rem', border: '1px solid #eee', borderRadius: '10px' }}>
            <h1>부스 참가 신청</h1>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>부스 이름</label>
                    <input type="text" name="boothTitle" value={formData.boothTitle} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>부스 설명</label>
                    <textarea name="boothDescription" value={formData.boothDescription} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', minHeight: '120px' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>부스 이메일</label>
                    <input type="email" name="boothEmail" value={formData.boothEmail} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>부스 타입</label>
                    <select name="boothTypeId" value={formData.boothTypeId} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }}>
                        <option value="">타입을 선택하세요</option>
                        {boothTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.name} ({type.size}, {type.price.toLocaleString()}원)</option>
                        ))}
                    </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>운영 시작일</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>운영 종료일</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>부스 배너 URL (선택사항)</label>
                    <input type="url" name="boothBannerUrl" value={formData.boothBannerUrl || ''} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
                </div>
                <hr style={{ margin: '2rem 0' }} />
                <h2>담당자 정보</h2>
                <div style={{ marginBottom: '1rem' }}>
                    <label>담당자 이름</label>
                    <input type="text" name="managerName" value={formData.managerName} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>이메일</label>
                    <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>연락처</label>
                    <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
                </div>
                
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit" disabled={submitting} style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    {submitting ? '신청 중...' : '신청하기'}
                </button>
            </form>
        </div>
    );
};

export default BoothApplication;
