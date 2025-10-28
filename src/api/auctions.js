import api from '../lib/apiClient'

export async function listActiveAuctions() {
  const { data } = await api.get('/auctions/active')
  return data || []
}

export async function listActiveAuctionsPublic() {
  const { data } = await api.get('/auctions/public/active')
  return data || []
}

export async function listMyAuctions() {
  const { data } = await api.get('/auctions/my')
  return data || []
}

export async function getAuctionById(id) {
  const { data } = await api.get(`/auctions/${id}`)
  return data || null
}

export async function getAuctionByIdPublic(id) {
  const { data } = await api.get(`/auctions/public/${id}`)
  return data || null
}

export async function createAuction({ product_id, startingPrice, durationTypeId }) {
  const res = await api.post('/auctions', { product_id, startingPrice, durationTypeId })
  return { data: res.data, message: res._message }
}

export async function placeBid(auctionId, amount) {
  const res = await api.post(`/auctions/${auctionId}/bids`, { amount })
  return { data: res.data, message: res._message }
}

export async function closeAuction(auctionId) {
  const res = await api.put(`/auctions/${auctionId}/close`)
  return { data: res.data, message: res._message }
}


