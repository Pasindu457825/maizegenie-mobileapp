/**
 * Advice Request API Service
 * Handles communication with FastAPI backend for farmer advice requests
 */

import { API_BASE } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// REQUEST INTERFACES
// ============================================================

export interface CreateAdviceRequestData {
    yield_prediction_id: string;
    request_type: 'yield_enhancement' | 'seed_variety' | 'both';
    farmer_message?: string;
    predicted_yield_kg_ha?: number;
    district?: string;
    location?: string;
    variety?: string;
    land_size_ha?: number;
    irrigation_type?: string;
    rainfall_condition?: string;
    planting_date?: string;
}

export interface UpdateAdviceRequestData {
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    assigned_officer_id?: string;
    officer_response?: string;
    officer_notes?: string;
    fertilizer_plan?: any; // JSONB structure from fertilizerCalculator
    cultivation_advice?: string;
    expected_yield_improvement?: string;
}

export interface CancelAdviceRequestData {
    reason?: string;
}

// ============================================================
// RESPONSE INTERFACES
// ============================================================

export interface AdviceRequest {
    id: string;
    farmer_id: string;
    yield_prediction_id?: string;
    request_type: 'yield_enhancement' | 'seed_variety' | 'both';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    farmer_message?: string;
    predicted_yield_kg_ha?: number;
    district?: string;
    location?: string;
    variety?: string;
    land_size_ha?: number;
    irrigation_type?: string;
    rainfall_condition?: string;
    planting_date?: string;
    assigned_officer_id?: string;
    officer_response?: string;
    officer_notes?: string;
    fertilizer_plan?: any;
    cultivation_advice?: string;
    expected_yield_improvement?: string;
    created_at: string;
    updated_at?: string;
    responded_at?: string;
    completed_at?: string;
}

export interface AdviceRequestListResponse {
    requests: AdviceRequest[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface AdviceRequestStats {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    cancelled: number;
}

export interface AdviceRequestFilters {
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    request_type?: 'yield_enhancement' | 'seed_variety' | 'both';
    district?: string;
    assigned_officer_id?: string;
    farmer_id?: string;
    date_from?: string;
    date_to?: string;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const token = await AsyncStorage.getItem('auth_token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
};

const handleApiError = async (response: Response): Promise<never> => {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    
    if (response.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
    }
    
    if (response.status === 403) {
        throw new Error(errorData.detail || 'You do not have permission to perform this action.');
    }
    
    if (response.status === 404) {
        throw new Error('Request not found.');
    }
    
    throw new Error(errorData.detail || errorData.message || 'Request failed');
};

// ============================================================
// API FUNCTIONS - CREATE
// ============================================================

/**
 * Create a new advice request (Farmer only)
 * @param data Advice request data
 * @returns Created advice request
 */
export const createAdviceRequest = async (
    data: CreateAdviceRequestData
): Promise<AdviceRequest> => {
    try {
        console.log('📝 Creating advice request...');
        console.log('📦 Request Data:', JSON.stringify(data, null, 2));

        const headers = await getAuthHeaders();
        
        const response = await fetch(`${API_BASE}/api/v1/advice-requests`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        console.log('📡 Response Status:', response.status);

        if (!response.ok) {
            await handleApiError(response);
        }

        const result: AdviceRequest = await response.json();
        console.log('✅ Advice request created:', result.id);
        
        return result;
    } catch (error) {
        console.error('❌ Create Advice Request Error:', error);
        throw error;
    }
};

// ============================================================
// API FUNCTIONS - READ
// ============================================================

/**
 * List advice requests with filters and pagination
 * Officers see all, Farmers see only their own
 * @param filters Optional filters
 * @param page Page number (default: 1)
 * @param pageSize Items per page (default: 20)
 * @returns Paginated list of advice requests
 */
export const listAdviceRequests = async (
    filters?: AdviceRequestFilters,
    page: number = 1,
    pageSize: number = 20
): Promise<AdviceRequestListResponse> => {
    try {
        console.log('📋 Fetching advice requests...');

        const headers = await getAuthHeaders();
        
        // Build query params
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('page_size', pageSize.toString());
        
        if (filters) {
            if (filters.status) params.append('status', filters.status);
            if (filters.priority) params.append('priority', filters.priority);
            if (filters.request_type) params.append('request_type', filters.request_type);
            if (filters.district) params.append('district', filters.district);
            if (filters.assigned_officer_id) params.append('assigned_officer_id', filters.assigned_officer_id);
            if (filters.farmer_id) params.append('farmer_id', filters.farmer_id);
            if (filters.date_from) params.append('date_from', filters.date_from);
            if (filters.date_to) params.append('date_to', filters.date_to);
        }
        
        const response = await fetch(
            `${API_BASE}/api/v1/advice-requests?${params.toString()}`,
            {
                method: 'GET',
                headers,
            }
        );

        if (!response.ok) {
            await handleApiError(response);
        }

        const result: AdviceRequestListResponse = await response.json();
        console.log(`✅ Fetched ${result.requests.length} requests (total: ${result.total})`);
        
        return result;
    } catch (error) {
        console.error('❌ List Advice Requests Error:', error);
        throw error;
    }
};

/**
 * Get advice request statistics
 * @returns Statistics object
 */
export const getAdviceRequestStats = async (): Promise<AdviceRequestStats> => {
    try {
        console.log('📊 Fetching advice request stats...');

        const headers = await getAuthHeaders();
        
        const response = await fetch(`${API_BASE}/api/v1/advice-requests/stats`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        const result: AdviceRequestStats = await response.json();
        console.log('✅ Stats:', result);
        
        return result;
    } catch (error) {
        console.error('❌ Get Stats Error:', error);
        throw error;
    }
};

/**
 * Get farmer's own advice requests
 * @param status Optional status filter
 * @param limit Maximum number of requests (default: 20)
 * @returns List of farmer's requests
 */
export const getMyAdviceRequests = async (
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled',
    limit: number = 20
): Promise<AdviceRequest[]> => {
    try {
        console.log('📋 Fetching my advice requests...');

        const headers = await getAuthHeaders();
        
        const params = new URLSearchParams();
        params.append('limit', limit.toString());
        if (status) params.append('status', status);
        
        const response = await fetch(
            `${API_BASE}/api/v1/advice-requests/my-requests?${params.toString()}`,
            {
                method: 'GET',
                headers,
            }
        );

        if (!response.ok) {
            await handleApiError(response);
        }

        const result: AdviceRequest[] = await response.json();
        console.log(`✅ Fetched ${result.length} of my requests`);
        
        return result;
    } catch (error) {
        console.error('❌ Get My Requests Error:', error);
        throw error;
    }
};

/**
 * Get a single advice request by ID
 * @param requestId Request ID
 * @returns Advice request details
 */
export const getAdviceRequest = async (
    requestId: string
): Promise<AdviceRequest> => {
    try {
        console.log('📋 Fetching advice request:', requestId);

        const headers = await getAuthHeaders();
        
        const response = await fetch(
            `${API_BASE}/api/v1/advice-requests/${requestId}`,
            {
                method: 'GET',
                headers,
            }
        );

        if (!response.ok) {
            await handleApiError(response);
        }

        const result: AdviceRequest = await response.json();
        console.log('✅ Fetched request:', result.id);
        
        return result;
    } catch (error) {
        console.error('❌ Get Advice Request Error:', error);
        throw error;
    }
};

// ============================================================
// API FUNCTIONS - UPDATE
// ============================================================

/**
 * Update an advice request (Officer only)
 * @param requestId Request ID
 * @param data Update data
 * @returns Updated advice request
 */
export const updateAdviceRequest = async (
    requestId: string,
    data: UpdateAdviceRequestData
): Promise<AdviceRequest> => {
    try {
        console.log('📝 Updating advice request:', requestId);

        const headers = await getAuthHeaders();
        
        const response = await fetch(
            `${API_BASE}/api/v1/advice-requests/${requestId}`,
            {
                method: 'PATCH',
                headers,
                body: JSON.stringify(data),
            }
        );

        if (!response.ok) {
            await handleApiError(response);
        }

        const result: AdviceRequest = await response.json();
        console.log('✅ Updated request:', result.id);
        
        return result;
    } catch (error) {
        console.error('❌ Update Advice Request Error:', error);
        throw error;
    }
};

/**
 * Assign request to current officer
 * @param requestId Request ID
 * @returns Updated advice request
 */
export const assignAdviceRequest = async (
    requestId: string
): Promise<AdviceRequest> => {
    try {
        console.log('👤 Assigning advice request:', requestId);

        const headers = await getAuthHeaders();
        
        const response = await fetch(
            `${API_BASE}/api/v1/advice-requests/${requestId}/assign`,
            {
                method: 'POST',
                headers,
            }
        );

        if (!response.ok) {
            await handleApiError(response);
        }

        const result: AdviceRequest = await response.json();
        console.log('✅ Assigned request:', result.id);
        
        return result;
    } catch (error) {
        console.error('❌ Assign Request Error:', error);
        throw error;
    }
};

/**
 * Complete an advice request with officer response
 * @param requestId Request ID
 * @param officerResponse Officer's advice response
 * @param officerNotes Optional internal notes
 * @returns Completed advice request
 */
export const completeAdviceRequest = async (
    requestId: string,
    officerResponse: string,
    officerNotes?: string
): Promise<AdviceRequest> => {
    try {
        console.log('✅ Completing advice request:', requestId);

        const headers = await getAuthHeaders();
        
        const params = new URLSearchParams();
        params.append('officer_response', officerResponse);
        if (officerNotes) params.append('officer_notes', officerNotes);
        
        const response = await fetch(
            `${API_BASE}/api/v1/advice-requests/${requestId}/complete?${params.toString()}`,
            {
                method: 'POST',
                headers,
            }
        );

        if (!response.ok) {
            await handleApiError(response);
        }

        const result: AdviceRequest = await response.json();
        console.log('✅ Completed request:', result.id);
        
        return result;
    } catch (error) {
        console.error('❌ Complete Request Error:', error);
        throw error;
    }
};

/**
 * Cancel an advice request (Farmer only, pending requests only)
 * @param requestId Request ID
 * @param reason Optional cancellation reason
 * @returns Cancelled advice request
 */
export const cancelAdviceRequest = async (
    requestId: string,
    reason?: string
): Promise<AdviceRequest> => {
    try {
        console.log('❌ Cancelling advice request:', requestId);

        const headers = await getAuthHeaders();
        
        const response = await fetch(
            `${API_BASE}/api/v1/advice-requests/${requestId}/cancel`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify({ reason }),
            }
        );

        if (!response.ok) {
            await handleApiError(response);
        }

        const result: AdviceRequest = await response.json();
        console.log('✅ Cancelled request:', result.id);
        
        return result;
    } catch (error) {
        console.error('❌ Cancel Request Error:', error);
        throw error;
    }
};

// ============================================================
// API FUNCTIONS - DELETE
// ============================================================

/**
 * Delete an advice request (Farmer only, pending requests only)
 * @param requestId Request ID
 */
export const deleteAdviceRequest = async (
    requestId: string
): Promise<void> => {
    try {
        console.log('🗑️ Deleting advice request:', requestId);

        const headers = await getAuthHeaders();
        
        const response = await fetch(
            `${API_BASE}/api/v1/advice-requests/${requestId}`,
            {
                method: 'DELETE',
                headers,
            }
        );

        if (!response.ok) {
            await handleApiError(response);
        }

        console.log('✅ Deleted request:', requestId);
    } catch (error) {
        console.error('❌ Delete Request Error:', error);
        throw error;
    }
};
