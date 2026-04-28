import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule, NgxExtendedPdfViewerModule],
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.scss'
})
export class PdfViewerComponent implements OnChanges, OnDestroy {
  @Input() pdfSrc: string | null = null;
  @Input() isLoading = false;
  @Input() errorMessage = '';

  pdfLoaded = false;
  renderErrorMessage = '';
  private generatedBlobUrl: string | null = null;

  get displayErrorMessage(): string {
    return this.renderErrorMessage || this.errorMessage;
  }

  get viewerSrc(): string | undefined {
    if (!this.pdfSrc) {
      return undefined;
    }

    return this.generatedBlobUrl ?? this.pdfSrc;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pdfSrc']) {
      this.prepareViewerSource();
    }
  }

  ngOnDestroy(): void {
    this.revokeGeneratedBlobUrl();
  }

  onPdfLoaded() {
    this.pdfLoaded = true;
    this.renderErrorMessage = '';
  }

  onPdfLoadFail(error?: unknown) {
    this.pdfLoaded = false;
    this.renderErrorMessage = 'This PDF could not be displayed.';
    console.error('[PdfViewer] pdfLoadingFailed', error);
  }

  private prepareViewerSource(): void {
    this.revokeGeneratedBlobUrl();

    if (!this.pdfSrc) {
      return;
    }

    const base64 = this.extractBase64(this.pdfSrc);
    if (!base64) {
      return;
    }

    const blob = this.base64ToBlob(base64, 'application/pdf');
    this.generatedBlobUrl = URL.createObjectURL(blob);
  }

  private extractBase64(value: string): string | null {
    if (value.startsWith('data:application/pdf;base64,')) {
      return value.slice('data:application/pdf;base64,'.length);
    }

    return this.isLikelyRawBase64(value) ? value : null;
  }

  private isLikelyRawBase64(value: string): boolean {
    return !value.includes('/') && !value.includes('\\') && !value.startsWith('blob:') && !value.startsWith('http');
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let index = 0; index < byteCharacters.length; index += 1) {
      byteNumbers[index] = byteCharacters.charCodeAt(index);
    }

    return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
  }

  private revokeGeneratedBlobUrl(): void {
    if (!this.generatedBlobUrl) {
      return;
    }

    URL.revokeObjectURL(this.generatedBlobUrl);
    this.generatedBlobUrl = null;
  }
}
