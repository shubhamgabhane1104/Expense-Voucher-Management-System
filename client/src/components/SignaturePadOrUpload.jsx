import React, { useRef, useState, useEffect } from 'react';
import { Upload, Edit3, Trash2, CheckCircle, Image as ImageIcon } from 'lucide-react';

export default function SignaturePadOrUpload({
    label = 'Signature',
    required = false,
    onSignatureChange,
    initialPreview = null,
    savedSignatureUrl = null
}) {
    const [mode, setMode] = useState('upload'); // 'upload' | 'draw'
    const [previewUrl, setPreviewUrl] = useState(initialPreview || null);
    const [selectedFile, setSelectedFile] = useState(null);
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    useEffect(() => {
        if (initialPreview) {
            setPreviewUrl(initialPreview);
        }
    }, [initialPreview]);

    // File input handler
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            if (onSignatureChange) {
                // Pass both file object and preview URL
                onSignatureChange({ file, dataUrl: null, preview: objectUrl });
            }
        }
    };

    // Canvas drawing helpers
    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

        ctx.lineTo(x, y);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        setHasDrawn(true);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            setPreviewUrl(dataUrl);
            setSelectedFile(null);
            if (onSignatureChange) {
                onSignatureChange({ file: null, dataUrl, preview: dataUrl });
            }
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setHasDrawn(false);
            setPreviewUrl(null);
            setSelectedFile(null);
            if (onSignatureChange) {
                onSignatureChange({ file: null, dataUrl: null, preview: null });
            }
        }
    };

    const useSavedSignature = () => {
        if (savedSignatureUrl) {
            setPreviewUrl(savedSignatureUrl);
            setSelectedFile(null);
            if (onSignatureChange) {
                onSignatureChange({ file: null, dataUrl: savedSignatureUrl, preview: savedSignatureUrl });
            }
        }
    };

    const removeCurrentSignature = () => {
        setPreviewUrl(null);
        setSelectedFile(null);
        setHasDrawn(false);
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        if (onSignatureChange) {
            onSignatureChange({ file: null, dataUrl: null, preview: null });
        }
    };

    return (
        <div className="signature-component">
            <div className="flex-between mb-1">
                <label className="form-label" style={{ marginBottom: 0 }}>
                    {label} {required && <span className="required">*</span>}
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        type="button"
                        className={`btn btn-sm ${mode === 'upload' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setMode('upload')}
                    >
                        <Upload size={14} /> Upload Image
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${mode === 'draw' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setMode('draw')}
                    >
                        <Edit3 size={14} /> Draw Signature
                    </button>
                    {savedSignatureUrl && (
                        <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            onClick={useSavedSignature}
                            title="Reuse pre-saved signature"
                        >
                            <CheckCircle size={14} /> Saved
                        </button>
                    )}
                </div>
            </div>

            <div className="signature-box" style={{ background: 'var(--bg-surface-alt)', padding: '1rem', borderRadius: '12px' }}>
                {mode === 'upload' ? (
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            id={`sig-upload-${label}`}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <label
                            htmlFor={`sig-upload-${label}`}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '1.25rem',
                                border: '2px dashed var(--border-subtle)',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                background: 'var(--bg-surface)'
                            }}
                        >
                            <Upload size={28} color="var(--primary-600)" style={{ marginBottom: '0.5rem' }} />
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Click to select signature image</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Supports PNG, JPG, WEBP, SVG (Max 5MB)</span>
                        </label>
                    </div>
                ) : (
                    <div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            Draw your signature using mouse or touch inside the box below:
                        </p>
                        <canvas
                            ref={canvasRef}
                            width={420}
                            height={130}
                            className="signature-canvas"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            style={{ background: '#ffffff', width: '100%', maxWidth: '420px', borderRadius: '8px' }}
                        />
                        <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline"
                                onClick={clearCanvas}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                                <Trash2 size={13} /> Clear Canvas
                            </button>
                        </div>
                    </div>
                )}

                {previewUrl && (
                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <ImageIcon size={14} /> Signature Preview
                            </span>
                            <button
                                type="button"
                                onClick={removeCurrentSignature}
                                className="btn btn-sm btn-outline"
                                style={{ color: 'var(--danger-600)', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            >
                                <Trash2 size={12} /> Remove
                            </button>
                        </div>
                        <div style={{ background: '#ffffff', padding: '0.5rem', borderRadius: '8px', display: 'inline-block', border: '1px solid var(--border-subtle)' }}>
                            <img
                                src={previewUrl}
                                alt="Signature Preview"
                                style={{ maxHeight: '80px', maxWidth: '240px', objectFit: 'contain', display: 'block' }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
