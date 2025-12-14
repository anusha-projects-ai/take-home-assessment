import React, { useState, useEffect } from 'react';
import './ConsentManagement.css';
import { apiService } from '../services/apiService';
import { useWeb3 } from '../hooks/useWeb3';

const ConsentManagement = ({ account }) => {
  const { signMessage } = useWeb3();
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    purpose: '',
  });

  useEffect(() => {
    const fetchConsents = async () => {
      setLoading(true);
      setError(null);
      try {
        const status = filterStatus === 'all' ? null : filterStatus;
        const response = await apiService.getConsents(null, status);
        setConsents(response.consents || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConsents();
  }, [filterStatus]);

  const handleCreateConsent = async (e) => {
    e.preventDefault();
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    if (!formData.patientId || !formData.purpose) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const message = `I consent to: ${formData.purpose} for patient: ${formData.patientId}`;
      const signature = await signMessage(message);
      
      await apiService.createConsent({
        patientId: formData.patientId,
        purpose: formData.purpose,
        walletAddress: account,
        signature: signature
      });
      
      setFormData({ patientId: '', purpose: '' });
      setShowCreateForm(false);
      
      // Refresh consents
      const status = filterStatus === 'all' ? null : filterStatus;
      const response = await apiService.getConsents(null, status);
      setConsents(response.consents || []);
      
      alert('Consent created successfully!');
    } catch (err) {
      alert('Failed to create consent: ' + err.message);
    }
  };

  const handleUpdateStatus = async (consentId, newStatus) => {
    try {
      const updateData = { status: newStatus };
      if (newStatus === 'active') {
        updateData.blockchainTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      }
      
      await apiService.updateConsent(consentId, updateData);
      
      // Refresh consents
      const status = filterStatus === 'all' ? null : filterStatus;
      const response = await apiService.getConsents(null, status);
      setConsents(response.consents || []);
      
      alert(`Consent status updated to ${newStatus}`);
    } catch (err) {
      alert('Failed to update consent: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="consent-management-container">
        <div className="loading">Loading consents...</div>
      </div>
    );
  }

  return (
    <div className="consent-management-container">
      <div className="consent-header">
        <h2>Consent Management</h2>
        <button
          className="create-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={!account}
        >
          {showCreateForm ? 'Cancel' : 'Create New Consent'}
        </button>
      </div>

      {!account && (
        <div className="warning">
          Please connect your MetaMask wallet to manage consents
        </div>
      )}

      {showCreateForm && account && (
        <div className="create-consent-form">
          <h3>Create New Consent</h3>
          <form onSubmit={handleCreateConsent}>
            <div className="form-group">
              <label>Patient ID</label>
              <input
                type="text"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                required
                placeholder="e.g., patient-001"
              />
            </div>
            <div className="form-group">
              <label>Purpose</label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                required
              >
                <option value="">Select purpose...</option>
                <option value="Research Study Participation">Research Study Participation</option>
                <option value="Data Sharing with Research Institution">Data Sharing with Research Institution</option>
                <option value="Third-Party Analytics Access">Third-Party Analytics Access</option>
                <option value="Insurance Provider Access">Insurance Provider Access</option>
              </select>
            </div>
            <button type="submit" className="submit-btn">
              Sign & Create Consent
            </button>
          </form>
        </div>
      )}

      <div className="consent-filters">
        <button
          className={filterStatus === 'all' ? 'active' : ''}
          onClick={() => setFilterStatus('all')}
        >
          All
        </button>
        <button
          className={filterStatus === 'active' ? 'active' : ''}
          onClick={() => setFilterStatus('active')}
        >
          Active
        </button>
        <button
          className={filterStatus === 'pending' ? 'active' : ''}
          onClick={() => setFilterStatus('pending')}
        >
          Pending
        </button>
      </div>

      <div className="consents-list">
        {error && <div className="error">Error: {error}</div>}
        {consents.length === 0 ? (
          <div className="no-consents">
            <p>No consents found</p>
          </div>
        ) : (
          consents.map((consent) => (
            <div key={consent.id} className="consent-card">
              <div className="consent-header">
                <h3>Patient: {consent.patientId}</h3>
                <span className={`consent-status ${consent.status}`}>
                  {consent.status}
                </span>
              </div>
              <div className="consent-details">
                <p><strong>Purpose:</strong> {consent.purpose}</p>
                <p><strong>Created:</strong> {new Date(consent.createdAt).toLocaleDateString()}</p>
                <p><strong>Wallet:</strong> {consent.walletAddress}</p>
                {consent.blockchainTxHash && (
                  <div className="blockchain-hash">
                    <p><strong>Blockchain Hash:</strong></p>
                    <code>{consent.blockchainTxHash}</code>
                  </div>
                )}
              </div>
              {consent.status === 'pending' && (
                <div className="consent-actions">
                  <button
                    onClick={() => handleUpdateStatus(consent.id, 'active')}
                    className="activate-btn"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(consent.id, 'revoked')}
                    className="revoke-btn"
                  >
                    Revoke
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsentManagement;


