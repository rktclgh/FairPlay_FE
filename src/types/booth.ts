export interface Booth {
    boothId: number;
    boothTitle: string;
    boothBannerUrl?: string;
    boothDescription: string;
    boothTypeName: string;
    location: string;
    startDate: string; // Assuming ISO date string
    endDate: string;   // Assuming ISO date string
    managerName: string;
    contactEmail: string;
    contactNumber: string;
    boothExternalLinks: ExternalLink[];
}

export interface BoothSummary {
    boothId: number;
    boothTitle: string;
    boothBannerUrl?: string;
    location: string;
}

export interface ExternalLink {
    url: string;
    displayText: string;
}

export interface BoothUpdateRequest {
    boothTitle?: string;
    boothDescription?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    boothExternalLinks?: ExternalLink[];
    deletedFileIds?: number[];
    tempFiles?: any[]; // Define temp file type more accurately if possible
}

export interface BoothType {
    id: number;
    name: string;
    size: string;
    price: number;
    maxApplicants: number;
}

export interface BoothApplication {
    id: number;
    boothTitle: string;
    boothDescription: string;
    boothTypeName: string;
    managerName: string;
    contactEmail: string;
    contactNumber: string;
    // Add other fields from backend DTOs as needed
}

export interface BoothApplicationStatusUpdate {
    status: 'APPROVED' | 'REJECTED';
    reason?: string;
}

export interface BoothPaymentStatusUpdate {
    paymentStatus: 'PAID' | 'CANCELLED'; // Or other statuses
}
