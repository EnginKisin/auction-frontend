import api from '../lib/apiClient'

export async function listMyProducts() {
  const { data } = await api.get('/products')
  return data || []
}

export async function createProduct(product) {
  const res = await api.post('/products', product)
  return { data: res.data, message: res._message }
}

export async function updateProduct(productId, product) {
  const res = await api.put(`/products/${productId}`, product)
  return { data: res.data, message: res._message }
}

export async function deleteProduct(productId) {
  const res = await api.delete(`/products/${productId}`)
  return { data: res.data, message: res._message }
}

export async function getMyProductById(productId) {
  const list = await listMyProducts()
  return list.find((p) => String(p.id) === String(productId)) || null
}

export async function uploadProductImages(productId, files) {
  const formData = new FormData()
  files.forEach((file) => formData.append('images', file))
  const res = await api.post(`/products/${productId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return { data: res.data, message: res._message }
}

export async function deleteProductImage(productId, imageId) {
  const res = await api.delete(`/products/${productId}/images/${imageId}`)
  return { data: res.data, message: res._message }
}


