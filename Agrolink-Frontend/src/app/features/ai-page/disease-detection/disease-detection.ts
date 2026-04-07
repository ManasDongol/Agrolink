// disease-detection.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiService } from '../../../core/Services/AiService/ai-service';
import { DetectionHistoryService, DetectionHistory } from '../../../core/Services/DetectionHistory/detection-history';
import { inject } from '@angular/core';
import { ToastService } from '../../../shared/toast/toast.service';

interface DetectionResult {
  predicted_class: string;
  predicted_class_raw: string;
  confidence: number;
}

@Component({
  selector: 'app-disease-detection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './disease-detection.html',
  styleUrl: './disease-detection.css'
})
export class DiseaseDetection implements OnInit {
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  isLoading = false;
  result: DetectionResult | null = null;
  error: string | null = null;

  // History
  detectionHistory: DetectionHistory[] = [];
  historyLoading = false;
  historyLoaded = false;
  modalItem: DetectionHistory | null = null;

  private toast = inject(ToastService);

  constructor(
    private aiService: AiService,
    private historyService: DetectionHistoryService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.historyLoading = true;
    this.historyService.getHistory().subscribe({
      next: (data) => {
        this.detectionHistory = data;
        this.historyLoading = false;
        this.historyLoaded = true;
      },
      error: () => {
        this.historyLoading = false;
        this.historyLoaded = true;
      }
    });
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.result = null;
    this.error = null;
    this.selectedImage = file;
    const reader = new FileReader();
    reader.onload = () => this.imagePreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  clearImage() {
    this.selectedImage = null;
    this.imagePreview = null;
    this.result = null;
    this.error = null;
  }

  analyze() {
    if (!this.selectedImage || this.isLoading) return;
    this.isLoading = true;
    this.result = null;
    this.error = null;

    const imageToSave = this.selectedImage;

    this.aiService.DetectDisease(this.selectedImage).subscribe({
      next: (res) => {
        this.result = res;
        this.isLoading = false;

        // Auto-save to history after successful detection
        this.historyService.saveDetection(
          imageToSave,
          res.predicted_class,
          res.predicted_class_raw,
          res.confidence
        ).subscribe({
          next: (saved) => {
            this.detectionHistory = [saved, ...this.detectionHistory];
            this.toast.success("Analysis complete!","");
            this.historyLoaded = true;
          },
          error: () => {} // silent fail — result still shown
        });
      },
      error: () => {
        this.error = 'Analysis failed. Please try again with a clearer image.';
        this.isLoading = false;
      }
    });
  }

  deleteHistory(id: number): void {
    this.historyService.deleteDetection(id).subscribe({
      next: () => {
        this.detectionHistory = this.detectionHistory.filter(h => h.id !== id);
        if (this.modalItem?.id === id) this.modalItem = null;
      },
      error: () => {}
    });
  }

  openImageModal(item: DetectionHistory): void {
    this.modalItem = item;
  }

  closeModal(): void {
    this.modalItem = null;
  }

  getImageUrl(imagePath: string): string {
    // Serve images from .NET wwwroot — adjust port if needed
    const filename = imagePath.split('\\').pop() ?? imagePath.split('/').pop();
    return `http://localhost:5131/uploads/detections/${filename}`;
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder-plant.png';
  }

  get confidenceColor(): string {
    return this.getConfidenceColor(this.result?.confidence ?? 0);
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 80) return '#16a34a';
    if (confidence >= 55) return '#d97706';
    return '#dc2626';
  }
}