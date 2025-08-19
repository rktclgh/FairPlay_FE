import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBooths } from '../../api/boothApi';
import { BoothSummary } from '../../types/booth';

const BoothList: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [booths, setBooths] = useState<BoothSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (eventId) {
            getBooths(parseInt(eventId))
                .then(data => {
                    // Assuming the summary response DTO matches BoothSummary
                    // You might need to adjust the type or mapping
                    setBooths(data as any);
                    setLoading(false);
                })
                .catch(err => {
                    setError('부스 목록을 불러오는 데 실패했습니다.');
                    setLoading(false);
                    console.error(err);
                });
        }
    }, [eventId]);

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <h1>부스 목록</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {booths.map(booth => (
                    <div key={booth.boothId} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', textDecoration: 'none', color: 'inherit' }}>
                        <Link to={`/events/${eventId}/booths/${booth.boothId}`}>
                            <img src={booth.boothBannerUrl || '/placeholder.png'} alt={booth.boothTitle} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px' }} />
                            <h2 style={{ marginTop: '1rem', fontSize: '1.25rem' }}>{booth.boothTitle}</h2>
                            <p style={{ color: '#666' }}>{booth.location}</p>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BoothList;
