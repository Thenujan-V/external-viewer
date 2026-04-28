import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ExternalDocumentResponse {
  data: string | { mimeType?: string; metadata?: string };
  message: string;
  status: number;
}

export interface DocumentViewModel {
  blobUrl: string;
  title?: string;
}

export interface DocumentLoadError {
  status: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.imageManagerApiBaseUrl;

  getDocumentBlobUrl(token: string): Observable<DocumentViewModel> {
    return this.http
      .get<ExternalDocumentResponse>(`${this.baseUrl}/image/external/view/${token}`)
      .pipe(
        map((response) => {
          if (response.status && response.status !== 200) {
            throw this.createDocumentLoadError(response.status, response.message);
          }

          const payload = response.data;
          const base64 = typeof payload === 'string' ? payload : payload.metadata ?? '';
          const mimeType = typeof payload === 'string' ? 'application/pdf' : payload.mimeType ?? 'application/pdf';

          if (!base64) {
            throw this.createDocumentLoadError(500, 'The document response did not include PDF content.');
          }

          const blob = this.base64ToBlob(this.normalizeBase64(base64), mimeType);

          return {
            blobUrl: URL.createObjectURL(blob),
            title: 'AuraDocs document',
          };
        })
      );
  }

  private createDocumentLoadError(status: number, message: string): DocumentLoadError {
    return {
      status,
      message,
    };
  }

  private normalizeBase64(value: string): string {
    const prefix = 'base64,';
    const base64Index = value.indexOf(prefix);
    return base64Index >= 0 ? value.slice(base64Index + prefix.length) : value;
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let index = 0; index < byteCharacters.length; index += 1) {
      byteNumbers[index] = byteCharacters.charCodeAt(index);
    }

    return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
  }
}
