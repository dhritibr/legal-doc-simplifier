import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '../api/axios';

const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'malayalam', label: 'Malayalam' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'bengali', label: 'Bengali' }
];

const DOC_TYPES = [
  { value: 'rental', label: 'Rental Agreement' },
  { value: 'employment', label: 'Employment Contract' },
  { value: 'loan', label: 'Loan Agreement' },
  { value: 'nda', label: 'NDA' },
  { value: 'service', label: 'Service Agreement' },
  { value: 'other', label: 'Other' }
];

const Upload = () => {
  const [file, setFile]         = useState(null);
  const [language, setLanguage] = useState('english');
  const [docType, setDocType]   = useState('other');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) { setError('Only PDF files allowed'); return; }
    setFile(accepted[0]); setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1, maxSize: 10 * 1024 * 1024
  });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) return setError('Please select a PDF');
    setError(''); setLoading(true);
    const fd = new FormData();
    fd.append('document', file);
    fd.append('language', language);
    fd.append('documentType', docType);
    try {
      const res = await api.post('/api/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/result/${res.data.data.documentId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="upload-page">
      <div className="upload-wrap">
        <h1>Upload document</h1>
        <p>PDF only · max 10MB · text-based documents work best</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${file ? 'dropzone-filled' : ''}`}>
            <input {...getInputProps()} />
            {file ? (
              <div className="dropzone-file">
                <span className="file-icon">📄</span>
                <span className="file-name">{file.name}</span>
                <span className="file-size">{(file.size/1024/1024).toFixed(2)} MB</span>
                <button type="button" className="file-remove" onClick={e => { e.stopPropagation(); setFile(null); }}>✕</button>
              </div>
            ) : (
              <div className="dropzone-empty">
                <span className="drop-icon">📂</span>
                <p>{isDragActive ? 'Drop it here' : 'Drag & drop your PDF'}</p>
                <span className="drop-sub">or click to browse</span>
              </div>
            )}
          </div>

          <div className="upload-options">
            <div className="field" style={{marginBottom:0}}>
  <label>Output language (for summary)</label>
  <select value={language} onChange={e => setLanguage(e.target.value)}>
    {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
  </select>
</div>
<div className="field" style={{marginBottom:0}}>
  <label>Document type</label>
  <select value={docType} onChange={e => setDocType(e.target.value)}>
    {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
  </select>
</div>
          </div>

          <button type="submit" className="btn-primary btn-large" disabled={loading || !file} style={{marginTop:'16px'}}>
            {loading ? 'Uploading...' : 'Upload document'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;