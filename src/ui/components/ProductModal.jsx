import { useState, useEffect } from 'react'
import Modal from './Modal'
import { useToast } from '../../context/ToastContext'
import { createProduct, updateProduct, uploadProductImages, deleteProductImage } from '../../api/products'
import { validateProduct, validateProductName, validateProductDescription, validateProductPrice, getCharacterCount } from '../../lib/validationUtils'
import { useSecurityMiddleware } from '../../hooks/useSecurityMiddleware'

export default function ProductModal({ 
  open, 
  product = null, 
  onClose, 
  onSuccess 
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: ''
  })
  const [images, setImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [imagesToDelete, setImagesToDelete] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const { success, error } = useToast()
  
  const { sanitizeFormData, validateFileUpload } = useSecurityMiddleware()

  const isEditMode = !!(product && typeof product === 'object' && product.id)

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return validateProductName(value);
      case 'description':
        return validateProductDescription(value);
      case 'price':
        return validateProductPrice(value);
      default:
        return { isValid: true, message: '' };
    }
  };

  const handleFieldBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldValue = formData[name];
    const validation = validateField(name, fieldValue);
    
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, [name]: validation.message }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (touched[name]) {
      const validation = validateField(name, value);
      if (!validation.isValid) {
        setErrors(prev => ({ ...prev, [name]: validation.message }));
      } else {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  }

  useEffect(() => {
    if (product && typeof product === 'object' && product.id) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || ''
      })
      const productImages = product.images || product.imageUrls || product.photos || []
      setExistingImages(productImages)
      setImagesToDelete([])
    } else {
      setFormData({ name: '', description: '', price: '' })
      setImages([])
      setExistingImages([])
      setImagesToDelete([])
    }
    
    setErrors({})
    setTouched({})
  }, [product])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    
    const validFiles = files.filter(file => {
      const validation = validateFileUpload(file, {
        maxSizeMB: 5,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });
      
      if (!validation.isValid) {
        error(`Dosya güvenlik hatası: ${validation.message}`);
        return false;
      }
      
      return true;
    });
    
    setImages(prev => [...prev, ...validFiles])
  }

  const removeNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (imageId) => {
    if (!imageId) {
      error('Görsel ID bulunamadı')
      return
    }
    
    setImagesToDelete(prev => [...prev, imageId])
    setExistingImages(prev => prev.filter(img => img.id !== imageId))
    success('Görsel silinecek görseller listesine eklendi')
  }

  const handleSubmit = async () => {
    const validation = validateProduct(formData);
    if (!validation.isValid) {
      setTouched({
        name: true,
        description: true,
        price: true
      });
      setErrors(validation.errors);
      return;
    }

    setLoading(true)
    try {
      const sanitizedData = sanitizeFormData(formData, {
        name: { type: 'html' },
        description: { type: 'html' },
        price: { type: 'text' }
      });
      
      const priceNum = Number(sanitizedData.price);
      
      if (isEditMode) {
        if (!product || !product.id) {
          error('Düzenlenecek ürün bulunamadı')
          return
        }
        
        await updateProduct(product.id, {
          ...sanitizedData,
          price: priceNum
        })
        success('Ürün başarıyla güncellendi')
        
        setUploading(true)
        try {
          if (imagesToDelete.length > 0) {
            success('Silinecek görseller işleniyor...')
            for (const imageId of imagesToDelete) {
              try {
                await deleteProductImage(product.id, imageId)
              } catch (err) {
                console.error('Görsel silme hatası:', err)
                error(`Görsel silinemedi: ${err?.message || 'Bilinmeyen hata'}`)
              }
            }
            success(`${imagesToDelete.length} görsel silindi`)
          }
          
          if (images.length > 0) {
            success('Yeni görseller yükleniyor...')
            await uploadProductImages(product.id, images)
            success('Yeni görseller başarıyla yüklendi')
          }
          
          if (imagesToDelete.length > 0 || images.length > 0) {
            success('Tüm görsel işlemleri tamamlandı')
          }
        } catch (err) {
          console.error('Görsel işlemleri hatası:', err)
          error('Görsel işlemleri sırasında hata oluştu: ' + (err?.message || 'Bilinmeyen hata'))
        } finally {
          setUploading(false)
        }
      } else {
        const createResponse = await createProduct({
          ...sanitizedData,
          price: priceNum
        })
        success('Ürün başarıyla oluşturuldu')
        
        const newProductId = createResponse.data?.id
        if (newProductId && images.length > 0) {
          setUploading(true)
          try {
            success('Görseller yükleniyor...')
            await uploadProductImages(newProductId, images)
            success('Görseller başarıyla yüklendi')
          } catch (err) {
            console.error('Görsel yükleme hatası:', err)
            error('Görseller yüklenirken hata oluştu: ' + (err?.message || 'Bilinmeyen hata'))
          } finally {
            setUploading(false)
          }
        }
      }

      onSuccess()
      onClose()
    } catch (err) {
      error(err?.message || 'İşlem başarısız')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading && !uploading) {
      onClose()
    } else {
      if (loading) {
        error('Lütfen ürün kaydedilmesini bekleyin')
      } else if (uploading) {
        error('Lütfen görseller yüklenmesini bekleyin')
      }
    }
  }

  return (
    <Modal 
      open={open} 
      title={isEditMode ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'} 
      onClose={handleClose}
    >
              <div style={{ display: 'grid', gap: 16, minWidth: 400 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <label htmlFor="name" style={{ fontWeight: '600', color: 'var(--color-accent)' }}>Ürün Adı *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur('name')}
              placeholder="Ürün adını girin"
              disabled={loading}
              style={{
                padding: '10px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: '14px',
                background: 'var(--color-secondary)',
                color: 'var(--color-text)'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {touched.name && errors.name && (
                <p style={{ color: 'var(--color-error)', fontSize: '0.8em', margin: 0 }}>{errors.name}</p>
              )}
              <div style={{ 
                fontSize: '0.8em', 
                color: formData.name.length > 80 ? 'var(--color-warning)' : 'var(--color-text-secondary)',
                marginLeft: 'auto'
              }}>
                {formData.name.length}/100
              </div>
            </div>
          </div>

                                     <div style={{ display: 'grid', gap: 8 }}>
             <label htmlFor="description" style={{ fontWeight: '600', color: 'var(--color-accent)' }}>Açıklama *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur('description')}
              placeholder="Ürün açıklamasını girin"
              rows={3}
              disabled={loading}
              style={{ 
                resize: 'vertical',
                padding: '10px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: '14px',
                background: 'var(--color-secondary)',
                color: 'var(--color-text)'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {touched.description && errors.description && (
                <p style={{ color: 'var(--color-error)', fontSize: '0.8em', margin: 0 }}>{errors.description}</p>
              )}
              <div style={{ 
                fontSize: '0.8em', 
                color: formData.description.length > 1800 ? 'var(--color-warning)' : 'var(--color-text-secondary)',
                marginLeft: 'auto'
              }}>
                {formData.description.length}/2000
              </div>
            </div>
          </div>

                                     <div style={{ display: 'grid', gap: 8 }}>
             <label htmlFor="price" style={{ fontWeight: '600', color: 'var(--color-accent)' }}>Fiyat (₺) *</label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur('price')}
              placeholder="0.00"
              disabled={loading}
              style={{
                padding: '10px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: '14px',
                background: 'var(--color-secondary)',
                color: 'var(--color-text)'
              }}
            />
            {touched.price && errors.price && (
              <p style={{ color: 'var(--color-error)', fontSize: '0.8em', margin: 0 }}>{errors.price}</p>
            )}
          </div>

        <div style={{ display: 'grid', gap: 8 }}>
          <label style={{ fontWeight: '600', color: 'var(--color-accent)' }}>Görseller</label>
          
          {isEditMode && existingImages.length > 0 && (
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ fontSize: '0.9em', color: 'var(--color-text-secondary)' }}>Mevcut Görseller ({existingImages.length}):</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                {existingImages.filter(img => img && typeof img === 'object').map((img, index) => {
                  const imageSrc = img.contentType && img.base64Data 
                    ? `data:${img.contentType};base64,${img.base64Data}`
                    : img.url || img.imageUrl || img.src || img.path || img
                  return (
                    <div key={img.id || `img-${index}`} style={{ position: 'relative' }}>
                      <img
                        src={imageSrc}
                        alt="Ürün görseli"
                        style={{
                          width: '100%',
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 4
                        }}
                        onError={(e) => {
                          console.error('Image failed to load:', imageSrc)
                          e.target.style.display = 'none'
                        }}
                      />
                      {img.id && (
                        <button
                          onClick={() => removeExistingImage(img.id)}
                          disabled={loading || uploading}
                          style={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            background: 'var(--color-error)',
                            color: 'white',
                            border: '2px solid var(--color-secondary)',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            lineHeight: 1
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          
          {isEditMode && imagesToDelete.length > 0 && (
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ fontSize: '0.9em', color: 'var(--color-error)' }}>Silinecek Görseller ({imagesToDelete.length}):</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                {imagesToDelete.map((imageId, index) => {
                  const imageToDelete = product.images?.find(img => img.id === imageId) || 
                                     product.imageUrls?.find(img => img.id === imageId) || 
                                     product.photos?.find(img => img.id === imageId)
                  
                  if (!imageToDelete) return null
                  
                  const imageSrc = imageToDelete.contentType && imageToDelete.base64Data 
                    ? `data:${imageToDelete.contentType};base64,${imageToDelete.base64Data}`
                    : imageToDelete.url || imageToDelete.imageUrl || imageToDelete.src || imageToDelete.path
                  
                  return (
                    <div key={`delete-${imageId}`} style={{ position: 'relative', opacity: 0.6 }}>
                      <img
                        src={imageSrc}
                        alt="Silinecek görsel"
                        style={{
                          width: '100%',
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 4,
                          filter: 'grayscale(50%)'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'var(--color-error)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        SİLİNECEK
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
         
          <div style={{ display: 'grid', gap: 8 }}>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading || uploading}
              style={{
                padding: '10px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: '14px',
                background: 'var(--color-secondary)',
                color: 'var(--color-text)'
              }}
            />
            
            {images.length > 0 && (
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ fontSize: '0.9em', color: 'var(--color-text-secondary)' }}>
                  {isEditMode ? 'Yeni Eklenecek Görseller:' : 'Eklenecek Görseller:'} ({images.length})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                  {images.map((file, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Yeni görsel ${index + 1}`}
                        style={{
                          width: '100%',
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 4
                        }}
                      />
                      <button
                        onClick={() => removeNewImage(index)}
                        disabled={loading || uploading}
                        style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          background: 'var(--color-error)',
                          color: 'white',
                          border: '2px solid var(--color-secondary)',
                          borderRadius: '50%',
                          width: 24,
                          height: 24,
                          fontSize: '16px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          lineHeight: 1
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24 }}>
          <button
            onClick={handleClose}
            disabled={loading || uploading}
            className="btn btn-secondary"
            style={{ padding: '12px 24px' }}
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || uploading}
            className="btn btn-primary"
            style={{ padding: '12px 24px' }}
          >
                         {loading ? 'Ürün Kaydediliyor...' : uploading ? 'Görsel İşlemleri Yapılıyor...' : (isEditMode ? 'Güncelle' : 'Kaydet')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
