import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/ui/Loader';
import InvoiceForm from '../components/invoice/InvoiceForm';
import { getErrorMessage } from '../utils/constants';

const EditInvoice = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const { data } = await api.get(`/invoices/${id}`);
        setInvoice(data.data);
      } catch (err) {
        setError(getErrorMessage(err, 'Invoice not found'));
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-error">{error}</div>;
  return <InvoiceForm invoice={invoice} />;
};

export default EditInvoice;