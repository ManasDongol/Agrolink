// disease-detection.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiService } from '../../../core/Services/AiService/ai-service';

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
export class DiseaseDetection{
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  isLoading = false;
  result: DetectionResult | null = null;
  error: string | null = null;

  constructor(private aiService: AiService) {}

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

    this.aiService.DetectDisease(this.selectedImage).subscribe({
      next: (res) => {
        this.result = res;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Analysis failed. Please try again with a clearer image.';
        this.isLoading = false;
      }
    });
  }

  get confidenceColor(): string {
    if (!this.result) return '#9ca3af';
    if (this.result.confidence >= 80) return '#16a34a';
    if (this.result.confidence >= 55) return '#d97706';
    return '#dc2626';
  }
}