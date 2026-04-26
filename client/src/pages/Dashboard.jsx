import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const TYPE_LABEL = { rental:'Rental', employment:'Employment', loan:'Loan', nda:'NDA', service:'Service', other:'Other' };
const STATUS_BADGE = { completed:'badge-success', processing:'badge-warning', failed:'badge-danger', uploaded:'badge-info' };

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const navigate                  = useNavigate();

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    try {
      const res = await api.get('/api/documents');
      setDocuments(res.data.data.documents);
    } finally { setLoading(false); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this document?')) return;
    await api.delete(`/api/documents/${id}`);
    setDocuments(d => d.filter(x => x._id !== id));
  };

  const fmt = d => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

  const completed = documents.filter(d => d.status === 'completed').length;
  const risks     = documents.reduce((a, d) => a + (d.clauses?.filter(c => c.riskLevel === 'danger').length || 0), 0);

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="dashboard-page">
      <div className="db-header">
        <h1>Documents</h1>
        <Link to="/upload" className="btn-primary">+ Upload</Link>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-label">Total docs</div>
          <div className="stat-card-value">{documents.length}</div>
          <div className="stat-card-sub">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Analysed</div>
          <div className="stat-card-value">{completed}</div>
          <div className="stat-card-sub">Processed by AI</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Risks found</div>
          <div className="stat-card-value" style={{color: risks > 0 ? 'var(--danger)' : 'var(--text)'}}>{risks}</div>
          <div className="stat-card-sub">Danger clauses</div>
        </div>
      </div>

      <div className="doc-section-header">
        <div className="doc-section-title">
          My documents
          <span className="doc-count">{documents.length}</span>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📄</span>
          <h3>No documents yet</h3>
          <p>Upload your first legal document to get started</p>
          <Link to="/upload" className="btn-primary">Upload document</Link>
        </div>
      ) : (
        <div className="doc-table-wrap">
          <table className="doc-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Type</th>
                <th>Language</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr
                  key={doc._id}
                  style={{cursor:'pointer'}}
                  onClick={() => navigate(`/result/${doc._id}`)}
                >
                  <td>
                    <div className="doc-name-cell">
                      {doc.originalFileName}
                      <small>{doc.pageCount} pages · {doc.wordCount} words</small>
                    </div>
                  </td>
                  <td style={{color:'var(--muted)', fontFamily:'var(--mono)', fontSize:'12px'}}>
                    {TYPE_LABEL[doc.documentType] || 'Other'}
                  </td>
                  <td style={{color:'var(--muted)', fontFamily:'var(--mono)', fontSize:'12px', textTransform:'capitalize'}}>
                    {doc.language}
                  </td>
                  <td style={{color:'var(--muted)', fontFamily:'var(--mono)', fontSize:'12px'}}>
                    {fmt(doc.createdAt)}
                  </td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[doc.status]}`}>{doc.status}</span>
                  </td>
                  <td>
                    <div className="doc-actions-cell">
                      <button className="btn-secondary" style={{fontSize:'12px',padding:'4px 10px'}} onClick={e => { e.stopPropagation(); navigate(`/result/${doc._id}`); }}>
                        View
                      </button>
                      <button className="btn-danger" style={{fontSize:'12px',padding:'4px 10px'}} onClick={e => handleDelete(e, doc._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;