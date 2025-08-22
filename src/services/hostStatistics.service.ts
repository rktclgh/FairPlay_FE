import type { Fetcher } from "react-router-dom";
import api from "../api/axios";
import type { get } from "http";

export interface HostEventReservationDto {
  totalRate : number;
  averageRate : number;
  topRate : number;
  bottomRate : number;
}

export interface getDailyTrend {
  date: string;
  reservationRate : number;
}



export const hostStatisticsService = {
  async getEventReservationStatistics(userId: number): Promise<HostEventReservationDto> {
    const res = await api.get<HostEventReservationDto>(
      `/api/host/reservation/get-event-reservation-statistics/${userId}`
    );
    return res.data || {
      totalRate: 0,
      averageRate: 0,
      topRate: 0,
      bottomRate: 0
    };
  },
  async getDailyTrend(userId: number): Promise<getDailyTrend[]> {
    const res = await api.get<getDailyTrend[]>(
      `/api/host/reservation/get-daily-trend/${userId}`
    );
    return res.data || [];
  }
};