'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Upload,
  Image as LucideImage,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  ExternalLink,
  Loader2,
  Cloud,
} from 'lucide-react';

interface MediaAsset {
  id: string;
  publicId: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  altText: {
    ar: string;
    en: string;
  };
  uploadedBy: string;
  createdAt: string;
}

export function MediaManager() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altAr, setAltAr] = useState('');
  const [altEn, setAltEn] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dhgk61npp';

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/admin/media');
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      }
    } catch (err) {
      console.error('Failed to load media', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('يرجى اختيار ملف صورة أولاً');
      return;
    }
    if (!altAr.trim() || !altEn.trim()) {
      setError('النص البديل بالعربية والإنجليزية إلزامي لمعايير الوصول الرقمي WCAG');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Get secure Cloudinary upload signature from our server
      const signRes = await fetch('/api/admin/media/sign', {
        method: 'POST',
      });
      if (!signRes.ok) {
        const signErr = await signRes.json();
        throw new Error(signErr.error || 'فشل توليد توقيع التشفير');
      }
      const signData = await signRes.json();

      // 2. Upload file directly to Cloudinary CDN
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('api_key', signData.apiKey);
      formData.append('timestamp', signData.timestamp.toString());
      formData.append('signature', signData.signature);
      formData.append('folder', signData.folder);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!cloudinaryRes.ok) {
        const cErr = await cloudinaryRes.json();
        throw new Error(cErr.error?.message || 'فشل الرفع إلى Cloudinary CDN');
      }

      const cData = await cloudinaryRes.json();

      // 3. Register asset into our server DB with bilingual alt texts
      const registerRes = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicId: cData.public_id,
          secureUrl: cData.secure_url,
          format: cData.format,
          width: cData.width,
          height: cData.height,
          bytes: cData.bytes,
          altText: {
            ar: altAr.trim(),
            en: altEn.trim(),
          },
        }),
      });

      if (!registerRes.ok) {
        const regErr = await registerRes.json();
        throw new Error(regErr.error || 'فشل حفظ بيانات الصورة في النظام');
      }

      setSuccessMsg('تم رفع الصورة بنجاح إلى شبكة Cloudinary وحفظها في مكتبة الوسائط!');
      setSelectedFile(null);
      setPreviewUrl(null);
      setAltAr('');
      setAltEn('');
      fetchAssets();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الرفع');
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الملف من سجل الوسائط؟')) return;
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAssets((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Cloudinary Integration Status Banner */}
      <div className="bg-surface border border-gold/30 rounded-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-signature rounded-sm text-gold">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-ink">سحابة التخزين المعتمدة: Cloudinary</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> متصل ونشط
              </span>
            </div>
            <p className="text-xs text-muted">
              الحساب: <code className="bg-canvas px-1 py-0.5 rounded text-ink">{cloudName}</code> — وضع الرفع المشفّر من الخادم (Server-Signed Direct Upload).
            </p>
          </div>
        </div>
      </div>

      {/* Upload Box */}
      <div className="bg-surface border border-border rounded-sm p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold font-heading-ar text-ink flex items-center gap-2">
            <Upload className="w-5 h-5 text-gold" />
            رفع وسائط جديدة (صور المحامين، الشهادات، مقالات المدونة)
          </h2>
          <p className="text-xs text-muted mt-1">
            يتم رفع الصور مباشرة إلى شبكة التوزيع العالمية (Cloudinary CDN) مع الحفظ التلقائي للبيانات الوصفية ثنائية اللغة.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-danger/10 border border-danger/30 rounded-sm flex items-center gap-2 text-xs text-danger">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-sm flex items-center gap-2 text-xs text-emerald-700">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* File Dropzone */}
            <div className="md:col-span-1 border-2 border-dashed border-border rounded-sm p-4 flex flex-col items-center justify-center text-center hover:border-gold transition-colors bg-canvas/50 relative">
              {previewUrl ? (
                <div className="space-y-2 w-full">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={320}
                    height={160}
                    unoptimized
                    className="max-h-40 w-auto mx-auto rounded object-contain border border-border"
                  />
                  <p className="text-xs text-muted truncate max-w-full">
                    {selectedFile?.name} ({(selectedFile!.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <LucideImage className="w-8 h-8 text-muted mx-auto" />
                  <p className="text-xs font-semibold text-ink">انقر أو اسحب الصورة هنا</p>
                  <p className="text-[11px] text-muted">PNG, JPG, WebP, SVG حتى 10MB</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {/* Bilingual Alt Texts */}
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">
                  النص البديل بالعربية (Alt Text - Arabic) <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  dir="rtl"
                  required
                  placeholder="مثال: صورة رسمية للمحامي رياض محمد الزهراني بالزي الرسمي"
                  value={altAr}
                  onChange={(e) => setAltAr(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded-sm text-sm text-ink focus:outline-none focus:border-gold"
                />
                <span className="text-[11px] text-muted block">
                  مطلوب لإمكانية الوصول ولذوي الإعاقة البصرية (WCAG 2.2 AA).
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink">
                  Alternative Text (English) <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  required
                  placeholder="e.g.: Official portrait of Managing Partner Riyadh Alzahrani"
                  value={altEn}
                  onChange={(e) => setAltEn(e.target.value)}
                  className="w-full px-3 py-2 bg-canvas border border-border rounded-sm text-sm text-ink focus:outline-none focus:border-gold"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-signature text-on-dark rounded-sm text-xs font-bold hover:bg-signature/90 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-gold" />
                      <span>جاري الرفع المشفّر إلى Cloudinary...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-gold" />
                      <span>رفع وحفظ الصورة</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Gallery Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-heading-ar text-ink">
            الصور المخزنة في مكتبة Cloudinary ({assets.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-muted text-xs">جاري تحميل قائمة الصور...</div>
        ) : assets.length === 0 ? (
          <div className="bg-surface border border-border rounded-sm p-10 text-center space-y-2">
            <LucideImage className="w-10 h-10 text-muted mx-auto" />
            <p className="text-sm font-semibold text-ink">لا توجد وسائط مرفوعة بعد</p>
            <p className="text-xs text-muted">
              استخدم نموذج الرفع أعلاه لإضافة أول صورة وسيقوم النظام بتخزينها وتوفير رابط CDN فوري.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="bg-surface border border-border rounded-sm overflow-hidden flex flex-col justify-between group shadow-xs hover:border-gold/50 transition-colors"
              >
                <div className="relative aspect-video bg-canvas overflow-hidden border-b border-border flex items-center justify-center">
                  <Image
                    src={asset.secureUrl}
                    alt={asset.altText.ar}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain"
                  />
                  <span className="absolute top-2 start-2 bg-ink/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono uppercase">
                    {asset.format}
                  </span>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <span>
                        {asset.width} × {asset.height} px
                      </span>
                      <span>{(asset.bytes / 1024).toFixed(1)} KB</span>
                    </div>
                    <p className="text-xs font-semibold text-ink line-clamp-1" title={asset.altText.ar}>
                      {asset.altText.ar}
                    </p>
                    <p className="text-[11px] text-muted line-clamp-1" dir="ltr" title={asset.altText.en}>
                      {asset.altText.en}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                    <button
                      onClick={() => copyUrl(asset.id, asset.secureUrl)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-canvas border border-border rounded text-[11px] font-medium text-ink hover:border-gold transition-colors"
                    >
                      {copiedId === asset.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-muted" />
                          <span>نسخ الرابط</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <a
                        href={asset.secureUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-muted hover:text-ink transition-colors"
                        title="فتح في علامة تبويب جديدة"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDelete(asset.id)}
                        className="p-1.5 text-muted hover:text-danger transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
