import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBoothDetails } from '../../api/boothApi';
import { Booth } from '../../types/booth';
import { useScrollToTop } from '../../hooks/useScrollToTop';

const BoothDetail: React.FC = () => {
    useScrollToTop();
    const { eventId, boothId } = useParams<{ eventId: string; boothId: string }>();
    const [booth, setBooth] = useState<Booth | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (eventId && boothId) {
            getBoothDetails(parseInt(eventId), parseInt(boothId))
                .then(data => {
                    setBooth(data);
                    setLoading(false);
                })
                .catch(err => {
                    setError('부스 정보를 불러오는 데 실패했습니다.');
                    setLoading(false);
                    console.error(err);
                });
        }
    }, [eventId, boothId]);

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>{error}</div>;
    if (!booth) return <div>부스 정보를 찾을 수 없습니다.</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <img src={booth.boothBannerUrl || '/placeholder.png'} alt={booth.boothTitle} style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px' }} />
            <h1 style={{ marginTop: '1.5rem' }}>{booth.boothTitle}</h1>
            <div
                className="prose prose-sm max-w-none"
                style={{ fontSize: '1.1rem', color: '#555', borderLeft: '4px solid #007bff', paddingLeft: '1rem', margin: '1.5rem 0' }}
                dangerouslySetInnerHTML={{ __html: booth.boothDescription }}
            />

            <h2>부스 정보</h2>
            <ul>
                <li><strong>위치:</strong> {booth.location}</li>
                <li><strong>운영 기간:</strong> {booth.startDate} ~ {booth.endDate}</li>
                <li><strong>부스 타입:</strong> {booth.boothTypeName}</li>
            </ul>

            <h2>담당자 정보</h2>
            <ul>
                <li><strong>이름:</strong> {booth.managerName}</li>
                <li><strong>이메일:</strong> {booth.contactEmail}</li>
                <li><strong>연락처:</strong> {booth.contactNumber}</li>
            </ul>

            {booth.boothExternalLinks && booth.boothExternalLinks.length > 0 && (
                <>
                    <h2>관련 링크</h2>
                    <ul>
                        {booth.boothExternalLinks.map((link, index) => (
                            <li key={index}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.displayText}</a></li>
                        ))}
                    </ul>
                </>
            )}

            <Link to={`/events/${eventId}/booths/apply`} style={{ display: 'inline-block', marginTop: '2rem', padding: '1rem 2rem', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px', fontSize: '1.2rem' }}>
                부스 신청하기
            </Link>
        </div>
    );
};

export default BoothDetail;
