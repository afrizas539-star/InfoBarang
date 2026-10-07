/**
 * ============================================================
 * PEKAN 4 — TASK 02: API SERVICE (REST API Client)
 * ============================================================
 *
 * Menggunakan `fetch()` bawaan JavaScript untuk HTTP Request.
 * Mendukung:
 *   - GET  /api/health       → Cek koneksi server
 *   - GET  /api/items         → Ambil daftar barang (CampusItem[])
 *   - GET  /api/claims        → Ambil daftar klaim (ClaimRequest[])
 *   - GET  /api/data          → Ambil seluruh data (items + claims)
 *   - POST /api/sync          → Sinkronisasi data ke server
 *   - GET  /api/items/:id     → Ambil detail satu barang
 *
 * Error handling: HTTP status code, timeout, network error.
 */

import { Platform } from 'react-native';

import {
  APIDataResponseDTO,
  APIHealthDTO,
  APISyncResponseDTO,
  CampusItemDTO,
  ClaimRequestDTO,
  mapAPIDataResponseToModels,
  mapCampusItemDTOToModel,
  mapCampusItemsDTOToModels,
  mapClaimRequestsDTOToModels,
} from './dto';

import { CampusItem, ClaimRequest } from '@/types';

// ─────────────────────────────────────────────────────────
// KONFIGURASI API
// ─────────────────────────────────────────────────────────

/**
 * Base URL default untuk backend server lokal.
 * Android emulator menggunakan 10.0.2.2 untuk mengakses host localhost.
 */
const DEFAULT_API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3001'
    : 'http://localhost:3001';

/** Timeout default untuk request (dalam ms) */
const DEFAULT_TIMEOUT_MS = 5000;

/** Timeout untuk health check (lebih pendek) */
const HEALTH_CHECK_TIMEOUT_MS = 2500;

// ─────────────────────────────────────────────────────────
// API ERROR CLASS
// ─────────────────────────────────────────────────────────

/**
 * Custom error class untuk error dari API.
 * Menyimpan HTTP status code dan response body.
 */
export class ApiError extends Error {
  public statusCode: number;
  public responseBody?: string;

  constructor(message: string, statusCode: number, responseBody?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

// ─────────────────────────────────────────────────────────
// API SERVICE CLASS
// ─────────────────────────────────────────────────────────

class ApiService {
  private baseUrl: string;
  private timeoutMs: number;

  constructor(
    baseUrl: string = DEFAULT_API_BASE_URL,
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ) {
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
  }

  // ── Konfigurasi ──

  /** Update base URL server (misalnya saat switch ke production) */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /** Ambil base URL saat ini */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  // ── Private Helper: Fetch dengan timeout ──

  /**
   * Wrapper fetch() dengan AbortController timeout.
   * Menangani status code non-2xx sebagai error.
   */
  private async fetchWithTimeout(
    endpoint: string,
    options: RequestInit = {},
    customTimeoutMs?: number
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const timeout = customTimeoutMs || this.timeoutMs;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      // Tangani HTTP Response — status code selain 2xx adalah error
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          body
        );
      }

      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Re-throw ApiError as-is
      if (error instanceof ApiError) throw error;

      // Network error / timeout
      if (error.name === 'AbortError') {
        throw new ApiError(
          `Request timeout setelah ${timeout}ms ke ${endpoint}`,
          0
        );
      }

      throw new ApiError(
        `Network error: ${error.message || 'Tidak dapat terhubung ke server'}`,
        0
      );
    }
  }

  // ── Public API Methods ──

  /**
   * GET /api/health
   * Cek apakah server backend aktif dan dapat diakses.
   * @returns APIHealthDTO atau null jika gagal
   */
  async checkHealth(): Promise<APIHealthDTO | null> {
    try {
      const response = await this.fetchWithTimeout(
        '/api/health',
        { method: 'GET' },
        HEALTH_CHECK_TIMEOUT_MS
      );
      const data: APIHealthDTO = await response.json();
      console.log('[ApiService] Health check OK:', data.service);
      return data;
    } catch (error) {
      console.warn('[ApiService] Health check gagal:', (error as Error).message);
      return null;
    }
  }

  /**
   * GET /api/items
   * Ambil seluruh daftar barang dari REST API.
   * Response JSON di-parse dan di-mapping via DTO → CampusItem[].
   */
  async fetchItems(): Promise<CampusItem[]> {
    try {
      const response = await this.fetchWithTimeout('/api/items', {
        method: 'GET',
      });
      const json = await response.json();

      // API bisa mengembalikan { items: [...] } atau langsung [...]
      const rawItems: CampusItemDTO[] = Array.isArray(json)
        ? json
        : json.items || [];

      // TASK 01: Mapping DTO → Application Model
      const mappedItems = mapCampusItemsDTOToModels(rawItems);
      console.log(
        `[ApiService] Berhasil fetch ${mappedItems.length} items dari API`
      );
      return mappedItems;
    } catch (error) {
      console.error('[ApiService] Gagal fetch items:', (error as Error).message);
      throw error;
    }
  }

  /**
   * GET /api/claims
   * Ambil seluruh daftar klaim dari REST API.
   */
  async fetchClaims(): Promise<ClaimRequest[]> {
    try {
      const response = await this.fetchWithTimeout('/api/claims', {
        method: 'GET',
      });
      const json = await response.json();

      const rawClaims: ClaimRequestDTO[] = Array.isArray(json)
        ? json
        : json.claims || [];

      const mappedClaims = mapClaimRequestsDTOToModels(rawClaims);
      console.log(
        `[ApiService] Berhasil fetch ${mappedClaims.length} claims dari API`
      );
      return mappedClaims;
    } catch (error) {
      console.error('[ApiService] Gagal fetch claims:', (error as Error).message);
      throw error;
    }
  }

  /**
   * GET /api/data
   * Ambil seluruh data (items + claims) sekaligus.
   * Ini adalah endpoint utama untuk sinkronisasi awal.
   */
  async fetchAllData(): Promise<{ items: CampusItem[]; claims: ClaimRequest[] }> {
    try {
      const response = await this.fetchWithTimeout('/api/data', {
        method: 'GET',
      });
      const json: APIDataResponseDTO = await response.json();

      // TASK 01: Mapping via DTO mapper
      const mapped = mapAPIDataResponseToModels(json);
      console.log(
        `[ApiService] Berhasil fetch data lengkap: ${mapped.items.length} items, ${mapped.claims.length} claims`
      );
      return mapped;
    } catch (error) {
      console.error(
        '[ApiService] Gagal fetch all data:',
        (error as Error).message
      );
      throw error;
    }
  }

  /**
   * GET /api/items/:id
   * Ambil detail satu barang berdasarkan ID.
   */
  async fetchItemById(id: string): Promise<CampusItem | null> {
    try {
      const response = await this.fetchWithTimeout(`/api/items/${id}`, {
        method: 'GET',
      });
      const json: CampusItemDTO = await response.json();

      if (!json || !json.id) return null;

      return mapCampusItemDTOToModel(json);
    } catch (error) {
      console.warn(
        `[ApiService] Gagal fetch item ${id}:`,
        (error as Error).message
      );
      return null;
    }
  }

  /**
   * POST /api/sync
   * Sinkronisasi data dari aplikasi ke server (push).
   * Mengirim seluruh state items + claims ke backend.
   */
  async syncData(data: {
    items?: CampusItem[];
    claims?: ClaimRequest[];
  }): Promise<APISyncResponseDTO | null> {
    try {
      const response = await this.fetchWithTimeout('/api/sync', {
        method: 'POST',
        body: JSON.stringify({
          items: data.items,
          claims: data.claims,
        }),
      });

      const result: APISyncResponseDTO = await response.json();
      console.log('[ApiService] Sync berhasil:', result.updatedAt);
      return result;
    } catch (error) {
      console.warn('[ApiService] Gagal sync data:', (error as Error).message);
      return null;
    }
  }
}

// ─────────────────────────────────────────────────────────
// SINGLETON INSTANCE
// ─────────────────────────────────────────────────────────

/** Singleton API Service yang digunakan di seluruh aplikasi */
export const apiService = new ApiService();
