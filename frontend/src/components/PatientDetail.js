import React, { useState, useEffect } from 'react';
import './PatientDetail.css';
import { apiService } from '../services/apiService';

const PatientDetail = ({ patientId, onBack }) => {
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [patientResponse, recordsResponse] = await Promise.all([
          apiService.getPatient(patientId),
          apiService.getPatientRecords(patientId)
        ]);
        setPatient(patientResponse);
        setRecords(recordsResponse.records || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="patient-detail-container">
        <div className="loading">Loading patient details...</div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="patient-detail-container">
        <div className="error">Error loading patient: {error || 'Patient not found'}</div>
        <button onClick={onBack} className="back-btn">Back to List</button>
      </div>
    );
  }

  return (
    <div className="patient-detail-container">
      <div className="patient-detail-header">
        <button onClick={onBack} className="back-btn">← Back to List</button>
      </div>

      <div className="patient-detail-content">
        <div className="patient-info-section">
          <h2>Patient Information</h2>
          <div className="patient-details">
            <div className="detail-row">
              <label>Name:</label>
              <span>{patient.name}</span>
            </div>
            <div className="detail-row">
              <label>Email:</label>
              <span>{patient.email}</span>
            </div>
            <div className="detail-row">
              <label>Date of Birth:</label>
              <span>{new Date(patient.dateOfBirth).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <label>Gender:</label>
              <span>{patient.gender}</span>
            </div>
            <div className="detail-row">
              <label>Phone:</label>
              <span>{patient.phone}</span>
            </div>
            <div className="detail-row">
              <label>Address:</label>
              <span>{patient.address}</span>
            </div>
            <div className="detail-row">
              <label>Wallet Address:</label>
              <span className="wallet-address">{patient.walletAddress}</span>
            </div>
          </div>
        </div>

        <div className="patient-records-section">
          <h2>Medical Records ({records.length})</h2>
          {records.length === 0 ? (
            <div className="no-records">
              <p>No medical records found</p>
            </div>
          ) : (
            <div className="records-list">
              {records.map((record) => (
                <div key={record.id} className="record-card">
                  <div className="record-header">
                    <h3>{record.title}</h3>
                    <span className={`record-type ${record.type.toLowerCase()}`}>
                      {record.type}
                    </span>
                  </div>
                  <div className="record-details">
                    <div className="record-info">
                      <p><strong>Date:</strong> {new Date(record.date).toLocaleDateString()}</p>
                      <p><strong>Doctor:</strong> {record.doctor}</p>
                      <p><strong>Hospital:</strong> {record.hospital}</p>
                      <p><strong>Status:</strong> <span className={`status ${record.status}`}>{record.status}</span></p>
                    </div>
                    {record.blockchainHash && (
                      <div className="blockchain-info">
                        <p><strong>Blockchain Hash:</strong></p>
                        <code className="hash">{record.blockchainHash}</code>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;


