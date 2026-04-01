import React, { useState } from 'react';

const BookForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    class: '',
    condition: 'Good',
    price: '',
    location: ''
  });
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 4) {
      alert('You can only upload a maximum of 4 images.');
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create FormData for file upload
    const data = new FormData();
    data.append('title', formData.title);
    data.append('subject', formData.subject);
    data.append('class', formData.class);
    data.append('condition', formData.condition);
    data.append('price', formData.price);
    data.append('location', formData.location);
    
    selectedFiles.forEach(file => {
      data.append('images', file);
    });

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
      <header style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ fontSize: '24px', fontWeight: 700 }}>List a New Book</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Fill in the details to post your book on the marketplace.</p>
      </header>

      <div className="form-group">
        <label style={{ color: 'white' }}>Book Title</label>
        <input type="text" name="title" className="form-control" placeholder="e.g. Organic Chemistry 10th Ed" onChange={handleChange} required />
      </div>

      <div className="flex gap-md">
        <div className="form-group" style={{ flex: 1 }}>
          <label style={{ color: 'white' }}>Subject</label>
          <input type="text" name="subject" className="form-control" placeholder="e.g. Science" onChange={handleChange} required />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label style={{ color: 'white' }}>Class / Semester</label>
          <input type="text" name="class" className="form-control" placeholder="e.g. Class 12 / Sem 3" onChange={handleChange} required />
        </div>
      </div>

      <div className="flex gap-md">
        <div className="form-group" style={{ flex: 1 }}>
          <label style={{ color: 'white' }}>Condition</label>
          <select name="condition" className="form-control" onChange={handleChange} value={formData.condition} style={{ cursor: 'pointer' }}>
            <option value="New">✨ New</option>
            <option value="Good">👍 Good</option>
            <option value="Worn">📚 Worn</option>
          </select>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label style={{ color: 'white' }}>Price ($)</label>
          <input type="number" name="price" className="form-control" placeholder="0.00" onChange={handleChange} required />
        </div>
      </div>

      <div className="form-group">
        <label style={{ color: 'white' }}>Location / Pickup Point</label>
        <input type="text" name="location" className="form-control" placeholder="e.g. Central Library / Block A" onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label style={{ color: 'white' }}>Book Images (Max 4)</label>
        <div className="upload-container" style={{ 
          border: '2px dashed var(--glass-border)', 
          padding: 'var(--space-md)', 
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.03)'
        }}>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            id="book-images-upload"
          />
          <label htmlFor="book-images-upload" style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}>
            📁 Click to upload or drag and drop
          </label>
          
          {previews.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '15px' }}>
              {previews.map((url, index) => (
                <div key={index} style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button" 
                    onClick={() => removeImage(index)}
                    style={{ 
                      position: 'absolute', top: '4px', right: '4px', 
                      background: 'rgba(255, 0, 0, 0.7)', color: 'white', 
                      border: 'none', borderRadius: '50%', width: '20px', height: '20px',
                      fontSize: '10px', cursor: 'pointer', display: 'grid', placeItems: 'center'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', marginTop: 'var(--space-md)' }} disabled={loading}>
        {loading ? 'Listing book...' : 'Publish Listing'}
      </button>
    </form>
  );
};

export default BookForm;

