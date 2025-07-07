import React, { useState, useEffect } from 'react';

interface ClientSideDateFormatterProps {
  dateString: string;
}

const ClientSideDateFormatter: React.FC<ClientSideDateFormatterProps> = ({ dateString }) => {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    // This code only runs on the client, after hydration
    setFormattedDate(new Date(dateString).toLocaleString());
  }, [dateString]);

  return <span>{formattedDate}</span>;
};

export default ClientSideDateFormatter;
