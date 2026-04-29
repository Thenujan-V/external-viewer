import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, catchError, combineLatest, distinctUntilChanged, map, of, switchMap, takeUntil } from 'rxjs';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';
import { DocumentLoadError, DocumentService } from '../services/document.service';

@Component({
  selector: 'app-document-viewer-page',
  standalone: true,
  imports: [CommonModule, PdfViewerComponent],
  templateUrl: './document-viewer-page.component.html',
  styleUrl: './document-viewer-page.component.scss'
})
export class DocumentViewerPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly documentService = inject(DocumentService);
  private readonly destroy$ = new Subject<void>();

  private currentBlobUrl: string | null = null;

  constructor(private router: Router) {}

  pdfSrc: string | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(
        map(([params]) => params.get('documentToken')),
        distinctUntilChanged(),
        switchMap((token) => {
          this.resetViewerState();

          if (!token) {
            this.router.navigate(['/invalid']);
            this.errorMessage = 'No document token was provided.';
            this.isLoading = false;
            return of(null);
          }

          return this.documentService.getDocumentBlobUrl(token).pipe(
            catchError((error) => {
              this.errorMessage = this.getErrorMessage(error);
              this.isLoading = false;
              return of(null);
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((document) => {
        if (!document) {
          return;
        }

        this.revokeBlobUrl();
        this.currentBlobUrl = document.blobUrl;
        this.pdfSrc = document.blobUrl;
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.revokeBlobUrl();
  }

  private resetViewerState(): void {
    this.revokeBlobUrl();
    this.pdfSrc = null;
    this.isLoading = true;
    this.errorMessage = '';
  }

  private revokeBlobUrl(): void {
    if (!this.currentBlobUrl) {
      return;
    }

    URL.revokeObjectURL(this.currentBlobUrl);
    this.currentBlobUrl = null;
  }

  private getErrorMessage(error: unknown): string {
    const status = this.getErrorStatus(error);

    if (status === 401) {
      return 'You are not authorized to view this document.';
    }

    if (status === 403) {
      return 'You are not authorized to use this token.';
    }

    if (status === 404) {
      return 'The requested document was not found.';
    }

    if (status === 410) {
      return 'This document link has expired or is no longer available.';
    }

    if (this.isDocumentLoadError(error) && error.message) {
      return error.message;
    }

    return 'Unable to load the PDF document.';
  }

  private getErrorStatus(error: unknown): number | null {
    if (this.isDocumentLoadError(error)) {
      return error.status;
    }

    if (error instanceof HttpErrorResponse) {
      return error.status;
    }

    return null;
  }

  private isDocumentLoadError(error: unknown): error is DocumentLoadError {
    return typeof error === 'object' && error !== null && 'status' in error;
  }
}
