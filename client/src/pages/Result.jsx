import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Result = () => {
  const [doc, setDoc]             = useState(null);
  const [loading, setLoading]     = useState(true);
  const [analysing, setAnalysing] = useState(false);
  const [error, setError]         = useState('');
  const [expanded, setExpanded]   = useState({});
  const { id }                    = useParams();
  const navigate                  = useNavigate();

  useEffect(() => { fetchDoc(); }, [id]);

  const fetchDoc = async () => {
    try {
      const res = await api.get(`/api/documents/${id}`);
      setDoc(res.data.data);
    } catch { setError('Document not found'); }
    finally { setLoading(false); }
  };

  const handleAnalyse = async () => {
    setAnalysing(true); setError('');
    try {
      const res = await api.post(`/api/documents/${id}/analyse`);
      setDoc(prev => ({ ...prev, ...res.data.data, status: 'completed' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed — please try again');
    } finally { setAnalysing(false); }
  };

  const toggle = idx => setExpanded(p => ({ ...p, [idx]: !p[idx] }));

  const riskCounts = doc?.clauses?.reduce((a, c) => {
    a[c.riskLevel] = (a[c.riskLevel] || 0) + 1; return a;
  }, {}) || {};

  const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

  if (loading) return <div className="page-loading">Loading document...</div>;
  if (error && !doc) return <div className="error-page"><p>{error}</p><Link to="/dashboard" className="btn-primary">Back</Link></div>;

  return (
    <div className="result-page">
      <div className="result-topbar">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
        <div className="result-meta">
          <h1>{doc.originalFileName}</h1>
          <div className="result-meta-row">
            <span className="meta-chip">{doc.pageCount} pages</span>
            <span className="meta-sep">·</span>
            <span className="meta-chip">{doc.wordCount} words</span>
            <span className="meta-sep">·</span>
            <span className="meta-chip" style={{textTransform:'capitalize'}}>{doc.language}</span>
            <span className="meta-sep">·</span>
            <span className="meta-chip" style={{textTransform:'capitalize'}}>{doc.documentType}</span>
          </div>
        </div>
        {error && <div className="alert alert-error" style={{marginBottom:0, fontSize:'12px'}}>{error}</div>}
      </div>

      {/* not analysed yet */}
      {(doc.status === 'uploaded' || doc.status === 'failed') && (
        <div className="analyse-prompt">
          <div className="analyse-prompt-icon">🔍</div>
          <h2>{doc.status === 'failed' ? 'Analysis failed' : 'Ready to analyse'}</h2>
          <p>{doc.status === 'failed' ? 'The previous attempt failed. Click below to retry.' : 'Your PDF is uploaded and ready. Start AI analysis to get a plain-language breakdown.'}</p>
          <div className="analyse-chips">
            <span className="analyse-chip">📄 {doc.originalFileName}</span>
            <span className="analyse-chip">{doc.pageCount} pages</span>
            <span className="analyse-chip">{doc.wordCount} words</span>
          </div>
          <button
  className="btn-primary"
  onClick={handleAnalyse}
  disabled={analysing}
  style={{
    width: 'auto',
    padding: '10px 32px',
    fontSize: '14px',
    margin: '0 auto',
    display: 'block'
  }}
>
  {analysing ? '⏳ Analysing — please wait...' : '→ Analyse document'}
</button>
        </div>
      )}

      {doc.status === 'processing' && (
        <div className="analyse-prompt">
          <div className="analyse-prompt-icon">⏳</div>
          <h2>Processing</h2>
          <p>Gemini is reading your document. This usually takes 20–30 seconds.</p>
        </div>
      )}

      {doc.status === 'completed' && (
        <>
          {/* risk bar */}
          <div className="risk-bar">
            <div className="risk-item">
              <div className="risk-dot safe">{riskCounts.safe || 0}</div>
              <div><div className="risk-item-num">{riskCounts.safe || 0}</div><div className="risk-item-label">Safe</div></div>
            </div>
            <div className="risk-item">
              <div className="risk-dot warning">{riskCounts.warning || 0}</div>
              <div><div className="risk-item-num">{riskCounts.warning || 0}</div><div className="risk-item-label">Warning</div></div>
            </div>
            <div className="risk-item">
              <div className="risk-dot danger">{riskCounts.danger || 0}</div>
              <div><div className="risk-item-num">{riskCounts.danger || 0}</div><div className="risk-item-label">Danger</div></div>
            </div>
          </div>

          <div className="result-layout">
            {/* main — clauses */}
            <div className="result-main">
              <div className="section-label">Clause analysis — {doc.clauses.length} clauses</div>
              <div className="clauses-wrap">
                {doc.clauses.map((clause, idx) => (
                  <div key={idx} className="clause-item">
                    <div className="clause-line">
                      <div className={`clause-dot ${clause.riskLevel}`}></div>
                      {idx < doc.clauses.length - 1 && <div className="clause-connector"></div>}
                    </div>
                    <div className={`clause-card ${expanded[idx] ? 'open' : ''}`} onClick={() => toggle(idx)}>
                      <div className="clause-card-header">
                        <div className="clause-card-left">
                          <div className={`clause-risk-tag ${clause.riskLevel}`}>{clause.riskLevel}</div>
                          <div className="clause-card-title">{clause.title}</div>
                          <div className="clause-card-simplified">{clause.simplified}</div>
                        </div>
                        <span className="clause-expand">{expanded[idx] ? '▲' : '▼'}</span>
                      </div>
                      {expanded[idx] && (
                        <div className="clause-expanded">
                          {clause.riskReason && (
                            <div className="clause-reason">
                              <span>⚠</span> {clause.riskReason}
                            </div>
                          )}
                          <div className="clause-original-wrap">
                            <div className="original-label">Original text</div>
                            <p>{clause.original}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* sidebar */}
            <div className="result-sidebar">
              <div className="section-label">Summary</div>
              <div className="summary-box">
                <p>{doc.summary}</p>
              </div>

              <div className="section-label">Document info</div>
              <div className="sidebar-card">
                <div className="sidebar-row">
                  <span className="sidebar-row-label">File</span>
                  <span className="sidebar-row-val" style={{fontSize:'11px', maxWidth:'140px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{doc.originalFileName}</span>
                </div>
                <div className="sidebar-row">
                  <span className="sidebar-row-label">Pages</span>
                  <span className="sidebar-row-val">{doc.pageCount}</span>
                </div>
                <div className="sidebar-row">
                  <span className="sidebar-row-label">Words</span>
                  <span className="sidebar-row-val">{doc.wordCount}</span>
                </div>
                <div className="sidebar-row">
                  <span className="sidebar-row-label">Type</span>
                  <span className="sidebar-row-val" style={{textTransform:'capitalize'}}>{doc.documentType}</span>
                </div>
                <div className="sidebar-row">
                  <span className="sidebar-row-label">Language</span>
                  <span className="sidebar-row-val" style={{textTransform:'capitalize'}}>{doc.language}</span>
                </div>
                <div className="sidebar-row">
                  <span className="sidebar-row-label">Analysed</span>
                  <span className="sidebar-row-val">{fmtDate(doc.updatedAt)}</span>
                </div>
              </div>

              <button
                className="btn-secondary"
                style={{width:'100%', marginTop:'4px'}}
                onClick={handleAnalyse}
                disabled={analysing}
              >
                {analysing ? 'Re-analysing...' : '↺ Re-analyse'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Result;