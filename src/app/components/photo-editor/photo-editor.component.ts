import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  sepia: number;
  blur: number;
  grayscale: number;
  invert: number;
}

interface CropSettings {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

@Component({
  selector: 'app-photo-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-95 flex z-[60]" (click)="closeEditor()">
      <div class="w-full h-full flex" (click)="$event.stopPropagation()">
        
        <!-- Editor Sidebar -->
        <div class="w-80 bg-gray-900 text-white p-6 overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold">Photo Editor</h2>
            <button
              (click)="closeEditor()"
              class="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Editor Tabs -->
          <div class="flex mb-6">
            <button
              (click)="activeTab.set('filters')"
              class="flex-1 py-2 px-4 text-sm font-medium rounded-l-lg transition-colors"
              [ngClass]="activeTab() === 'filters' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
            >
              Filters
            </button>
            <button
              (click)="activeTab.set('crop')"
              class="flex-1 py-2 px-4 text-sm font-medium rounded-r-lg transition-colors"
              [ngClass]="activeTab() === 'crop' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
            >
              Crop
            </button>
          </div>

          <!-- Filters Tab -->
          @if (activeTab() === 'filters') {
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium mb-2">Brightness</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  [(ngModel)]="filterSettings.brightness"
                  (input)="applyFilters()"
                  class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div class="text-xs text-gray-400 mt-1">{{ filterSettings.brightness }}%</div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Contrast</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  [(ngModel)]="filterSettings.contrast"
                  (input)="applyFilters()"
                  class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div class="text-xs text-gray-400 mt-1">{{ filterSettings.contrast }}%</div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Saturation</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  [(ngModel)]="filterSettings.saturation"
                  (input)="applyFilters()"
                  class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div class="text-xs text-gray-400 mt-1">{{ filterSettings.saturation }}%</div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Hue</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  [(ngModel)]="filterSettings.hue"
                  (input)="applyFilters()"
                  class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div class="text-xs text-gray-400 mt-1">{{ filterSettings.hue }}°</div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Sepia</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  [(ngModel)]="filterSettings.sepia"
                  (input)="applyFilters()"
                  class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div class="text-xs text-gray-400 mt-1">{{ filterSettings.sepia }}%</div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Blur</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  [(ngModel)]="filterSettings.blur"
                  (input)="applyFilters()"
                  class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div class="text-xs text-gray-400 mt-1">{{ filterSettings.blur }}px</div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Grayscale</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  [(ngModel)]="filterSettings.grayscale"
                  (input)="applyFilters()"
                  class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div class="text-xs text-gray-400 mt-1">{{ filterSettings.grayscale }}%</div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Invert</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  [(ngModel)]="filterSettings.invert"
                  (input)="applyFilters()"
                  class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div class="text-xs text-gray-400 mt-1">{{ filterSettings.invert }}%</div>
              </div>

              <!-- Filter Presets -->
              <div class="pt-4 border-t border-gray-700">
                <h3 class="text-sm font-medium mb-3">Presets</h3>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    (click)="applyPreset('vintage')"
                    class="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                  >
                    Vintage
                  </button>
                  <button
                    (click)="applyPreset('blackwhite')"
                    class="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                  >
                    B&W
                  </button>
                  <button
                    (click)="applyPreset('vivid')"
                    class="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                  >
                    Vivid
                  </button>
                  <button
                    (click)="applyPreset('warm')"
                    class="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                  >
                    Warm
                  </button>
                  <button
                    (click)="applyPreset('cool')"
                    class="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                  >
                    Cool
                  </button>
                  <button
                    (click)="applyPreset('reset')"
                    class="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- Crop Tab -->
          @if (activeTab() === 'crop') {
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium mb-2">Aspect Ratio</label>
                <select
                  [(ngModel)]="selectedAspectRatio"
                  (change)="setAspectRatio($event)"
                  class="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="free">Free</option>
                  <option value="1:1">Square (1:1)</option>
                  <option value="4:3">Standard (4:3)</option>
                  <option value="16:9">Widescreen (16:9)</option>
                  <option value="3:2">Photo (3:2)</option>
                  <option value="2:3">Portrait (2:3)</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">Scale</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  [(ngModel)]="cropSettings.scale"
                  (input)="applyCrop()"
                  class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div class="text-xs text-gray-400 mt-1">{{ (cropSettings.scale * 100) | number:'1.0-0' }}%</div>
              </div>

              <div class="pt-4 border-t border-gray-700">
                <button
                  (click)="resetCrop()"
                  class="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                >
                  Reset Crop
                </button>
              </div>
            </div>
          }

          <!-- Action Buttons -->
          <div class="mt-8 pt-6 border-t border-gray-700 space-y-3">
            <button
              (click)="saveChanges()"
              [disabled]="isSaving()"
              class="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              @if (isSaving()) {
                <span class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              } @else {
                Save Changes
              }
            </button>
            <button
              (click)="discardChanges()"
              [disabled]="isSaving()"
              class="w-full py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              Discard Changes
            </button>
          </div>
        </div>

        <!-- Image Preview Area -->
        <div class="flex-1 flex items-center justify-center p-8 bg-gray-800">
          <div class="relative max-w-full max-h-full" #imageContainer>
            <canvas
              #canvas
              class="max-w-full max-h-full rounded-lg shadow-2xl"
              [class.cursor-move]="activeTab() === 'crop'"
              (mousedown)="startCrop($event)"
              (mousemove)="updateCrop($event)"
              (mouseup)="endCrop()"
              (mouseleave)="endCrop()"
            ></canvas>

            <!-- Crop overlay -->
            @if (activeTab() === 'crop' && isCropping()) {
              <div
                class="absolute border-2 border-white border-dashed bg-black bg-opacity-25"
                [style.left.px]="cropOverlay().x"
                [style.top.px]="cropOverlay().y"
                [style.width.px]="cropOverlay().width"
                [style.height.px]="cropOverlay().height"
              >
                <!-- Corner handles -->
                <div class="absolute -top-1 -left-1 w-3 h-3 bg-white border border-gray-400"></div>
                <div class="absolute -top-1 -right-1 w-3 h-3 bg-white border border-gray-400"></div>
                <div class="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-gray-400"></div>
                <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-gray-400"></div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .slider::-webkit-slider-thumb {
      appearance: none;
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background: #3b82f6;
      cursor: pointer;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .slider::-moz-range-thumb {
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background: #3b82f6;
      cursor: pointer;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  `]
})
export class PhotoEditorComponent implements OnInit, AfterViewInit {
  @Input() imageUrl: string = '';
  @Input() photoId: string = '';
  @Output() onSave = new EventEmitter<{ editedImageUrl: string; photoId: string }>();
  @Output() onClose = new EventEmitter<void>();

  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('imageContainer', { static: false }) containerRef!: ElementRef<HTMLDivElement>;

  activeTab = signal<'filters' | 'crop'>('filters');
  isSaving = signal(false);
  isCropping = signal(false);
  selectedAspectRatio = 'free';

  // Filter settings with default values
  filterSettings: FilterSettings = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    sepia: 0,
    blur: 0,
    grayscale: 0,
    invert: 0
  };

  // Crop settings
  cropSettings: CropSettings = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scale: 1
  };

  cropOverlay = signal({ x: 0, y: 0, width: 0, height: 0 });

  private originalImage?: HTMLImageElement;
  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private isDragging = false;
  private dragStart = { x: 0, y: 0 };

  ngOnInit() {
    console.log('🎨 Photo editor initialized with imageUrl:', this.imageUrl);
    console.log('🎨 Photo editor initialized with photoId:', this.photoId);
  }

  ngAfterViewInit() {
    console.log('🎨 Photo editor view initialized');
    // Load image after view is initialized to ensure canvas is available
    setTimeout(() => {
      this.loadImage();
    }, 100);
  }

  private async loadImage() {
    if (!this.imageUrl) {
      console.error('❌ No image URL provided to photo editor');
      return;
    }

    console.log('🖼️ Loading image from URL:', this.imageUrl);
    
    const img = new Image();

    img.onload = () => {
      console.log('✅ Image loaded successfully:', {
        width: img.width,
        height: img.height,
        src: img.src
      });
      this.originalImage = img;
      this.setupCanvas();
      this.drawImage();
    };

    img.onerror = (error) => {
      console.error('❌ Failed to load image for editing:', error);
      console.error('❌ Image URL was:', this.imageUrl);
      alert('Failed to load image for editing. Please try again.');
    };

    img.src = this.imageUrl;
    console.log('🔄 Started loading image...');
  }

  private setupCanvas() {
    console.log('🖼️ Setting up canvas...');
    console.log('🖼️ Canvas ref exists:', !!this.canvasRef);
    console.log('🖼️ Original image exists:', !!this.originalImage);
    
    if (!this.canvasRef || !this.originalImage) {
      console.error('❌ Cannot setup canvas - missing canvas ref or image');
      return;
    }

    this.canvas = this.canvasRef.nativeElement;
    const context = this.canvas.getContext('2d');
    
    if (!context) {
      console.error('❌ Cannot get 2D context from canvas');
      return;
    }
    
    this.ctx = context;
    console.log('✅ Canvas context obtained');

    // Set canvas size to match image
    const maxWidth = window.innerWidth - 400; // Account for sidebar
    const maxHeight = window.innerHeight - 200; // Account for padding
    
    let { width, height } = this.originalImage;
    console.log('🖼️ Original image size:', { width, height });
    
    // Scale image to fit container while maintaining aspect ratio
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;
      console.log('🖼️ Scaled image size:', { width, height, ratio });
    }

    this.canvas.width = width;
    this.canvas.height = height;
    console.log('✅ Canvas size set:', { width, height });

    // Initialize crop settings
    this.cropSettings = {
      x: 0,
      y: 0,
      width: width,
      height: height,
      scale: 1
    };
    console.log('✅ Crop settings initialized:', this.cropSettings);
  }

  private drawImage() {
    console.log('🎨 Drawing image...');
    console.log('🎨 Context exists:', !!this.ctx);
    console.log('🎨 Original image exists:', !!this.originalImage);
    console.log('🎨 Canvas exists:', !!this.canvas);
    
    if (!this.ctx || !this.originalImage || !this.canvas) {
      console.error('❌ Cannot draw image - missing context, image, or canvas');
      return;
    }

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    console.log('🎨 Canvas cleared');

    // Apply transformations
    this.ctx.save();
    
    // Apply filters
    this.ctx.filter = this.getFilterString();
    console.log('🎨 Filter applied:', this.getFilterString());
    
    // Apply scaling and positioning for crop
    const scaleX = this.canvas.width / this.originalImage.width * this.cropSettings.scale;
    const scaleY = this.canvas.height / this.originalImage.height * this.cropSettings.scale;
    
    this.ctx.scale(scaleX, scaleY);
    this.ctx.translate(-this.cropSettings.x / scaleX, -this.cropSettings.y / scaleY);

    // Draw the image
    this.ctx.drawImage(this.originalImage, 0, 0);
    console.log('✅ Image drawn to canvas');
    
    this.ctx.restore();
  }

  applyFilters() {
    if (!this.canvas) return;

    const filterString = [
      `brightness(${this.filterSettings.brightness}%)`,
      `contrast(${this.filterSettings.contrast}%)`,
      `saturate(${this.filterSettings.saturation}%)`,
      `hue-rotate(${this.filterSettings.hue}deg)`,
      `sepia(${this.filterSettings.sepia}%)`,
      `blur(${this.filterSettings.blur}px)`,
      `grayscale(${this.filterSettings.grayscale}%)`,
      `invert(${this.filterSettings.invert}%)`
    ].join(' ');

    this.canvas.style.filter = filterString;
  }

  private getFilterString(): string {
    return [
      `brightness(${this.filterSettings.brightness}%)`,
      `contrast(${this.filterSettings.contrast}%)`,
      `saturate(${this.filterSettings.saturation}%)`,
      `hue-rotate(${this.filterSettings.hue}deg)`,
      `sepia(${this.filterSettings.sepia}%)`,
      `blur(${this.filterSettings.blur}px)`,
      `grayscale(${this.filterSettings.grayscale}%)`,
      `invert(${this.filterSettings.invert}%)`
    ].join(' ');
  }

  applyCrop() {
    this.drawImage();
  }

  applyPreset(preset: string) {
    switch (preset) {
      case 'vintage':
        this.filterSettings = {
          ...this.filterSettings,
          brightness: 110,
          contrast: 120,
          saturation: 80,
          sepia: 30,
          hue: 15
        };
        break;
      case 'blackwhite':
        this.filterSettings = {
          ...this.filterSettings,
          grayscale: 100,
          contrast: 120,
          brightness: 105
        };
        break;
      case 'vivid':
        this.filterSettings = {
          ...this.filterSettings,
          saturation: 150,
          contrast: 110,
          brightness: 105
        };
        break;
      case 'warm':
        this.filterSettings = {
          ...this.filterSettings,
          hue: 15,
          saturation: 110,
          brightness: 105
        };
        break;
      case 'cool':
        this.filterSettings = {
          ...this.filterSettings,
          hue: 200,
          saturation: 90,
          brightness: 95
        };
        break;
      case 'reset':
        this.filterSettings = {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          hue: 0,
          sepia: 0,
          blur: 0,
          grayscale: 0,
          invert: 0
        };
        break;
    }
    this.applyFilters();
  }

  setAspectRatio(event: Event) {
    const ratio = (event.target as HTMLSelectElement).value;
    this.selectedAspectRatio = ratio;
    
    if (ratio !== 'free' && this.canvas) {
      const [widthRatio, heightRatio] = ratio.split(':').map(Number);
      const canvasAspect = this.canvas.width / this.canvas.height;
      const targetAspect = widthRatio / heightRatio;
      
      if (targetAspect > canvasAspect) {
        // Fit width
        this.cropSettings.width = this.canvas.width;
        this.cropSettings.height = this.canvas.width / targetAspect;
      } else {
        // Fit height
        this.cropSettings.height = this.canvas.height;
        this.cropSettings.width = this.canvas.height * targetAspect;
      }
      
      // Center the crop
      this.cropSettings.x = (this.canvas.width - this.cropSettings.width) / 2;
      this.cropSettings.y = (this.canvas.height - this.cropSettings.height) / 2;
      
      this.updateCropOverlay();
    }
  }

  resetCrop() {
    if (!this.canvas) return;
    
    this.cropSettings = {
      x: 0,
      y: 0,
      width: this.canvas.width,
      height: this.canvas.height,
      scale: 1
    };
    
    this.selectedAspectRatio = 'free';
    this.drawImage();
    this.updateCropOverlay();
  }

  startCrop(event: MouseEvent) {
    if (this.activeTab() !== 'crop') return;
    
    this.isDragging = true;
    this.isCropping.set(true);
    const rect = this.canvas!.getBoundingClientRect();
    this.dragStart = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    this.cropSettings.x = this.dragStart.x;
    this.cropSettings.y = this.dragStart.y;
    this.updateCropOverlay();
  }

  updateCrop(event: MouseEvent) {
    if (!this.isDragging || this.activeTab() !== 'crop') return;
    
    const rect = this.canvas!.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;
    
    this.cropSettings.width = Math.abs(currentX - this.dragStart.x);
    this.cropSettings.height = Math.abs(currentY - this.dragStart.y);
    
    if (currentX < this.dragStart.x) {
      this.cropSettings.x = currentX;
    }
    if (currentY < this.dragStart.y) {
      this.cropSettings.y = currentY;
    }
    
    // Maintain aspect ratio if selected
    if (this.selectedAspectRatio !== 'free') {
      const [widthRatio, heightRatio] = this.selectedAspectRatio.split(':').map(Number);
      const targetAspect = widthRatio / heightRatio;
      
      if (this.cropSettings.width / this.cropSettings.height > targetAspect) {
        this.cropSettings.width = this.cropSettings.height * targetAspect;
      } else {
        this.cropSettings.height = this.cropSettings.width / targetAspect;
      }
    }
    
    this.updateCropOverlay();
  }

  endCrop() {
    this.isDragging = false;
  }

  private updateCropOverlay() {
    this.cropOverlay.set({
      x: this.cropSettings.x,
      y: this.cropSettings.y,
      width: this.cropSettings.width,
      height: this.cropSettings.height
    });
  }

  async saveChanges() {
    if (!this.canvas || !this.ctx) return;
    
    this.isSaving.set(true);
    
    try {
      // Create a new canvas for the final image
      const finalCanvas = document.createElement('canvas');
      const finalCtx = finalCanvas.getContext('2d');
      
      if (!finalCtx) return;
      
      // Set final canvas size to crop size
      finalCanvas.width = this.cropSettings.width;
      finalCanvas.height = this.cropSettings.height;
      
      // Apply filters to context
      finalCtx.filter = this.canvas.style.filter;
      
      // Draw the cropped portion
      finalCtx.drawImage(
        this.canvas,
        this.cropSettings.x,
        this.cropSettings.y,
        this.cropSettings.width,
        this.cropSettings.height,
        0,
        0,
        this.cropSettings.width,
        this.cropSettings.height
      );
      
      // Convert to blob and create URL
      const blob = await new Promise<Blob | null>(resolve => {
        finalCanvas.toBlob(resolve, 'image/jpeg', 0.9);
      });
      
      if (blob) {
        const editedImageUrl = URL.createObjectURL(blob);
        this.onSave.emit({ editedImageUrl, photoId: this.photoId });
      }
      
    } catch (error) {
      console.error('Error saving edited image:', error);
    } finally {
      this.isSaving.set(false);
    }
  }

  discardChanges() {
    this.closeEditor();
  }

  closeEditor() {
    this.onClose.emit();
  }
}
