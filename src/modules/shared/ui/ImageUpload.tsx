import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, GripVertical, Edit3 } from "lucide-react";
import { toast } from "sonner";

export interface ImageItem {
  url: string;
  alt: string;
  caption: string;
}

interface ImageUploadProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export function ImageUpload({ images, onChange, maxImages = 10, maxSizeMB = 5 }: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = maxImages - images.length;
    if (files.length > remaining) {
      toast.error(`حداکثر ${maxImages} تصویر مجاز است.`);
      return;
    }

    Array.from(files).forEach((file) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`حجم فایل ${file.name} بیشتر از ${maxSizeMB} مگابایت است.`);
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(`فایل ${file.name} تصویر نیست.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        onChange([...images, { url, alt: file.name.replace(/\.[^.]+$/, ""), caption: "" }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
    setEditingIndex(null);
  };

  const updateImage = (index: number, field: keyof ImageItem, value: string) => {
    const updated = [...images];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const updated = [...images];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`clay-surface flex flex-col items-center justify-center gap-3 p-8 cursor-pointer border-2 border-dashed transition-all ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">تصاویر را اینجا رها کنید اا کلیک کنید</p>
          <p className="text-xs text-muted-foreground mt-1">
            حداکثر {maxImages} تصویر — هر تصویر تا {maxSizeMB} مگابایت
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Image List */}
      {images.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{images.length} تصویر انتخاب شده</p>
          {images.map((img, idx) => (
            <div key={idx} className="clay-surface p-3">
              <div className="flex items-start gap-3">
                {/* Drag Handle */}
                <div className="flex flex-col items-center gap-1 pt-1">
                  <button
                    onClick={() => moveImage(idx, idx - 1)}
                    disabled={idx === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <GripVertical className="h-3 w-3 rotate-90" />
                  </button>
                </div>

                {/* Preview */}
                <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{img.alt || "بدون عنوان"}</p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingIndex(editingIndex === idx ? null : idx)}
                        className="clay-icon flex h-6 w-6 items-center justify-center rounded-lg bg-muted hover:bg-accent transition-colors"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeImage(idx)}
                        className="clay-icon flex h-6 w-6 items-center justify-center rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Edit Fields */}
                  {editingIndex === idx && (
                    <div className="space-y-2 animate-slide-up">
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-0.5 block">متن جایگزین (Alt)</label>
                        <input
                          value={img.alt}
                          onChange={(e) => updateImage(idx, "alt", e.target.value)}
                          placeholder="توضیح تصویر برای SEO و دسترسی‌پذیری"
                          className="clay-input w-full px-3 py-1.5 text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-0.5 block">زیرنویس تصویر</label>
                        <input
                          value={img.caption}
                          onChange={(e) => updateImage(idx, "caption", e.target.value)}
                          placeholder="زیرنویس اختیاری تصویر"
                          className="clay-input w-full px-3 py-1.5 text-xs outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
